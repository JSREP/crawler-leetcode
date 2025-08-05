# 配置文件与环境变量设置指南

## 📋 概述

本文档详细说明了Flask后端应用的配置选项和环境变量设置。

## 🔧 配置文件结构

### 主配置文件 (`config.py`)

```python
class Config:
    """基础配置类"""
    
    # 基本配置
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # 数据库配置
    MYSQL_HOST = os.environ.get('MYSQL_HOST') or 'localhost'
    MYSQL_PORT = int(os.environ.get('MYSQL_PORT') or 3306)
    MYSQL_USER = os.environ.get('MYSQL_USER') or 'root'
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD') or 'cC11001100'
    MYSQL_DATABASE = os.environ.get('MYSQL_DATABASE') or 'crawler_leetcode'
    
    # JWT配置
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or SECRET_KEY
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # 文件存储配置
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER') or './storage'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    
    # GitHub OAuth配置
    GITHUB_CLIENT_ID = os.environ.get('GITHUB_CLIENT_ID')
    GITHUB_CLIENT_SECRET = os.environ.get('GITHUB_CLIENT_SECRET')
    
    # CORS配置
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(',')
```

### 环境特定配置

- **DevelopmentConfig**: 开发环境配置
- **ProductionConfig**: 生产环境配置
- **TestingConfig**: 测试环境配置

## 🌍 环境变量配置

### 必需的环境变量

#### 数据库配置
```bash
# MySQL数据库连接
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=cC11001100
MYSQL_DATABASE=crawler_leetcode

# 或使用完整的数据库URL
DATABASE_URL=mysql+pymysql://root:cC11001100@localhost:3306/crawler_leetcode?charset=utf8mb4
```

#### 安全配置
```bash
# Flask密钥（生产环境必须设置）
SECRET_KEY=your-super-secret-key-here

# JWT密钥
JWT_SECRET_KEY=your-jwt-secret-key-here
```

### 可选的环境变量

#### GitHub OAuth
```bash
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:3000/auth/callback
```

#### 文件存储
```bash
UPLOAD_FOLDER=./storage
MAX_CONTENT_LENGTH=16777216  # 16MB
```

#### CORS配置
```bash
CORS_ORIGINS=http://localhost:3000,http://localhost:61395
```

#### 应用配置
```bash
FLASK_ENV=development
FLASK_DEBUG=True
APP_NAME=爬虫LeetCode
APP_VERSION=2.0.0
```

## 📁 配置文件示例

### 开发环境 (`.env`)
```bash
# Flask应用配置
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=dev-secret-key-change-in-production

# MySQL数据库配置
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=cC11001100
MYSQL_DATABASE=crawler_leetcode

# JWT配置
JWT_SECRET_KEY=dev-jwt-secret-key

# 文件存储配置
UPLOAD_FOLDER=./storage

# GitHub OAuth配置（可选）
# GITHUB_CLIENT_ID=your_github_client_id
# GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:3000/auth/callback

# CORS配置
CORS_ORIGINS=http://localhost:3000,http://localhost:61395

# 应用配置
APP_NAME=爬虫LeetCode
APP_VERSION=2.0.0
```

### 生产环境 (`.env.production`)
```bash
# Flask应用配置
FLASK_ENV=production
FLASK_DEBUG=False
SECRET_KEY=your-production-secret-key-here

# MySQL数据库配置
MYSQL_HOST=your-production-db-host
MYSQL_PORT=3306
MYSQL_USER=your-production-db-user
MYSQL_PASSWORD=your-production-db-password
MYSQL_DATABASE=crawler_leetcode

# JWT配置
JWT_SECRET_KEY=your-production-jwt-secret-key

# 文件存储配置
UPLOAD_FOLDER=/var/www/storage

# GitHub OAuth配置
GITHUB_CLIENT_ID=your_production_github_client_id
GITHUB_CLIENT_SECRET=your_production_github_client_secret
GITHUB_REDIRECT_URI=https://yourdomain.com/auth/callback

# CORS配置
CORS_ORIGINS=https://yourdomain.com

# 应用配置
APP_NAME=爬虫LeetCode
APP_VERSION=2.0.0
```

## 🚀 部署配置

### Docker配置

#### Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY . .

# 创建存储目录
RUN mkdir -p storage/uploads storage/avatars storage/challenges storage/temp

# 设置权限
RUN chmod +x scripts/*.py

# 暴露端口
EXPOSE 5000

# 启动命令
CMD ["python", "run.py"]
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
      - MYSQL_HOST=db
      - MYSQL_USER=root
      - MYSQL_PASSWORD=your_password
      - MYSQL_DATABASE=crawler_leetcode
    volumes:
      - ./storage:/app/storage
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=your_password
      - MYSQL_DATABASE=crawler_leetcode
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

volumes:
  mysql_data:
```

### Nginx配置

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # API代理
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 存储文件代理
    location /storage/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 认证代理
    location /auth/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 静态文件直接服务
    location /static/ {
        alias /var/www/storage/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 🔒 安全配置

### 生产环境安全检查清单

- [ ] 设置强密码的SECRET_KEY
- [ ] 设置独立的JWT_SECRET_KEY
- [ ] 使用HTTPS
- [ ] 配置防火墙
- [ ] 限制数据库访问
- [ ] 设置文件上传限制
- [ ] 配置CORS白名单
- [ ] 启用日志记录
- [ ] 定期备份数据库

### 密钥生成

```python
# 生成安全的密钥
import secrets
secret_key = secrets.token_urlsafe(32)
print(f"SECRET_KEY={secret_key}")
```

## 📊 监控配置

### 日志配置
```python
import logging
from logging.handlers import RotatingFileHandler

if not app.debug:
    file_handler = RotatingFileHandler('logs/app.log', maxBytes=10240, backupCount=10)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
```

### 健康检查端点
```python
@app.route('/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': app.config.get('APP_VERSION', '1.0.0')
    })
```

## 🛠️ 配置验证

### 配置验证脚本
```python
def validate_config():
    """验证配置完整性"""
    required_vars = [
        'SECRET_KEY',
        'MYSQL_HOST',
        'MYSQL_USER',
        'MYSQL_PASSWORD',
        'MYSQL_DATABASE'
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.environ.get(var):
            missing_vars.append(var)
    
    if missing_vars:
        raise ValueError(f"Missing required environment variables: {missing_vars}")
```

## 📚 配置最佳实践

1. **环境分离**: 为不同环境使用不同的配置文件
2. **密钥安全**: 永远不要在代码中硬编码密钥
3. **配置验证**: 启动时验证必需的配置项
4. **默认值**: 为非关键配置提供合理的默认值
5. **文档更新**: 保持配置文档与代码同步

## 🔧 故障排除

### 常见配置问题

1. **数据库连接失败**
   - 检查MySQL服务是否运行
   - 验证连接参数
   - 确认数据库存在

2. **JWT认证失败**
   - 检查JWT_SECRET_KEY设置
   - 验证令牌过期时间

3. **文件上传失败**
   - 检查UPLOAD_FOLDER权限
   - 验证文件大小限制

4. **CORS错误**
   - 检查CORS_ORIGINS配置
   - 确认前端域名在白名单中
