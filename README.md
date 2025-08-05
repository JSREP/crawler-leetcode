# 🕷️ 爬虫LeetCode

一个现代化的LeetCode题目爬虫和管理系统，采用前后端分离架构。

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-2.3+-green.svg)](https://flask.palletsprojects.com)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg)](https://nextjs.org)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://mysql.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## ✨ 功能特性

- 🕷️ **智能爬虫**: 自动爬取LeetCode题目和数据
- 📊 **数据可视化**: 题目统计和趋势分析
- 💾 **本地存储**: 完整的文件存储和管理系统
- 🔍 **智能搜索**: 多维度搜索和筛选功能
- 💬 **社区论坛**: 题目讨论和经验分享
- 🎯 **挑战系统**: 个性化学习挑战
- 💰 **积分钱包**: 虚拟货币和奖励系统
- 🔐 **安全认证**: GitHub OAuth登录
- 📱 **响应式设计**: 完美适配各种设备

## 🏗️ 技术架构

### 前端
- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **状态管理**: React Context
- **HTTP客户端**: 统一API客户端

### 后端
- **框架**: Python Flask
- **数据库**: MySQL 8.0+
- **认证**: JWT + GitHub OAuth
- **存储**: 本地文件系统
- **API**: RESTful API设计

### 部署
- **容器化**: Docker + Docker Compose
- **反向代理**: Nginx
- **进程管理**: systemd
- **监控**: 健康检查和日志

## 🚀 快速开始

### 环境要求

- **Python**: 3.11+
- **Node.js**: 18+
- **MySQL**: 8.0+
- **Git**: 最新版本

### 一键启动（推荐）

```bash
# 1. 克隆项目
git clone <repository-url>
cd crawler-leetcode

# 2. 后端设置
cd backend
pip install -r requirements.txt
cp .env.example .env
# 编辑 .env 文件配置数据库连接

# 3. 初始化数据库和示例数据
python quick_init.py
python create_sample_data.py

# 4. 启动后端服务
python run.py

# 5. 前端设置（新终端）
cd ../frontend
npm install
cp .env.local.example .env.local
# 编辑 .env.local 配置API地址

# 6. 启动前端服务
npm run dev
```

### Docker部署（生产推荐）

```bash
# 1. 克隆项目
git clone <repository-url>
cd crawler-leetcode

# 2. 配置环境变量
cp docker-compose.yml docker-compose.override.yml
# 编辑 docker-compose.override.yml

# 3. 启动所有服务
docker-compose up -d

# 4. 初始化数据
docker-compose exec app python quick_init.py
docker-compose exec app python create_sample_data.py
```

### 验证安装

```bash
# 检查后端健康状态
curl http://localhost:5000/health

# 检查API功能
curl http://localhost:5000/api/db/test

# 访问前端应用
open http://localhost:3000
```

## ⚙️ 配置指南

### 后端配置 (.env)

```env
# Flask应用配置
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your-secret-key

# MySQL数据库配置
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your-password
MYSQL_DATABASE=crawler_leetcode

# JWT配置
JWT_SECRET_KEY=your-jwt-secret

# 文件存储配置
UPLOAD_FOLDER=./storage

# GitHub OAuth配置
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:3000/auth/callback

# CORS配置
CORS_ORIGINS=http://localhost:3000
```

### 前端配置 (.env.local)

```env
# API配置
NEXT_PUBLIC_API_URL=http://localhost:5000

# GitHub OAuth配置
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# 应用配置
NEXT_PUBLIC_APP_NAME=爬虫LeetCode
NEXT_PUBLIC_APP_VERSION=2.0.0
```

## 📁 项目结构

```
crawler-leetcode/
├── backend/                # 🐍 Python Flask后端
│   ├── app/               # Flask应用核心
│   │   ├── models/        # 数据模型 (User, Challenge, Forum等)
│   │   ├── api/           # RESTful API路由
│   │   ├── auth/          # JWT + GitHub OAuth认证
│   │   ├── storage/       # 本地文件存储系统
│   │   └── utils/         # 工具函数和验证器
│   ├── migrations/        # 数据库迁移脚本
│   ├── scripts/           # 维护和部署脚本
│   ├── tests/             # 完整测试套件
│   ├── docs/              # 后端API文档
│   ├── storage/           # 文件存储目录
│   ├── config.py          # 配置管理
│   ├── run.py             # 应用启动入口
│   └── requirements.txt   # Python依赖
├── frontend/              # ⚛️ Next.js前端应用
│   ├── app/               # Next.js 14 App Router
│   │   ├── auth/          # 认证页面
│   │   ├── challenges/    # 挑战管理页面
│   │   ├── forum/         # 论坛系统页面
│   │   ├── storage/       # 存储管理页面
│   │   └── wallet/        # 钱包系统页面
│   ├── components/        # React组件库
│   │   ├── auth/          # 认证相关组件
│   │   ├── challenge/     # 挑战相关组件
│   │   ├── layout/        # 布局组件
│   │   └── providers/     # Context Providers
│   ├── lib/               # 工具库
│   │   ├── api-client.ts  # 统一API客户端
│   │   └── utils.ts       # 工具函数
│   ├── contexts/          # React Context状态管理
│   ├── hooks/             # 自定义React Hooks
│   ├── types/             # TypeScript类型定义
│   ├── styles/            # 样式文件
│   ├── package.json       # Node.js依赖
│   └── next.config.js     # Next.js配置
├── nginx/                 # 🌐 Nginx反向代理配置
├── docker-compose.yml     # 🐳 Docker容器编排
├── DEPLOYMENT.md          # 📖 详细部署指南
├── DEVELOPMENT.md         # 🛠️ 开发环境搭建
├── MIGRATION_COMPLETE.md  # ✅ 迁移完成报告
└── README.md              # 📋 项目说明文档
```

## 🔧 开发指南

### 后端开发

```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 运行测试
python run_tests.py

# 配置验证
python scripts/validate_config.py

# 数据库迁移
python quick_init.py

# 启动开发服务器
python run.py
```

### 前端开发

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 运行生产服务器
npm start
```

### API文档

后端提供完整的RESTful API：

- **数据库API**: `/api/db/*`
- **认证API**: `/auth/*`
- **存储API**: `/storage/*`
- **论坛API**: `/api/forum/*`
- **钱包API**: `/api/wallet/*`

详细API文档请参考：[backend/docs/api.md](backend/docs/api.md)

## 🚀 部署指南

### 开发环境部署

参考[快速开始](#快速开始)部分。

### 生产环境部署

详细部署指南请参考：[DEPLOYMENT.md](DEPLOYMENT.md)

#### Docker部署（推荐）

```bash
# 使用Docker Compose
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

#### 传统部署

```bash
# 运行部署脚本
cd backend
python scripts/deploy.py --env production
```

## 🧪 测试

### 运行所有测试

```bash
cd backend
python run_tests.py
```

### 运行特定测试

```bash
# API测试
python test_api.py

# 认证测试
python test_auth.py

# 存储测试
python test_storage.py

# 论坛测试
python test_forum.py

# 性能测试
python tests/test_performance.py
```

## 📊 监控和维护

### 健康检查

```bash
# 应用健康状态
curl http://localhost:5000/health

# 数据库连接测试
curl http://localhost:5000/api/db/test
```

### 日志查看

```bash
# 应用日志
sudo journalctl -u crawler-leetcode -f

# Nginx日志
sudo tail -f /var/log/nginx/access.log
```

### 备份管理

```bash
# 创建备份
python scripts/storage_backup.py create

# 恢复备份
python scripts/storage_backup.py restore backup_file.tar.gz

# 清理旧备份
python scripts/storage_backup.py cleanup 30
```

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

### 开发规范

- 遵循PEP 8 Python代码规范
- 使用TypeScript进行前端开发
- 编写单元测试覆盖新功能
- 更新相关文档

## 📚 文档

- [部署指南](DEPLOYMENT.md)
- [迁移完成报告](MIGRATION_COMPLETE.md)
- [验证报告](VERIFICATION_REPORT.md)
- [后端API文档](backend/docs/api.md)
- [存储系统文档](backend/docs/storage_system.md)
- [配置指南](backend/docs/configuration.md)

## 🐛 问题反馈

如果您遇到任何问题，请通过以下方式反馈：

1. [GitHub Issues](https://github.com/your-repo/issues)
2. 邮件联系：your-email@example.com

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和用户！

---

**⭐ 如果这个项目对您有帮助，请给我们一个星标！**
