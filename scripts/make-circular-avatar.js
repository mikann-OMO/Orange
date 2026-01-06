import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// 配置
const inputPath = path.join('public', 'images', 'chikann.png');
const outputPath = path.join('public', 'images', 'chikann-circular.png');

async function makeCircularAvatar() {
  try {
    // 读取图像
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    // 确保图像是正方形
    const size = Math.min(metadata.width, metadata.height);
    
    // 创建圆形蒙版
    const circle = Buffer.from(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/>
      </svg>
    `);
    
    // 应用蒙版并输出
    await image
      .resize(size, size, { fit: 'cover' })
      .composite([{
        input: circle,
        blend: 'dest-in'
      }])
      .toFile(outputPath);
    
    console.log('圆形头像创建成功:', outputPath);
  } catch (error) {
    console.error('处理图像时出错:', error);
  }
}

makeCircularAvatar();
