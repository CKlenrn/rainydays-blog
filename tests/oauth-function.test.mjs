import assert from "node:assert/strict";
import test from "node:test";

import { handleRequest } from "../functions/api/[[path]].js";

const env = {
  GITHUB_CLIENT_ID: "client-id",
  GITHUB_CLIENT_SECRET: "client-secret",
};

test("OAuth configuration is required", async () => {
  const response = await handleRequest(
    new Request("https://rainydays.cn/api/auth?provider=github"),
    {},
  );
  assert.equal(response.status, 503);
});

test("OAuth login creates a scoped GitHub redirect and state cookie", async () => {
  const response = await handleRequest(
    new Request("https://rainydays.cn/api/auth?provider=github"),
    env,
  );
  const location = new URL(response.headers.get("Location"));

  assert.equal(response.status, 302);
  assert.equal(location.origin, "https://github.com");
  assert.equal(location.searchParams.get("client_id"), "client-id");
  assert.equal(location.searchParams.get("redirect_uri"), "https://rainydays.cn/api/callback");
  assert.equal(location.searchParams.get("scope"), "public_repo");
  assert.match(location.searchParams.get("state"), /^[a-f0-9]{64}$/);
  assert.match(response.headers.get("Set-Cookie"), /HttpOnly; Secure; SameSite=Lax/);
});

test("OAuth callback rejects a mismatched state before calling GitHub", async () => {
  const response = await handleRequest(
    new Request("https://rainydays.cn/api/callback?code=code&state=wrong", {
      headers: { Cookie: "rainydays_cms_oauth_state=expected" },
    }),
    env,
    () => assert.fail("GitHub must not be called"),
  );
  assert.equal(response.status, 400);
  assert.match(await response.text(), /authorization:github:error/);
});

test("OAuth callback only returns a token for CKlenrn", async () => {
  const responses = [
    new Response(JSON.stringify({ access_token: "github-token" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
    new Response(JSON.stringify({ login: "CKlenrn" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  ];
  const calls = [];
  const fetchMock = async (url, options) => {
    calls.push({ url, options });
    return responses.shift();
  };

  const response = await handleRequest(
    new Request("https://rainydays.cn/api/callback?code=code&state=expected", {
      headers: { Cookie: "rainydays_cms_oauth_state=expected" },
    }),
    env,
    fetchMock,
  );
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].url, "https://github.com/login/oauth/access_token");
  assert.equal(calls[1].url, "https://api.github.com/user");
  assert.match(html, /authorization:github:success/);
  assert.match(html, /github-token/);
  assert.match(response.headers.get("Content-Security-Policy"), /frame-ancestors 'none'/);
});
