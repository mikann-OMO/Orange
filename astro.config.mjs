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
	site: "https://example.com/", // Replace with your actual domain
	base: "/",
	trailingSlash: "always",
	build: {
		outDir: "dist",
		assetsDir: "_astro",
		cache: true,
		minify: "esbuild",
		sourcemap: false,
	},
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
			preload: {
				hover: false,
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
			animationSelector: "[data-swup-animation]",
			ignoreVisit: (visit) => {
				if (visit.url.origin !== window.location.origin) {
					return true;
				}
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
	compressHTML: true,
	image: {
		quality: 80,
		formats: ["avif", "webp", "jpeg"],
		fallbackFormat: "jpeg",
		loading: "lazy",
		decoding: "async",
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
			rollupOptions: {
				output: {
					manualChunks: (id) => {
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
			},
			terserOptions: {
				compress: {
					drop_console: true,
					drop_debugger: true,
					unused: true,
				},
				format: {
					comments: false,
				},
			},
		},
	},
});