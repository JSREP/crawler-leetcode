# 🕷️ 爬虫技术挑战平台 - Next.js 版

> 突破各种网站反爬机制，掌握先进爬虫技术，提升数据采集能力

## 🎯 项目概述

这是一个专业的爬虫技术学习平台，提供各种真实网站的爬虫挑战，帮助开发者提升数据采集技能。项目已完全重构为 **TypeScript + Next.js**，可以完美部署在 **Vercel** 上。

### ✨ 主要特性

- 🚀 **现代技术栈**: Next.js 14 + TypeScript + Tailwind CSS
- 🗄️ **数据库集成**: Neon Postgres + Vercel 原生支持
- 🎨 **精美界面**: Ant Design + 响应式设计
- 📱 **移动友好**: 完全响应式，支持各种设备
- ⚡ **高性能**: 服务端渲染 + 静态生成
- 🔒 **类型安全**: 完整的 TypeScript 支持
- 🌐 **一键部署**: Vercel 零配置部署

## 🚀 快速开始

### 本地开发

1. **安装依赖**
```bash
npm install
```

2. **配置环境变量**
```bash
# 编辑 .env.local 文件，配置数据库连接
```

3. **启动开发服务器**
```bash
npm run dev
```

4. **访问应用**
```
http://localhost:3000
```

## 📁 项目结构

```
crawler-leetcode-nextjs/
├── app/                          # Next.js App Router
│   ├── api/                     # API Routes
│   │   └── db/                  # 数据库 API
│   ├── challenges/              # 挑战相关页面
│   ├── globals.css              # 全局样式
│   ├── layout.tsx               # 根布局
│   └── page.tsx                 # 首页
├── components/                   # React 组件
│   ├── layout/                  # 布局组件
│   └── providers/               # Context Providers
├── lib/                         # 工具库
│   ├── database.ts              # 数据库操作
│   └── utils.ts                 # 通用工具
├── types/                       # TypeScript 类型
│   └── challenge.ts             # 挑战相关类型
├── scripts/                     # 脚本文件
│   └── deploy.sh                # 部署脚本
└── vercel.json                  # Vercel 部署配置
```

## 🔌 API 接口

### 挑战相关

- `GET /api/db/challenges` - 获取挑战列表（支持分页和筛选）
- `GET /api/db/challenges/[alias]` - 获取单个挑战详情
- `POST /api/db/challenges` - 创建新挑战

### 统计信息

- `GET /api/db/stats` - 获取挑战统计信息

### 系统

- `GET /api/db/test` - 测试数据库连接

## 🚀 部署到 Vercel

### 自动部署

1. **连接 GitHub**
   - 在 Vercel 中导入 GitHub 仓库
   - 选择 Next.js 框架预设

2. **配置环境变量**
   - 在 Vercel 项目设置中添加环境变量
   - 配置数据库连接信息

3. **自动部署**
   - 推送代码到 main 分支自动触发部署

### 手动部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署项目
vercel --prod
```

### 使用部署脚本

```bash
# 执行自动化部署脚本
./scripts/deploy.sh
```

## 🧪 测试

```bash
# 类型检查
npm run type-check

# 构建测试
npm run build

# 测试数据库连接
curl https://your-domain.vercel.app/api/db/test
```

## 🔧 技术栈

- **前端**: Next.js 14, TypeScript, Tailwind CSS
- **UI**: Ant Design
- **数据库**: Neon Postgres
- **部署**: Vercel
- **API**: Next.js API Routes

## 📊 重构优势

相比原来的 React + Python 架构：

- ✅ **统一技术栈**: 前后端都使用 TypeScript
- ✅ **零配置部署**: Vercel 原生支持
- ✅ **更好性能**: SSR + 边缘计算
- ✅ **类型安全**: 端到端类型检查
- ✅ **开发体验**: 热重载 + 自动优化

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 打开 Pull Request

---

<div align="center">
  <p>Made with ❤️ by JSREP</p>
  <p>
    <a href="https://github.com/JSREP/crawler-leetcode">GitHub</a> •
    <a href="https://your-domain.vercel.app">Live Demo</a> •
    <a href="https://your-domain.vercel.app/api/db/test">API Status</a>
  </p>
</div>
