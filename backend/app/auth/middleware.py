"""
认证中间件
"""
from functools import wraps
from flask import request, jsonify, g
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, get_jwt
from app.models import User, UserSession


def require_auth(optional=False):
    """认证装饰器"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                verify_jwt_in_request(optional=optional)
                
                if not optional:
                    user_id = get_jwt_identity()
                    if user_id:
                        user = User.query.get(user_id)
                        if user:
                            g.current_user = user
                        else:
                            return jsonify({
                                'error': 'User not found'
                            }), 404
                
                return f(*args, **kwargs)
                
            except Exception as e:
                if not optional:
                    return jsonify({
                        'error': 'Authentication required',
                        'details': str(e)
                    }), 401
                else:
                    g.current_user = None
                    return f(*args, **kwargs)
        
        return decorated_function
    return decorator


def require_admin(f):
    """管理员权限装饰器"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            
            if not user_id:
                return jsonify({
                    'error': 'Authentication required'
                }), 401
            
            user = User.query.get(user_id)
            if not user:
                return jsonify({
                    'error': 'User not found'
                }), 404
            
            if not user.is_admin():
                return jsonify({
                    'error': 'Admin privileges required'
                }), 403
            
            g.current_user = user
            return f(*args, **kwargs)
            
        except Exception as e:
            return jsonify({
                'error': 'Authentication failed',
                'details': str(e)
            }), 401
    
    return decorated_function


def require_session(f):
    """会话验证装饰器"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            # 首先验证JWT
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            
            if not user_id:
                return jsonify({
                    'error': 'Authentication required'
                }), 401
            
            # 检查会话令牌
            session_token = request.headers.get('X-Session-Token')
            if not session_token:
                # 从请求体中获取
                data = request.get_json() or {}
                session_token = data.get('session_token')
            
            if session_token:
                session = UserSession.query.filter_by(
                    user_id=user_id,
                    session_token=session_token
                ).first()
                
                if not session:
                    return jsonify({
                        'error': 'Invalid session'
                    }), 401
                
                if session.is_expired():
                    return jsonify({
                        'error': 'Session expired'
                    }), 401
                
                g.current_session = session
            
            user = User.query.get(user_id)
            if not user:
                return jsonify({
                    'error': 'User not found'
                }), 404
            
            g.current_user = user
            return f(*args, **kwargs)
            
        except Exception as e:
            return jsonify({
                'error': 'Session validation failed',
                'details': str(e)
            }), 401
    
    return decorated_function


def get_current_user():
    """获取当前用户"""
    return getattr(g, 'current_user', None)


def get_current_session():
    """获取当前会话"""
    return getattr(g, 'current_session', None)


def is_authenticated():
    """检查是否已认证"""
    return get_current_user() is not None


def is_admin():
    """检查是否为管理员"""
    user = get_current_user()
    return user and user.is_admin()


class AuthMiddleware:
    """认证中间件类"""
    
    def __init__(self, app=None):
        self.app = app
        if app is not None:
            self.init_app(app)
    
    def init_app(self, app):
        """初始化应用"""
        app.before_request(self.before_request)
        app.after_request(self.after_request)
    
    def before_request(self):
        """请求前处理"""
        # 清理过期会话
        self.cleanup_expired_sessions()
        
        # 设置CORS头
        if request.method == 'OPTIONS':
            return self.handle_preflight()
    
    def after_request(self, response):
        """请求后处理"""
        # 设置CORS头
        origin = request.headers.get('Origin')
        if origin:
            response.headers['Access-Control-Allow-Origin'] = origin
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Session-Token'
        
        return response
    
    def handle_preflight(self):
        """处理预检请求"""
        response = jsonify({'status': 'ok'})
        origin = request.headers.get('Origin')
        if origin:
            response.headers['Access-Control-Allow-Origin'] = origin
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Session-Token'
        return response
    
    def cleanup_expired_sessions(self):
        """清理过期会话"""
        try:
            from datetime import datetime
            from app import db
            
            expired_sessions = UserSession.query.filter(
                UserSession.expires_at < datetime.utcnow()
            ).all()
            
            for session in expired_sessions:
                db.session.delete(session)
            
            if expired_sessions:
                db.session.commit()
                
        except Exception as e:
            # 静默处理清理错误
            pass
