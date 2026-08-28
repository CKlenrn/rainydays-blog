const SITE_ORIGIN = "https://rainydays.cn";
const REPOSITORY = "CKlenrn/rainydays-blog";
const BRANCH = "main";
const SESSION_COOKIE = "rainydays_admin_session";
const SESSION_SECONDS = 12 * 60 * 60;
const NOTE_PATH = /^src\/content\/docs\/notes\/(learning-methods|tools|reflections)\/[^/]+\.md$/u;
const CATEGORIES = new Set(["learning-methods", "tools", "reflections"]);
const IMAGE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/gif", "gif"],
  ["image/webp", "webp"],
]);

const apiHeaders = {
  "Cache-Control": "no-store",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...apiHeaders, "Content-Type": "application/json; charset=UTF-8", ...headers },
  });
}

function configured(env, names) {
  const missing = names.filter((name) => !env[name]);
  return missing.length ? json({ error: `缺少服务端配置：${missing.join(", ")}` }, 503) : undefined;
}

function getCookie(request, name) {
  for (const entry of (request.headers.get("Cookie") ?? "").split(";")) {
    const [key, ...value] = entry.trim().split("=");
    if (key === name) return value.join("=");
  }
  return undefined;
}

function bytesToBase64(bytes) {
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function toBase64Url(bytes) {
  return bytesToBase64(bytes).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
}

function fromBase64Url(value) {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return base64ToBytes(base64);
}

async function hmacKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function createSession(env) {
  const payload = toBase64Url(new TextEncoder().encode(JSON.stringify({ exp: Date.now() + SESSION_SECONDS * 1000 })));
  const signature = await crypto.subtle.sign("HMAC", await hmacKey(env.SESSION_SECRET), new TextEncoder().encode(payload));
  return `${payload}.${toBase64Url(new Uint8Array(signature))}`;
}

async function validSession(request, env) {
  const token = getCookie(request, SESSION_COOKIE);
  if (!token) return false;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return false;

  try {
    const valid = await crypto.subtle.verify(
      "HMAC",
      await hmacKey(env.SESSION_SECRET),
      fromBase64Url(signature),
      new TextEncoder().encode(payload),
    );
    if (!valid) return false;
    const session = JSON.parse(new TextDecoder().decode(fromBase64Url(payload)));
    return Number.isFinite(session.exp) && session.exp > Date.now();
  } catch {
    return false;
  }
}

async function passwordMatches(candidate, expected) {
  const digest = async (value) => new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
  );
  const [candidateHash, expectedHash] = await Promise.all([digest(candidate), digest(expected)]);
  let difference = 0;
  for (let index = 0; index < expectedHash.length; index += 1) {
    difference |= candidateHash[index] ^ expectedHash[index];
  }
  return difference === 0;
}

async function readJson(request) {
  if (!(request.headers.get("Content-Type") ?? "").includes("application/json")) return undefined;
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

function sameOrigin(request) {
  const origin = request.headers.get("Origin");
  return origin === new URL(request.url).origin || origin === SITE_ORIGIN;
}

function githubHeaders(env, extra = {}) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    "Content-Type": "application/json",
    "User-Agent": "Rainy-Days-Admin",
    "X-GitHub-Api-Version": "2022-11-28",
    ...extra,
  };
}

async function githubJson(env, path, fetchImpl, options = {}) {
  return fetchImpl(`https://api.github.com/repos/${REPOSITORY}${path}`, {
    ...options,
    headers: githubHeaders(env, options.headers),
  });
}

function encodePath(path) {
  return path.split("/").map(encodeURIComponent).join("/");
}

async function handleLogin(request, env) {
  const failure = configured(env, ["ADMIN_PASSWORD", "SESSION_SECRET"]);
  if (failure) return failure;
  if (!sameOrigin(request)) return json({ error: "请求来源无效。" }, 403);

  const body = await readJson(request);
  if (typeof body?.password !== "string" || body.password.length > 256) {
    return json({ error: "请输入后台密码。" }, 400);
  }
  if (!(await passwordMatches(body.password, env.ADMIN_PASSWORD))) {
    return json({ error: "密码错误。" }, 401);
  }

  const session = await createSession(env);
  return json(
    { ok: true },
    200,
    { "Set-Cookie": `${SESSION_COOKIE}=${session}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_SECONDS}` },
  );
}

function handleLogout() {
  return json(
    { ok: true },
    200,
    { "Set-Cookie": `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0` },
  );
}

async function requireAdmin(request, env) {
  const failure = configured(env, ["SESSION_SECRET", "GITHUB_TOKEN"]);
  if (failure) return failure;
  if (!(await validSession(request, env))) return json({ error: "请先登录。" }, 401);
  return undefined;
}

async function handleListNotes(env, fetchImpl) {
  const treeResponse = await githubJson(env, `/git/trees/${BRANCH}?recursive=1`, fetchImpl);
  if (!treeResponse.ok) return json({ error: "无法读取 GitHub 笔记列表。" }, 502);
  const tree = await treeResponse.json();
  const files = tree.tree.filter((entry) => entry.type === "blob" && NOTE_PATH.test(entry.path));

  try {
    const notes = await Promise.all(files.map(async (file) => {
      const response = await githubJson(env, `/git/blobs/${file.sha}`, fetchImpl);
      if (!response.ok) throw new Error(`Unable to read ${file.path}`);
      const blob = await response.json();
      return {
        path: file.path,
        sha: file.sha,
        content: new TextDecoder().decode(base64ToBytes(blob.content.replaceAll("\n", ""))),
      };
    }));
    notes.sort((left, right) => left.path.localeCompare(right.path, "en"));
    return json({ notes });
  } catch {
    return json({ error: "无法读取 GitHub 笔记内容。" }, 502);
  }
}

function validSlug(slug) {
  return typeof slug === "string"
    && slug.length >= 1
    && slug.length <= 80
    && /^[\p{Letter}\p{Number}]+(?:-[\p{Letter}\p{Number}]+)*$/u.test(slug);
}

async function handleSaveNote(request, env, fetchImpl) {
  if (!sameOrigin(request)) return json({ error: "请求来源无效。" }, 403);
  const body = await readJson(request);
  if (!body || typeof body.content !== "string" || body.content.length > 1_000_000) {
    return json({ error: "笔记内容无效或过长。" }, 400);
  }

  let path = body.path;
  if (path) {
    if (!NOTE_PATH.test(path) || typeof body.sha !== "string") return json({ error: "笔记路径无效。" }, 400);
  } else {
    if (!CATEGORIES.has(body.category) || !validSlug(body.slug)) return json({ error: "分类或路径名称无效。" }, 400);
    path = `src/content/docs/notes/${body.category}/${body.slug}.md`;
  }

  const title = typeof body.title === "string" ? body.title.trim().slice(0, 80) : "笔记";
  const payload = {
    message: `${body.sha ? "content: update" : "content: create"} ${title}`,
    content: bytesToBase64(new TextEncoder().encode(body.content)),
    branch: BRANCH,
    ...(body.sha ? { sha: body.sha } : {}),
  };
  const response = await githubJson(env, `/contents/${encodePath(path)}`, fetchImpl, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  if (response.status === 409 || response.status === 422) {
    return json({ error: "该笔记已被修改或路径名称已存在，请刷新后重试。" }, 409);
  }
  if (!response.ok) return json({ error: "GitHub 保存失败，请稍后重试。" }, 502);
  const result = await response.json();
  return json({ ok: true, path, sha: result.content.sha });
}

function cleanFileName(name, extension) {
  const base = name.replace(/\.[^.]+$/u, "").normalize("NFKD")
    .replace(/[^a-zA-Z0-9]+/gu, "-").replace(/^-|-$/gu, "").toLowerCase();
  return `${base || "image"}.${extension}`;
}

async function handleUploadImage(request, env, fetchImpl) {
  if (!sameOrigin(request)) return json({ error: "请求来源无效。" }, 403);
  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "图片上传请求无效。" }, 400);
  }
  const file = form.get("file");
  const extension = file && IMAGE_TYPES.get(file.type);
  if (!file || !extension || file.size > 4_000_000) {
    return json({ error: "仅支持 4 MB 以内的 JPG、PNG、GIF 或 WebP 图片。" }, 400);
  }

  const suffix = toBase64Url(crypto.getRandomValues(new Uint8Array(4))).toLowerCase();
  const fileName = `${Date.now()}-${suffix}-${cleanFileName(file.name, extension)}`;
  const path = `public/images/notes/${fileName}`;
  const payload = {
    message: `content: upload image ${fileName}`,
    content: bytesToBase64(new Uint8Array(await file.arrayBuffer())),
    branch: BRANCH,
  };
  const response = await githubJson(env, `/contents/${encodePath(path)}`, fetchImpl, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  if (!response.ok) return json({ error: "图片保存失败，请稍后重试。" }, 502);
  return json({ ok: true, url: `/images/notes/${encodeURIComponent(fileName)}` });
}

export async function handleRequest(request, env, fetchImpl = fetch) {
  const { pathname } = new URL(request.url);

  if (pathname === "/api/session" && request.method === "POST") return handleLogin(request, env);
  if (pathname === "/api/session" && request.method === "DELETE") return handleLogout();

  if (pathname === "/api/notes" || pathname === "/api/images") {
    const failure = await requireAdmin(request, env);
    if (failure) return failure;
  }
  if (pathname === "/api/notes" && request.method === "GET") return handleListNotes(env, fetchImpl);
  if (pathname === "/api/notes" && request.method === "PUT") return handleSaveNote(request, env, fetchImpl);
  if (pathname === "/api/images" && request.method === "POST") return handleUploadImage(request, env, fetchImpl);

  return json({ error: "Not found" }, 404);
}

export function onRequest({ request, env }) {
  return handleRequest(request, env);
}
