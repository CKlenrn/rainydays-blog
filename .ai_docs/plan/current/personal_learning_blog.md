# 个人提升学习笔记博客首版实施计划

## 概述

### Feature Description

从空 Git 仓库搭建一个可直接本地运行和静态部署的个人学习笔记博客。站点使用 Astro + Starlight：根路径 `/` 提供个人主站入口，`/notes/` 提供按主题组织的学习笔记知识库，笔记以 Markdown/MDX 维护。视觉层次与信息架构参考 RainerSeventeen 的“个人信息 -> 内容入口 -> 知识库”思路，但不复制其姓名、头像、邮箱、备案信息、文章、项目数据、品牌资产或具体文案。

首版只解决“展示个人信息、沉淀笔记、方便查找和阅读”三个核心问题，不建设后台、CMS、登录、评论或数据库。

### User Benefits

- 访问者可以从首页快速了解站点定位，并进入学习笔记或关于页面。
- 作者只需新增 Markdown/MDX 文件即可发布笔记，不需要维护数据库或后台。
- 笔记可按主题浏览，并通过 Starlight 内置 Pagefind 搜索全文。
- 主站与笔记页均具备深色模式和移动端适配。
- 姓名、简介、头像、社交链接和首页主题入口集中配置，后续替换个人资料时不必到处改代码。
- 站点静态构建，部署成本低，适合绑定根域名/自定义域名的 GitHub Pages、Cloudflare Pages、Netlify 或任意根路径静态服务器。

### Project Alignment

- 当前仓库只有 `.git/`，没有既有代码或兼容性负担，可直接建立最小 Astro 项目。
- 参考项目使用 Astro、Starlight 和 Markdown 内容源，技术方向与本项目一致。
- 与参考项目的多包、多子域结构不同，首版采用单站结构，减少内容同步脚本、工作区配置和多站部署配置；当内容规模或部署边界确有需要时再拆分。
- 使用 Starlight 原生能力承担文档路由、目录、搜索、代码块、深色模式和可访问性，避免重复实现成熟功能。

### 计划分支名称

`feat/personal_learning_blog`

> 本文档只记录分支名称；计划阶段不创建或切换分支。

## 需求分析

### Functional Requirements

1. 初始化单包 Astro + Starlight 项目，提供 `dev`、`build`、`preview` 和 `check` 命令。
2. 根路径 `/` 展示个人主页，首屏至少包含可配置的姓名/站点名、个人简介、头像或明确的头像占位、进入知识库的主要操作，以及关于页面入口。
3. 首页提供学习主题概览和最近更新笔记，数据来自统一配置及内容集合，不硬编码参考站数据；首版每个主题卡直接链接到该主题已有的代表性示例笔记，禁止生成指向不存在目录页的链接。
4. `/notes/` 提供知识库首页，侧边栏按主题展示示例笔记，并支持文章内目录、上一篇/下一篇等 Starlight 原生阅读能力。
5. 笔记使用 Markdown/MDX 文件维护；frontmatter 至少支持 `title`、`description`、`published`、`updated`、`tags`，并复用 Starlight `docsSchema()` 内置的 `draft` 字段，不重复声明同名 schema。
6. 提供至少 3 篇原创占位示例笔记，分别覆盖学习方法、工具使用和阶段复盘，文案只用于演示结构，不引用参考项目文章。
7. 启用 Starlight 的 Pagefind 搜索，能够按中文标题和正文关键词检索已发布笔记。
8. 启用 Starlight 原生明暗主题切换，并让首页自定义区域同步遵循主题变量与系统偏好。
9. 提供桌面、平板和手机响应式布局，首页卡片、导航、搜索、正文和侧边栏不得溢出或遮挡。
10. 在单个 `src/config/site.ts` 文件集中维护个人资料、站点文案、社交链接、知识库路径和首页主题卡片。
11. 提供通用 favicon/头像占位资源及清晰替换位置；不包含 RainerSeventeen 的品牌图形或个人素材。
12. 提供 README，说明环境要求、安装/启动/构建命令、如何修改个人资料、如何新增笔记及首版部署产物位置。
13. 在实现开始时建立博客项目专属的 `.ai_docs/rules/` 规则集，供后续实现自审和结构审查使用；规则仅覆盖 Astro、TypeScript、Markdown、静态站点与 Git 工作流，不继承 Paper Tracker 的 Python、CLI 或论文检索规则。

### Non-Functional Requirements

- **最小实现**：仅使用 Astro、Starlight 及类型检查所需依赖；不引入 Tailwind、React/Vue、状态管理、服务端适配器或图标库。
- **静态输出**：默认执行 `astro build` 生成静态站点，不依赖运行时服务和数据库。
- **部署边界**：首版明确只支持站点根路径 `/`，`astro.config.ts` 不配置非根 `base`；GitHub Pages 项目子路径等场景留待后续统一引入 base-aware 链接助手后支持。
- **性能**：首页不加载第三方统计脚本或远程运行时资源；首屏头像采用本地资源并声明尺寸，避免布局跳动。
- **可访问性**：使用语义化标题、导航和链接；交互元素有可见焦点；头像有替代文本；颜色对比度满足常规 WCAG AA 阅读要求；尊重 `prefers-reduced-motion`。
- **可维护性**：个人资料只有一个配置源；内容只有 `src/content/docs/` 一个维护入口；不建立生成内容副本或同步脚本。
- **兼容性**：支持当前稳定版 Chrome、Edge、Firefox、Safari；移动端最低按 360px 宽度检查。
- **隐私与原创**：参考站仅用于布局和信息层级分析，禁止复制其身份信息、备案、文章、项目列表、联系信息和品牌资产。
- **内容路径稳定**：目录与 slug 使用小写 ASCII/kebab-case，页面标题和正文可以使用中文，降低跨平台路径和部署编码问题。

### Edge Cases

- 未配置头像或图片加载失败时，显示由站点名生成的文字占位，不留下破图或造成布局位移。
- 社交链接为空时不渲染对应按钮；无效/空字符串不能生成可点击链接。
- 尚无笔记或所有笔记均为草稿时，首页最近更新区域显示明确空状态，构建仍应成功。
- 笔记缺少可选日期、标签或描述时，列表仍可渲染；缺少必填标题时由内容 schema 在构建阶段报错。
- `draft: true` 的内容由 Starlight 在生产路由/侧边栏/Pagefind 中隔离，首页查询还必须显式过滤；开发模式遵循 Starlight 默认行为，不能另造第二套草稿状态。
- 最近更新只接受 `notes/**` 下的非索引内容；`updated` 缺失时使用 `published`，两个日期都缺失时排在有日期内容之后，日期相同或均缺失时按内容 ID/slug 升序稳定排序。
- 长中文/英文标题、长代码块和宽表格在 360px 视口下可换行或横向滚动，不撑破页面。
- JavaScript/localStorage 不可用时，页面仍可阅读，并至少遵循系统配色偏好。
- 站点只按根路径部署；若部署平台要求 `/repo-name/` 等非根 base，首版应明确提示不支持，而不是让部分绝对路径静默失效。
- Pagefind 在开发模式与生产构建的行为可能不同，搜索验收必须基于 `build + preview` 产物完成。

### Dependencies

- Node.js：采用 Astro 当前版本所支持的 LTS 版本，README 中明确最低版本；实施时以实际安装的 Astro/Starlight `engines` 为准。
- 包管理器：pnpm，根 `package.json` 通过 `packageManager` 固定主版本并生成 `pnpm-lock.yaml`。
- 运行依赖：`astro`、`@astrojs/starlight`。
- 开发依赖：`@astrojs/check`、`typescript`。
- 不加入 Tailwind、CMS SDK、数据库客户端、评论 SDK、分析脚本或服务端 adapter。

## 技术设计

### Architecture Overview

采用单个 Astro 应用与单个 Starlight 内容集合：

```mermaid
flowchart LR
    A[src/config/site.ts] --> B[Starlight/Astro 配置]
    A --> C[首页组件]
    D[src/content/docs/index.mdx] --> C
    E[src/content/docs/notes/**/*.md(x)] --> F[Starlight docsLoader]
    F --> G[知识库路由与侧边栏]
    F --> H[首页最近更新查询]
    F --> I[Pagefind 搜索索引]
    B --> J[静态构建 dist/]
    C --> J
    G --> J
    H --> J
    I --> J
```

- `/` 是 Starlight 管理的 splash/自定义首页，保持统一的顶栏、主题和搜索体验。
- `/notes/` 及其子路径由 `src/content/docs/notes/` 中的 Markdown/MDX 生成。
- `/about/` 是同一 docs 集合中的简洁关于页，个人文案只引用集中配置或使用通用占位内容。
- 构建输出为 `dist/`，不包含服务端 API。

### Component Breakdown

#### 配置层

- `src/config/site.ts`
  - 定义并导出站点标题、作者显示名、简介、格言、头像、社交链接、主题卡片和主要路径。
  - 为 Astro 配置与页面组件提供同一份类型安全数据。
  - 初始值使用“你的名字”等明确占位，等待用户替换，不杜撰真实资料。
  - `topics[].href` 必须指向实际存在的代表性示例笔记；首版不为只有一篇文章的主题额外创建空泛目录页。

建议接口：

```ts
export interface SiteConfig {
  title: string;
  description: string;
  author: {
    name: string;
    bio: string;
    motto: string;
    avatar?: { src: string; alt: string };
  };
  links: Array<{
    label: string;
    href: string;
    kind: "github" | "email" | "other";
  }>;
  topics: Array<{
    title: string;
    description: string;
    href: `/notes/${string}/`;
  }>;
  paths: {
    notes: "/notes/";
    about: "/about/";
  };
}
```

#### 内容层

- `src/content.config.ts` 使用 `docsLoader()` 与 `docsSchema()`；只扩展 Starlight 未内置且首页列表需要的 `published`、`updated`、`tags` 字段，`draft` 直接使用 Starlight 内置定义。
- `src/content/docs/index.mdx` 是主页内容入口，frontmatter 必须设置 `template: splash`，随后以标准 MDX 语法导入并渲染首页组件：

```mdx
---
title: 首页
template: splash
---

import HomeLanding from "../../components/home/HomeLanding.astro";

<HomeLanding />
```
- `src/content/docs/notes/index.mdx` 是知识库导览页。
- `src/content/docs/notes/<topic>/<slug>.md` 是实际笔记；首版使用 ASCII 文件路径与中文标题。
- `src/content/docs/about.mdx` 是关于页，只放通用占位说明并提示从配置文件替换资料。

#### 展示层

- `src/components/home/HomeLanding.astro` 负责首页整体内容编排。
- `src/components/home/ProfileIntro.astro` 负责个人信息、头像回退和主要操作。
- `src/components/home/TopicLinks.astro` 渲染配置中的主题入口。
- `src/components/home/RecentNotes.astro` 在 Astro frontmatter 中使用顶层 `await getRecentNotes()` 获取构建期数据，再渲染结果与空状态；不把查询移到浏览器运行时。
- `src/lib/notes.ts` 封装范围过滤、索引页排除、草稿过滤、日期回退、稳定排序和截取逻辑，避免在模板中堆叠业务逻辑。
- `src/styles/custom.css` 复用 Starlight CSS 变量完成首页和内容细节样式，覆盖浅色/深色、响应式和 reduced-motion 状态。

若实现时发现上述首页子组件每个都只有少量无复用模板，可合并到 `HomeLanding.astro`，以“减少文件而不牺牲可读性”为准，不为了计划结构强行拆分。

#### 框架层

- `astro.config.ts` 集成 Starlight，配置标题、描述、语言、favicon、自定义 CSS、Pagefind 搜索和按 `notes` 目录自动生成的侧边栏；保持根路径部署，关闭 Starlight 的 Git `lastUpdated`，避免与 frontmatter 日期形成双源。
- Starlight 原生组件负责文档顶栏、搜索弹窗、主题切换、侧边栏、目录和分页导航；首版不覆盖 Header/Search/Sidebar 等框架核心组件。

#### 工程规则层

- `.ai_docs/rules/code_rules.md`：约束 Astro/TypeScript/Markdown 实现，包括严格类型、静态输出、集中配置、内容目录单一来源、Starlight 内置草稿字段、frontmatter 单一日期源、根路径部署、可访问性、资源路径和依赖最小化。
- `.ai_docs/rules/code_review_structure_rules.md`：检查配置、内容、查询逻辑、组件和样式之间的边界，避免重复数据源、循环依赖、无必要的 Starlight 核心组件覆盖和过度拆分。
- `.ai_docs/rules/testing_rules.md`：规定 `pnpm check`、`pnpm build` 和生产预览手工测试为首版门禁，重点覆盖 Pagefind、深色模式、断点、键盘访问和草稿过滤；临时 fixture 必须以固定路径创建并在 `finally`/等价清理步骤中删除，默认不创建测试框架。
- `.ai_docs/rules/git_rules.md`：规定 `feat/<feature_name>` 分支、清晰的小步提交、依赖变化才更新锁文件，以及禁止提交 `node_modules/`、`dist/`、`.astro/` 和本地秘密。
- 四份规则保持短小、可执行，并明确优先遵循仓库根 `AGENTS.md`（若后续建立）和用户最新指令；不得复制 Paper Tracker 的语言栈专属条款。

### Data Flow

1. 作者在 `src/config/site.ts` 修改个人信息，在 `src/content/docs/notes/` 新增 Markdown/MDX。
2. Astro 构建时由 `docsLoader` 读取内容，`docsSchema` 校验 frontmatter。
3. Starlight 根据目录生成 `/notes/**` 页面和侧边栏，并在生产模式排除内置 `draft: true` 内容。
4. `getRecentNotes()` 只接受 ID 位于 `notes/` 下且最后一个路径段不是 `index` 的条目，显式排除 `draft: true`；按 `updated ?? published` 降序、无日期置后、最终按 ID/slug 升序稳定排序，再截取最近内容。
5. Starlight/Pagefind 在生产构建中为已发布页面生成搜索索引。
6. 静态文件输出到 `dist/`，部署平台直接托管该目录。

### Configuration Changes

- 新增 `src/config/site.ts` 作为唯一个人配置入口。
- `astro.config.ts` 从该文件读取 `title`、`description` 等站点级字段，避免重复常量。
- `src/content.config.ts` 只扩展 `published`、`updated`、`tags`，不重复定义 Starlight 已提供的 `draft`。
- 不引入 `.env`；首版没有密钥或运行时配置。部署域名确定后，只需在 Astro 配置中增加 `site`，不改变内容架构。
- `astro.config.ts` 使用默认根 `base` 且设置 `lastUpdated: false`；日期展示与最近更新排序唯一读取笔记 frontmatter 的 `updated ?? published`。
- `.gitignore` 忽略 `node_modules/`、`dist/`、`.astro/` 和常见本地环境文件，但保留示例配置和内容。

### API/Interface Definitions

笔记 frontmatter 约定：

```yaml
---
title: 建立可持续的学习复盘
description: 用轻量模板记录目标、证据和下一步行动。
published: 2026-08-28
updated: 2026-08-28
tags:
  - 学习方法
  - 复盘
draft: false
---
```

最近更新查询对组件暴露最小模型：

```ts
export interface NoteSummary {
  title: string;
  description: string;
  href: string;
  date?: Date;
  tags: string[];
}

export function getRecentNotes(limit?: number): Promise<NoteSummary[]>;
```

`getRecentNotes()` 的过滤/排序契约：

1. 将内容 ID 的分隔符统一为 `/`。
2. 仅保留以 `notes/` 开头的条目。
3. 排除最后路径段为 `index` 的所有索引页，而不只排除 `/notes/index`。
4. 显式排除 `data.draft === true`。
5. 使用 `updated ?? published` 作为唯一日期；有日期条目降序、无日期条目置后，最后按规范化 ID 升序打破平局。

该项目没有网络 API、认证接口或数据库 schema。

### 关键设计决策与备选方案

1. **选用单站而非参考项目的 pnpm workspace 双站结构。**
   - 采用：根路径主页 + `/notes/` 知识库，共用一次构建和部署。
   - 原因：完整覆盖首版需求，且不需要跨包内容同步、双端口脚本和跨域配置。
   - 备选：以后确需 `note.example.com` 独立域名、独立发布周期或独立权限时，再拆为 `packages/home` 与 `packages/note`。
2. **主页也置于 Starlight 路由体系。**
   - 采用：`src/content/docs/index.mdx` + 自定义首页组件。
   - 原因：直接共享 Starlight 顶栏、搜索、深色模式和无障碍行为。
   - 备选：独立 `src/pages/index.astro` 可获得更完全的视觉控制，但需要重复实现主题/搜索导航，不适合首版。
3. **使用原生 CSS，不引入 Tailwind。**
   - 采用：单个 `custom.css` 基于 Starlight 变量定制。
   - 原因：首页规模小，额外 CSS 框架不会降低首版复杂度。
   - 备选：组件显著增加且形成统一 utility 需求后再评估 Tailwind。
4. **目录即导航，避免单独导航注册表。**
   - 采用：Starlight `autogenerate` 从 `notes` 目录生成侧边栏，首页主题卡仅在个人配置中维护。
   - 原因：新增文章无需同步两份导航定义。
   - 备选：需要严格人工排序、别名或跨目录聚合时，再增加 Starlight 显式 sidebar 配置。
5. **内容随 Git 管理，不接 CMS。**
   - 采用：Markdown/MDX + Git。
   - 原因：适合个人学习笔记、可审阅、易备份、零服务维护。
   - 备选：出现非技术编辑协作或移动端在线编辑刚需后，再评估 Git-based CMS。
6. **首版限定根路径部署。**
   - 采用：所有公开路径以 `/` 为基准，`base` 保持默认值；README 明确 GitHub Pages 项目子路径不在首版支持范围内。
   - 原因：当前集中配置和 Starlight 路由均面向单域根路径，强行兼容非根 base 会扩大所有链接和资源处理的范围。
   - 备选：出现明确的项目子路径部署需求时，统一增加 `withBase()`/Astro base-aware URL 方案并一次性迁移，不接受局部兼容。
7. **frontmatter 是唯一内容日期来源。**
   - 采用：`updated ?? published` 负责最近更新排序和日期展示，Starlight Git `lastUpdated` 关闭。
   - 原因：Git 时间在迁移、浅克隆和不同部署环境中可能变化，双源也会导致页面显示与首页排序不一致。
   - 备选：未来若决定完全采用 Git 日期，应同时移除 `updated` 业务语义和相关 schema/展示，不能双轨并存。

## 实施策略

### Implementation Phases

#### Phase 1：项目骨架与依赖

1. 先创建 `.ai_docs/rules/code_rules.md`、`code_review_structure_rules.md`、`testing_rules.md` 和 `git_rules.md`，写入本计划定义的 Astro/TypeScript/Markdown 项目约束，使后续实现和双重审查从第一步起有据可依。
2. 创建根 `package.json`、`pnpm-lock.yaml`、`tsconfig.json`、`astro.config.ts`、`.gitignore`。
3. 安装兼容版本的 Astro、Starlight、Astro check 和 TypeScript；记录 Node/pnpm 要求。
4. 建立 `src/content.config.ts` 与最小 docs 集合，运行 `pnpm check` 和 `pnpm build` 验证空骨架。

#### Phase 2：集中配置与首页

1. 创建 `src/config/site.ts`，填入非个人化占位数据；每个主题入口直接指向 Phase 3 会创建的代表性示例笔记路径。
2. 创建本地通用 favicon/头像占位；头像缺失时实现稳定的文字回退。
3. 创建带 `template: splash` 的 `index.mdx`，用 MDX import 渲染 `HomeLanding.astro`；组件在 Astro frontmatter 中顶层等待最近笔记查询，构建主页的个人介绍、知识库主操作、关于入口、主题概览和最近更新。
4. 用 `src/styles/custom.css` 完成参考站式的克制排版与清晰信息层级，但使用独立颜色、文案和资产。

#### Phase 3：知识库与示例内容

1. 创建 `/notes/` 知识库导览页与 `/about/` 页面。
2. 创建 3 个主题目录及各 1 篇原创结构示例笔记。
3. 配置自动侧边栏、中文语言、搜索和主题切换，并关闭 Git `lastUpdated`；日期只从 `published`/`updated` frontmatter 用于首页卡片展示与排序。
4. 实现 `getRecentNotes()` 并接入首页，严格限定 `notes/**`、排除所有 `index` 和草稿，按约定执行日期回退与稳定排序。

#### Phase 4：文档、校验与交付

1. 编写 README，说明个人化入口、新增笔记流程、命令及根路径静态部署方式；Windows 示例不使用 `bash`、`source`、行内环境变量或 `&&`，所有 package scripts 直接调用跨平台 Astro/pnpm 命令。
2. 执行类型检查和生产构建，修复内容 schema、链接和资源路径问题。
3. 使用生产预览手工验证搜索、深色模式、页面导航和响应式布局；README 将 `pnpm build` 与 `pnpm preview` 分行，说明预览服务器常驻终端 A，终端 B 用于其余检查/操作，结束后用 `Ctrl+C` 停止。
4. 检索仓库，确认没有出现参考作者的姓名、邮箱、域名、备案号、文章文本或项目数据。

### File Structure Changes

预计新增结构：

```text
.
├── .ai_docs/plan/current/personal_learning_blog.md
├── .ai_docs/rules/
│   ├── code_rules.md
│   ├── code_review_structure_rules.md
│   ├── testing_rules.md
│   └── git_rules.md
├── .gitignore
├── README.md
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── astro.config.ts
├── public/
│   ├── favicon.svg
│   └── images/
│       └── avatar-placeholder.*
└── src/
    ├── components/home/
    │   ├── HomeLanding.astro
    │   ├── ProfileIntro.astro        # 可按实际复杂度合并
    │   ├── RecentNotes.astro         # 可按实际复杂度合并
    │   └── TopicLinks.astro           # 可按实际复杂度合并
    ├── config/
    │   └── site.ts
    ├── content.config.ts
    ├── content/docs/
    │   ├── index.mdx
    │   ├── about.mdx
    │   └── notes/
    │       ├── index.mdx
    │       ├── learning-methods/
    │       │   └── sustainable-review.md
    │       ├── tools/
    │       │   └── markdown-workflow.md
    │       └── reflections/
    │           └── weekly-review.md
    ├── lib/
    │   └── notes.ts
    └── styles/
        └── custom.css
```

### Code Locations

- 实现、自审、结构审查、测试与 Git 规则：`.ai_docs/rules/`；这些规则必须在其他产品代码之前创建。
- 项目/构建配置：仓库根目录和 `astro.config.ts`。
- 个人资料和首页入口配置：`src/config/site.ts`。
- 内容类型校验：`src/content.config.ts`。
- 页面内容：`src/content/docs/`。
- 首页视图：`src/components/home/`。
- 笔记查询与排序：`src/lib/notes.ts`。
- 主题及响应式样式：`src/styles/custom.css`。
- 使用说明：`README.md`。

### Integration Points

- `plan-implement-dual-review` 的实现 agent 先读取计划并创建 `.ai_docs/rules/`，随后按 `code_rules.md` 自审；结构审查 agent 再按 `code_review_structure_rules.md` 检查最终实现。
- `astro.config.ts` 导入 `siteConfig` 并传入 Starlight。
- Starlight `customCss` 加载 `src/styles/custom.css`。
- `index.mdx` 导入并渲染 `HomeLanding.astro`。
- `index.mdx` 的 frontmatter 明确设置 `template: splash`，MDX import 位于 frontmatter 之后。
- `HomeLanding.astro` 读取 `siteConfig`，在 Astro frontmatter 中通过顶层 `await` 调用 `getRecentNotes()`。
- `getRecentNotes()` 通过 Astro Content Collections 读取 docs 集合。
- Starlight sidebar 对 `notes` 目录执行 `autogenerate`。
- Starlight 生产构建负责从路由、自动侧边栏和 Pagefind 同时排除内置 `draft: true` 页面；首页查询另做显式过滤作为调用方保护。

## 测试计划

首版不新增自动化测试模块，按功能风险执行手工测试，并以 `astro check` 和生产构建作为基础质量门禁。

### Test Scenarios

1. **依赖与构建**
   - 操作：在干净环境依次执行 `pnpm install --frozen-lockfile`、`pnpm check`、`pnpm build`；每条命令单独运行，不依赖 Bash 或 `&&`。
   - 预期：命令均成功，`dist/` 生成，无 TypeScript/content schema 错误。
2. **主页信息架构**
   - 操作：访问 `/`，检查个人简介、头像/回退、知识库 CTA、关于入口、主题卡和最近更新，并逐个点击主题卡。
   - 预期：所有区块可见且链接正确；每个主题卡进入实际存在的代表性笔记，无 404；页面不包含参考作者信息。
3. **知识库导航**
   - 操作：访问 `/notes/`，依次打开 3 篇示例笔记，使用侧边栏、目录和上一篇/下一篇导航。
   - 预期：路由无 404，当前位置明确，导航顺序稳定。
4. **Markdown 能力**
   - 操作：检查标题、列表、引用、链接、表格和代码块示例。
   - 预期：内容排版清楚，长代码块可滚动，宽表格不破坏页面。
5. **生产搜索**
   - 操作：终端 A 先执行 `pnpm build`，成功后另起一行执行并保持 `pnpm preview`；终端 B 保留给检查命令。通过预览站搜索每篇示例笔记中的唯一中文关键词，结束后在终端 A 按 `Ctrl+C`。
   - 预期：已发布笔记出现在结果中，点击后进入正确页面；草稿不进入结果。
6. **主题切换**
   - 操作：在主页和笔记页切换浅色/深色，刷新并切换系统偏好。
   - 预期：主题选择按 Starlight 规则保持，首页自定义区域没有闪烁、低对比文本或错误配色。
7. **响应式布局**
   - 操作：在 360x800、768x1024、1440x900 三个视口检查主页、搜索框、侧边栏和文章页。
   - 预期：无横向页面滚动、文字遮挡、按钮截断或布局跳动；移动导航可正常开关。
8. **键盘与可访问性**
   - 操作：仅用键盘遍历导航、搜索、主题切换和主要链接；检查图片 alt 与标题层级。
   - 预期：焦点顺序合理、焦点样式清楚、所有操作可触达、页面只有一个主 H1。
9. **内容边界**
   - 操作：测试只含 `published`、同时含 `updated`、两个日期都缺失、同日期的笔记，以及长标题、空社交链接和缺失头像。
   - 预期：最近更新只收录 `notes/**` 下非 `index`、非草稿内容；`updated ?? published` 降序，无日期置后，同日期按规范化 ID 稳定排序；其余回退状态正确。
10. **草稿生产隔离与 fixture 清理**
    - 操作：以固定临时路径 `src/content/docs/notes/test-fixtures/draft-pagefind-fixture.md` 创建 `draft: true` 笔记，标题/正文包含唯一标识 `DRAFT-PAGEFIND-FIXTURE-8D72`；在清理保护（PowerShell `try/finally` 或等价机制）内完成生产构建。用 `rg -a` 检查整个 `dist/`（包括 HTML 与 `dist/pagefind/`）不含临时 slug 和唯一标识，再在生产预览中检查 `/notes/` 侧边栏及搜索结果。停止预览后由 `finally` 删除 fixture，并执行 `Test-Path`/`git status --short` 确认未残留。
    - 预期：fixture 不生成生产页面、不出现在侧边栏和 Pagefind 搜索中，首页最近更新也不出现；无论测试成功或失败，临时源文件最终都被删除。
11. **根路径部署限制**
    - 操作：在默认 `base: "/"` 的生产预览中检查首页、favicon、主题卡、关于页和笔记链接；同时检查 README 的部署限制说明。
    - 预期：根路径下资源/链接全部正常；README 明确项目子路径部署不属于首版支持范围，不承诺局部兼容。
12. **原创与隐私检查**
    - 操作：在仓库中搜索 `RainerSeventeen`、参考域名及参考项目个人标识。
    - 预期：除计划文档中用于说明“禁止复制”的必要提及外，产品代码、内容、资源和 README 中无参考作者数据。
13. **规则文件适用性**
    - 操作：逐份检查 `.ai_docs/rules/`，并用其条目执行一次实现自审和结构审查。
    - 预期：四份文件均存在、条目可操作，仅涉及 Astro/TypeScript/Markdown/静态站点/Git，不包含 Python、CLI、论文数据源等 Paper Tracker 专属要求。

### Test Data and Expected Results

| 测试数据 | 用途 | 预期结果 |
|---|---|---|
| 3 篇不同目录的原创示例笔记 | 导航、最近更新、搜索 | 均可访问，并按日期稳定排序 |
| 每篇一个唯一中文关键词 | 搜索 | 生产预览中能命中正确文章 |
| 固定路径、唯一标识、`draft: true` 的临时笔记 | 草稿过滤 | 不出现在首页、生产页面、侧边栏和 Pagefind；测试结束无 fixture 残留 |
| 仅 `published`、含 `updated`、无日期、同日期笔记 | 日期与排序 | 严格按 `updated ?? published`、无日期置后、ID 打破平局 |
| 超长中英文混合标题 | 响应式 | 卡片和正文标题换行且不溢出 |
| 空 links 数组 | 配置回退 | 不渲染空社交区或无效按钮 |
| 缺失 avatar 配置 | 媒体回退 | 显示固定尺寸文字占位，无布局位移 |

## 验收标准

### Success Metrics

- [ ] `pnpm install --frozen-lockfile`、`pnpm check` 和 `pnpm build` 全部成功。
- [ ] `/`、`/about/`、`/notes/` 和 3 篇示例笔记均可在生产预览访问。
- [ ] 首页包含个人入口、知识库入口、主题概览和最近更新，且资料由 `src/config/site.ts` 集中控制。
- [ ] 每个首页主题卡都指向已存在的代表性笔记，不存在空链接或 404 目录入口。
- [ ] 作者可以仅通过新增 Markdown/MDX 文件发布一篇新笔记。
- [ ] Pagefind 能检索中文示例内容；草稿不会进入首页、生产页面、侧边栏或搜索索引，临时 fixture 测试后无文件残留。
- [ ] 最近更新只包含 `notes/**` 非索引内容，并按 frontmatter `updated ?? published` 及 ID 平局规则稳定排序；未启用 Git `lastUpdated`。
- [ ] 浅色/深色主题在主页与知识库之间表现一致并可保持选择。
- [ ] 360px、768px 和 1440px 视口下没有内容遮挡或非预期横向滚动。
- [ ] 关键导航和操作可使用键盘完成，图片和图标具备可访问名称。
- [ ] 产品代码、内容和资源未复制参考作者的个人或项目数据。
- [ ] README 足以指导用户修改个人资料、添加笔记、运行和构建站点。
- [ ] 首版没有后台、CMS、登录、评论、数据库和服务端运行时。
- [ ] 所有 package scripts 可在 Windows PowerShell 直接运行，README 的构建/预览命令分行且说明两个终端与 `Ctrl+C` 停止流程。
- [ ] 站点在根路径生产预览正常，README 明确非根 base 部署暂不支持。
- [ ] `.ai_docs/rules/` 下四份项目规则齐全，并已实际用于实现自审、结构审查、测试和 Git 变更检查。

### User Acceptance

用户在安装 Node.js LTS 与 pnpm 后，可以按照 README 在本机启动站点；只需编辑 `src/config/site.ts` 即可替换个人资料，只需在 `src/content/docs/notes/` 新建 Markdown/MDX 即可添加笔记。生产预览中能够浏览、搜索和切换主题，并在常见桌面及手机尺寸下正常使用，即视为首版通过验收。

## 明确假设

- 首版使用单域名、根路径部署和路径式知识库（`/notes/`），不要求主站与笔记站分别部署到不同子域名，也不支持 GitHub Pages 项目子路径等非根 base。
- 用户尚未提供姓名、头像、简介、社交链接和正式域名，因此实现使用清晰的中性占位内容，并把替换入口集中到 `src/config/site.ts`。
- 示例笔记只用于演示内容结构，由项目新写，不复用参考仓库文章。
- 用户接受 pnpm 作为包管理器，并可安装 Astro 当前支持的 Node.js LTS。
- 首版部署目标是根路径静态托管；具体平台和自定义域名配置在平台确定后补充，非根 base 作为后续独立需求处理。
- 首版不要求数学公式、RSS、站点统计、评论、在线编辑、全文内容 API、多语言或离线 PWA。
- 后续实施使用 `plan-implement-dual-review`；其实现 agent 会先按计划创建并使用本博客专属规则集，结构审查 agent 以新建的结构规则为依据。
- 当前阶段只输出计划，不创建分支、不安装依赖、不实现站点。
