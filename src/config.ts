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
		src: "assets/images/banner-light.webp",
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
		LinkPreset.Works,
		LinkPreset.Rec,
		LinkPreset.Archive,
		LinkPreset.Friends,
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "/avatar.webp",
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
	provider: "server",
	leancloud: {
		appId: import.meta.env.VITE_APP_ID || "",
		appKey: import.meta.env.VITE_APP_KEY || "",
		serverUrl: import.meta.env.VITE_LEANCLOUD_SERVER_URL || "",
	},
};


