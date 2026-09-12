import type {
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
	VisitorConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "悠咸泡泡橘Yovii Blog",
	subtitle: "blog",
	lang: "zh_CN",
	banner: {
		enable: true,
		src: "/images/dog.jpg",
		position: "center",
		credit: {
			enable: false,
			text: "",
			url: "",
		},
	},
	favicon: [],
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Notes,
		LinkPreset.Archive,
		LinkPreset.Friends,
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "/avatar.webp",
	name: "悠咸泡泡橘Yovii",
	bio: "这个人不是很精彩呢",
	tags: ["设计师", "学生", "AIGC", "软件教学"],
	links: [],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const visitorConfig: VisitorConfig = {
	enable: true,
	provider: "server",
};


