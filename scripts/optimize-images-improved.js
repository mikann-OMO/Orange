/**
 * 优化后的图片管理脚本
 * 使用 sharp 库优化图片大小并生成响应式版本
 * 支持生成 WebP 和 AVIF 格式
 * 采用更清晰的目录结构
 */

import { existsSync, mkdirSync, rmSync } from "node:fs";
import { glob } from "glob";
import sharp from "sharp";
import path from "node:path";

/**
 * 图片优化配置
 */
const OPTIMIZATION_CONFIG = {
	quality: 80, // 图片质量 (0-100)
	maxWidth: 1920, // 最大宽度
	formats: ["webp", "avif"], // 要生成的额外格式
	overwrite: true, // 覆盖原文件以确保最新优化
	responsiveSizes: [320, 640, 768, 1024, 1280, 1536, 1920], // 生成响应式尺寸
	inputDir: "src/assets/images/original", // 原始图片目录
	outputDir: "public/images", // 输出图片目录
};

/**
 * 要处理的图片格式
 */
const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif"];

/**
 * 忽略的目录
 */
const IGNORE_DIRS = ["node_modules", ".git", "dist"];

/**
 * 获取所有原始图片文件
 * @returns {Promise<string[]>} 图片文件路径数组
 */
async function getAllOriginalImages() {
	const patterns = IMAGE_EXTENSIONS.map((ext) => `${OPTIMIZATION_CONFIG.inputDir}/**/*.${ext}`);
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

/**
 * 优化单张图片
 * @param {string} filePath 图片文件路径
 * @returns {Promise<boolean>} 优化是否成功
 */
async function optimizeImage(filePath) {
	try {
		console.log(`正在优化: ${filePath}`);
		const fs = await import("node:fs/promises");

		// 检查文件是否存在
		if (!existsSync(filePath)) {
			console.error(`❌ 文件不存在: ${filePath}`);
			return false;
		}

		// 读取图片数据到缓冲区
		const imageBuffer = await fs.readFile(filePath);
		const metadata = await sharp(imageBuffer).metadata();

		// 计算优化后的基准尺寸
		let baseWidth = metadata.width || 0;
		let baseHeight = metadata.height || 0;

		// 如果宽度超过最大宽度，按比例缩小
		if (baseWidth > OPTIMIZATION_CONFIG.maxWidth) {
			baseHeight = Math.round(
				(baseHeight / baseWidth) * OPTIMIZATION_CONFIG.maxWidth,
			);
			baseWidth = OPTIMIZATION_CONFIG.maxWidth;
		}

		// 计算输出路径
		const relativePath = path.relative(OPTIMIZATION_CONFIG.inputDir, filePath);
		const basePath = path.join(OPTIMIZATION_CONFIG.outputDir, relativePath.replace(/\.[^/.]+$/, ""));
		const outputDir = path.dirname(basePath);

		// 确保输出目录存在
		mkdirSync(outputDir, { recursive: true });

		// 优化并保存原格式
		const originalExt = filePath.split(".").pop().toLowerCase();
		let optimizedBuffer;

		// 根据文件类型选择优化参数
		if (originalExt === "jpg" || originalExt === "jpeg") {
			optimizedBuffer = await sharp(imageBuffer)
				.resize(baseWidth, baseHeight, {
					fit: "inside", // 保持宽高比，调整到指定尺寸内
					withoutEnlargement: true, // 不放大图片
				})
				.jpeg({
					quality: OPTIMIZATION_CONFIG.quality,
					mozjpeg: true, // 使用 mozjpeg 编码器
					progressive: true, // 生成渐进式 JPEG
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
					compressionLevel: 8, // 压缩级别 (0-9)
					adaptiveFiltering: true, // 自适应过滤
					force: false, // 不强制转换
				})
				.toBuffer();
		} else {
			// 其他格式直接使用原图
			optimizedBuffer = imageBuffer;
		}

		// 写入优化后的原图
		const originalOutputPath = `${basePath}.${originalExt}`;
		await fs.writeFile(originalOutputPath, optimizedBuffer);

		// 生成WebP和AVIF格式的不同尺寸版本
		for (const format of OPTIMIZATION_CONFIG.formats) {
			// 生成主格式版本（不包含尺寸后缀）
			const mainOutputPath = `${basePath}.${format}`;
			await sharp(optimizedBuffer)
				.resize(baseWidth, baseHeight, {
					fit: "inside",
					withoutEnlargement: true,
					kernel: "lanczos3", // 使用 lanczos3 算法，获得更好的质量
				})
				.withMetadata() // 保留元数据
				[format]({
					quality: OPTIMIZATION_CONFIG.quality - (format === "avif" ? 5 : 0), // AVIF 格式可以稍微降低质量
					...(format === "webp" && { lossless: false, smartSubsample: true }), // WebP 特定选项
					...(format === "avif" && { chromaSubsampling: "4:2:0" }), // AVIF 特定选项
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

/**
 * 清理未使用的图片
 * @param {string[]} usedImages 使用中的图片路径数组
 */
async function cleanUnusedImages(usedImages) {
	console.log("开始清理未使用的图片...");

	// 获取所有生成的图片
	const allGeneratedImages = [];
	const patterns = ["**/*.jpg", "**/*.jpeg", "**/*.png", "**/*.webp", "**/*.avif"];
	
	for (const pattern of patterns) {
		const files = await glob(`${OPTIMIZATION_CONFIG.outputDir}/${pattern}`, {
			nodir: true
		});
		allGeneratedImages.push(...files);
	}

	// 找出未使用的图片
	const unusedImages = allGeneratedImages.filter(img => {
		const relativePath = path.relative(OPTIMIZATION_CONFIG.outputDir, img);
		return !usedImages.includes(`/images/${relativePath}`);
	});

	// 删除未使用的图片
	let deletedCount = 0;
	for (const img of unusedImages) {
		rmSync(img);
		deletedCount++;
		console.log(`🗑️ 删除未使用的图片: ${img}`);
	}

	console.log(`✅ 清理完成，删除了 ${deletedCount} 张未使用的图片`);
}

/**
 * 分析代码库中使用的图片
 * @returns {Promise<string[]>} 使用中的图片路径数组
 */
async function analyzeUsedImages() {
	console.log("开始分析使用中的图片...");

	// 搜索代码库中的图片引用
	const imagePatterns = [
		/\/images\/[^"'\s]+\.(jpg|jpeg|png|webp|avif)/g,
		/"\/images\/[^"']+/g,
		/'\/images\/[^"']+/g
	];

	const usedImages = new Set();

	// 搜索所有可能包含图片引用的文件
	const files = await glob("src/**/*.{js,jsx,ts,tsx,md,astro}", {
		ignore: IGNORE_DIRS.map(dir => `${dir}/**`)
	});

	const fs = await import("node:fs/promises");

	for (const file of files) {
		const content = await fs.readFile(file, 'utf8');
		
		for (const pattern of imagePatterns) {
			let match;
			while (true) {
				match = pattern.exec(content);
				if (match === null) break;
				let imagePath = match[0];
				// 清理引号
				imagePath = imagePath.replace(/['"]/g, '');
				usedImages.add(imagePath);
			}
		}
	}

	console.log(`✅ 分析完成，找到 ${usedImages.size} 张使用中的图片`);
	return Array.from(usedImages);
}

/**
 * 主函数
 */
async function main() {
	console.log("开始优化图片资源...");

	try {
		// 分析使用中的图片
		const usedImages = await analyzeUsedImages();

		// 获取所有原始图片
		const originalImages = await getAllOriginalImages();
		console.log(`找到 ${originalImages.length} 张原始图片`);

		let successCount = 0;
		let failCount = 0;

		// 遍历处理每张图片
		for (const image of originalImages) {
			const result = await optimizeImage(image);
			if (result) {
				successCount++;
			} else {
				failCount++;
			}
		}

		// 清理未使用的图片
		await cleanUnusedImages(usedImages);

		// 输出结果
		console.log("\n优化完成!");
		console.log(`✅ 成功: ${successCount} 张`);
		console.log(`❌ 失败: ${failCount} 张`);
	} catch (error) {
		console.error("❌ 执行失败:", error.message);
	}
}

// 执行主函数
main();
