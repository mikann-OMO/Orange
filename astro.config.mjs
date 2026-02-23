// Astro 配置文件
// 用于配置 Astro 项目的各种设置，包括构建选项、集成、Markdown 处理等

import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import yaml from "@rollup/plugin-yaml";
// import swup from "@swup/astro";
import icon from "astro-icon";
import { defineConfig } from "astro/config";

// Markdown 处理插件
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeComponents from "rehype-components";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkDirective from "remark-directive";
import remarkGithubAdmonitionsToDirectives from "remark-github-admonitions-to-directives";
import remarkMath from "remark-math";
import remarkSectionize from "remark-sectionize";

// PWA 支持
import { VitePWA } from "vite-plugin-pwa";

// 自定义插件
import { AdmonitionComponent } from "./src/plugins/rehype-component-admonition.mjs";
import { GithubCardComponent } from "./src/plugins/rehype-component-github-card.mjs";
import { parseDirectiveNode } from "./src/plugins/remark-directive-rehype.js";
import { remarkExcerpt } from "./src/plugins/remark-excerpt.js";
import { remarkReadingTime } from "./src/plugins/remark-reading-time.mjs";

/**
 * Astro 项目配置
 * 详细配置说明：https://docs.astro.build/en/reference/configuration-reference/
 */
export default defineConfig({
	// 网站域名配置 - 请替换为你的实际域名
	site: "https://mikan.fun",
	// 网站基础路径，默认为根路径
	base: "/",
	// 启用内置预加载
	prefetch: true,

	// 构建配置
	build: {
		// 输出目录
		outDir: "dist",
		// 静态资源目录
		assetsDir: "_astro",
		// 启用构建缓存
		cache: true,
		// 代码压缩工具
		minify: "esbuild",
		// 是否生成 sourcemap
		sourcemap: false,
	},

	// 集成配置
	integrations: [
		// Tailwind CSS 集成
		tailwind({
			// 启用嵌套样式支持
			nesting: true,
		}),
		// Svelte 集成
		svelte(),
		// Swup 页面过渡集成
		// swup({
		// 	// 禁用默认主题
		// 	theme: false,
		// 	// 动画类前缀
		// 	animationClass: "transition-swup-",
		// 	// 要更新的容器
		// 	containers: ["#swup-container", "#toc"],
		// 	// 启用平滑滚动
		// 	smoothScrolling: true,
		// 	// 启用缓存
		// 	cache: true,
		// 	// 预加载配置
		// 	preload: {
		// 		hover: true, // 悬停时预加载
		// 		focus: true, // 聚焦时预加载
		// 		top: true, // 顶部预加载
		// 		topOffset: 800, // 顶部预加载偏移量
		// 		delay: 0, // 预加载延迟
		// 		throttle: 80, // 预加载节流
		// 	},
		// 	// 无障碍支持
		// 	accessibility: true,
		// 	// 更新头部
		// 	updateHead: true,
		// 	// 更新 body 类
		// 	updateBodyClass: true,
		// 	// 全局实例
		// 	globalInstance: true,
		// 	// 动画选择器
		// 	animationSelector: "[data-swup-animation]",
		// 	// 忽略访问的条件
		// 	ignoreVisit: (visit) => {
		// 		// 忽略外部链接
		// 		if (visit.url.origin !== window.location.origin) {
		// 			return true;
		// 		}
		// 		// 忽略下载链接
		// 		if (visit.link?.getAttribute("download")) {
		// 			return true;
		// 		}
		// 		return false;
		// 	},
		// }),
		// 图标集成
		icon({
			// 包含的图标集
			include: {
				"fa6-brands": ["*"], // Font Awesome 6 品牌图标
				"fa6-regular": ["*"], // Font Awesome 6 常规图标
				"fa6-solid": ["*"], // Font Awesome 6 实心图标
			},
		}),
		// 站点地图集成
		sitemap(),
	],

	// Markdown 配置
	markdown: {
		// Remark 插件（用于处理 Markdown 内容）
		remarkPlugins: [
			remarkMath, // 数学公式支持
			remarkReadingTime, // 阅读时间计算
			remarkExcerpt, // 摘要提取
			remarkGithubAdmonitionsToDirectives, // GitHub  admonitions 支持
			remarkDirective, // 指令支持
			remarkSectionize, // 章节划分
			parseDirectiveNode, // 自定义指令解析
		],
		// Rehype 插件（用于处理 HTML 输出）
		rehypePlugins: [
			rehypeKatex, // KaTeX 数学公式渲染
			rehypeSlug, // 自动添加锚点
			[
				rehypeComponents,
				{
					// 自定义组件
					components: {
						github: GithubCardComponent, // GitHub 卡片组件
						note: (x, y) => AdmonitionComponent(x, y, "note"), // 注释 admonition
						tip: (x, y) => AdmonitionComponent(x, y, "tip"), // 提示 admonition
						important: (x, y) => AdmonitionComponent(x, y, "important"), // 重要 admonition
						caution: (x, y) => AdmonitionComponent(x, y, "caution"), // 警告 admonition
						warning: (x, y) => AdmonitionComponent(x, y, "warning"), // 危险 admonition
					},
				},
			],
			[
				rehypeAutolinkHeadings,
				{
					// 锚点行为
					behavior: "append",
					// 锚点属性
					properties: { className: ["anchor"] },
					// 锚点内容
					content: {
						type: "element",
						tagName: "span",
						properties: {
							className: ["anchor-icon"],
							"data-pagefind-ignore": true, // 忽略 pagefind 索引
						},
						children: [{ type: "text", value: "#" }],
					},
				},
			],
		],
	},

	// 启用 HTML 压缩
	compressHTML: true,

	// 图片处理配置
	image: {
		quality: 80, // 图片质量（0-100）
		formats: ["avif", "webp", "jpeg"], // 支持的图片格式
		fallbackFormat: "jpeg", //  fallback 格式
		loading: "lazy", // 懒加载
		decoding: "async", // 异步解码
	},

	// Vite 配置
	vite: {
		// Vite 插件
		plugins: [
			yaml({
				include: "**/*.yaml",
			}),
			// PWA 配置
			VitePWA({
				// 注册类型
				registerType: "autoUpdate",
				// 包含的静态资源
				includeAssets: ["favicon/**/*", "images/**/*"],
				// 应用清单
				manifest: {
					name: "我的博客", // 应用名称
					short_name: "博客", // 应用短名称
					description: "我的个人技术博客", // 应用描述
					theme_color: "#ffffff", // 主题颜色
					background_color: "#ffffff", // 背景颜色
					// 应用图标
					icons: [
						{
							src: "favicon/favicon-light-192.webp",
							sizes: "192x192",
							type: "image/webp",
							purpose: "any maskable",
						},
						{
							src: "favicon/favicon-light-512.webp",
							sizes: "512x512",
							type: "image/webp",
							purpose: "any maskable",
						},
					],
				},
				// Workbox 配置
				workbox: {
					// 缓存模式
					globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,avif}"],
					globIgnores: ["**/*.yaml"],
					// 运行时缓存
					runtimeCaching: [
						{
							// Google 字体缓存
							urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
							handler: "CacheFirst",
							options: {
								cacheName: "google-fonts-cache",
								expiration: {
									maxEntries: 10,
									maxAgeSeconds: 60 * 60 * 24 * 365, // 1 年
								},
								cacheableResponse: {
									statuses: [0, 200],
								},
							},
						},
						{
							// Google 字体静态资源缓存
							urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
							handler: "CacheFirst",
							options: {
								cacheName: "google-fonts-static-cache",
								expiration: {
									maxEntries: 10,
									maxAgeSeconds: 60 * 60 * 24 * 365, // 1 年
								},
								cacheableResponse: {
									statuses: [0, 200],
								},
							},
						},
					],
				},
			}),
		],

		// 路径别名配置
		resolve: {
			alias: {
				"@components/*": "./src/components/*",
				"@assets/*": "./src/assets/*",
				"@constants/*": "./src/constants/*",
				"@utils/*": "./src/utils/*",
				"@i18n/*": "./src/i18n/*",
				"@layouts/*": "./src/layouts/*",
				"@/*": "./src/*",
			},
		},

		// 构建配置
		build: {
			// Rollup 配置
			rollupOptions: {
				output: {
					// 手动代码分割
					manualChunks: (id) => {
						if (id.includes("node_modules")) {
							if (id.includes("photoswipe")) return "photoswipe";
							if (id.includes("katex")) return "katex";
							if (id.includes("markdown-it")) return "markdown";
							if (id.includes("overlayscrollbars")) return "overlayscrollbars";
							if (id.includes("iconify")) return "iconify";
							if (id.includes("svelte")) return "svelte";
							if (id.includes("swup")) return "swup";
							if (id.includes("pagefind")) return "pagefind";
							return "vendor";
						}
					},
				},
			},
			// Terser 配置
			terserOptions: {
				compress: {
					drop_console: true, // 移除 console
					drop_debugger: true, // 移除 debugger
					unused: true, // 移除未使用的代码
				},
				format: {
					comments: false, // 移除注释
				},
			},
		},

		// 依赖优化
		optimizeDeps: {
			exclude: ["photoswipe", "katex"], // 排除某些依赖的优化
		},

		// 开发服务器配置
		server: {
			headers: {
				"Cache-Control": "no-cache",
				"Cross-Origin-Embedder-Policy": "require-corp",
				"Cross-Origin-Opener-Policy": "same-origin",
			},
		},

		// 预览服务器配置
		preview: {
			headers: {
				"Cache-Control": "public, max-age=604800", // 7 天
			},
		},
	},
});
