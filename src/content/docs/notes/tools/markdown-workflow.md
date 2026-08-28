---
title: 轻量 Markdown 笔记工作流
description: 用稳定目录、简短 frontmatter 和版本控制维护可检索笔记。
published: 2026-08-22
tags:
  - Markdown
  - 工作流
draft: false
---

Markdown 的优势不在语法简单，而在于内容可以脱离某个编辑器长期保存。一个轻量工作流只需要解决三件事：放在哪里、如何命名、何时整理。

## 目录和命名

目录表示长期主题，文件表示一个可以独立回答的问题。路径使用小写英文和连字符，标题可以写中文：

```text
notes/
  learning-methods/
    sustainable-review.md
  tools/
    markdown-workflow.md
```

这种方式能让链接稳定，也方便在不同操作系统和部署平台之间迁移。

## 保持 frontmatter 简短

```yaml
---
title: 一篇笔记的标题
description: 一句话说明它解决什么问题。
published: 2026-08-22
tags:
  - 示例
draft: false
---
```

正文中的**检索短语钩子**应该自然描述核心概念，而不是堆砌标签。以后搜索时，问题、结论和自己的例子往往比分类名称更容易命中。

## 整理节奏

- 随手记录进入临时草稿。
- 完成一次验证后再放入正式主题目录。
- 每周修正失效链接和模糊标题。
- 每月合并重复笔记，保留更清楚的一篇。

工具只负责降低摩擦。真正有价值的是持续把零散记录变成可以再次使用的答案。

