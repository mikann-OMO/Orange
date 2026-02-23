/**
 * 创建新博客文章的脚本
 * 用于自动生成带有 front-matter 的 Markdown 文件
 * Usage: npm run new-post -- <filename>
 */

import fs from "node:fs";
import path from "node:path";

/**
 * 获取当前日期
 * @returns {string} 格式化的日期字符串 (YYYY-MM-DD)
 */
function getDate() {
	const today = new Date();
	const year = today.getFullYear();
	const month = String(today.getMonth() + 1).padStart(2, "0");
	const day = String(today.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}

/**
 * 主函数
 * 处理命令行参数并创建新文章
 */
function main() {
	// 获取命令行参数
	const args = process.argv.slice(2);

	// 检查是否提供了文件名
	if (args.length === 0) {
		console.error(`Error: No filename argument provided
Usage: npm run new-post -- <filename>`);
		process.exit(1); // 终止脚本并返回错误代码 1
	}

	let fileName = args[0];

	// 添加 .md 扩展名（如果不存在）
	const fileExtensionRegex = /\.(md|mdx)$/i;
	if (!fileExtensionRegex.test(fileName)) {
		fileName += ".md";
	}

	// 目标目录
	const targetDir = "./src/content/posts/";
	// 完整文件路径
	const fullPath = path.join(targetDir, fileName);

	// 检查文件是否已存在
	if (fs.existsSync(fullPath)) {
		console.error(`Error: File ${fullPath} already exists `);
		process.exit(1);
	}

	// 递归创建目录
	const dirPath = path.dirname(fullPath);
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
		console.log(`Directory ${dirPath} created`);
	}

	// 生成文件内容
	const content = `---
title: ${args[0]}
published: ${getDate()}
description: ''
image: ''
tags: []
category: ''
draft: false 
lang: ''
---
`;

	// 写入文件
	fs.writeFileSync(fullPath, content);

	console.log(`Post ${fullPath} created successfully`);
}

// 执行主函数
main();
