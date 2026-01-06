#!/usr/bin/env node
import { existsSync } from "fs";
import { glob } from "glob";
import sharp from "sharp";

// 图片优化配置
const OPTIMIZATION_CONFIG = {
	quality: 80,
	maxWidth: 1920,
	formats: ["webp", "avif"],
	overwrite: true, // 覆盖原文件以确保最新优化
	responsiveSizes: [320, 640, 768, 1024, 1280, 1536, 1920], // 生成响应式尺寸
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
		const fs = await import("fs/promises");

		// 读取图片数据到缓冲区
		const imageBuffer = await fs.readFile(filePath);
		const metadata = await sharp(imageBuffer).metadata();

		// 计算优化后的基准尺寸
		let baseWidth = metadata.width || 0;
		let baseHeight = metadata.height || 0;

		if (baseWidth > OPTIMIZATION_CONFIG.maxWidth) {
			baseHeight = Math.round(
				(baseHeight / baseWidth) * OPTIMIZATION_CONFIG.maxWidth,
			);
			baseWidth = OPTIMIZATION_CONFIG.maxWidth;
		}

		// 优化并保存原格式
		const originalExt = filePath.split(".").pop().toLowerCase();
		let optimizedBuffer;

		// 根据文件类型选择优化参数
		if (originalExt === "jpg" || originalExt === "jpeg") {
			optimizedBuffer = await sharp(imageBuffer)
				.resize(baseWidth, baseHeight, {
					fit: "inside",
					withoutEnlargement: true,
				})
				.jpeg({
					quality: OPTIMIZATION_CONFIG.quality,
					mozjpeg: true,
					progressive: true,
				})
				.toBuffer();
		} else if (originalExt === "png") {
			optimizedBuffer = await sharp(imageBuffer)
				.resize(baseWidth, baseHeight, {
					fit: "inside",
					withoutEnlargement: true,
				})
				.png({
					quality: OPTIMIZATION_CONFIG.quality,
					compressionLevel: 8,
					adaptiveFiltering: true,
					force: false,
				})
				.toBuffer();
		} else {
			// 其他格式直接使用原图
			optimizedBuffer = imageBuffer;
		}

		// 写入优化后的原图
		await fs.writeFile(filePath, optimizedBuffer);

		// 生成WebP和AVIF格式的不同尺寸版本
		const basePath = filePath.replace(/\.[^/.]+$/, "");

		// 为每种格式生成响应式图片
		for (const format of OPTIMIZATION_CONFIG.formats) {
			// 生成主格式版本（不包含尺寸后缀）
			const mainOutputPath = `${basePath}.${format}`;
			await sharp(optimizedBuffer)
				.resize(baseWidth, baseHeight, {
					fit: "inside",
					withoutEnlargement: true,
					kernel: "lanczos3",
				})
				.withMetadata()
				[format]({
					quality: OPTIMIZATION_CONFIG.quality - (format === "avif" ? 5 : 0),
					...(format === "webp" && { lossless: false, smartSubsample: true }),
					...(format === "avif" && { chromaSubsampling: "4:2:0" }),
				})
				.toFile(mainOutputPath, { overwrite: OPTIMIZATION_CONFIG.overwrite });

			// 生成响应式尺寸版本
			for (const size of OPTIMIZATION_CONFIG.responsiveSizes) {
				// 只生成小于等于原图宽度的尺寸
				if (size > baseWidth) continue;

				// 计算该尺寸下的高度
				const height = Math.round((baseHeight / baseWidth) * size);

				// 构建输出路径
				const outputPath = `${basePath}-${size}.${format}`;

				// 优化并保存
				await sharp(optimizedBuffer)
					.resize(size, height, {
						fit: "inside",
						withoutEnlargement: true,
						kernel: "lanczos3",
					})
					.withMetadata() // 保留元数据
					[format]({
						quality: OPTIMIZATION_CONFIG.quality - (format === "avif" ? 5 : 0),
						...(format === "webp" && { lossless: false, smartSubsample: true }),
						...(format === "avif" && { chromaSubsampling: "4:2:0" }),
					})
					.toFile(outputPath, { overwrite: OPTIMIZATION_CONFIG.overwrite });
			}
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
