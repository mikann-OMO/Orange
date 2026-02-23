/**
 * 配置类型定义文件
 * 包含网站配置、导航栏、个人资料、许可证等类型定义
 */

import type { AUTO_MODE, DARK_MODE, LIGHT_MODE } from "@constants/constants";

/**
 * 站点配置类型
 * 包含网站的基本信息
 */
export type SiteConfig = {
	// 网站标题
	title: string;
	// 网站副标题
	subtitle: string;

	// 网站语言
	// 支持 'en', 'zh_CN', 'zh_TW'
	lang: string;

	// 主题颜色配置
	themeColor: {
		// 主题色调，范围从 0 到 360
		hue: number;
		// 是否固定主题颜色，隐藏主题颜色选择器
		fixed: boolean;
	};

	// 网站横幅配置
	banner: {
		// 是否启用横幅
		enable: boolean;
		// 横幅图片路径
		src: string;
		// 横幅位置，可选值: 'top' | 'center' | 'bottom'
		position?: "top" | "center" | "bottom";
		// 横幅图片 credits
		credit: {
			// 是否显示 credits
			enable: boolean;
			// credits 文本
			text: string;
			// (可选) 原始 artwork 或艺术家页面的 URL 链接
			url?: string;
		};
	};

	// 网站图标配置
	favicon: Favicon[];
};

/**
 * 网站图标类型
 */
export type Favicon = {
	// 图标路径
	src: string;
	// 图标主题，可选值: 'light' | 'dark'
	theme?: "light" | "dark";
	// 图标尺寸
	sizes?: string;
};

/**
 * 链接预设枚举
 * 用于导航栏配置中的预设链接
 */
export enum LinkPreset {
	Home = 0, // 首页
	Archive = 1, // 归档页
	About = 2, // 关于页
	Friends = 3, // 友链页
	Notes = 4, // 笔记页
	Works = 5, // 作品页
}

/**
 * 导航栏链接类型
 * 用于导航栏配置中的自定义链接
 */
export type NavBarLink = {
	// 链接名称
	name: string;
	// 链接地址
	url: string;
	// 是否为外部链接，显示外部链接图标并在新标签页打开
	external?: boolean;
};

/**
 * 导航栏配置类型
 */
export type NavBarConfig = {
	// 导航链接数组
	// 可以是 NavBarLink 对象或 LinkPreset 枚举值
	links: (NavBarLink | LinkPreset)[];
};

/**
 * 个人资料配置类型
 */
export type ProfileConfig = {
	// 头像路径
	avatar?: string;
	// 名称
	name: string;
	// 个人简介
	bio?: string;
	// 社交链接数组
	links: {
		// 链接名称
		name: string;
		// 链接地址
		url: string;
		// 图标代码，访问 https://icones.js.org/ 获取
		icon: string;
	}[];
};

/**
 * 许可证配置类型
 */
export type LicenseConfig = {
	// 是否启用许可证
	enable: boolean;
	// 许可证名称
	name: string;
	// 许可证 URL
	url: string;
};

/**
 * 明暗模式类型
 */
export type LIGHT_DARK_MODE =
	| typeof LIGHT_MODE // 亮色模式
	| typeof DARK_MODE // 暗色模式
	| typeof AUTO_MODE; // 自动模式

/**
 * 博客文章数据类型
 */
export type BlogPostData = {
	// 文章内容
	body: string;
	// 文章标题
	title: string;
	// 发布日期
	published: Date;
	// 文章描述
	description: string;
	// 标签数组
	tags: string[];
	// 是否为草稿
	draft?: boolean;
	// 文章封面图
	image?: string;
	// 文章分类
	category?: string;
	// 上一篇文章标题
	prevTitle?: string;
	// 上一篇文章 slug
	prevSlug?: string;
	// 下一篇文章标题
	nextTitle?: string;
	// 下一篇文章 slug
	nextSlug?: string;
};
