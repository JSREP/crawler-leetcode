#!/bin/bash

# 爬虫LeetCode项目启动脚本
# 自动启动前端和后端服务，并确保同一时间只有一个实例运行

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
    
    # 杀死端口进程
    kill_port_process 5000 "后端Flask"
    kill_port_process 5173 "前端Vite"
    kill_port_process 3000 "前端备用端口"
    
    # 杀死特定进程
    kill_process_by_name "python.*run.py" "Flask后端"
    kill_process_by_name "vite" "Vite前端"
    kill_process_by_name "npm.*dev" "NPM开发服务器"
    
    log_success "进程清理完成"
}

# 检查Python环境
check_python_env() {
    log_info "检查Python环境..."
    
    if [ ! -d "backend" ]; then
        log_error "backend目录不存在"
        exit 1
    fi
    
    cd backend
    
    # 检查是否有虚拟环境
    if [ -d "venv" ]; then
        log_info "发现虚拟环境，激活中..."
        source venv/bin/activate
    elif [ -d ".venv" ]; then
        log_info "发现虚拟环境，激活中..."
        source .venv/bin/activate
    else
        log_warning "未发现虚拟环境，使用系统Python"
    fi
    
    # 检查依赖
    if [ -f "requirements.txt" ]; then
        log_info "安装Python依赖..."
        $PIP_CMD install -r requirements.txt
    fi
    
    cd ..
    log_success "Python环境检查完成"
}

# 检查Node.js环境
check_node_env() {
    log_info "检查Node.js环境..."
    
    if [ ! -d "frontend" ]; then
        log_error "frontend目录不存在"
        exit 1
    fi
    
    cd frontend
    
    # 检查依赖
    if [ -f "package.json" ]; then
        if [ ! -d "node_modules" ]; then
            log_info "安装Node.js依赖..."
            npm install
        else
            log_info "Node.js依赖已存在，跳过安装"
        fi
    fi
    
    cd ..
    log_success "Node.js环境检查完成"
}

# 启动后端服务
start_backend() {
    log_info "启动后端服务..."
    
    cd backend
    
    # 激活虚拟环境（如果存在）
    if [ -d "venv" ]; then
        source venv/bin/activate
    elif [ -d ".venv" ]; then
        source .venv/bin/activate
    fi
    
    # 启动Flask应用
    log_info "启动Flask应用在端口5000..."
    python run.py &
    BACKEND_PID=$!
    
    cd ..
    
    # 等待后端启动
    sleep 3
    
    # 检查后端是否启动成功
    if curl -s http://localhost:5000 >/dev/null 2>&1; then
        log_success "后端服务启动成功 (PID: $BACKEND_PID)"
    else
        log_warning "后端服务可能未完全启动，请检查日志"
    fi
}

# 启动前端服务
start_frontend() {
    log_info "启动前端服务..."
    
    cd frontend
    
    # 启动Vite开发服务器
    log_info "启动Vite开发服务器..."
    npm run dev &
    FRONTEND_PID=$!
    
    cd ..
    
    # 等待前端启动
    sleep 5
    
    # 检查前端是否启动成功
    if curl -s http://localhost:5173 >/dev/null 2>&1; then
        log_success "前端服务启动成功 (PID: $FRONTEND_PID)"
    else
        log_warning "前端服务可能未完全启动，请检查日志"
    fi
}

# 显示服务状态
show_status() {
    echo ""
    log_info "=== 服务状态 ==="
    echo ""
    
    # 检查后端状态
    if curl -s http://localhost:5000 >/dev/null 2>&1; then
        log_success "后端服务: http://localhost:5000 ✓"
    else
        log_error "后端服务: http://localhost:5000 ✗"
    fi
    
    # 检查前端状态
    if curl -s http://localhost:5173 >/dev/null 2>&1; then
        log_success "前端服务: http://localhost:5173 ✓"
    else
        log_error "前端服务: http://localhost:5173 ✗"
    fi
    
    echo ""
    log_info "如需停止服务，请按 Ctrl+C"
    echo ""
}

# 信号处理函数
cleanup_on_exit() {
    echo ""
    log_info "正在停止服务..."
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    # 清理端口
    kill_port_process 5000 "后端"
    kill_port_process 5173 "前端"
    
    log_success "服务已停止"
    exit 0
}

# 主函数
main() {
    echo ""
    log_info "=== 爬虫LeetCode项目启动脚本 ==="
    echo ""
    
    # 检查必要命令
    check_command "python3"
    # 检查pip或pip3
    if command -v pip3 &> /dev/null; then
        PIP_CMD="pip3"
    elif command -v pip &> /dev/null; then
        PIP_CMD="pip"
    else
        log_error "pip 或 pip3 命令未找到，请先安装 pip"
        exit 1
    fi
    check_command "node"
    check_command "npm"
    check_command "curl"
    check_command "lsof"
    
    # 设置信号处理
    trap cleanup_on_exit SIGINT SIGTERM
    
    # 清理现有进程
    cleanup_processes
    
    # 检查环境
    check_python_env
    check_node_env
    
    # 启动服务
    start_backend
    start_frontend
    
    # 显示状态
    show_status
    
    # 保持脚本运行
    while true; do
        sleep 10
        
        # 检查进程是否还在运行
        if [ ! -z "$BACKEND_PID" ] && ! kill -0 $BACKEND_PID 2>/dev/null; then
            log_error "后端进程已停止"
            break
        fi
        
        if [ ! -z "$FRONTEND_PID" ] && ! kill -0 $FRONTEND_PID 2>/dev/null; then
            log_error "前端进程已停止"
            break
        fi
    done
}

# 运行主函数
main "$@"
