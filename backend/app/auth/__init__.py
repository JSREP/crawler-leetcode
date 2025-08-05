"""
认证蓝图模块
"""
from flask import Blueprint

# 创建认证蓝图
auth_bp = Blueprint('auth', __name__)

# 导入路由
from . import github, jwt_auth
