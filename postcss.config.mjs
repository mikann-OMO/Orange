// PostCSS 配置文件
// 用于配置 PostCSS 插件和处理流程

import postcssImport from "postcss-import"; // PostCSS 导入插件
import postcssNesting from "postcss-nesting"; // Tailwind CSS 嵌套支持
import tailwindcss from "tailwindcss"; // Tailwind CSS 核心

// 环境判断
// 用于根据环境不同应用不同的配置
const isProduction = process.env.NODE_ENV === "production";

/**
 * PostCSS 配置
 * 详细配置说明：https://postcss.org/docs/configuration
 */
export default {
	plugins: {
		// 插件配置
		"postcss-import": postcssImport, // 处理 @import 语句
		"tailwindcss/nesting": postcssNesting, // 启用 Tailwind CSS 嵌套语法
		tailwindcss: tailwindcss, // 启用 Tailwind CSS

		// 生产环境配置
		...(isProduction
			? {
					// 添加 cssnano 进行生产环境 CSS 压缩
					cssnano: {
						preset: "default", // 使用默认预设
					},
				}
			: {}),
	},
};
// Config verified
