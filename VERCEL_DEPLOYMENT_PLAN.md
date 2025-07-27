# Vercel 部署方案

## 当前状况
- ✅ 前端: React + Vite (可部署在 Vercel)
- ❌ 后端: Python Flask (Vercel 不支持)
- ✅ 数据库: Neon Postgres (兼容 Vercel)

## 🎯 推荐方案：迁移到 Node.js

### 方案优势
- ✅ 完全部署在 Vercel
- ✅ 技术栈统一 (JavaScript/TypeScript)
- ✅ 更好的性能和集成
- ✅ 简化部署和维护

### 迁移计划

#### 1. 创建 Node.js API 路由
```
api/
├── db/
│   ├── challenges.js      # 挑战相关API
│   ├── stats.js          # 统计API
│   └── test.js           # 数据库测试
└── migrate.js            # 数据迁移脚本
```

#### 2. 技术栈
- **运行时**: Node.js 18+
- **数据库**: @vercel/postgres
- **框架**: Vercel API Routes
- **语言**: JavaScript/TypeScript

#### 3. API 端点映射

| Python Flask | Node.js Vercel |
|-------------|----------------|
| `/api/db/challenges` | `/api/db/challenges.js` |
| `/api/db/challenges/stats` | `/api/db/stats.js` |
| `/api/db/test` | `/api/db/test.js` |

## 🔧 实现步骤

### 步骤1: 安装依赖
```bash
npm install @vercel/postgres
```

### 步骤2: 创建 API 路由
每个 API 端点对应一个文件

### 步骤3: 配置环境变量
在 Vercel 项目设置中添加数据库连接信息

### 步骤4: 部署测试
```bash
vercel --prod
```

## 📁 项目结构 (迁移后)

```
crawler-leetcode/
├── frontend/              # React 前端
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── api/                   # Node.js API (新增)
│   ├── db/
│   │   ├── challenges.js
│   │   ├── stats.js
│   │   └── test.js
│   └── migrate.js
├── backend/               # Python 后端 (保留作参考)
├── vercel.json           # Vercel 配置
└── package.json          # 根目录配置
```

## 🚀 部署配置

### vercel.json
```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/dist",
  "devCommand": "cd frontend && npm run dev",
  "installCommand": "npm install && cd frontend && npm install",
  "functions": {
    "api/**/*.js": {
      "maxDuration": 10
    }
  },
  "env": {
    "POSTGRES_URL": "@postgres_url",
    "POSTGRES_PRISMA_URL": "@postgres_prisma_url"
  }
}
```

## 🔄 迁移时间表

### 第1天: 基础设置
- [ ] 创建 Node.js API 结构
- [ ] 实现数据库连接
- [ ] 创建测试端点

### 第2天: 核心功能
- [ ] 迁移挑战列表API
- [ ] 迁移统计API
- [ ] 实现数据迁移脚本

### 第3天: 测试和部署
- [ ] 本地测试
- [ ] Vercel 部署测试
- [ ] 前端API地址更新

## 🔧 替代方案

### 方案A: Railway 部署 Python
如果不想迁移到 Node.js：

```yaml
# railway.toml
[build]
builder = "NIXPACKS"

[deploy]
healthcheckPath = "/api/db/test"
restartPolicyType = "ON_FAILURE"
```

### 方案B: Render 部署
```yaml
# render.yaml
services:
  - type: web
    name: crawler-backend
    env: python
    buildCommand: "pip install -r requirements.txt"
    startCommand: "python run.py"
```

## 💰 成本对比

| 平台 | 免费额度 | Python支持 | 部署难度 |
|------|----------|-------------|----------|
| Vercel | 很好 | ❌ | 简单 |
| Railway | 好 | ✅ | 简单 |
| Render | 一般 | ✅ | 中等 |
| Heroku | 有限 | ✅ | 中等 |

## 🎯 最终推荐

**推荐选择**: 迁移到 Node.js + Vercel

**理由**:
1. 技术栈统一，维护简单
2. Vercel 提供最佳的前端部署体验
3. 数据库已经兼容
4. 长期来看更有优势

**如果时间紧迫**: 使用 Railway 部署 Python 后端

你希望我帮你实现哪个方案？
