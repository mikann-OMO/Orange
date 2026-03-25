# Orange Blog

一个基于 Astro 框架的现代化博客项目，使用 TypeScript、Tailwind CSS 和 Svelte 构建，提供优雅的用户界面和丰富的功能。

## 📋 项目简介

Orange Blog 是一个功能完整的博客系统，具有以下特点：

- 基于 Astro 5.x 框架，提供高性能的静态生成和服务端渲染
- 使用 TypeScript 确保类型安全
- 集成 Tailwind CSS 实现响应式设计
- 支持 Svelte 组件，增强交互体验
- 内置多种博客功能，如文章、笔记、相册等
- 支持国际化（i18n）
- 集成 Pagefind 实现站内搜索

## 🛠 技术栈

- **框架**：Astro 5.7.13
- **语言**：TypeScript 5.8.3
- **样式**：Tailwind CSS 3.4.17
- **交互**：Svelte 5.30.1
- **图标**：Iconify
- **搜索**：Pagefind 1.3.0
- **数学公式**：KaTeX
- **Markdown 增强**：多种 remark/rehype 插件

## 🚀 快速开始

### 环境要求

- Node.js 18+
- pnpm 10+

### 安装

```bash
# 克隆仓库
git clone <repository-url>
cd orange-blog

# 安装依赖
pnpm install
```

### 运行

```bash
# 开发模式
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview
```

### 新建文章

```bash
pnpm new-post
```

## 📁 项目结构

```
├── src/
│   ├── components/        # 组件目录
│   │   ├── control/       # 控制组件（按钮、分页等）
│   │   ├── misc/          # 杂项组件
│   │   └── widget/        # 小部件组件
│   ├── content/           # 内容目录
│   │   ├── posts/         # 博客文章
│   │   ├── notes/         # 笔记
│   │   └── exhibition/    # 展览/相册
│   ├── layouts/           # 布局组件
│   ├── pages/             # 页面目录
│   ├── utils/             # 工具函数
│   └── i18n/              # 国际化文件
├── public/                # 静态资源
├── scripts/               # 脚本工具
└── data/                  # 数据文件
```

## 📚 功能列表

### 核心功能

- **博客系统**：支持文章发布、分类、标签
- **笔记系统**：快速记录和分享想法
- **相册系统**：展示图片集合
- **友链系统**：管理友情链接
- **评论系统**：集成 Twikoo 评论
- **搜索功能**：基于 Pagefind 的站内搜索
- **响应式设计**：适配桌面、平板和移动设备
- **深色模式**：支持明暗主题切换

### 组件库

- **导航组件**：Navbar、Breadcrumb
- **控制组件**：Button、Pagination、BackToTop
- **展示组件**：PostCard、NoteCard、FriendCard
- **小部件**：SidebarToc、Categories、Tags、FriendsList

## 🌐 API 文档

### 内置 API 端点

- **`/api/like.ts`**：处理文章点赞功能
- **`/api/posts.json.ts`**：获取文章列表 JSON
- **`/search.json.ts`**：搜索索引 JSON
- **`/rss.xml.ts`**：RSS 订阅 feed
- **`/robots.txt.ts`**： robots.txt 配置

## 🔧 配置

### 主要配置文件

- **`src/config.ts`**：项目主要配置
- **`src/content/config.ts`**：内容配置
- **`tailwind.config.cjs`**：Tailwind CSS 配置
- **`astro.config.mjs`**：Astro 配置

### 环境变量

复制 `.env.example` 文件为 `.env` 并填写相应配置：

```bash
cp .env.example .env
```

## 📖 使用指南

### 写作文章

在 `src/content/posts/` 目录下创建 Markdown 文件，支持以下 Frontmatter：

```markdown
---
title: 文章标题
date: 2024-01-01
description: 文章描述
category: 分类
tags: [标签1, 标签2]
---

文章内容...
```

### 添加友链

在 `src/content/friends/` 目录下创建 Markdown 文件：

```markdown
---
title: 网站名称
link: https://example.com
avatar: https://example.com/avatar.jpg
description: 网站描述
---
```

### 配置展览/相册

在 `src/content/exhibition/` 目录下创建 YAML 配置文件和对应的图片目录。

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议！请参考 [CONTRIBUTING.md](CONTRIBUTING.md) 了解贡献流程。

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)。

## 📞 联系方式

- **作者**：[Your Name]
- **邮箱**：[your.email@example.com]
- **博客**：[Your Blog URL]

---

*使用 Orange Blog，开启你的内容创作之旅！*