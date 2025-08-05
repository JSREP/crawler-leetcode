# 🚀 部署指南

## 📋 概述

本文档提供了爬虫LeetCode项目的完整部署指南，包括开发环境和生产环境的部署方式。

## 🛠️ 部署方式

### 1. 本地开发部署

#### 前置要求
- Python 3.11+
- MySQL 8.0+
- Node.js 18+ (前端)
- Git

#### 快速开始
```bash
# 1. 克隆项目
git clone <repository-url>
cd crawler-leetcode

# 2. 后端设置
cd backend
pip install -r requirements.txt
cp .env.example .env
# 编辑 .env 文件配置数据库连接

# 3. 初始化数据库
python quick_init.py

# 4. 创建示例数据
python create_sample_data.py

# 5. 启动后端
python run.py

# 6. 前端设置（新终端）
cd ../frontend
npm install
cp .env.local.example .env.local
# 编辑 .env.local 配置API地址

# 7. 启动前端
npm run dev
```

#### 验证部署
```bash
# 验证后端
curl http://localhost:5000/health
curl http://localhost:5000/api/db/test

# 验证前端
open http://localhost:3000
```

### 2. Docker部署

#### 使用Docker Compose（推荐）
```bash
# 1. 克隆项目
git clone <repository-url>
cd crawler-leetcode

# 2. 配置环境变量
cp docker-compose.yml docker-compose.override.yml
# 编辑 docker-compose.override.yml 修改密钥和域名

# 3. 启动服务
docker-compose up -d

# 4. 初始化数据库
docker-compose exec app python quick_init.py

# 5. 创建示例数据
docker-compose exec app python create_sample_data.py

# 6. 查看日志
docker-compose logs -f app
```

#### 单独构建Docker镜像
```bash
# 构建后端镜像
cd backend
docker build -t crawler-leetcode-backend .

# 运行容器
docker run -d \
  --name crawler-leetcode-app \
  -p 5000:5000 \
  -e MYSQL_HOST=host.docker.internal \
  -e MYSQL_PASSWORD=your_password \
  crawler-leetcode-backend
```

### 3. 生产环境部署

#### 服务器要求
- Ubuntu 20.04+ / CentOS 8+
- 2GB+ RAM
- 20GB+ 存储空间
- 域名和SSL证书

#### 自动部署脚本
```bash
# 1. 上传代码到服务器
git clone <repository-url>
cd crawler-leetcode/backend

# 2. 配置生产环境
cp .env.production.example .env.production
# 编辑 .env.production 设置生产配置

# 3. 运行部署脚本
python scripts/deploy.py --env production

# 4. 配置系统服务
sudo mv /tmp/crawler-leetcode.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable crawler-leetcode
sudo systemctl start crawler-leetcode

# 5. 配置Nginx
sudo mv /tmp/crawler-leetcode-nginx.conf /etc/nginx/sites-available/crawler-leetcode
sudo ln -s /etc/nginx/sites-available/crawler-leetcode /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 手动部署步骤

##### 1. 系统准备
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装依赖
sudo apt install -y python3.11 python3.11-venv python3-pip mysql-server nginx git

# 创建应用用户
sudo useradd -m -s /bin/bash crawler
sudo usermod -aG sudo crawler
```

##### 2. MySQL配置
```bash
# 安全配置
sudo mysql_secure_installation

# 创建数据库和用户
sudo mysql -u root -p
```

```sql
CREATE DATABASE crawler_leetcode CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'crawler_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON crawler_leetcode.* TO 'crawler_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

##### 3. 应用部署
```bash
# 切换到应用用户
sudo su - crawler

# 克隆代码
git clone <repository-url> /home/crawler/crawler-leetcode
cd /home/crawler/crawler-leetcode/backend

# 创建虚拟环境
python3.11 -m venv venv
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.production.example .env.production
# 编辑配置文件

# 初始化数据库
python quick_init.py

# 测试应用
python run.py
```

##### 4. 系统服务配置
```bash
# 创建systemd服务文件
sudo tee /etc/systemd/system/crawler-leetcode.service > /dev/null <<EOF
[Unit]
Description=Crawler LeetCode Flask App
After=network.target mysql.service

[Service]
Type=simple
User=crawler
WorkingDirectory=/home/crawler/crawler-leetcode/backend
Environment=PATH=/home/crawler/crawler-leetcode/backend/venv/bin
Environment=FLASK_ENV=production
ExecStart=/home/crawler/crawler-leetcode/backend/venv/bin/python run.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# 启动服务
sudo systemctl daemon-reload
sudo systemctl enable crawler-leetcode
sudo systemctl start crawler-leetcode
sudo systemctl status crawler-leetcode
```

##### 5. Nginx配置
```bash
# 复制Nginx配置
sudo cp nginx/sites-available/crawler-leetcode /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/crawler-leetcode /etc/nginx/sites-enabled/

# 编辑配置文件，修改域名
sudo nano /etc/nginx/sites-available/crawler-leetcode

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl reload nginx
```

##### 6. SSL证书配置（使用Let's Encrypt）
```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx

# 获取SSL证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 自动续期
sudo crontab -e
# 添加: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 配置管理

### 环境变量配置

#### 开发环境 (.env)
```bash
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=dev-secret-key
MYSQL_PASSWORD=cC11001100
```

#### 生产环境 (.env.production)
```bash
FLASK_ENV=production
FLASK_DEBUG=False
SECRET_KEY=your-secure-production-key
MYSQL_HOST=localhost
MYSQL_USER=crawler_user
MYSQL_PASSWORD=secure_password
MYSQL_DATABASE=crawler_leetcode
```

### 配置验证
```bash
# 验证配置
python scripts/validate_config.py

# 生成安全密钥
python scripts/validate_config.py --generate-keys
```

## 📊 监控和维护

### 健康检查
```bash
# 应用健康检查
curl http://localhost:5000/health

# 服务状态检查
sudo systemctl status crawler-leetcode
sudo systemctl status mysql
sudo systemctl status nginx
```

### 日志管理
```bash
# 应用日志
sudo journalctl -u crawler-leetcode -f

# Nginx日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# MySQL日志
sudo tail -f /var/log/mysql/error.log
```

### 备份策略
```bash
# 数据库备份
python scripts/storage_backup.py create

# 定期备份（添加到crontab）
0 2 * * * cd /home/crawler/crawler-leetcode/backend && python scripts/storage_backup.py create
0 3 * * 0 cd /home/crawler/crawler-leetcode/backend && python scripts/storage_backup.py cleanup 30
```

### 性能监控
```bash
# 运行性能测试
python tests/test_performance.py

# 系统资源监控
htop
df -h
free -h
```

## 🔒 安全配置

### 防火墙设置
```bash
# 配置UFW防火墙
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw deny 3306  # 仅本地访问MySQL
sudo ufw deny 5000  # 仅通过Nginx访问Flask
```

### 安全检查清单
- [ ] 更改默认密码
- [ ] 配置SSL证书
- [ ] 设置防火墙规则
- [ ] 定期更新系统
- [ ] 配置自动备份
- [ ] 监控日志异常
- [ ] 限制文件上传大小
- [ ] 配置CORS白名单

## 🚨 故障排除

### 常见问题

#### 1. 数据库连接失败
```bash
# 检查MySQL服务
sudo systemctl status mysql

# 检查连接配置
python scripts/validate_config.py

# 查看MySQL日志
sudo tail -f /var/log/mysql/error.log
```

#### 2. 应用启动失败
```bash
# 查看应用日志
sudo journalctl -u crawler-leetcode -n 50

# 手动启动测试
cd /home/crawler/crawler-leetcode/backend
source venv/bin/activate
python run.py
```

#### 3. Nginx配置错误
```bash
# 测试Nginx配置
sudo nginx -t

# 查看Nginx日志
sudo tail -f /var/log/nginx/error.log

# 重新加载配置
sudo systemctl reload nginx
```

#### 4. 存储权限问题
```bash
# 检查存储目录权限
ls -la storage/

# 修复权限
sudo chown -R crawler:crawler storage/
chmod -R 755 storage/
```

## 📚 更新和维护

### 应用更新
```bash
# 1. 备份当前版本
python scripts/storage_backup.py create

# 2. 拉取最新代码
git pull origin main

# 3. 更新依赖
pip install -r requirements.txt

# 4. 运行数据库迁移（如有）
python scripts/migrate.py

# 5. 重启服务
sudo systemctl restart crawler-leetcode
```

### 定期维护任务
```bash
# 添加到crontab
crontab -e

# 每日备份
0 2 * * * cd /home/crawler/crawler-leetcode/backend && python scripts/storage_backup.py create

# 每周清理
0 3 * * 0 cd /home/crawler/crawler-leetcode/backend && python scripts/storage_maintenance.py full

# 每月清理旧备份
0 4 1 * * cd /home/crawler/crawler-leetcode/backend && python scripts/storage_backup.py cleanup 30
```
