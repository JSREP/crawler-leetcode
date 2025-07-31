#!/bin/bash

# Next.js 爬虫LeetCode项目启动脚本
# 自动启动Next.js全栈应用，并确保同一时间只有一个实例运行

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 命令未找到，请先安装 $1"
        exit 1
    fi
}

# 杀死指定端口的进程
kill_port_process() {
    local port=$1
    local service_name=$2

    log_info "检查端口 $port 上的 $service_name 进程..."

    # 查找占用端口的进程
    local pids=$(lsof -ti:$port 2>/dev/null || true)

    if [ -n "$pids" ]; then
        log_warning "发现端口 $port 上运行的进程: $pids"
        for pid in $pids; do
            log_info "正在杀死进程 $pid..."
            kill -9 $pid 2>/dev/null || true
        done
        sleep 2
        log_success "已清理端口 $port 上的进程"
    else
        log_info "端口 $port 没有运行的进程"
    fi
}

# 杀死特定名称的进程
kill_process_by_name() {
    local process_pattern=$1
    local service_name=$2

    log_info "检查 $service_name 相关进程..."

    # 查找匹配的进程，排除当前脚本
    local pids=$(pgrep -f "$process_pattern" 2>/dev/null | grep -v $$ || true)

    if [ -n "$pids" ]; then
        log_warning "发现 $service_name 进程: $pids"
        for pid in $pids; do
            log_info "正在杀死 $service_name 进程 $pid..."
            kill -9 $pid 2>/dev/null || true
        done
        sleep 2
        log_success "已清理 $service_name 进程"
    else
        log_info "没有发现 $service_name 进程"
    fi
}

# 清理所有相关进程
cleanup_processes() {
    log_info "开始清理现有进程..."

    # 杀死Next.js端口进程
    kill_port_process 61395 "Next.js应用"

    # 杀死特定进程
    kill_process_by_name "next.*dev" "Next.js开发服务器"
    kill_process_by_name "npm.*dev" "NPM开发服务器"
    kill_process_by_name "node.*next" "Next.js进程"

    log_success "进程清理完成"
}

# 检查Node.js环境
check_node_env() {
    log_info "检查Node.js环境..."

    # 检查package.json是否存在
    if [ ! -f "package.json" ]; then
        log_error "package.json文件不存在，这不是一个有效的Node.js项目"
        exit 1
    fi

    # 检查依赖
    if [ ! -d "node_modules" ]; then
        log_info "安装Node.js依赖..."
        npm install
    else
        log_info "Node.js依赖已存在，跳过安装"
    fi

    log_success "Node.js环境检查完成"
}



# 启动Next.js应用
start_nextjs() {
    log_info "启动Next.js应用..."

    # 启动Next.js开发服务器
    log_info "启动Next.js开发服务器在端口61395..."
    npm run dev &
    NEXTJS_PID=$!

    # 等待Next.js启动
    sleep 5

    # 检查Next.js是否启动成功
    if curl -s http://localhost:61395 >/dev/null 2>&1; then
        log_success "Next.js应用启动成功 (PID: $NEXTJS_PID)"
    else
        log_warning "Next.js应用可能未完全启动，请检查日志"
    fi
}



# 显示服务状态
show_status() {
    echo ""
    log_info "=== 服务状态 ==="
    echo ""

    # 检查Next.js应用状态
    if curl -s http://localhost:61395 >/dev/null 2>&1; then
        log_success "Next.js应用: http://localhost:61395 ✓"
    else
        log_error "Next.js应用: http://localhost:61395 ✗"
    fi

    echo ""
    log_info "如需停止服务，请按 Ctrl+C"
    echo ""
}

# 信号处理函数
cleanup_on_exit() {
    echo ""
    log_info "正在停止服务..."

    if [ ! -z "$NEXTJS_PID" ]; then
        kill $NEXTJS_PID 2>/dev/null || true
    fi

    # 清理端口
    kill_port_process 61395 "Next.js应用"

    log_success "服务已停止"
    exit 0
}

# 主函数
main() {
    echo ""
    log_info "=== Next.js 爬虫LeetCode项目启动脚本 ==="
    echo ""

    # 检查必要命令
    check_command "node"
    check_command "npm"
    check_command "curl"
    check_command "lsof"

    # 设置信号处理
    trap cleanup_on_exit SIGINT SIGTERM

    # 清理现有进程
    cleanup_processes

    # 检查环境
    check_node_env

    # 启动服务
    start_nextjs

    # 显示状态
    show_status

    # 保持脚本运行
    while true; do
        sleep 10

        # 检查进程是否还在运行
        if [ ! -z "$NEXTJS_PID" ] && ! kill -0 $NEXTJS_PID 2>/dev/null; then
            log_error "Next.js进程已停止"
            break
        fi
    done
}

# 运行主函数
main "$@"
