# AI 修改守则 (AI_GUIDELINES.md)

> 本文档是 AI 助手在修改本项目代码时的强制性约束。任何对本项目的代码变更都必须遵守以下规则。
> 最后扫描时间：2026-05-02

---

## 第一板块：代码死理（硬性约束）

### 一、Biome 强制规则（已在 biome.json 中配置，违反将直接报错）

| # | 规则 | 级别 | 说明 |
|---|------|------|------|
| 1 | `noForEach` | **error** | **禁止使用 `Array.prototype.forEach()`**。所有遍历必须改用 `for...of` 循环。 |
| 2 | `noUselessElse` | **error** | **当 `if` 分支中包含 `return`/`break`/`continue`/`throw` 时，禁止使用 `else`**。直接在 `if` 之后写后续逻辑即可。 |
| 3 | `useNodejsImportProtocol` | **error** | **导入 Node.js 内置模块时必须带 `node:` 前缀**。例如：`import path from "node:path"` 而非 `import path from "path"`。 |
| 4 | `noExplicitAny` | **error** | **禁止使用 `any` 类型**。必须给出明确的类型定义。如果实在无法确定类型，可使用 `unknown` 并配合类型守卫。 |
| 5 | `noNonNullAssertion` | **warn** | **避免使用非空断言 `!`**（如 `foo!.bar`）。应改用可选链 `?.`、空值合并 `??` 或显式类型守卫。 |

### 二、从项目代码习惯中提取的额外规则

| # | 规则 | 说明 |
|---|------|------|
| 6 | **缩进必须使用 Tab** | biome.json 中 `indentStyle: "tab"`，不得使用空格缩进。 |
| 7 | **字符串必须使用双引号** | biome.json 中 `quoteStyle: "double"`，不得使用单引号（Svelte 文件除外）。 |
| 8 | **import 语句必须排序** | biome.json 中 `organizeImports: true`，import 语句会被自动排序，不要手动打乱顺序。 |
| 9 | **Svelte 文件有特殊豁免** | `.svelte` 和 `.vue` 文件中 `useConst` 和 `useImportType` 规则被关闭（因为 Svelte 编译器的限制）。但其他规则仍然适用。 |
| 10 | **CSS 文件不经过 Biome 检查** | `src/**/*.css` 被排除在 Biome 之外，CSS 修改不会触发 Lint 报错，但仍需遵守项目 CSS 规范（见下文）。 |

### 三、CSS/样式硬性约束

| # | 规则 | 说明 |
|---|------|------|
| 11 | **禁止硬编码颜色值** | 所有颜色必须通过 CSS 变量引用（如 `var(--primary)`、`var(--page-bg)`、`var(--text-primary)` 等）。项目已定义完整的亮/暗色变量体系，详见 `src/styles/main.css` 的 `:root` 和 `.dark` 选择器。唯一例外是 `is:inline` 防闪烁脚本中的硬编码色值（如 `#1c1814`、`#fff8f0`）。 |
| 12 | **透明度使用 `color-mix` 而非 `rgba`** | 如需透明色，优先使用 `color-mix(in srgb, var(--x) N%, transparent)` 而非 `rgba(数值)`。 |
| 13 | **视口高度使用 `100dvh`** | 不要使用 `100vh`，应使用 `100dvh`（动态视口高度，兼容移动端浏览器地址栏）。 |

### 四、TypeScript 约束

| # | 规则 | 说明 |
|---|------|------|
| 14 | **所有 TypeScript 必须通过 `tsc --noEmit`** | 项目有严格的类型检查，修改后必须运行 `pnpm type-check`。 |
| 15 | **类型定义集中在 `src/types/`** | 新增类型应放在 `src/types/` 目录下，复用现有类型结构。 |

---

## 第二板块：博客逻辑地图（给非技术人员看的架构说明）

### 一、项目技术栈

| 组件 | 技术 | 说明 |
|------|------|------|
| 框架 | **Astro 6** | 静态网站生成器，本项目采用 SSR 模式（`output: "server"`）部署到 Vercel |
| 交互组件 | **Svelte 5** | 用于需要客户端交互的部分（主题切换、点赞、评论、访问计数等） |
| 样式 | **Tailwind CSS 3** | 实用优先的 CSS 框架，通过 class 直接写样式 |
| 包管理器 | **pnpm** | 严格锁定，不支持 npm/yarn |
| 代码检查 | **Biome 1.9.4** | 同时负责格式化和 Lint，替代了 ESLint + Prettier |
| 图标 | **Iconify** | 使用 Font Awesome 6 和 Material Symbols 图标集 |
| 图片灯箱 | **PhotoSwipe** | 点击文章内图片可放大查看 |
| 数学公式 | **KaTeX** | 支持在 Markdown 中写 LaTeX 数学公式 |
| 搜索 | **Pagefind** | 仅在生产构建后生效，开发环境使用 RSS + pinyin-pro 的模糊搜索 |
| 访问统计 | **不蒜子 (busuanzi)** | 免费的页面访问量统计服务 |
| 部署 | **Vercel** | 含 Vercel Speed Insights 性能监控 |

### 二、文章存放在哪？

你的所有内容都存放在 `src/content/` 目录下，分为 5 个"内容集合"：

| 集合 | 路径 | 用途 | 文件格式 |
|------|------|------|----------|
| **posts** | `src/content/posts/` | 博客文章（可含子文件夹，如 `travel/`） | `.md` / `.mdx` |
| **notes** | `src/content/notes/` | 随记/碎碎念 | `.md` / `.mdx` |
| **exhibition** | `src/content/exhibition/` | 图册/相册 | `.md` / `.mdx` / `.yaml` / `.json` |
| **friends** | `src/content/friends/` | 友链（每个文件代表一个友链） | `.md` / `.mdx` |
| **about** | `src/content/about/` | 关于页面内容 | `.md` / `.mdx` |

此外还有两个 YAML 配置文件直接放在 `src/content/` 下：
- `announcement.yaml` — 首页公告配置
- `exhibition-announcement.yaml` — 图册页面公告配置

**文章 Frontmatter 字段（posts 集合）：**

```yaml
title: "文章标题"          # 必填
published: 2024-01-01      # 必填，发布日期
updated: 2024-01-02        # 可选，更新日期
draft: false               # 可选，是否为草稿（生产环境会隐藏草稿）
description: "摘要"        # 可选
image: "cover.webp"        # 可选，封面图路径
tags: ["标签1", "标签2"]    # 可选，标签数组
category: "分类名"          # 可选，分类（单选）
lang: ""                   # 可选，文章语言
```

### 三、首页是怎么生成的？

首页由 `src/pages/[...page].astro` 生成，这是一个分页页面：

1. **获取所有文章**：调用 `getSortedPosts()` 获取所有 posts 集合中的文章，按发布日期降序排列
2. **分页展示**：每页显示 8 篇文章（`PAGE_SIZE = 8`），通过 Astro 的 `paginate` 功能实现
3. **页面布局**：
   - **顶部**：个人资料卡片（头像、名字、简介、GitHub 链接）
   - **中部**：最新文章列表 + 分页控件
   - **侧边栏（桌面端）**：访问量统计、分类列表、标签列表、友链
   - **移动端**：公告、友链、分类、标签等以网格布局展示

### 四、博客有哪些核心功能？

| 功能 | 说明 | 对应页面/组件 |
|------|------|---------------|
| **文章浏览** | 按时间排序的文章列表，支持分页 | `pages/[...page].astro` → `PostCard.astro` |
| **文章详情** | 完整文章页，含字数统计、阅读时间、目录、上/下篇导航、点赞、评论、阅读量 | `pages/posts/[...slug].astro` → `PostPage.astro` |
| **分类系统** | 按 category 字段分组，有独立的分类列表和分类详情页 | `pages/archive/category/[category].astro` |
| **标签系统** | 按 tags 字段分组，有标签总览页和标签详情页 | `pages/archive/tags.astro` + `pages/archive/tag/[tag].astro` |
| **归档页** | 展示所有文章的时间线 | `pages/archive/index.astro` → `ArchivePanel.astro` |
| **搜索** | 生产环境使用 Pagefind（构建后自动生成索引），开发环境使用 RSS + pinyin-pro | `Search.svelte`（动态加载） |
| **随记/笔记** | 独立于文章的短内容，有自己的列表和详情页 | `pages/notes/` |
| **图册/作品展** | 照片相册展示，支持 Markdown 内图片、YAML 配置图片、本地图片三种来源 | `pages/pictures.astro` + `pages/pictures/[slug].astro` |
| **友链** | 展示友站链接，数据来自 `src/content/friends/` | `pages/friends/index.astro` → `FriendsPanel.astro` |
| **跨平台更新** | 汇总其他平台的内容链接，数据来自 `src/data/updates.json` | `pages/updates/index.astro` |
| **关于页** | 个人介绍，内容来自 `src/content/about/about.md` | `pages/about.astro` |
| **亮暗主题切换** | 支持亮色、暗色、跟随系统三种模式，通过 localStorage 持久化 | `LightDarkSwitch.svelte` + `setting-utils.ts` |
| **文章点赞** | 使用 Svelte 组件实现，通过 API 路由存储（Vercel KV/本地） | `LikeButton.svelte` + `pages/api/likes.ts` |
| **评论系统** | 嵌入式评论组件 | `Comment.astro` |
| **文章目录 (TOC)** | 根据 heading 自动生成目录，支持滚动高亮和移动端弹出 | `Toc.astro` + `TocTree.astro` |
| **阅读进度条** | 页面顶部的进度条 | `PageProgress.astro` |
| **返回顶部** | 浮动按钮 | `BackToTop.astro` |
| **访问量统计** | 全站和单篇文章的访问量 | `VisitorCounter.svelte` + `PageViewCounter.svelte` |
| **RSS 订阅** | 自动生成 RSS XML | `pages/rss.xml.ts` |
| **站点地图** | 自动生成 sitemap.xml | `@astrojs/sitemap` 集成 |
| **SEO** | 完整的 Open Graph、Twitter Card、JSON-LD 结构化数据 | `Layout.astro` 中的 meta 标签 |
| **i18n** | 中英文国际化支持 | `src/i18n/` 目录 |
| **公告系统** | 首页和图册页可配置公告 | YAML 配置 + 组件 |
| **图片灯箱** | 文章内图片点击放大，支持缩放和手势 | PhotoSwipe 集成 |
| **数学公式** | Markdown 中支持 LaTeX 公式 | remark-math + rehype-katex |
| **Markdown 增强** | 支持 admonition（提示框）、GitHub 卡片、自定义图片包装等 | 自定义 remark/rehype 插件 |
| **面包屑导航** | 文章页面顶部显示路径 | `Breadcrumb.astro` |
| **许可证声明** | 文章底部显示 CC BY-NC-SA 4.0 许可 | `License.astro` |
| **Vercel 性能监控** | 自动收集 Web Vitals | `@vercel/speed-insights` |

### 五、页面路由地图

```
/                          → 首页（分页文章列表）
/posts/{slug}/             → 文章详情页
/archive/                  → 归档页（时间线）
/archive/tags/             → 标签总览
/archive/tag/{tag}/        → 按标签筛选
/archive/category/{cat}/   → 按分类筛选
/archive/category/uncategorized/ → 未分类文章
/notes/                    → 随记列表
/notes/{slug}/             → 随记详情
/friends/                  → 友链页
/pictures/                 → 图册列表
/pictures/{slug}/          → 相册详情
/updates/                  → 跨平台更新
/about/                    → 关于页
/404/                      → 404 页面
/rss.xml                   → RSS 订阅
/robots.txt                → 爬虫规则
/api/likes                 → 点赞 API
/api/messages              → 留言 API
/api/visitor               → 访问量 API
/api/status                → 状态 API
```

### 六、布局层级关系

```
Layout.astro               → 最外层：HTML 骨架、meta 标签、主题初始化、PhotoSwipe、View Transitions
  └─ MainGridLayout.astro  → 中间层：导航栏、Banner、主内容网格（8+4 列）、侧边栏、页脚、阅读进度条
       └─ 各页面           → 具体页面内容
```

### 七、配置文件一览

| 文件 | 用途 |
|------|------|
| `src/config.ts` | 网站核心配置（标题、语言、主题色、Banner、导航栏、个人资料、许可证、访问统计） |
| `src/content.config.ts` | 内容集合的 Schema 定义（5 个集合的字段约束） |
| `src/constants/constants.ts` | 全局常量（分页大小、主题模式、Banner 高度、页面宽度） |
| `src/constants/link-presets.ts` | 导航栏链接预设 |
| `src/i18n/i18nKey.ts` | i18n 键名定义 |
| `src/i18n/languages/zh_CN.ts` | 中文翻译 |
| `src/i18n/languages/en.ts` | 英文翻译 |
| `src/data/updates.json` | 跨平台更新数据 |
| `src/content/announcement.yaml` | 首页公告 |
| `src/content/exhibition-announcement.yaml` | 图册页公告 |
| `astro.config.mjs` | Astro 框架配置 |
| `biome.json` | 代码格式化和 Lint 配置 |
| `package.json` | 项目依赖和脚本 |

---

## 第三板块：AI 修改规范（防止胡乱修改）

### 一、每次修改后必须执行的自检

```bash
# 1. Biome 格式化 + Lint 检查（必须通过）
pnpm lint
# 等价于：npx @biomejs/biome check --write .

# 2. TypeScript 类型检查（必须通过）
pnpm type-check
# 等价于：tsc --noEmit

# 3. 完整检查（Astro check + TypeScript）
pnpm check
```

**任何代码修改后，以上三个命令必须全部通过，否则不得提交。**

### 二、布局和组件修改规范

1. **禁止引入新的 UI 库或框架**。项目当前使用 Astro + Svelte + Tailwind CSS + Iconify，这是唯一的技术栈。不得引入 React、Vue、Preact 等其他框架。
2. **禁止引入新的 CSS 框架**。样式必须使用 Tailwind CSS 工具类 + 项目已有的 CSS 变量体系。
3. **修改布局时必须保持响应式**。项目有完整的移动端适配（768px 断点），任何布局修改都必须同时考虑桌面端和移动端。
4. **组件命名必须遵循现有约定**：
   - `.astro` 组件使用 PascalCase（如 `PostCard.astro`）
   - `.svelte` 组件使用 PascalCase（如 `LikeButton.svelte`）
   - `.ts` 工具文件使用 kebab-case（如 `content-utils.ts`）
5. **新增页面必须考虑 i18n**。至少在 `src/i18n/i18nKey.ts` 和 `src/i18n/languages/zh_CN.ts` 中添加对应翻译。
6. **新增页面如果需要出现在导航栏**，需要按顺序修改以下文件：
   1. `src/i18n/i18nKey.ts` — 添加 i18n 键
   2. `src/i18n/languages/zh_CN.ts` — 添加中文翻译
   3. `src/i18n/languages/en.ts` — 添加英文翻译
   4. `src/types/config.ts` — 在 `LinkPreset` 枚举中添加新值
   5. `src/constants/link-presets.ts` — 添加链接预设配置
   6. `src/config.ts` — 在 `navBarConfig.links` 中添加

### 三、内容修改规范

1. **新增文章**放在 `src/content/posts/` 下，可按分类建子文件夹（如 `travel/`）
2. **新增随记**放在 `src/content/notes/` 下
3. **新增友链**放在 `src/content/friends/` 下，一个 `.md` 文件对应一个友链
4. **新增相册**放在 `src/content/exhibition/` 下
5. **Frontmatter 中的 `draft: true`** 会在生产环境中隐藏该文章

### 四、路径别名

项目配置了以下路径别名（在 `astro.config.mjs` 中），导入时优先使用：

| 别名 | 指向 |
|------|------|
| `@components/*` | `./src/components/*` |
| `@assets/*` | `./src/assets/*` |
| `@constants/*` | `./src/constants/*` |
| `@utils/*` | `./src/utils/*` |
| `@i18n/*` | `./src/i18n/*` |
| `@layouts/*` | `./src/layouts/*` |
| `@/*` | `./src/*` |

### 五、禁止修改的文件

以下文件是基础设施配置，除非明确要求，否则**禁止修改**：
- `astro.config.mjs`（Astro 核心配置）
- `biome.json`（Lint/格式化配置）
- `package.json` 的 `scripts` 字段
- `src/env.d.ts`（TypeScript 环境声明）
- `src/content.config.ts`（内容集合 Schema，修改会影响所有文章）

### 六、Svelte 组件注意事项

- Svelte 文件中可以使用 `let` 而非 `const`（Biome 已豁免 `useConst` 规则）
- Svelte 文件中不需要 `import type`（Biome 已豁免 `useImportType` 规则）
- 客户端交互组件使用 `client:visible` 或 `client:load` 指令在 Astro 中加载

### 七、构建与部署

```bash
# 开发环境
pnpm dev              # 启动开发服务器

# 生产构建（会自动生成搜索索引）
pnpm build            # astro build + pagefind 索引生成

# 预览生产构建
pnpm preview
```

**注意**：搜索功能（Pagefind）仅在 `pnpm build` 后可用，开发环境中使用 RSS + pinyin-pro 的备选方案。

---

## 附录：项目"性格"分析

### 项目性格：温暖系功能丰富的个人博客

这个博客既不是极简风格，也不是"功能堆砌"的重型 CMS。它的性格可以概括为：

- **温暖的橙色调**：整个项目以 `#ff9800`（橙色）为主色调，亮色模式背景为 `#fff8f0`（暖白），暗色模式背景为 `#1c1814`（暖黑），视觉上给人温馨的感觉。
- **功能丰富但不臃肿**：具备文章、随记、图册、友链、跨平台更新、搜索、评论、点赞、访问统计等完整功能，但每个功能都做得精致而非粗糙。
- **移动端优先的设计感**：有大量针对 768px 以下的样式优化，包括移动端目录弹出面板、自适应布局等。
- **注重性能**：手动代码分割（manualChunks）、图片懒加载、HTML 压缩、CSS 代码分割、content-visibility 优化、LQIP（低质量图片占位符）等。
- **SEO 友好**：完整的 Open Graph、Twitter Card、JSON-LD 结构化数据、RSS、Sitemap。

### 潜在风险

| 风险 | 严重程度 | 说明 |
|------|----------|------|
| **SSR + 静态预渲染混合模式** | ⚠️ 中 | 项目配置了 `output: "server"` 但部分页面使用 `prerender = true`。这意味着不是所有页面都预渲染，API 路由（likes/messages/visitor）是服务端运行的。新增页面时需明确是否需要 `prerender`。 |
| **不蒜子 (busuanzi) 服务稳定性** | ⚠️ 中 | 访问量统计依赖第三方服务 busuanzi.cn，该服务可能不稳定或被屏蔽。项目已预留了 LeanCloud 和 local 两种备选方案（见 `visitorConfig.provider`）。 |
| **搜索仅在构建后可用** | ⚠️ 低 | Pagefind 需要 `astro build` 后才能生成索引。开发环境的备选搜索方案（RSS + pinyin-pro）功能有限。 |
| **图片资源分散** | ⚠️ 低 | 图片来源有多种：`src/assets/images/`（构建时处理）、`public/`（静态资源）、`src/content/` 下的图片（内容图片）。修改图片时需注意路径对应关系。 |
| **`is:inline` 脚本中的变量作用域** | ⚠️ 中 | Layout.astro 中大量使用 `is:inline` 脚本做主题初始化。这些脚本在全局作用域执行，且 `define:vars` 的变量会被注入为 `const`。修改时需注意不要污染全局命名空间。 |
| **手动代码分割配置** | ⚠️ 低 | `astro.config.mjs` 中的 `manualChunks` 配置引用了 `overlayscrollbars`，但该依赖未出现在 `package.json` 中（可能是历史残留）。不会导致错误但属于死代码。 |
| **硬编码中文** | ⚠️ 低 | 部分组件中仍有硬编码的中文字符串（如首页的"最新文章"、"分类"等），未完全走 i18n 系统。如果未来需要多语言支持，需要逐一提取。 |
| **YAML 直接导入而非内容集合** | ⚠️ 低 | `announcement.yaml` 和 `exhibition-announcement.yaml` 通过 Vite 的 YAML 插件直接导入，而非通过 Astro 的内容集合系统。这是有意为之（它们是配置文件而非内容），但与内容集合的处理方式不同。 |
| **PWA 功能已禁用但代码残留** | ⚠️ 低 | `astro.config.mjs` 中 `vite-plugin-pwa` 相关代码全部被注释掉，`package.json` 中仍保留依赖。不影响功能但增加维护成本。 |
