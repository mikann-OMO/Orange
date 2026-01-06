#!/usr/bin/env node
import { existsSync } from "fs";
import { glob } from "glob";
import sharp from "sharp";

// 图片优化配置
const OPTIMIZATION_CONFIG = {
	quality: 80,
	maxWidth: 1920,
	formats: ["webp", "avif"],
	overwrite: false, // 不覆盖原文件
};

// 要处理的图片格式
const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif"];

// 忽略的目录
const IGNORE_DIRS = ["node_modules", ".git", "dist"];

// 获取所有图片文件
async function getAllImages() {
	const patterns = IMAGE_EXTENSIONS.map((ext) => `**/*.${ext}`);
	const options = {
		ignore: IGNORE_DIRS.map((dir) => `${dir}/**`),
		nodir: true,
	};

	const allFiles = [];
	for (const pattern of patterns) {
		const files = await glob(pattern, options);
		allFiles.push(...files);
	}

	return allFiles;
}

// 优化单张图片
async function optimizeImage(filePath) {
	try {
		console.log(`正在优化: ${filePath}`);

		// 读取图片
		const image = sharp(filePath);
		const metadata = await image.metadata();

		// 计算优化后的尺寸
		let width = metadata.width || 0;
		let height = metadata.height || 0;

		if (width > OPTIMIZATION_CONFIG.maxWidth) {
			height = Math.round((height / width) * OPTIMIZATION_CONFIG.maxWidth);
			width = OPTIMIZATION_CONFIG.maxWidth;
		}

		// 优化并保存原格式
		await image
			.resize(width, height, { fit: "inside", withoutEnlargement: true })
			.jpeg({ quality: OPTIMIZATION_CONFIG.quality, mozjpeg: true })
			.png({ quality: OPTIMIZATION_CONFIG.quality, compressionLevel: 8 })
			.toFile(filePath, { overwrite: OPTIMIZATION_CONFIG.overwrite });

		// 生成WebP和AVIF格式
		const basePath = filePath.replace(/\.[^/.]+$/, "");

		// WebP
		const webpPath = `${basePath}.webp`;
		if (!existsSync(webpPath) || OPTIMIZATION_CONFIG.overwrite) {
			await image
				.resize(width, height, { fit: "inside", withoutEnlargement: true })
				.webp({ quality: OPTIMIZATION_CONFIG.quality })
				.toFile(webpPath);
		}

		// AVIF
		const avifPath = `${basePath}.avif`;
		if (!existsSync(avifPath) || OPTIMIZATION_CONFIG.overwrite) {
			await image
				.resize(width, height, { fit: "inside", withoutEnlargement: true })
				.avif({ quality: OPTIMIZATION_CONFIG.quality - 5 })
				.toFile(avifPath);
		}

		console.log(`✅ 优化完成: ${filePath}`);
		return true;
	} catch (error) {
		console.error(`❌ 优化失败: ${filePath}`, error.message);
		return false;
	}
}

// 主函数
async function main() {
	console.log("开始优化图片资源...");

	const images = await getAllImages();
	console.log(`找到 ${images.length} 张图片`);

	let successCount = 0;
	let failCount = 0;

	for (const image of images) {
		const result = await optimizeImage(image);
		if (result) {
			successCount++;
		} else {
			failCount++;
		}
	}

	console.log(`\n优化完成!`);
	console.log(`✅ 成功: ${successCount} 张`);
	console.log(`❌ 失败: ${failCount} 张`);
}

// 执行
main();
