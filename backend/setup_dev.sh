#!/bin/bash

# Flask后端开发环境设置脚本

echo "🚀 设置Flask后端开发环境..."

# 检查Python版本
python_version=$(python3 --version 2>&1 | grep -o '[0-9]\+\.[0-9]\+')
if [[ $(echo "$python_version >= 3.8" | bc -l) -eq 0 ]]; then
    echo "❌ 需要Python 3.8或更高版本，当前版本: $python_version"
    exit 1
fi

echo "✅ Python版本检查通过: $python_version"

# 创建虚拟环境
if [ ! -d "venv" ]; then
    echo "📦 创建虚拟环境..."
    python3 -m venv venv
else
    echo "✅ 虚拟环境已存在"
fi

# 激活虚拟环境
echo "🔧 激活虚拟环境..."
source venv/bin/activate

# 升级pip
echo "⬆️ 升级pip..."
pip install --upgrade pip

# 安装依赖
echo "📚 安装Python依赖..."
pip install -r requirements.txt

# 复制环境变量文件
if [ ! -f ".env" ]; then
    echo "📝 创建环境变量文件..."
    cp .env.example .env
    echo "⚠️ 请编辑 .env 文件配置数据库连接信息"
else
    echo "✅ 环境变量文件已存在"
fi

# 创建存储目录
echo "📁 创建存储目录..."
mkdir -p storage/uploads
mkdir -p storage/avatars
mkdir -p storage/challenges

echo "✅ Flask后端开发环境设置完成！"
echo ""
echo "下一步："
echo "1. 编辑 .env 文件配置数据库连接"
echo "2. 创建MySQL数据库: CREATE DATABASE crawler_leetcode CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
echo "3. 运行数据库迁移: flask db upgrade"
echo "4. 启动开发服务器: python run.py"
echo ""
echo "开发服务器将在 http://localhost:5000 启动"
