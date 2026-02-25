# 图片管理最佳实践

## 目录结构

为了更好地管理图片资源，我们采用以下目录结构：

```
src/
└── assets/
    └── images/
        └── original/  # 原始图片存放目录
            ├── avatars/     # 头像图片
            ├── posts/       # 文章图片
            ├── gallery/     # 相册图片
            └── other/       # 其他图片

public/
└── images/  # 生成的优化图片目录（自动生成，无需手动修改）
    ├── avatars/
    ├── posts/
    ├── gallery/
    └── other/
```

## 图片优化工作流

### 1. 添加原始图片

将原始图片添加到 `src/assets/images/original/` 目录下的对应子目录中。

### 2. 运行优化脚本

使用以下命令运行图片优化脚本：

```bash
node scripts/optimize-images-improved.js
```

该脚本会：
- 分析代码库中使用的图片
- 优化原始图片并生成响应式版本
- 清理未使用的图片

### 3. 在代码中引用图片

在代码中使用以下格式引用图片：

```jsx
// 引用头像
<img src="/images/avatars/chikann-circular.png" alt="头像" />

// 引用文章图片
<img src="/images/posts/示例图片.jpg" alt="示例" />
```

## 命名规范

### 文件名
- 使用小写字母和数字
- 使用下划线 `_` 或连字符 `-` 分隔单词
- 避免使用特殊字符
- 保持文件名简洁明了

### 目录名
- 使用小写字母
- 按功能或类型分类
- 保持目录结构扁平，避免过深嵌套

## 响应式图片

脚本会自动为每张图片生成以下尺寸的响应式版本：
- 320px
- 640px
- 768px
- 1024px
- 1280px
- 1536px
- 1920px

同时生成以下格式：
- 原始格式（如 JPG、PNG）
- WebP 格式
- AVIF 格式

## 最佳实践

1. **只添加必要的图片**：避免添加可能不会使用的图片
2. **保持原始图片质量**：原始图片应保持较高质量，脚本会自动优化
3. **定期运行优化脚本**：在添加新图片或修改代码后运行脚本
4. **使用相对路径**：在代码中使用相对路径引用图片
5. **添加适当的 alt 文本**：为所有图片添加有意义的 alt 文本

## 故障排除

### 图片不显示
- 检查图片路径是否正确
- 确保已运行优化脚本
- 检查图片是否存在于 `public/images/` 目录中

### 脚本运行失败
- 确保已安装依赖：`npm install sharp glob`
- 检查原始图片路径是否正确
- 查看控制台错误信息

## 示例

### 添加新头像
1. 将原始头像图片添加到 `src/assets/images/original/avatars/` 目录
2. 运行优化脚本：`node scripts/optimize-images-improved.js`
3. 在代码中引用：`<img src="/images/avatars/新头像.png" alt="新头像" />`

### 添加文章图片
1. 将图片添加到 `src/assets/images/original/posts/` 目录
2. 运行优化脚本
3. 在 Markdown 文件中引用：`![描述](/images/posts/图片名.jpg)`

## 注意事项

- `public/images/` 目录是自动生成的，不要手动修改其中的内容
- 原始图片应保存在 `src/assets/images/original/` 目录中
- 定期清理未使用的原始图片，以保持仓库大小合理
