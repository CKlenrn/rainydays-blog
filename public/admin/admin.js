const categories = {
  "learning-methods": "学习方法",
  tools: "工具实践",
  reflections: "阶段复盘",
};

const elements = Object.fromEntries([
  ["loginView", "login-view"], ["loginForm", "login-form"], ["loginStatus", "login-status"],
  ["password", "password"], ["workspace", "workspace"], ["logout", "logout"],
  ["newNote", "new-note"], ["noteList", "note-list"], ["categoryFilter", "category-filter"],
  ["editor", "editor"], ["emptyEditor", "empty-editor"], ["editorKind", "editor-kind"],
  ["editorTitle", "editor-title"], ["saveStatus", "save-status"], ["saveNote", "save-note"],
  ["title", "title"], ["category", "category"], ["slug", "slug"],
  ["description", "description"], ["published", "published"], ["updated", "updated"],
  ["tags", "tags"], ["draft", "draft"], ["body", "body"],
  ["uploadImage", "upload-image"], ["imageFile", "image-file"],
].map(([name, id]) => [name, document.getElementById(id)]));

const state = {
  notes: [],
  current: undefined,
  dirty: false,
  slugTouched: false,
};

function setStatus(element, message = "", kind = "") {
  element.textContent = message;
  element.dataset.kind = kind;
}

async function api(path, options = {}) {
  const response = await fetch(path, options);
  let payload = {};
  try {
    payload = await response.json();
  } catch {
    payload = { error: "服务器返回了无法识别的内容。" };
  }
  if (!response.ok) throw Object.assign(new Error(payload.error || "请求失败。"), { status: response.status });
  return payload;
}

function parseScalar(value) {
  const trimmed = value.trim();
  if (trimmed.startsWith('"')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed.slice(1, -1);
    }
  }
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) return trimmed.slice(1, -1).replaceAll("''", "'");
  return trimmed;
}

function parseMarkdown(file) {
  const match = file.content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/u);
  const frontmatter = match?.[1] ?? "";
  const values = {};
  const tags = [];
  let readingTags = false;

  for (const line of frontmatter.split(/\r?\n/u)) {
    if (readingTags && /^\s+-\s+/u.test(line)) {
      tags.push(parseScalar(line.replace(/^\s+-\s+/u, "")));
      continue;
    }
    readingTags = false;
    const separator = line.indexOf(":");
    if (separator < 0) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (key === "tags") {
      readingTags = true;
      if (value.startsWith("[") && value.endsWith("]")) {
        try {
          tags.push(...JSON.parse(value));
        } catch {
          // Existing multiline tags are handled above.
        }
      }
    } else {
      values[key] = parseScalar(value);
    }
  }

  const [, category, fileName] = file.path.match(NOTE_PATH) ?? [];
  return {
    path: file.path,
    sha: file.sha,
    category,
    slug: fileName?.replace(/\.md$/u, "") ?? "",
    title: values.title || fileName || "未命名笔记",
    description: values.description || "",
    published: values.published || "",
    updated: values.updated || "",
    tags,
    draft: values.draft === "true" || values.draft === true,
    body: match?.[2]?.trimEnd() ?? file.content,
  };
}

const NOTE_PATH = /^src\/content\/docs\/notes\/(learning-methods|tools|reflections)\/([^/]+\.md)$/u;

function yamlString(value) {
  return JSON.stringify(value.trim());
}

function serializeNote(note) {
  const lines = [
    "---",
    `title: ${yamlString(note.title)}`,
    `description: ${yamlString(note.description)}`,
    `published: ${note.published}`,
  ];
  if (note.updated) lines.push(`updated: ${note.updated}`);
  lines.push("tags:");
  for (const tag of note.tags) lines.push(`  - ${yamlString(tag)}`);
  lines.push(`draft: ${note.draft}`, "---", "", note.body.trim(), "");
  return lines.join("\n");
}

function today() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function slugify(value) {
  return value.normalize("NFKC").toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-|-$/gu, "").slice(0, 80);
}

function noteFromForm() {
  return {
    path: state.current?.path,
    sha: state.current?.sha,
    title: elements.title.value.trim(),
    category: elements.category.value,
    slug: elements.slug.value.trim(),
    description: elements.description.value.trim(),
    published: elements.published.value,
    updated: elements.updated.value,
    tags: elements.tags.value.split(/[,，]/u).map((tag) => tag.trim()).filter(Boolean),
    draft: elements.draft.checked,
    body: elements.body.value,
  };
}

function showLogin(message = "", kind = "") {
  elements.workspace.hidden = true;
  elements.loginView.hidden = false;
  setStatus(elements.loginStatus, message, kind);
  elements.password.focus();
}

function showWorkspace() {
  elements.loginView.hidden = true;
  elements.workspace.hidden = false;
}

function renderList() {
  const filter = elements.categoryFilter.value;
  const notes = state.notes
    .filter((note) => filter === "all" || note.category === filter)
    .sort((left, right) => (right.updated || right.published).localeCompare(left.updated || left.published));

  elements.noteList.replaceChildren();
  for (const note of notes) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.path = note.path;
    button.setAttribute("aria-current", String(note.path === state.current?.path));
    const title = document.createElement("span");
    title.textContent = note.title;
    const meta = document.createElement("small");
    meta.textContent = `${categories[note.category]} · ${note.draft ? "草稿" : note.published}`;
    if (note.draft) meta.className = "draft";
    button.append(title, meta);
    button.addEventListener("click", () => selectNote(note));
    elements.noteList.append(button);
  }
}

function selectNote(note) {
  state.current = note;
  state.dirty = false;
  state.slugTouched = true;
  elements.editor.hidden = false;
  elements.emptyEditor.hidden = true;
  elements.editorKind.textContent = note.path ? "编辑笔记" : "新笔记";
  elements.editorTitle.textContent = note.title || "未命名笔记";
  elements.title.value = note.title;
  elements.category.value = note.category;
  elements.slug.value = note.slug;
  elements.description.value = note.description;
  elements.published.value = note.published;
  elements.updated.value = note.updated;
  elements.tags.value = note.tags.join(", ");
  elements.draft.checked = note.draft;
  elements.body.value = note.body;
  elements.category.disabled = Boolean(note.path);
  elements.slug.disabled = Boolean(note.path);
  setStatus(elements.saveStatus);
  renderList();
}

function newNote() {
  selectNote({
    path: undefined,
    sha: undefined,
    title: "",
    category: elements.categoryFilter.value === "all" ? "learning-methods" : elements.categoryFilter.value,
    slug: "",
    description: "",
    published: today(),
    updated: "",
    tags: [],
    draft: true,
    body: "",
  });
  state.slugTouched = false;
  elements.title.focus();
}

async function loadNotes() {
  try {
    const payload = await api("/api/notes");
    state.notes = payload.notes.map(parseMarkdown);
    showWorkspace();
    renderList();
  } catch (error) {
    if (error.status === 401) showLogin();
    else showLogin(error.message, "error");
  }
}

elements.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = elements.loginForm.querySelector("button");
  button.disabled = true;
  setStatus(elements.loginStatus, "正在登录...");
  try {
    await api("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: elements.password.value }),
    });
    elements.password.value = "";
    await loadNotes();
  } catch (error) {
    setStatus(elements.loginStatus, error.message, "error");
  } finally {
    button.disabled = false;
  }
});

elements.logout.addEventListener("click", async () => {
  await api("/api/session", { method: "DELETE" }).catch(() => undefined);
  state.notes = [];
  state.current = undefined;
  showLogin("已退出。", "success");
});

elements.newNote.addEventListener("click", newNote);
elements.categoryFilter.addEventListener("change", renderList);

elements.title.addEventListener("input", () => {
  elements.editorTitle.textContent = elements.title.value.trim() || "未命名笔记";
  if (!state.current?.path && !state.slugTouched) elements.slug.value = slugify(elements.title.value);
  state.dirty = true;
});

elements.slug.addEventListener("input", () => {
  state.slugTouched = true;
  state.dirty = true;
});

elements.editor.addEventListener("input", () => {
  state.dirty = true;
});

elements.editor.addEventListener("submit", async (event) => {
  event.preventDefault();
  const note = noteFromForm();
  if (!note.slug || !/^[\p{Letter}\p{Number}]+(?:-[\p{Letter}\p{Number}]+)*$/u.test(note.slug)) {
    setStatus(elements.saveStatus, "路径名称只能包含文字、数字和连字符。", "error");
    elements.slug.focus();
    return;
  }

  elements.saveNote.disabled = true;
  setStatus(elements.saveStatus, "正在保存...");
  try {
    const payload = await api("/api/notes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...note, content: serializeNote(note) }),
    });
    const saved = { ...note, path: payload.path, sha: payload.sha };
    const index = state.notes.findIndex((item) => item.path === state.current?.path);
    if (index >= 0) state.notes[index] = saved;
    else state.notes.push(saved);
    selectNote(saved);
    setStatus(elements.saveStatus, "已保存，网站正在部署。", "success");
  } catch (error) {
    if (error.status === 401) showLogin("登录已过期，请重新登录。", "error");
    else setStatus(elements.saveStatus, error.message, "error");
  } finally {
    elements.saveNote.disabled = false;
  }
});

elements.uploadImage.addEventListener("click", () => elements.imageFile.click());
elements.imageFile.addEventListener("change", async () => {
  const file = elements.imageFile.files[0];
  if (!file) return;
  elements.uploadImage.disabled = true;
  setStatus(elements.saveStatus, "正在上传图片...");
  try {
    const form = new FormData();
    form.append("file", file);
    const payload = await api("/api/images", { method: "POST", body: form });
    const editor = elements.body;
    const markdown = `![${file.name.replace(/\.[^.]+$/u, "")}](${payload.url})`;
    editor.setRangeText(markdown, editor.selectionStart, editor.selectionEnd, "end");
    editor.focus();
    state.dirty = true;
    setStatus(elements.saveStatus, "图片已插入正文。", "success");
  } catch (error) {
    setStatus(elements.saveStatus, error.message, "error");
  } finally {
    elements.uploadImage.disabled = false;
    elements.imageFile.value = "";
  }
});

window.addEventListener("beforeunload", (event) => {
  if (!state.dirty) return;
  event.preventDefault();
});

loadNotes();
