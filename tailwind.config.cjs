/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

/**
 * Tailwind CSS 配置
 * 详细配置说明：https://tailwindcss.com/docs/configuration
 */
module.exports = {
	// 内容配置
	// 告诉 Tailwind 哪些文件需要扫描以生成 CSS
	content: [
		"./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue,mjs}",
		"./public/**/*.html",
	],

	// 未来特性配置
	future: {
		hoverOnlyWhenSupported: true,
	},

	// 模式配置
	// 启用 JIT 模式，只生成实际使用的 CSS
	mode: "jit",

	// 暗黑模式配置
	// 使用 class 策略，通过添加/移除 dark 类来切换暗黑模式
	darkMode: "class",

	// 主题配置
	theme: {
		// 扩展默认主题
		extend: {
			// 字体配置
			fontFamily: {
				sans: [
					"Roboto", // 主要无衬线字体
					"sans-serif", // 后备无衬线字体
					...defaultTheme.fontFamily.sans, // Tailwind 默认无衬线字体
				],
			},

			// 颜色配置
			// 使用 CSS 变量定义主题颜色，方便全局调整
			colors: {
				primary: "var(--primary)", // 主要颜色
				secondary: "var(--secondary)", // 次要颜色
			},

			// 动画配置
			animation: {
				"fade-in": "fadeIn 0.3s ease-in-out", // 淡入动画
				"slide-up": "slideUp 0.3s ease-out", // 滑入动画
			},

			// 关键帧配置
			keyframes: {
				fadeIn: {
					"0%": { opacity: "0" },
					"100%": { opacity: "1" },
				},
				slideUp: {
					"0%": { transform: "translateY(10px)", opacity: "0" },
					"100%": { transform: "translateY(0)", opacity: "1" },
				},
			},
		},
	},

	// 插件配置
	plugins: [
		// 排版插件
		// 用于美化 Markdown 内容的样式
		require("@tailwindcss/typography")({
			className: "prose", // 自定义类名
			defaultVariants: {
				prose: {
					dark: true, // 启用暗黑模式支持
				},
			},
		}),
	],

	// 核心插件配置
	// 可以禁用不使用的插件以减少文件大小
	corePlugins: {
		// 根据实际使用情况调整，例如：
		// 如果不使用 gradients，可以禁用
		// gradientColorStops: false,
	},

	// 安全列表配置
	// 确保动态生成的类名被正确生成
	safelist: [
		// 常用的动态类名
		"bg-primary",
		"text-primary",
		"border-primary",
		"bg-secondary",
		"text-secondary",
		"border-secondary",
		// 用于暗黑模式的类名
		"dark:bg-primary",
		"dark:text-primary",
		"dark:border-primary",
		// 动画类名
		"animate-fade-in",
		"animate-slide-up",
	],
};
