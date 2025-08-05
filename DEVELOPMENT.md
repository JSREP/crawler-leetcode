# 🛠️ 开发环境搭建指南

## 📋 概述

本指南详细说明如何搭建爬虫LeetCode项目的开发环境，包括前端和后端的完整配置。

## 🔧 系统要求

### 必需软件
- **Python**: 3.11+ (推荐 3.11.5)
- **Node.js**: 18+ (推荐 18.17.0)
- **MySQL**: 8.0+ (推荐 8.0.34)
- **Git**: 最新版本

### 推荐工具
- **IDE**: VS Code / PyCharm / WebStorm
- **数据库管理**: MySQL Workbench / phpMyAdmin
- **API测试**: Postman / Insomnia
- **终端**: iTerm2 (macOS) / Windows Terminal

## 🚀 快速搭建

### 1. 克隆项目

```bash
# 克隆仓库
git clone <repository-url>
cd crawler-leetcode

# 查看项目结构
tree -L 2
```

### 2. 后端环境搭建

#### 安装Python依赖

```bash
cd backend

# 创建虚拟环境（推荐）
python -m venv venv

# 激活虚拟环境
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# 升级pip
pip install --upgrade pip

# 安装依赖
pip install -r requirements.txt
```

#### 配置MySQL数据库

```bash
# 启动MySQL服务
# macOS (Homebrew)
brew services start mysql

# Ubuntu/Debian
sudo systemctl start mysql

# Windows
net start mysql

# 连接MySQL并创建数据库
mysql -u root -p
```

```sql
-- 创建数据库
CREATE DATABASE crawler_leetcode CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户（可选）
CREATE USER 'crawler_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON crawler_leetcode.* TO 'crawler_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑配置文件
nano .env
```

```env
# 基本配置
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=dev-secret-key-change-in-production

# 数据库配置
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=crawler_leetcode

# JWT配置
JWT_SECRET_KEY=dev-jwt-secret-key

# 存储配置
UPLOAD_FOLDER=./storage

# CORS配置
CORS_ORIGINS=http://localhost:3000,http://localhost:61395
```

#### 初始化数据库

```bash
# 验证配置
python scripts/validate_config.py

# 初始化数据库结构
python quick_init.py

# 创建示例数据
python create_sample_data.py

# 验证数据库连接
python test_mysql_connection.py
```

#### 启动后端服务

```bash
# 启动Flask开发服务器
python run.py

# 验证服务启动
curl http://localhost:5000/health
curl http://localhost:5000/api/db/test
```

### 3. 前端环境搭建

#### 安装Node.js依赖

```bash
# 切换到前端目录
cd ../frontend

# 安装依赖
npm install

# 或使用yarn
yarn install
```

#### 配置环境变量

```bash
# 复制环境变量模板
cp .env.local.example .env.local

# 编辑配置文件
nano .env.local
```

```env
# API配置
NEXT_PUBLIC_API_URL=http://localhost:5000

# GitHub OAuth配置（可选）
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# 应用配置
NEXT_PUBLIC_APP_NAME=爬虫LeetCode
NEXT_PUBLIC_APP_VERSION=2.0.0
```

#### 启动前端服务

```bash
# 启动Next.js开发服务器
npm run dev

# 或使用yarn
yarn dev

# 验证服务启动
open http://localhost:3000
```

## 🧪 开发测试

### 后端测试

```bash
cd backend

# 运行所有测试
python run_tests.py

# 运行特定测试
python test_api.py
python test_auth.py
python test_storage.py
python test_forum.py

# 性能测试
python tests/test_performance.py

# 配置验证
python scripts/validate_config.py
```

### 前端测试

```bash
cd frontend

# 运行测试
npm test

# 运行测试覆盖率
npm run test:coverage

# 类型检查
npm run type-check

# 代码检查
npm run lint

# 代码格式化
npm run format
```

## 🔧 开发工具配置

### VS Code配置

创建 `.vscode/settings.json`:

```json
{
  "python.defaultInterpreterPath": "./backend/venv/bin/python",
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true,
  "python.formatting.provider": "black",
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  }
}
```

创建 `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "ms-python.python",
    "ms-python.flake8",
    "ms-python.black-formatter",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### Git配置

创建 `.gitignore`:

```gitignore
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
.env

# Node.js
node_modules/
.next/
out/
.env.local
.env.production.local

# 数据库
*.db
*.sqlite

# 存储文件
backend/storage/uploads/*
backend/storage/avatars/*
backend/storage/challenges/*
backend/storage/temp/*
!backend/storage/.gitkeep

# 日志
*.log
logs/

# IDE
.vscode/
.idea/
*.swp
*.swo

# 系统文件
.DS_Store
Thumbs.db
```

### 预提交钩子

安装pre-commit:

```bash
pip install pre-commit

# 创建 .pre-commit-config.yaml
cat > .pre-commit-config.yaml << EOF
repos:
  - repo: https://github.com/psf/black
    rev: 23.3.0
    hooks:
      - id: black
        language_version: python3.11

  - repo: https://github.com/pycqa/flake8
    rev: 6.0.0
    hooks:
      - id: flake8

  - repo: https://github.com/pre-commit/mirrors-prettier
    rev: v3.0.0
    hooks:
      - id: prettier
        files: \.(js|jsx|ts|tsx|json|css|md)$
EOF

# 安装钩子
pre-commit install
```

## 🐛 常见问题解决

### Python相关问题

#### 1. 依赖安装失败
```bash
# 升级pip
pip install --upgrade pip

# 清理缓存
pip cache purge

# 重新安装
pip install -r requirements.txt --force-reinstall
```

#### 2. MySQL连接失败
```bash
# 检查MySQL服务状态
sudo systemctl status mysql

# 重启MySQL服务
sudo systemctl restart mysql

# 检查端口占用
netstat -tlnp | grep 3306
```

#### 3. 权限问题
```bash
# 修复存储目录权限
chmod -R 755 backend/storage/
chown -R $USER:$USER backend/storage/
```

### Node.js相关问题

#### 1. 依赖安装失败
```bash
# 清理npm缓存
npm cache clean --force

# 删除node_modules重新安装
rm -rf node_modules package-lock.json
npm install
```

#### 2. 端口占用
```bash
# 查找占用端口的进程
lsof -ti:3000

# 杀死进程
kill -9 $(lsof -ti:3000)
```

### 数据库相关问题

#### 1. 字符编码问题
```sql
-- 检查数据库字符集
SHOW CREATE DATABASE crawler_leetcode;

-- 修改字符集
ALTER DATABASE crawler_leetcode CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 2. 连接数限制
```sql
-- 查看当前连接数
SHOW STATUS LIKE 'Threads_connected';

-- 查看最大连接数
SHOW VARIABLES LIKE 'max_connections';

-- 修改最大连接数
SET GLOBAL max_connections = 200;
```

## 📚 开发资源

### 文档链接
- [Flask官方文档](https://flask.palletsprojects.com/)
- [Next.js官方文档](https://nextjs.org/docs)
- [MySQL官方文档](https://dev.mysql.com/doc/)
- [Tailwind CSS文档](https://tailwindcss.com/docs)

### 学习资源
- [Python最佳实践](https://docs.python-guide.org/)
- [React开发指南](https://react.dev/)
- [TypeScript手册](https://www.typescriptlang.org/docs/)
- [RESTful API设计](https://restfulapi.net/)

### 社区资源
- [Stack Overflow](https://stackoverflow.com/)
- [GitHub Discussions](https://github.com/discussions)
- [Reddit - r/webdev](https://reddit.com/r/webdev)
- [Dev.to](https://dev.to/)

## 🎯 开发最佳实践

### 代码规范
1. **Python**: 遵循PEP 8规范
2. **JavaScript/TypeScript**: 使用Prettier格式化
3. **Git提交**: 使用语义化提交信息
4. **文档**: 保持代码注释和文档同步

### 安全实践
1. **环境变量**: 敏感信息不要硬编码
2. **依赖管理**: 定期更新依赖包
3. **输入验证**: 严格验证用户输入
4. **错误处理**: 不要暴露敏感错误信息

### 性能优化
1. **数据库**: 合理使用索引和查询优化
2. **前端**: 代码分割和懒加载
3. **缓存**: 合理使用缓存策略
4. **监控**: 添加性能监控和日志

---

🎉 **恭喜！您已成功搭建开发环境！**

现在可以开始愉快的开发之旅了！如有问题，请参考[故障排除](#常见问题解决)部分或提交Issue。
