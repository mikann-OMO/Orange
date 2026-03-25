# 贡献指南

感谢你对 Orange Blog 项目的关注和支持！我们欢迎各种形式的贡献，包括但不限于代码提交、问题报告、文档改进等。

## 📋 贡献流程

### 1. 报告问题

如果你发现了 bug 或有新功能建议，请在 GitHub 上提交 Issue：

1. 访问项目的 [Issue 页面](https://github.com/yourusername/orange-blog/issues)
2. 点击 "New Issue"
3. 选择合适的模板（Bug 报告或功能请求）
4. 填写详细信息，包括：
   - 问题描述
   - 复现步骤（对于 bug）
   - 预期行为
   - 实际行为
   - 环境信息（操作系统、浏览器版本等）
   - 相关截图（如有）

### 2. 提交代码

#### 步骤 1：Fork 仓库

1. 访问项目的 GitHub 仓库页面
2. 点击 "Fork" 按钮创建自己的分支

#### 步骤 2：克隆仓库

```bash
# 克隆你 fork 的仓库
git clone https://github.com/yourusername/orange-blog.git
cd orange-blog

# 添加上游仓库
git remote add upstream https://github.com/original-owner/orange-blog.git
```

#### 步骤 3：创建分支

```bash
# 创建并切换到新分支
git checkout -b feature/your-feature-name
# 或对于 bug 修复
git checkout -b fix/your-bug-fix
```

#### 步骤 4：安装依赖

```bash
pnpm install
```

#### 步骤 5：开发和测试

- 运行开发服务器：`pnpm dev`
- 运行类型检查：`pnpm type-check`
- 运行代码格式化：`pnpm format`
- 运行代码检查：`pnpm lint`
- 构建项目：`pnpm build`

#### 步骤 6：提交代码

```bash
# 查看修改
git status

# 暂存修改
git add .

# 提交修改（使用语义化提交信息）
git commit -m "feat: 添加新功能描述"
# 或
# git commit -m "fix: 修复 bug 描述"
# 或
# git commit -m "docs: 更新文档"
```

#### 步骤 7：推送到远程

```bash
# 推送到你的 fork 仓库
git push origin feature/your-feature-name
```

#### 步骤 8：创建 Pull Request

1. 访问你 fork 的仓库页面
2. 点击 "Compare & pull request"
3. 填写 PR 标题和描述，说明：
   - 你解决的问题
   - 你做了哪些修改
   - 相关的 Issue（如果有）
4. 点击 "Create pull request"

## 🎨 代码风格

### 1. 代码格式化

项目使用 Biome 进行代码格式化，提交前请运行：

```bash
pnpm format
```

### 2. 代码检查

提交前请运行代码检查：

```bash
pnpm lint
```

### 3. 类型检查

确保 TypeScript 类型检查通过：

```bash
pnpm type-check
```

### 4. 提交信息规范

使用语义化提交信息，格式为：

```
<类型>: <描述>

<详细说明>

<相关 Issue 链接>
```

常见类型：
- `feat`：新功能
- `fix`：bug 修复
- `docs`：文档更新
- `style`：代码风格调整（不影响功能）
- `refactor`：代码重构
- `test`：测试相关
- `chore`：构建或依赖更新

### 5. 代码规范

- **TypeScript**：使用严格模式，避免使用 `any` 类型
- **Astro**：遵循 Astro 组件最佳实践
- **Svelte**：遵循 Svelte 组件最佳实践
- **CSS**：使用 Tailwind CSS 类，避免内联样式
- **命名**：使用 camelCase 命名变量和函数，PascalCase 命名组件

## 🧪 测试指南

### 运行测试

项目使用 [Vitest](https://vitest.dev/) 进行测试，运行：

```bash
pnpm test
```

### 编写测试

- 单元测试：放在 `test/unit/` 目录
- 组件测试：放在 `test/component/` 目录
- 测试文件命名：`*.test.ts` 或 `*.spec.ts`

## 📚 文档规范

- **README.md**：项目概述、安装和使用指南
- **API 文档**：详细说明 API 端点和使用方法
- **代码注释**：为复杂逻辑添加注释，遵循 JSDoc 规范

## 🔒 安全注意事项

- 不要在代码中硬编码敏感信息
- 确保所有依赖项都是最新的，避免已知漏洞
- 遵循最佳安全实践

## 📄 许可证

通过贡献代码，你同意你的贡献将在 [MIT 许可证](LICENSE) 下发布。

## 🤝 行为准则

我们期望所有贡献者遵循以下行为准则：

- 尊重他人，保持友善和专业
- 接受建设性批评
- 专注于项目的最佳利益
- 避免使用冒犯性语言或行为

## 📞 联系方式

如果你有任何问题或需要帮助，可以通过以下方式联系我们：

- GitHub Issue：[项目 Issues](https://github.com/yourusername/orange-blog/issues)
- 邮件：[your.email@example.com]

---

感谢你的贡献，让 Orange Blog 变得更好！