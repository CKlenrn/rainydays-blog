# Rainy Days

一个使用 Astro + Starlight 构建的个人学习笔记博客。根路径是个人主页，`/notes/` 是 Markdown/MDX 知识库。

## 环境要求

- Node.js 22.12.0 或更高版本
- pnpm 11

## 本地运行

安装依赖：

```powershell
pnpm install --frozen-lockfile
```

启动开发服务器：

```powershell
pnpm dev
```

终端会显示本地访问地址。按 `Ctrl+C` 停止服务器。

## 生产构建与预览

在终端 A 依次运行，命令保持分行：

```powershell
pnpm check
pnpm build
pnpm preview
```

`pnpm preview` 会持续占用终端 A。需要执行其他检查时使用终端 B；预览结束后回到终端 A 按 `Ctrl+C`。静态产物位于 `dist/`。

## 修改个人资料

所有个人资料集中在 [`src/config/site.ts`](src/config/site.ts)：

- `title`、`description`：站点名称和说明
- `author`：显示名、简介、格言和头像
- `links`：GitHub、邮箱或其他链接；为空时首页不显示社交区
- `topics`：首页学习主题及代表性笔记入口
- `paths`：知识库和关于页面路径

首页路由 [`src/pages/index.astro`](src/pages/index.astro) 是唯一的文件路由壳：它使用 Starlight 官方 `StarlightPage`，并直接从这份配置读取标题与描述、渲染首页组件；不要在其中另写站点元数据或正文，也不要增加并行内容路由。文档和笔记正文仍只维护在 `src/content/docs/`，知识库首页直接从 `topics` 渲染主题入口。

默认内容是中性占位。将头像文件放入 `public/images/`，再修改 `author.avatar.src` 即可替换。

## 新增笔记

在 `src/content/docs/notes/` 的主题目录中新建 `.md` 或 `.mdx` 文件。路径使用小写英文和连字符，标题与正文可以使用中文。

```yaml
---
title: 笔记标题
description: 一句话说明内容。
published: 2026-08-28
updated: 2026-08-28
tags:
  - 示例
draft: false
---
```

`published`、`updated` 和 `tags` 可省略。最近更新使用 `updated ?? published`；没有日期的笔记排在有日期内容之后。设置 `draft: true` 后，Starlight 会在生产构建中排除该页面，首页查询也会显式排除它。

侧边栏会自动读取三个主题目录中的内容。新增其他顶级主题时，同时在 `src/config/site.ts` 的 `topics` 中补充标题、目录和一个真实存在的代表性笔记链接。

## 站内写作后台

生产环境后台位于 `/admin/`。后台使用独立密码登录，编辑三个现有主题目录，图片保存到 `public/images/notes/`，保存后由 Cloudflare Pages Function 提交到 GitHub `main` 分支并触发自动部署。

在 Cloudflare Pages 项目的 Settings -> Variables and Secrets 中添加三个加密变量，并重新部署：

- `ADMIN_PASSWORD`：后台登录密码，建议使用密码管理器生成至少 20 位随机值。
- `SESSION_SECRET`：用于签名登录 Cookie 的独立随机值，建议至少 32 位。
- `GITHUB_TOKEN`：GitHub Fine-grained personal access token，只授予 `rainydays-blog` 仓库的 Contents `Read and write` 权限。

后台密码和 GitHub Token 只存在于 Cloudflare 服务端环境变量中，不得写入仓库、前端配置或截图。登录会话使用 HttpOnly、Secure、SameSite Cookie，有效期 12 小时。

本地调试 Pages Function 时，将三个变量写入被 Git 忽略的 `.dev.vars`，格式参考 `.env.example`。

## 搜索和主题

全文搜索由 Starlight 的 Pagefind 提供，只能在 `pnpm build` 后的生产预览中完整验证。浅色和深色主题由 Starlight 原生切换器管理。

## 部署限制

首版仅支持部署在域名根路径 `/`，适合自定义域名或根站点静态托管。GitHub Pages 的 `/repo-name/` 项目子路径暂不支持；不要只修改部分链接来尝试兼容，后续应统一增加 base-aware 路径处理。
