/**
 * 创建圆形头像的脚本
 * 使用 sharp 库将方形图片转换为圆形头像
 */

import sharp from 'sharp'; // 图像处理库
import fs from 'node:fs'; // 文件系统模块
import path from 'node:path'; // 路径处理模块

/**
 * 配置项
 * 可根据需要修改输入和输出路径
 */
const config = {
  inputPath: path.join('public', 'images', 'chikann.png'), // 输入图片路径
  outputPath: path.join('public', 'images', 'chikann-circular.png') // 输出圆形头像路径
};

/**
 * 创建圆形头像
 * @returns {Promise<void>}
 */
async function makeCircularAvatar() {
  try {
    // 检查输入文件是否存在
    if (!fs.existsSync(config.inputPath)) {
      console.error('错误: 输入文件不存在:', config.inputPath);
      return;
    }

    // 读取图像并获取元数据
    const image = sharp(config.inputPath);
    const metadata = await image.metadata();
    
    // 确保图像是正方形
    // 使用宽度和高度中的较小值作为正方形的边长
    const size = Math.min(metadata.width, metadata.height);
    
    // 创建圆形蒙版
    // 使用 SVG 创建一个圆形，作为蒙版
    const circle = Buffer.from(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/>
      </svg>
    `);
    
    // 确保输出目录存在
    const outputDir = path.dirname(config.outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // 应用蒙版并输出
    await image
      .resize(size, size, { fit: 'cover' }) // 调整为正方形，使用 cover 模式确保填充
      .composite([{
        input: circle,
        blend: 'dest-in' // 使用 dest-in 混合模式，只保留蒙版内的部分
      }])
      .toFile(config.outputPath);
    
    console.log('圆形头像创建成功:', config.outputPath);
  } catch (error) {
    console.error('处理图像时出错:', error);
  }
}

// 执行函数
makeCircularAvatar();
