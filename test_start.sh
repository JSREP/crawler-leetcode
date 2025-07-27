#!/bin/bash

# 测试start.sh脚本的基本功能

echo "=== 测试start.sh脚本 ==="

# 测试1: 检查脚本语法
echo "1. 检查脚本语法..."
if bash -n start.sh; then
    echo "✓ 语法检查通过"
else
    echo "✗ 语法检查失败"
    exit 1
fi

# 测试2: 检查脚本权限
echo "2. 检查脚本权限..."
if [ -x start.sh ]; then
    echo "✓ 脚本有执行权限"
else
    echo "✗ 脚本没有执行权限"
    exit 1
fi

# 测试3: 检查项目结构
echo "3. 检查项目结构..."
if [ -d "frontend" ] && [ -d "backend" ]; then
    echo "✓ 项目结构正确"
else
    echo "✗ 项目结构不正确"
    exit 1
fi

# 测试4: 检查配置文件
echo "4. 检查配置文件..."
if [ -f "frontend/package.json" ] && [ -f "backend/requirements.txt" ]; then
    echo "✓ 配置文件存在"
else
    echo "✗ 配置文件缺失"
    exit 1
fi

# 测试5: 检查必要命令
echo "5. 检查必要命令..."
missing_commands=()

if ! command -v python3 &> /dev/null; then
    missing_commands+=("python3")
fi

if ! command -v pip3 &> /dev/null && ! command -v pip &> /dev/null; then
    missing_commands+=("pip/pip3")
fi

if ! command -v node &> /dev/null; then
    missing_commands+=("node")
fi

if ! command -v npm &> /dev/null; then
    missing_commands+=("npm")
fi

if ! command -v curl &> /dev/null; then
    missing_commands+=("curl")
fi

if ! command -v lsof &> /dev/null; then
    missing_commands+=("lsof")
fi

if [ ${#missing_commands[@]} -eq 0 ]; then
    echo "✓ 所有必要命令都可用"
else
    echo "✗ 缺少命令: ${missing_commands[*]}"
    echo "  请安装缺少的命令后再运行脚本"
fi

echo ""
echo "=== 测试完成 ==="
echo ""
echo "如果所有测试都通过，可以运行以下命令启动项目："
echo "./start.sh"
echo ""
echo "注意: 首次运行可能需要安装依赖，请耐心等待"
