import assert from "node:assert/strict";
import test from "node:test";

import { handleRequest } from "../functions/api/[[path]].js";

const origin = "https://rainydays.cn";
const env = {
  ADMIN_PASSWORD: "correct-horse-battery-staple",
  SESSION_SECRET: "a-long-random-session-secret-for-tests",
  GITHUB_TOKEN: "github-token",
};

function request(path, options = {}) {
  return new Request(`${origin}${path}`, {
    ...options,
    headers: { Origin: origin, ...options.headers },
  });
}

async function sessionCookie() {
  const response = await handleRequest(request("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: env.ADMIN_PASSWORD }),
  }), env);
  assert.equal(response.status, 200);
  return response.headers.get("Set-Cookie").split(";", 1)[0];
}

test("login requires the configured password and creates a secure session", async () => {
  const rejected = await handleRequest(request("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: "wrong" }),
  }), env);
  assert.equal(rejected.status, 401);

  const cookie = await sessionCookie();
  assert.match(cookie, /^rainydays_admin_session=/u);

  const accepted = await handleRequest(request("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: env.ADMIN_PASSWORD }),
  }), env);
  assert.match(accepted.headers.get("Set-Cookie"), /HttpOnly; Secure; SameSite=Strict/u);
});

test("notes require a valid signed session", async () => {
  const response = await handleRequest(request("/api/notes"), env, () => assert.fail("GitHub must not be called"));
  assert.equal(response.status, 401);
});

test("authenticated note listing only returns supported note paths", async () => {
  const cookie = await sessionCookie();
  const responses = [
    new Response(JSON.stringify({
      tree: [
        { type: "blob", path: "src/content/docs/notes/tools/example.md", sha: "note-sha" },
        { type: "blob", path: "src/content/docs/about.mdx", sha: "about-sha" },
      ],
    }), { headers: { "Content-Type": "application/json" } }),
    new Response(JSON.stringify({ content: btoa("---\ntitle: Example\n---\n\nBody") }), {
      headers: { "Content-Type": "application/json" },
    }),
  ];
  const calls = [];
  const fetchMock = async (url, options) => {
    calls.push({ url, options });
    return responses.shift();
  };

  const response = await handleRequest(request("/api/notes", { headers: { Cookie: cookie } }), env, fetchMock);
  const payload = await response.json();
  assert.equal(response.status, 200);
  assert.equal(payload.notes.length, 1);
  assert.equal(payload.notes[0].path, "src/content/docs/notes/tools/example.md");
  assert.equal(calls.length, 2);
  assert.equal(calls[0].options.headers.Authorization, "Bearer github-token");
});

test("saving rejects cross-site requests and writes valid notes to GitHub", async () => {
  const cookie = await sessionCookie();
  const note = {
    category: "tools",
    slug: "new-note",
    title: "New note",
    content: "---\ntitle: New note\n---\n\nBody\n",
  };
  const rejected = await handleRequest(new Request(`${origin}/api/notes`, {
    method: "PUT",
    headers: { Cookie: cookie, Origin: "https://attacker.example", "Content-Type": "application/json" },
    body: JSON.stringify(note),
  }), env, () => assert.fail("GitHub must not be called"));
  assert.equal(rejected.status, 403);

  let githubCall;
  const response = await handleRequest(request("/api/notes", {
    method: "PUT",
    headers: { Cookie: cookie, "Content-Type": "application/json" },
    body: JSON.stringify(note),
  }), env, async (url, options) => {
    githubCall = { url, options };
    return new Response(JSON.stringify({ content: { sha: "saved-sha" } }), {
      headers: { "Content-Type": "application/json" },
    });
  });
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.path, "src/content/docs/notes/tools/new-note.md");
  assert.match(githubCall.url, /\/contents\/src\/content\/docs\/notes\/tools\/new-note\.md$/u);
  assert.equal(JSON.parse(githubCall.options.body).branch, "main");
});
