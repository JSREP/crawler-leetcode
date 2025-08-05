"""
存储蓝图模块
"""
from flask import Blueprint

# 创建存储蓝图
storage_bp = Blueprint('storage', __name__)

# 导入路由
from . import upload, files, quota
