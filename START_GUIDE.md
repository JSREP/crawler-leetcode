# 项目启动指南

## 概述

`start.sh` 是一个自动化启动脚本，用于同时启动爬虫LeetCode项目的前端和后端服务。该脚本具有以下特性：

- 🔄 **自动进程管理**: 自动检测并杀死已存在的服务实例
- 🚀 **一键启动**: 同时启动前端和后端服务
- 📦 **依赖管理**: 自动检查和安装项目依赖
- 🔍 **状态监控**: 实时监控服务状态
- 🎨 **彩色日志**: 清晰的彩色日志输出
- ⚡ **错误处理**: 完善的错误处理和恢复机制

## 快速开始

### 1. 运行测试脚本（推荐）

首次使用前，建议运行测试脚本检查环境：

```bash
./test_start.sh
```

### 2. 启动项目

```bash
./start.sh
```

### 3. 访问服务

启动成功后，可以通过以下地址访问：

- **前端服务**: http://localhost:5173
- **后端API**: http://localhost:5000

## 脚本功能详解

### 进程管理

脚本会自动检测并清理以下进程：

- 占用端口5000的Flask后端进程
- 占用端口5173的Vite前端进程
- 占用端口3000的备用前端进程
- 所有相关的Python和Node.js进程

### 环境检查

脚本会自动检查以下环境：

#### Python环境
- 检测虚拟环境（`venv` 或 `.venv`）
- 自动激活虚拟环境
- 安装 `requirements.txt` 中的依赖

#### Node.js环境
- 检查 `node_modules` 目录
- 自动运行 `npm install`（如果需要）

### 服务启动

#### 后端服务
- 启动Flask应用（`backend/run.py`）
- 运行在端口5000
- 支持虚拟环境

#### 前端服务
- 启动Vite开发服务器
- 运行在端口5173
- 支持热重载

## 系统要求

### 必需软件

- **Python 3.x**: 用于运行后端Flask应用
- **pip/pip3**: Python包管理器
- **Node.js**: 用于运行前端应用
- **npm**: Node.js包管理器
- **curl**: 用于健康检查
- **lsof**: 用于端口检查

### 操作系统

- macOS
- Linux
- Windows (WSL)

## 使用说明

### 启动服务

```bash
# 直接启动
./start.sh

# 如果权限不足
chmod +x start.sh
./start.sh
```

### 停止服务

按 `Ctrl+C` 停止所有服务，脚本会自动清理进程。

### 查看日志

脚本提供彩色日志输出：

- 🔵 **[INFO]**: 一般信息
- 🟢 **[SUCCESS]**: 成功操作
- 🟡 **[WARNING]**: 警告信息
- 🔴 **[ERROR]**: 错误信息

## 故障排除

### 常见问题

#### 1. 端口被占用

```
[WARNING] 发现端口 5000 上运行的进程: 12345
```

**解决方案**: 脚本会自动杀死占用端口的进程，无需手动处理。

#### 2. 依赖安装失败

```
[ERROR] pip 或 pip3 命令未找到
```

**解决方案**: 
- macOS: `brew install python`
- Ubuntu: `sudo apt install python3-pip`
- CentOS: `sudo yum install python3-pip`

#### 3. Node.js依赖问题

```
[ERROR] npm 命令未找到
```

**解决方案**:
- 安装Node.js: https://nodejs.org/
- 或使用包管理器: `brew install node` (macOS)

#### 4. 虚拟环境问题

如果Python虚拟环境有问题，可以重新创建：

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 手动启动

如果自动脚本有问题，可以手动启动：

#### 启动后端

```bash
cd backend
# 激活虚拟环境（如果有）
source venv/bin/activate
# 安装依赖
pip install -r requirements.txt
# 启动服务
python run.py
```

#### 启动前端

```bash
cd frontend
# 安装依赖
npm install
# 启动服务
npm run dev
```

## 高级配置

### 自定义端口

如需修改端口，请编辑以下文件：

- **后端端口**: `backend/run.py` 中的 `port=5000`
- **前端端口**: `frontend/vite.config.ts` 中的服务器配置

### 环境变量

可以通过环境变量配置：

```bash
# 设置Flask环境
export FLASK_CONFIG=development

# 设置数据库URL
export DEV_DATABASE_URL=sqlite:///dev.db
```

## 贡献

如果发现问题或有改进建议，请：

1. 提交Issue
2. 创建Pull Request
3. 联系项目维护者

## 许可证

MIT License
