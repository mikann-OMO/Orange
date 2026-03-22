# MongoDB 评论系统部署指南

## 架构概述

- **前端**: Astro 博客项目，使用 `MongoComments.astro` 组件
- **后端**: Vercel Serverless Functions
- **数据库**: MongoDB Atlas

## 部署步骤

### 1. 创建 MongoDB Atlas 数据库

1. 访问 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) 并注册/登录
2. 创建一个免费的 M0 集群
3. 创建数据库用户：
   - 用户名和密码（记住这些，后面需要用到）
4. 配置网络访问：
   - 在 Network Access 中添加 `0.0.0.0/0`（允许所有 IP 访问，适合 Vercel）
   - 或者更安全的方式是使用 Vercel 的 IP 白名单
5. 获取连接字符串：
   - 点击 "Connect" -> "Connect your application"
   - 复制连接字符串，格式类似：
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```

### 2. 部署 Vercel API

1. 进入 `api/` 目录：
   ```bash
   cd api
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 在 Vercel 创建新项目：
   - 访问 [Vercel Dashboard](https://vercel.com/dashboard)
   - 点击 "New Project"
   - 导入你的 Git 仓库
   - 设置 **Root Directory** 为 `api`
   - 设置环境变量：
     - `MONGODB_URI`: MongoDB 连接字符串
     - `MONGODB_DB`: 数据库名称（如 `blog_comments`）

4. 部署项目

### 3. 配置自定义域名

1. 在 Vercel 项目设置中，进入 "Domains"
2. 添加你的自定义域名（如 `comments.mikan.fun`）
3. 在你的 DNS 提供商处添加 CNAME 记录：
   ```
   comments -> cname.vercel-dns.com
   ```
4. 等待 DNS 生效（通常几分钟到几小时）

### 4. 更新博客配置

在 `src/config.ts` 中更新评论配置：

```typescript
export const commentConfig = {
  provider: "mongodb" as const,
  apiBaseUrl: "https://comments.mikan.fun", // 你的自定义域名
};
```

### 5. 创建 MongoDB 索引（推荐）

在 MongoDB Atlas 中创建以下索引以提高性能：

```javascript
// 在 comments 集合上创建索引
db.comments.createIndex({ postSlug: 1, createdAt: -1 });
db.comments.createIndex({ postSlug: 1, parentId: 1 });
db.comments.createIndex({ postSlug: 1, isDeleted: 1 });
```

## API 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/comments` | GET | 获取评论列表 |
| `/api/comments` | POST | 提交新评论 |
| `/api/comments/like` | POST | 点赞/取消点赞 |
| `/api/comments/count` | GET | 获取评论数量 |

## 环境变量

| 变量名 | 描述 | 必需 |
|--------|------|------|
| `MONGODB_URI` | MongoDB 连接字符串 | 是 |
| `MONGODB_DB` | 数据库名称 | 否（默认 `blog_comments`） |

## 安全特性

- XSS 防护：内容自动转义
- 输入验证：邮箱、URL 格式验证
- 内容长度限制：最大 5000 字符
- 用户指纹：防止重复点赞
- CORS 配置：支持跨域请求

## 性能优化

- 数据库连接池
- 响应缓存（60秒）
- 懒加载评论组件
- 分页加载评论

## 故障排除

### 评论加载失败
1. 检查 `apiBaseUrl` 配置是否正确
2. 检查 CORS 配置
3. 检查 MongoDB 连接状态

### 评论提交失败
1. 检查必填字段是否完整
2. 检查内容长度限制
3. 检查邮箱格式

### 点赞不生效
1. 清除浏览器缓存
2. 检查用户指纹生成
