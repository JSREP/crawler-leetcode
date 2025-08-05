# 爬虫LeetCode项目 - Flask后端

这是爬虫LeetCode项目的Python Flask后端API服务。

## 技术栈

- **框架**: Flask 3.0
- **数据库**: MySQL 8.0+ (使用SQLAlchemy ORM)
- **认证**: JWT + GitHub OAuth
- **文件存储**: 本地磁盘存储
- **API文档**: 自动生成的RESTful API

## 快速开始

### 环境要求

- Python 3.8+
- MySQL 8.0+
- pip

### 安装步骤

1. **创建虚拟环境**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
venv\Scripts\activate     # Windows
```

2. **安装依赖**
```bash
pip install -r requirements.txt
```

3. **配置环境变量**
```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库连接等信息
```

4. **初始化数据库**
```bash
# 创建数据库
mysql -u root -p -e "CREATE DATABASE crawler_leetcode CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 初始化表结构
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

5. **启动开发服务器**
```bash
python run.py
```

服务器将在 http://localhost:5000 启动

## 项目结构

```
backend/
├── app/                    # 应用主目录
│   ├── __init__.py        # 应用工厂
│   ├── models/            # 数据模型
│   ├── api/               # API路由
│   ├── auth/              # 认证相关
│   ├── storage/           # 文件存储
│   └── utils/             # 工具函数
├── migrations/            # 数据库迁移文件
├── storage/               # 本地文件存储目录
├── config.py              # 配置文件
├── requirements.txt       # Python依赖
└── run.py                 # 启动文件
```

## API接口

### 核心API
- `GET /api/db/test` - 数据库连接测试
- `GET /api/db/challenges` - 获取挑战列表
- `GET /api/db/challenges/<alias>` - 获取单个挑战
- `GET /api/db/stats` - 获取统计信息

### 认证API
- `POST /auth/github` - GitHub OAuth登录
- `POST /auth/refresh` - 刷新JWT token
- `POST /auth/logout` - 用户登出

### 文件存储API
- `POST /storage/upload` - 文件上传
- `GET /storage/files/<filename>` - 文件访问
- `GET /storage/quota` - 存储配额查询

## 开发指南

### 数据库迁移
```bash
# 生成迁移文件
flask db migrate -m "描述信息"

# 应用迁移
flask db upgrade

# 回滚迁移
flask db downgrade
```

### 运行测试
```bash
pytest
```

### 代码格式化
```bash
black .
flake8 .
```

## 生产部署

### 使用Gunicorn
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 run:app
```

### 环境变量配置
生产环境需要配置以下环境变量：
- `FLASK_ENV=production`
- `SECRET_KEY` - 应用密钥
- `JWT_SECRET_KEY` - JWT密钥
- `MYSQL_*` - 数据库连接信息
- `GITHUB_CLIENT_*` - GitHub OAuth配置
