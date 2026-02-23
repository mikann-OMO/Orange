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

/**
 * 站点配置
 * 包含网站的基本信息
 */
export const siteConfig: SiteConfig = {
	// 网站标题
	title: "mikann-OMO Blog",
	// 网站副标题
	subtitle: "blog",
	// 网站语言
	// 支持 'en', 'zh_CN', 'zh_TW'
	lang: "zh_CN",
	// 主题颜色配置
	themeColor: {
		// 主题色调，范围从 0 到 360
		// 例如：红色: 0, 青色: 200, 蓝绿色: 250, 粉色: 345
		hue: 30,
		// 是否固定主题颜色，隐藏主题颜色选择器
		fixed: false,
	},
	// 网站横幅配置
	banner: {
		// 是否启用横幅
		enable: false,
		// 横幅图片路径
		// 相对于 /src 目录，以 '/' 开头则相对于 /public 目录
		src: "assets/images/chika",
		// 横幅位置
		// 等效于 object-position，仅支持 'top', 'center', 'bottom'，默认为 'center'
		position: "center",
		// 横幅图片 credits
		credit: {
			// 是否显示 credits
			enable: false,
			// credits 文本
			text: "",
			// (可选) 原始 artwork 或艺术家页面的 URL 链接
			url: "",
		},
	},

	// 网站图标配置
	favicon: [
		{
			// 图标路径，相对于 /public 目录
			src: "/images/chikann-circular.png",
			// 图标尺寸
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

/**
 * 导航栏配置
 * 包含网站导航链接
 */
export const navBarConfig: NavBarConfig = {
	// 导航链接
	links: [
		LinkPreset.Home, // 首页
		LinkPreset.Archive, // 归档页
		LinkPreset.Notes, // 笔记页
		LinkPreset.Works, // 作品页
		LinkPreset.Friends, // 友链页
		//LinkPreset.About, // 关于页
		// 自定义链接示例
		//{
		//name: "GitHub", // 链接名称
		//url: "https://github.com/mikann-OMO", // 链接地址
		//external: true, // 是否为外部链接，显示外部链接图标并在新标签页打开
		//},
	],
};

/**
 * 个人资料配置
 * 包含个人信息和社交链接
 */
export const profileConfig: ProfileConfig = {
	// 头像路径
	// 相对于 /src 目录，以 '/' 开头则相对于 /public 目录
	avatar: "assets/images/chikann.png",
	// 名称
	name: "mikann-OMO",
	// 个人简介
	bio: "这个人不是很精彩呢",
	// 社交链接
	links: [
		// 社交链接示例
		//{
		//name: "Twitter", // 链接名称
		//icon: "fa6-brands:twitter", // 图标代码，访问 https://icones.js.org/ 获取
		// 如需使用未包含的图标集，需要安装对应的包
		// `pnpm add @iconify-json/<icon-set-name>`
		//url: "https://twitter.com", // 链接地址
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

/**
 * 许可证配置
 * 包含内容许可证信息
 */
export const licenseConfig: LicenseConfig = {
	// 是否启用许可证
	enable: true,
	// 许可证名称
	name: "CC BY-NC-SA 4.0",
	// 许可证 URL
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};
