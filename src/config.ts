import type {
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "mikann-OMO Blog",
	subtitle: "blog",
	lang: "zh_CN", // 'en', 'zh_CN', 'zh_TW'
	themeColor: {
		hue: 30, // Default hue for the theme color, from 0 to 360. e.g. red: 0, teal: 200, cyan: 250, pink: 345
		fixed: false, // Hide the theme color picker for visitors
	},
	banner: {
		enable: false,
		src: "assets/images/chika", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
		position: "center", // Equivalent to object-position, only supports 'top', 'center', 'bottom'. 'center' by default
		credit: {
			enable: false, // Display the credit text of the banner image
			text: "", // Credit text to be displayed
			url: "", // (Optional) URL link to the original artwork or artist's page
		},
	},

	favicon: [
		{
			src: "/images/chikann-circular.png", // Path of the favicon, relative to the /public directory
			sizes: "32x32", // Size of the favicon
		},
		{
			src: "/images/chikann-circular.png", // Path of the favicon, relative to the /public directory
			sizes: "128x128", // Size of the favicon
		},
		{
			src: "/images/chikann-circular.png", // Path of the favicon, relative to the /public directory
			sizes: "180x180", // Size of the favicon
		},
		{
			src: "/images/chikann-circular.png", // Path of the favicon, relative to the /public directory
			sizes: "192x192", // Size of the favicon
		},
	],
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		LinkPreset.Notes,
		LinkPreset.Works,
		LinkPreset.Friends,
		//LinkPreset.About,
		//{
		//name: "GitHub",
		//url: "https://github.com/mikann-OMO", // Internal links should not include the base path, as it is automatically added
		//external: true, // Show an external link icon and will open in a new tab
		//},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "assets/images/chikann.png", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
	name: "mikann-OMO",
	bio: "这个人不是很精彩呢",
	links: [
		//{
		////name: "Twitter",
		////icon: "fa6-brands:twitter", // Visit https://icones.js.org/ for icon codes
		// You will need to install the corresponding icon set if it's not already included
		// `pnpm add @iconify-json/<icon-set-name>`
		////url: "https://twitter.com",
		//},
		//{
		//name: "Steam",
		//icon: "fa6-brands:steam",
		//url: "https://store.steampowered.com",
		//},
		//{
		//name: "GitHub",
		//icon: "fa6-brands:github",
		//url: "https://github.com/mikann-OMO",
		//},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};
