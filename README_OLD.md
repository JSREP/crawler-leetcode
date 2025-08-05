# 爬虫LeetCode项目

这是一个基于Next.js的爬虫技术挑战平台，用于展示和管理LeetCode挑战。

## 技术栈

- **前端**: Next.js 14 + TypeScript + Ant Design + Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: Neon Serverless PostgreSQL
- **文件存储**: Vercel Blob Store
- **部署**: Vercel

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 环境变量配置

🔒 **重要安全提醒**:
- **`.env.local`** - 包含真实敏感信息，**绝不**提交到git
- **`.env.example`** - 只包含示例占位符，**可以**提交到git

创建 `.env.local` 文件：

```bash
cp .env.example .env.local
```

在 `.env.local` 中配置真实的环境变量：

```env
# Neon Serverless PostgreSQL
DATABASE_URL="your_neon_database_url"
# 向后兼容
POSTGRES_URL="your_postgres_connection_string"
# Blob Store
BLOB_READ_WRITE_TOKEN="your_blob_read_write_token"
```

⚠️ **安全警告**: 详细安全配置指南请参考 [docs/SECURITY_GUIDE.md](docs/SECURITY_GUIDE.md)

### 启动开发服务器

```bash
npm run dev
# 或使用启动脚本
./start.sh
```

访问 [http://localhost:61395](http://localhost:61395) 查看应用。

## 项目结构

```
crawler-leetcode/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes (后端)
│   │   └── db/           # 数据库相关API
│   ├── challenges/        # 挑战页面
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/            # React组件
│   ├── layout/           # 布局组件
│   ├── providers/        # Context Providers
│   └── index.ts          # 组件导出
├── lib/                   # 工具库
│   ├── api/              # API相关工具
│   ├── db/               # 数据库操作
│   ├── validations/      # 数据验证
│   └── utils.ts          # 通用工具函数
├── types/                 # TypeScript类型定义
├── hooks/                 # 自定义React Hooks
├── utils/                 # 工具函数
├── constants/             # 常量定义
├── config/                # 配置文件
├── styles/                # 样式文件
├── public/                # 静态资源
│   ├── images/           # 图片资源
│   └── icons/            # 图标资源
└── 配置文件
```

## 爬虫挑战

所有爬虫挑战都定义在 `docs/challenges/` 目录中，使用YAML格式描述挑战的特点、难度和解决方案。详细的贡献指南请参考 [挑战贡献指南](docs/challenges/README.md)。

目前包含的挑战类型：

- 验证码挑战（如reCAPTCHA、hCaptcha）
- 浏览器指纹识别
- JavaScript混淆与加密
- API限流与保护
- WebAssembly保护
- 设备指纹和行为分析

## API 接口

### 数据库API
- `GET /api/db/test` - 数据库连接测试
- `GET /api/db/challenges` - 获取挑战列表
- `GET /api/db/challenges/[alias]` - 获取单个挑战
- `GET /api/db/stats` - 获取统计信息

### 文件上传API
- `POST /api/upload` - 通用文件上传
- `POST /api/avatar/upload` - 头像上传
- `GET /api/upload` - 获取上传配置

详细文档请参考：
- [🔒 安全配置指南](docs/SECURITY_GUIDE.md) - **必读**
- [Blob Store使用文档](docs/BLOB_STORE.md)
- [Neon数据库使用文档](docs/NEON_DATABASE.md)

## 本地开发

```bash
# 克隆项目
git clone https://github.com/JSREP/crawler-leetcode.git
cd crawler-leetcode

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建项目
npm run build

# 预览构建结果
npm run preview
```

## 自动部署

本项目配置了GitHub Actions自动部署流程，当代码推送到主分支时，会自动构建并部署到GitHub Pages：

1. 检出代码
2. 设置Node.js环境
3. 安装依赖
4. 构建项目
5. 部署到gh-pages分支

你可以在 `.github/workflows/deploy-github-pages.yml` 文件中查看完整的工作流配置。

## 贡献指南

1. Fork本仓库
2. 创建新分支 (`git checkout -b feature/new-challenge`)
3. 提交更改 (`git commit -m 'Add new challenge: XXX'`)
4. 推送到分支 (`git push origin feature/new-challenge`)
5. 创建Pull Request

欢迎贡献新的爬虫挑战案例、改进文档或代码！

## 许可证

MIT
