"""
API蓝图模块
"""
from flask import Blueprint

# 创建API蓝图
api_bp = Blueprint('api', __name__)

# 导入路由
from . import challenges, database, stats, comments, forum, wallet
