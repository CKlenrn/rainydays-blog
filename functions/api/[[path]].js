const SITE_ORIGIN = "https://rainydays.cn";
const CALLBACK_URL = `${SITE_ORIGIN}/api/callback`;
const ALLOWED_GITHUB_LOGIN = "CKlenrn";
const STATE_COOKIE = "rainydays_cms_oauth_state";

const secureHeaders = {
  "Cache-Control": "no-store",
  "Content-Security-Policy": "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

function randomState() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function getCookie(request, name) {
  const cookies = request.headers.get("Cookie") ?? "";
  for (const entry of cookies.split(";")) {
    const [key, ...value] = entry.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return undefined;
}

function callbackResponse(status, content, httpStatus = 200) {
  const message = `authorization:github:${status}:${JSON.stringify(content)}`;
  const serializedMessage = JSON.stringify(message).replaceAll("<", "\\u003c");
  const serializedOrigin = JSON.stringify(SITE_ORIGIN);
  const title = status === "success" ? "登录成功" : "登录失败";

  return new Response(
    `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>body{font-family:system-ui,sans-serif;margin:2rem;color:#17201c}</style>
  </head>
  <body>
    <p>${title}，正在返回写作后台...</p>
    <script>
      (() => {
        const origin = ${serializedOrigin};
        const message = ${serializedMessage};
        const receiveMessage = (event) => {
          if (event.origin !== origin || event.source !== window.opener || event.data !== "authorizing:github") return;
          window.opener.postMessage(message, origin);
          window.removeEventListener("message", receiveMessage);
        };
        window.addEventListener("message", receiveMessage);
        if (window.opener) window.opener.postMessage("authorizing:github", origin);
      })();
    </script>
  </body>
</html>`,
    {
      status: httpStatus,
      headers: {
        ...secureHeaders,
        "Content-Type": "text/html; charset=UTF-8",
        "Set-Cookie": `${STATE_COOKIE}=; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
      },
    },
  );
}

function configurationError(env) {
  if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) return undefined;
  return new Response("OAuth is not configured", {
    status: 503,
    headers: { ...secureHeaders, "Content-Type": "text/plain; charset=UTF-8" },
  });
}

function handleAuth(request, env) {
  const url = new URL(request.url);
  if (url.searchParams.get("provider") !== "github") {
    return new Response("Invalid provider", { status: 400, headers: secureHeaders });
  }

  const state = randomState();
  const authorizationUrl = new URL("https://github.com/login/oauth/authorize");
  authorizationUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  authorizationUrl.searchParams.set("redirect_uri", CALLBACK_URL);
  authorizationUrl.searchParams.set("scope", "public_repo");
  authorizationUrl.searchParams.set("state", state);
  authorizationUrl.searchParams.set("login", ALLOWED_GITHUB_LOGIN);

  return new Response(null, {
    status: 302,
    headers: {
      ...secureHeaders,
      Location: authorizationUrl.toString(),
      "Set-Cookie": `${STATE_COOKIE}=${state}; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
  });
}

async function handleCallback(request, env, fetchImpl) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = getCookie(request, STATE_COOKIE);

  if (!code || !state || !expectedState || state !== expectedState) {
    return callbackResponse("error", { message: "登录状态无效，请重新登录。" }, 400);
  }

  const tokenResponse = await fetchImpl("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "Rainy-Days-CMS",
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: CALLBACK_URL,
    }),
  });
  const tokenPayload = await tokenResponse.json();
  if (!tokenResponse.ok || !tokenPayload.access_token) {
    return callbackResponse("error", { message: "GitHub 授权失败，请重试。" }, 401);
  }

  const userResponse = await fetchImpl("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${tokenPayload.access_token}`,
      "User-Agent": "Rainy-Days-CMS",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  const user = await userResponse.json();
  if (!userResponse.ok || user.login?.toLowerCase() !== ALLOWED_GITHUB_LOGIN.toLowerCase()) {
    return callbackResponse("error", { message: "此 GitHub 账号无权编辑 Rainy Days。" }, 403);
  }

  return callbackResponse("success", {
    token: tokenPayload.access_token,
    provider: "github",
  });
}

export async function handleRequest(request, env, fetchImpl = fetch) {
  const configurationFailure = configurationError(env);
  if (configurationFailure) return configurationFailure;

  const pathname = new URL(request.url).pathname;
  if (pathname === "/api/auth") return handleAuth(request, env);
  if (pathname === "/api/callback") return handleCallback(request, env, fetchImpl);
  return new Response("Not found", { status: 404, headers: secureHeaders });
}

export function onRequestGet({ request, env }) {
  return handleRequest(request, env);
}
