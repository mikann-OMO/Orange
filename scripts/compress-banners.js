import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';

const INPUT_DIR = 'src/assets/images';
const OUTPUT_DIR = 'src/assets/images';
const MAX_WIDTH = 1920;
const QUALITY = 75;

async function compressImage(inputPath, outputPath) {
    const inputStat = await stat(inputPath);
    const inputSizeKB = inputStat.size / 1024;
    
    console.log(`Compressing: ${inputPath} (${inputSizeKB.toFixed(0)} KB)`);
    
    await sharp(inputPath)
        .resize(MAX_WIDTH, null, { 
            withoutEnlargement: true,
            fit: 'inside'
        })
        .webp({ 
            quality: QUALITY,
            effort: 6
        })
        .toFile(outputPath + '.tmp');
    
    const outputStat = await stat(outputPath + '.tmp');
    const outputSizeKB = outputStat.size / 1024;
    const savings = ((1 - outputSizeKB / inputSizeKB) * 100).toFixed(1);
    
    console.log(`  -> ${outputSizeKB.toFixed(0)} KB (saved ${savings}%)`);
    
    // Replace original
    const fs = await import('fs');
    fs.renameSync(outputPath + '.tmp', outputPath);
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
