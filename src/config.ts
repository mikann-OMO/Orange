/**
 * 网站配置文件
 * 包含网站的基本信息、导航栏、个人资料和许可证配置
 */

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
	lang: "zh_CN",
	themeColor: {
		hue: 30,
		fixed: false,
	},
	banner: {
		enable: false,
		src: "assets/images/chika",
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
		LinkPreset.Archive,
		LinkPreset.Notes,
		LinkPreset.Works,
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
