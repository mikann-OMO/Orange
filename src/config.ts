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
			src: "/favicon/favicon-light-32.png",
			sizes: "32x32",
			theme: "light"
		},
		{
			src: "/favicon/favicon-dark-32.png",
			sizes: "32x32",
			theme: "dark"
		},
		{
			src: "/favicon/favicon-light-128.png",
			sizes: "128x128",
			theme: "light"
		},
		{
			src: "/favicon/favicon-dark-128.png",
			sizes: "128x128",
			theme: "dark"
		},
		{
			src: "/favicon/favicon-light-180.png",
			sizes: "180x180",
			theme: "light"
		},
		{
			src: "/favicon/favicon-dark-180.png",
			sizes: "180x180",
			theme: "dark"
		},
		{
			src: "/favicon/favicon-light-192.png",
			sizes: "192x192",
			theme: "light"
		},
		{
			src: "/favicon/favicon-dark-192.png",
			sizes: "192x192",
			theme: "dark"
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
};

/**
 * 评论系统配置
 * 支持 Twikoo、CWD、MongoDB 评论系统
 */
export const commentConfig = {
	provider: "mongodb" as const,
	// 部署 Vercel API 后替换为你的域名
	// 本地开发可使用 http://localhost:3000
	apiBaseUrl: "https://comments.mikan.fun",
};
