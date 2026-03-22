/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
	content: [
		"./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue,mjs}",
		"./public/**/*.html",
	],

	future: {
		hoverOnlyWhenSupported: true,
	},

	mode: "jit",

	darkMode: "class",

	theme: {
		extend: {
			screens: {
				xs: "400px",
			},
			fontFamily: {
				sans: ["Roboto", "sans-serif", ...defaultTheme.fontFamily.sans],
			},

			colors: {
				primary: {
					DEFAULT: "#ff9800",
					50: "#fff3e0",
					100: "#ffe0b2",
					200: "#ffcc80",
					300: "#ffb74d",
					400: "#ffa726",
					500: "#ff9800",
					600: "#fb8c00",
					700: "#f57c00",
					800: "#ef6c00",
					900: "#e65100",
				},
			},

			animation: {
				"fade-in": "fadeIn 0.3s ease-in-out",
				"slide-up": "slideUp 0.3s ease-out",
			},

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

	plugins: [
		require("@tailwindcss/typography")({
			className: "prose",
			defaultVariants: {
				prose: {
					dark: true,
				},
			},
		}),
	],

	corePlugins: {
		preflight: true,
	},

	safelist: [
		"bg-primary",
		"text-primary",
		"border-primary",
		"dark:bg-primary",
		"dark:text-primary",
		"dark:border-primary",
		"animate-fade-in",
		"animate-slide-up",
	],
};
