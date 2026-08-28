import sharp from 'sharp';
import { readdir, stat, copyFile, unlink, rename } from 'fs/promises';
import { join } from 'path';

const INPUT_DIR = 'src/assets/images';
const OUTPUT_DIR = 'src/assets/images';
const MAX_WIDTH = 1600;
const QUALITY = 60;

async function compressImage(inputPath, outputPath) {
    const inputStat = await stat(inputPath);
    const inputSizeKB = inputStat.size / 1024;
    
    console.log(`Compressing: ${inputPath} (${inputSizeKB.toFixed(0)} KB)`);
    
    const tmpPath = outputPath + '.new';
    await sharp(inputPath)
        .resize(MAX_WIDTH, null, { 
            withoutEnlargement: true,
            fit: 'inside'
        })
        .webp({ 
            quality: QUALITY,
            effort: 6
        })
        .toFile(tmpPath);
    
    try {
        await copyFile(tmpPath, outputPath);
    } catch {
        // 原文件被锁定时，先删除再用临时文件重命名
        await unlink(outputPath);
        await rename(tmpPath, outputPath);
    }
    await unlink(tmpPath).catch(() => {});
    
    const outputStat = await stat(outputPath);
    const outputSizeKB = outputStat.size / 1024;
    const savings = ((1 - outputSizeKB / inputSizeKB) * 100).toFixed(1);
    
    console.log(`  -> ${outputSizeKB.toFixed(0)} KB (saved ${savings}%)`);
}

async function main() {
    const files = await readdir(INPUT_DIR);
    const bannerFiles = files.filter(f => f.startsWith('banner') && f.endsWith('.webp'));
    
    for (const file of bannerFiles) {
        const inputPath = join(INPUT_DIR, file);
        const outputPath = join(OUTPUT_DIR, file);
        await compressImage(inputPath, outputPath);
    }
    
    console.log('\nDone!');
}

main().catch(console.error);
