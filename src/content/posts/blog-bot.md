---
title: 博客？& bot？
published: 2025-12-31T00:00:00.000Z
description: “代码小白认识学习搭建静态博客&bot”
image: ''
tags:
  - bot
  - blog
category: IT相关
draft: false
---

正式开始前，你需要知道————

- **Git**是一个**版本控制系统**，可以理解为代码的“时光机”，它能精确记录你每次对文件的修改。

- **GitHub**是一个基于Git的**代码托管平台**，你可以在这里存放代码、与他人协作，它提供的GitHub Pages服务能免费托管静态网站。

---

# Astro静态博客搭建

Astro 是一个「把静态做到极限」的静态站点生成器——默认 0 JS、按需 Hydrate，首屏速度天生快；Markdown 直接当数据源，GitHub Pages / Vercel 一键托管，真正「写完就部署」。  

Fuwari 则是专为 Astro 打造的博客主题：Tailwind 排版 + 平滑过渡动画 + 暗黑/亮色双主题 + 内置搜索/评论/TOC，开箱即用，却留好 config.ts 让你改色、改 banner、加组件都只需几行，不碰底层代码就能拥有“设计感”。
 
- 选 **Astro** 是为了「快」和「无后端」；再套 **Fuwari** 是因为「颜值在线」又「不锁死」，小白能直接写，大佬能随意魔改。

1.  **准备账号与环境**：注册一个GitHub账号，并在电脑上安装Node.js、Git和包管理工具pnpm。
2.  **获取博客模板**：在GitHub上找到Fuwari模板仓库，使用“Use this template”功能创建属于自己的仓库。
3.  **本地运行与定制**：将仓库克隆到本地，安装依赖后即可通过 `pnpm dev` 命令在本地预览博客。通过修改 `src/config.ts` 等配置文件来个性化你的博客。
4.  **撰写与发布文章**：在 `src/content/posts/` 目录下创建Markdown文件写文章。最后将代码推送到GitHub，并利用GitHub Actions等自动化服务部署到网上。

想了解每一步的详细操作、优化技巧和个性化设置（如添加评论系统），推荐跟随这篇非常详细的教程进行实操：
>**🔗 详细教程：** [新一代静态博客框架Astro的部署优化指南与使用体验](https://www.lapis.cafe/posts/technicaltutorials/astro-deploy-and-optimization/)

---

# Bot的搭建与功能扩展

Bot（机器人）可以成为你管理博客的智能助手。在技术选型上，主要存在两种以NapCat作为QQ协议连接底层的方案，它们代表了“直接代理”与“框架驱动”两种不同思路。

### 核心方案对比：Cyberbot + NapCat 与 NoneBot + NapCat

| 对比维度 | **方案一：Cyberbot + NapCat** | **方案二：NoneBot + Napcat** |
| :--- | :--- | :--- |
| **核心架构** | **直接代理**。NapCat是QQ协议的实现，Cyberbot是带界面的客户端，两者一体。 | **框架+驱动器**。NoneBot是机器人**应用框架**，NapCat作为“驱动器”为其提供QQ协议连接。 |
| **开发模式** | **配置为主，有限扩展**。主要通过配置文件工作，深度开发需要理解其内部机制。 | **编程为主，灵活开发**。基于Python编写插件，框架提供清晰API，功能扩展能力强。 |
| **生态能力** | **功能相对固定**。生态围绕其自身，插件和扩展性一般。 | **生态强大丰富**。拥有庞大的插件市场，可轻松集成AI对话、生图、博客管理等功能。 |
| **适用场景** | 需要快速搭建一个**稳定、功能明确**的QQ机器人，对深度定制和跨平台无要求。 | 需要**高度定制、功能复杂**（如管理博客），并希望未来能方便地扩展AI功能的开发者。 |

---

两种方案各有侧重，你可以根据自己的需求选择：

如果你追求快速部署、开箱即用，且对复杂定制需求不高**，可以选择 **Cyberbot + NapCat** 方案。
>**🔗 详细教程：** [基于NapCat和Cyberbot的QQ群机器人部署教程](https://www.zellon.top/posts/250531-napcat-n-cyberbot-deployment/)

如果你的目标是打造一个高度可定制、能集成AI并自动化管理博客的机器人**，那么 **NoneBot + NapCat** 的框架方案更适合你。
>**🔗 详细教程：** [nonebot2的简单部署](https://www.shiro.team/posts/bot/qqbot/)

- https://nonebot.dev/store/plugins   插件商店链接

**对于“用Bot管理博客并集成AI生图”的需求，推荐选择 NoneBot + NapCat 方案**，因为它能为你未来的功能扩展（如开发一个“接收指令->生图->发布博客”的插件）提供最大的灵活性。

**新增第三种bot：** https://www.zellon.top/posts/251230-mioki/   Mioki Bot食用方法

---

后续管理代码可以用**Trae**（软件）来管理，Trae是一个免费的中文IDE，支持Python、JavaScript、TypeScript等语言，提供代码自动完成、调试、版本控制等功能。

---

<div style="opacity: 0.5;"> 这篇只是把我知道的总结记录留存，我本人并不是很会这些技术，只是无脑依靠ai以及跟随教程操作</div>