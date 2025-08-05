"""
装饰器工具函数
"""
from functools import wraps
from flask import request, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.models import User


def require_auth(f):
    """需要认证的装饰器"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request()
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({
                'error': 'Authentication required',
                'details': str(e)
            }), 401
    return decorated_function


def require_admin(f):
    """需要管理员权限的装饰器"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            
            if not user or not user.is_admin():
                return jsonify({
                    'error': 'Admin privileges required'
                }), 403
            
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({
                'error': 'Authentication required',
                'details': str(e)
            }), 401
    return decorated_function


def validate_json(f):
    """验证JSON数据的装饰器"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not request.is_json:
            return jsonify({
                'error': 'Content-Type must be application/json'
            }), 400
        
        data = request.get_json()
        if data is None:
            return jsonify({
                'error': 'Invalid JSON data'
            }), 400
        
        return f(*args, **kwargs)
    return decorated_function


def handle_db_errors(f):
    """处理数据库错误的装饰器"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            from app import db
            db.session.rollback()
            return jsonify({
                'error': 'Database operation failed',
                'details': str(e)
            }), 500
    return decorated_function
