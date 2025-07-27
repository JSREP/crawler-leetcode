from flask import Blueprint

api_bp = Blueprint('api', __name__)

from . import challenges  # 导入路由模块
from . import db_challenges  # 导入数据库路由模块