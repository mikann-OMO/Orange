const fs = require('fs');
const path = require('path');

const sourcePath = 'd:\\Blog\\orange\\public\\images\\毛毛痛车';
const destPath = 'd:\\Blog\\orange\\public\\images\\itasha';

const files = {
    '乱.png': 'mess.png',
    '开始.jpg': 'start.jpg',
    '数据.png': 'data.png',
    '毛毛.png': 'momo.png',
    '素材.jpg': 'material.jpg',
    '草稿.jpg': 'draft.jpg'
};

for (const [sourceFile, destFile] of Object.entries(files)) {
    const sourceFilePath = path.join(sourcePath, sourceFile);
    const destFilePath = path.join(destPath, destFile);
    
    try {
        fs.copyFileSync(sourceFilePath, destFilePath);
        console.log(`Copied ${sourceFile} to ${destFile}`);
    } catch (error) {
        console.error(`Error copying ${sourceFile}:`, error.message);
    }
}

console.log('All files copied successfully!');