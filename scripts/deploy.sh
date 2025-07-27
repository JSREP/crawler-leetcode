#!/bin/bash

# Next.js 项目部署脚本

set -e

echo "🚀 开始部署 Next.js 项目到 Vercel..."

# 检查必要的工具
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 未安装，请先安装 $1"
        exit 1
    fi
}

echo "📋 检查必要工具..."
check_command "node"
check_command "npm"
check_command "vercel"

# 检查 Node.js 版本
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 版本需要 >= 18，当前版本: $(node --version)"
    exit 1
fi

echo "✅ Node.js 版本检查通过: $(node --version)"

# 安装依赖
echo "📦 安装项目依赖..."
npm install

# 类型检查
echo "🔍 执行 TypeScript 类型检查..."
npm run type-check

# 构建项目
echo "🏗️  构建项目..."
npm run build

# 测试数据库连接
echo "🗄️  测试数据库连接..."
if curl -f -s http://localhost:3000/api/db/test > /dev/null 2>&1; then
    echo "✅ 数据库连接正常"
else
    echo "⚠️  无法连接到数据库，请检查环境变量配置"
fi

# 部署到 Vercel
echo "🚀 部署到 Vercel..."
vercel --prod

echo "🎉 部署完成！"
echo ""
echo "📋 部署后检查清单："
echo "  1. 检查网站是否正常访问"
echo "  2. 测试 API 端点是否工作"
echo "  3. 验证数据库连接"
echo "  4. 检查环境变量配置"
echo ""
echo "🔗 有用的链接："
echo "  - Vercel Dashboard: https://vercel.com/dashboard"
echo "  - 项目 API 测试: https://your-domain.vercel.app/api/db/test"
echo "  - 挑战列表: https://your-domain.vercel.app/challenges"
