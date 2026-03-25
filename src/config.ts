/**
 * 网站配置文件
 * 包含网站的基本信息、导航栏、个人资料和许可证配置
 */

import type {
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
	VisitorConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "mikann-OMO Blog",
	subtitle: "blog",
	lang: "zh_CN",
	themeColor: {
		hue: 30,
		fixed: false,
	},
	banner: {
		enable: true,
		src: "/images/背景.png",
		position: "center",
		credit: {
			enable: false,
			text: "",
			url: "",
		},
	},
	favicon: [
		{
			src: "/images/chikann-circular.png",
			sizes: "32x32",
		},
		{
			src: "/images/chikann-circular.png",
			sizes: "128x128",
		},
		{
			src: "/images/chikann-circular.png",
			sizes: "180x180",
		},
		{
			src: "/images/chikann-circular.png",
			sizes: "192x192",
		},
	],
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.About,
		LinkPreset.Works,
		LinkPreset.Notes,
		LinkPreset.Archive,
		LinkPreset.Friends,
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "assets/images/chikann.png",
	name: "mikann-OMO",
	bio: "这个人不是很精彩呢",
	links: [],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const visitorConfig: VisitorConfig = {
	enable: true,
	provider: "busuanzi",
	leancloud: {
		appId: import.meta.env.VITE_APP_ID || "",
		appKey: import.meta.env.VITE_APP_KEY || "",
		serverUrl: import.meta.env.VITE_LEANCLOUD_SERVER_URL || "",
	},
};

/**
 * 评论系统配置
 * 支持 Twikoo 评论系统
 */
export const commentConfig = {
	provider: "twikoo" as const,
	// Twikoo Cloudflare Worker 地址
	envId:
		import.meta.env.VITE_TWIKOO_ENV_ID ||
		"https://twikoo.2744167586.workers.dev",
};
