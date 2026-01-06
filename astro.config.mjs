import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import swup from "@swup/astro";
import icon from "astro-icon";
import { defineConfig } from "astro/config";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeComponents from "rehype-components";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkDirective from "remark-directive";
import remarkGithubAdmonitionsToDirectives from "remark-github-admonitions-to-directives";
import remarkMath from "remark-math";
import remarkSectionize from "remark-sectionize";
import { AdmonitionComponent } from "./src/plugins/rehype-component-admonition.mjs";
import { GithubCardComponent } from "./src/plugins/rehype-component-github-card.mjs";
import { parseDirectiveNode } from "./src/plugins/remark-directive-rehype.js";
import { remarkExcerpt } from "./src/plugins/remark-excerpt.js";
import { remarkReadingTime } from "./src/plugins/remark-reading-time.mjs";

export default defineConfig({
	site: "https://fuwari.vercel.app/",
	base: "/",
	trailingSlash: "always",
	// 优化渲染性能
	renderer: {
		preload: true,
	},
	// 优化构建输出
	build: {
		// 启用实验性的性能优化
		experimental: {
			optimizeCss: true,
		},
		// 增加构建缓存
		cache: true,
		// 输出目录
		outDir: "dist",
		// 资产目录
		assetsDir: "_astro",
		// 源映射
		sourcemap: false,
	},
	// 优化HTTP头和缓存策略
	// 配置CDN前缀
	// cdn: {
	//   base: 'https://cdn.example.com',
	// },
	// 压缩HTML
	compressHTML: true,
	integrations: [
		tailwind({
			nesting: true,
		}),
		svelte(),
		swup({
			theme: false,
			animationClass: "transition-swup-",
			containers: ["main", "#toc"],
			smoothScrolling: true,
			cache: true,
			// 优化预加载，只预加载可见链接
			preload: {
				hover: true,
				focus: false,
				top: true,
				topOffset: 500,
				delay: 0,
				throttle: 100,
			},
			accessibility: true,
			updateHead: true,
			updateBodyClass: false,
			globalInstance: true,
			// 优化动画性能
			animationSelector: "[data-swup-animation]",
			// 减少不必要的事件监听
			ignoreVisit: (visit) => {
				// 忽略外部链接
				if (visit.url.origin !== window.location.origin) {
					return true;
				}
				// 忽略下载链接
				if (visit.link?.getAttribute("download")) {
					return true;
				}
				return false;
			},
		}),
		icon({
			include: {
				"fa6-brands": ["*"],
				"fa6-regular": ["*"],
				"fa6-solid": ["*"],
			},
		}),
		sitemap(),
	],
	markdown: {
		remarkPlugins: [
			remarkMath,
			remarkReadingTime,
			remarkExcerpt,
			remarkGithubAdmonitionsToDirectives,
			remarkDirective,
			remarkSectionize,
			parseDirectiveNode,
		],
		rehypePlugins: [
			rehypeKatex,
			rehypeSlug,
			[
				rehypeComponents,
				{
					components: {
						github: GithubCardComponent,
						note: (x, y) => AdmonitionComponent(x, y, "note"),
						tip: (x, y) => AdmonitionComponent(x, y, "tip"),
						important: (x, y) => AdmonitionComponent(x, y, "important"),
						caution: (x, y) => AdmonitionComponent(x, y, "caution"),
						warning: (x, y) => AdmonitionComponent(x, y, "warning"),
					},
				},
			],
			[
				rehypeAutolinkHeadings,
				{
					behavior: "append",
					properties: { className: ["anchor"] },
					content: {
						type: "element",
						tagName: "span",
						properties: {
							className: ["anchor-icon"],
							"data-pagefind-ignore": true,
						},
						children: [{ type: "text", value: "#" }],
					},
				},
			],
		],
	},
	// 优化构建输出
	compressHTML: true,
	image: {
		// 优化图片处理
		domains: [],
		remotePatterns: [],
		quality: 80,
		formats: ["webp", "avif", "jpeg"],
		fallbackFormat: "jpeg",
		sharpOptions: {
			jpeg: {
				mozjpeg: true,
				quality: 80,
			},
			webp: {
				quality: 80,
				lossless: false,
			},
			avif: {
				quality: 75,
			},
		},
		// 自动生成响应式图片
		responsive: true,
		// 生成多种尺寸的图片
		sizes: {
			default: "100vw",
			sm: "640px",
			md: "768px",
			lg: "1024px",
			xl: "1280px",
			"2xl": "1536px",
		},
	},
	// CSS 优化
	css: {
		// 启用 CSS 代码分割
		codeSplit: true,
		// 内联关键 CSS
		inlineCritical: true,
	},
	vite: {
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
		build: {
			// 启用代码分割
			codeSplit: true,
			// 启用 tree shaking
			minify: "terser",
			treeshake: true,
			// 优化 Rollup 配置
			rollupOptions: {
				output: {
					// 优化资源命名，添加hash便于缓存
					entryFileNames: "_astro/[name].[hash].js",
					chunkFileNames: "_astro/[name].[hash].js",
					assetFileNames: "_astro/[name].[hash][extname]",
					// 启用更高效的压缩
					manualChunks: {
						// 分割大型依赖，便于缓存和并行加载
						photoswipe: ["photoswipe"],
						katex: ["katex"],
						markdown: ["markdown-it"],
						overlayscrollbars: ["overlayscrollbars"],
						iconify: [
							"@iconify/svelte",
							"@iconify-json/fa6-brands",
							"@iconify-json/fa6-regular",
							"@iconify-json/fa6-solid",
							"@iconify-json/material-symbols",
						],
					},
					// 启用动态导入的代码分割
					dynamicImportInCjs: true,
					// 优化缓存策略
					manualChunks: (id) => {
						// 将 node_modules 中的大型依赖拆分到单独的 chunk
						if (id.includes("node_modules")) {
							if (id.includes("photoswipe")) return "photoswipe";
							if (id.includes("katex")) return "katex";
							if (id.includes("markdown-it")) return "markdown";
							if (id.includes("overlayscrollbars")) return "overlayscrollbars";
							if (id.includes("iconify")) return "iconify";
							return "vendor";
						}
					},
				},
				onwarn(warning, warn) {
					// Suppress dynamic/static import conflict warnings
					if (
						warning.message.includes("is dynamically imported by") &&
						warning.message.includes("but also statically imported by")
					)
						return;
					warn(warning);
				},
			},
			// 优化 CSS 构建
			cssCodeSplit: true,
			// 禁用源映射以减小文件大小
			sourcemap: false,
			// 优化 terser 配置
			terserOptions: {
				compress: {
					drop_console: true,
					drop_debugger: true,
					pure_funcs: ["console.log", "console.debug", "console.warn"],
					// 进一步优化压缩
					pure_getters: true,
					unsafe: true,
					unsafe_comps: true,
					unsafe_math: true,
					unsafe_proto: true,
					unsafe_regexp: true,
				},
				mangle: {
					// 启用变量名混淆
					toplevel: true,
					keep_classnames: false,
					keep_fnames: false,
				},
			},
			// 配置缓存策略
			cacheOptions: {
				// 缓存目录
				cacheDir: ".vite-cache",
				// 缓存失效时间（毫秒）
				ttl: 604800000, // 7天
			},
		},
		// 优化开发服务器
		server: {
			fs: {
				allow: ["."],
			},
		},
	},
});
