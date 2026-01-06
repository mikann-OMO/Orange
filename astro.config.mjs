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
		componentCache: true,
	},
	// 优化构建输出
	build: {
		// 启用实验性的性能优化
		experimental: {
			optimizeCss: true,
			treeshake: true,
		},
		// 增加构建缓存
		cache: true,
		// 输出目录
		outDir: "dist",
		// 资产目录
		assetsDir: "_astro",
		// 源映射
		sourcemap: false,
		// 启用图片优化
		optimize: true,
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
	// 优化页面加载性能
	pagefind: {
		// 优化搜索索引
		exclude: ["node_modules", "dist", ".git"],
		verbose: false,
	},
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
				progressive: true,
			},
			webp: {
				quality: 80,
				lossless: false,
				smartSubsample: true,
			},
			avif: {
				quality: 75,
				chromaSubsampling: "4:2:0",
			},
			png: {
				quality: 80,
				compressionLevel: 8,
				adaptiveFiltering: true,
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
			"3xl": "1920px",
		},
		// 启用图片懒加载
		loading: "lazy",
		// 优化图片解码
		decoding: "async",
	},
	// CSS 优化
	css: {
		// 启用 CSS 代码分割
		codeSplit: true,
		// 内联关键 CSS
		inlineCritical: true,
		// 优化 CSS 压缩
		minify: true,
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
			// 优化模块解析
			extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
		},
		// 优化依赖预构建
		optimizeDeps: {
			enabled: true,
			include: [
				"photoswipe",
				"katex",
				"markdown-it",
				"overlayscrollbars",
				"@iconify/svelte",
				"@iconify-json/fa6-brands",
				"@iconify-json/fa6-regular",
				"@iconify-json/fa6-solid",
				"@iconify-json/material-symbols",
			],
			// 禁用内部依赖优化以提高构建速度
			disableDependencyOptimization: false,
			// 缓存优化结果
			cacheDir: ".vite-cache",
		},
		build: {
			// 启用代码分割
			codeSplit: true,
			// 启用 tree shaking
			minify: "terser",
			treeshake: {
				// 启用更严格的 tree shaking
				moduleSideEffects: false,
				propertyReadSideEffects: false,
				tryCatchDeoptimization: false,
			},
			// 优化 Rollup 配置
			rollupOptions: {
				output: {
					// 优化资源命名，添加hash便于缓存
					entryFileNames: "_astro/[name].[hash].js",
					chunkFileNames: "_astro/[name].[hash].js",
					assetFileNames: "_astro/[name].[hash][extname]",
					// 启用动态导入的代码分割
					dynamicImportInCjs: true,
					// 启用更高效的压缩
					compact: true,
					// 优化初始加载性能
					manualChunks: (id) => {
						// 将 node_modules 中的大型依赖拆分到单独的 chunk
						if (id.includes("node_modules")) {
							if (id.includes("photoswipe")) return "photoswipe";
							if (id.includes("katex")) return "katex";
							if (id.includes("markdown-it")) return "markdown";
							if (id.includes("overlayscrollbars")) return "overlayscrollbars";
							if (id.includes("iconify")) return "iconify";
							// 将其他依赖合并到 vendor chunk
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
					// 忽略未使用的导入警告
					if (warning.code === "UNUSED_IMPORT") return;
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
					pure_funcs: [
						"console.log",
						"console.debug",
						"console.warn",
						"console.info",
					],
					// 进一步优化压缩
					pure_getters: true,
					unsafe: true,
					unsafe_comps: true,
					unsafe_math: true,
					unsafe_proto: true,
					unsafe_regexp: true,
					// 移除未使用的变量和函数
					unused: true,
					// 折叠连续声明
					collapse_vars: true,
				},
				mangle: {
					// 启用变量名混淆
					toplevel: true,
					keep_classnames: false,
					keep_fnames: false,
					// 混淆属性名
					properties: {
						regex: /^_/, // 只混淆以 _ 开头的属性
					},
				},
				// 优化输出格式
				format: {
					comments: false,
				},
			},
			// 配置缓存策略
			cacheOptions: {
				// 缓存目录
				cacheDir: ".vite-cache",
				// 缓存失效时间（毫秒）
				ttl: 604800000, // 7天
				// 启用文件系统缓存
				fs: {
					// 缓存文件的哈希算法
					algorithm: "sha256",
				},
			},
			// 优化资产处理
			assetsInlineLimit: 4096, // 4KB 以下的资源内联
			// 启用 CSS 优化
			cssMinify: "terser",
		},
		// 优化开发服务器
		server: {
			fs: {
				allow: ["."],
			},
			// 启用服务器压缩
			compress: true,
		},
		// 优化预览服务器
		preview: {
			compress: true,
		},
	},
});
