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
		src: "https://mikann-1359996823.cos.ap-beijing.myqcloud.com/orange.png",
		position: "center",
		credit: {
			enable: false,
			text: "",
			url: "",
		},
	},
	favicon: [
		{
			src: "https://mikann-1359996823.cos.ap-beijing.myqcloud.com/chika.png",
			sizes: "32x32",
		},
		{
			src: "https://mikann-1359996823.cos.ap-beijing.myqcloud.com/chika.png",
			sizes: "128x128",
		},
		{
			src: "https://mikann-1359996823.cos.ap-beijing.myqcloud.com/chika.png",
			sizes: "180x180",
		},
		{
			src: "https://mikann-1359996823.cos.ap-beijing.myqcloud.com/chika.png",
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
	avatar:
		"https://mikann-1359996823.cos.ap-beijing.myqcloud.com/justorange.jpg",
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
