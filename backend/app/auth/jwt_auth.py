"""
JWT认证相关路由
"""
from datetime import datetime, timedelta
from flask import request, jsonify
from flask_jwt_extended import (
    jwt_required, get_jwt_identity, create_access_token, 
    create_refresh_token, get_jwt
)
from app.auth import auth_bp
from app import db
from app.models import User, UserSession


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh_token():
    """刷新访问令牌"""
    try:
        current_user_id = get_jwt_identity()
        
        # 验证用户是否存在
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({
                'error': 'User not found'
            }), 404
        
        # 创建新的访问令牌
        new_access_token = create_access_token(identity=current_user_id)
        
        return jsonify({
            'access_token': new_access_token,
            'expires_in': 86400  # 24小时
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Token refresh failed',
            'details': str(e)
        }), 500


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """用户登出"""
    try:
        current_user_id = get_jwt_identity()
        
        # 获取会话令牌（如果提供）
        data = request.get_json() or {}
        session_token = data.get('session_token')
        
        if session_token:
            # 删除特定会话
            session = UserSession.query.filter_by(
                user_id=current_user_id,
                session_token=session_token
            ).first()
            
            if session:
                db.session.delete(session)
        else:
            # 删除用户的所有会话
            UserSession.query.filter_by(user_id=current_user_id).delete()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Logged out successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Logout failed',
            'details': str(e)
        }), 500


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """获取当前用户信息"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({
                'error': 'User not found'
            }), 404
        
        return jsonify({
            'user': user.to_dict()
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch user info',
            'details': str(e)
        }), 500


@auth_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_current_user():
    """更新当前用户信息"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({
                'error': 'User not found'
            }), 404
        
        data = request.get_json()
        if not data:
            return jsonify({
                'error': 'No data provided'
            }), 400
        
        # 允许更新的字段
        updatable_fields = ['name', 'bio', 'location', 'company', 'blog']
        
        for field in updatable_fields:
            if field in data:
                setattr(user, field, data[field])
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'User updated successfully',
            'user': user.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Failed to update user',
            'details': str(e)
        }), 500


@auth_bp.route('/sessions', methods=['GET'])
@jwt_required()
def get_user_sessions():
    """获取用户会话列表"""
    try:
        current_user_id = get_jwt_identity()
        
        sessions = UserSession.query.filter_by(user_id=current_user_id).all()
        
        # 清理过期会话
        current_time = datetime.utcnow()
        expired_sessions = [s for s in sessions if s.expires_at < current_time]
        
        for session in expired_sessions:
            db.session.delete(session)
        
        if expired_sessions:
            db.session.commit()
            # 重新查询有效会话
            sessions = UserSession.query.filter_by(user_id=current_user_id).all()
        
        return jsonify({
            'sessions': [session.to_dict() for session in sessions]
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch sessions',
            'details': str(e)
        }), 500


@auth_bp.route('/sessions/<int:session_id>', methods=['DELETE'])
@jwt_required()
def delete_session(session_id):
    """删除指定会话"""
    try:
        current_user_id = get_jwt_identity()
        
        session = UserSession.query.filter_by(
            id=session_id,
            user_id=current_user_id
        ).first()
        
        if not session:
            return jsonify({
                'error': 'Session not found'
            }), 404
        
        db.session.delete(session)
        db.session.commit()
        
        return jsonify({
            'message': 'Session deleted successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Failed to delete session',
            'details': str(e)
        }), 500


@auth_bp.route('/verify', methods=['POST'])
@jwt_required()
def verify_token():
    """验证令牌有效性"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({
                'valid': False,
                'error': 'User not found'
            }), 404
        
        # 获取JWT声明
        claims = get_jwt()
        
        return jsonify({
            'valid': True,
            'user_id': current_user_id,
            'username': user.username,
            'role': user.role,
            'expires_at': claims.get('exp'),
            'issued_at': claims.get('iat')
        })
        
    except Exception as e:
        return jsonify({
            'valid': False,
            'error': str(e)
        }), 401


# JWT错误处理器
@auth_bp.errorhandler(401)
def handle_unauthorized(error):
    """处理未授权错误"""
    return jsonify({
        'error': 'Unauthorized',
        'message': 'Valid authentication token required'
    }), 401


@auth_bp.errorhandler(403)
def handle_forbidden(error):
    """处理禁止访问错误"""
    return jsonify({
        'error': 'Forbidden',
        'message': 'Insufficient permissions'
    }), 403
