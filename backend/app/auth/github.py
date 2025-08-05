"""
GitHub OAuth认证路由
"""
import os
import requests
from datetime import datetime, timedelta
from flask import request, jsonify, current_app, redirect, url_for
from flask_jwt_extended import create_access_token, create_refresh_token
from app.auth import auth_bp
from app import db
from app.models import User, UserSession, UserStorageQuota, UserWallet
from app.utils.helpers import generate_random_string
import secrets
import hashlib


@auth_bp.route('/github', methods=['POST'])
def github_oauth():
    """GitHub OAuth登录处理"""
    try:
        data = request.get_json()
        
        if not data or 'code' not in data:
            return jsonify({
                'error': 'Authorization code is required'
            }), 400
        
        # 交换访问令牌
        token_response = exchange_code_for_token(data['code'])
        if not token_response:
            return jsonify({
                'error': 'Failed to exchange code for token'
            }), 400
        
        access_token = token_response['access_token']
        
        # 获取用户信息
        user_info = get_github_user_info(access_token)
        if not user_info:
            return jsonify({
                'error': 'Failed to fetch user information'
            }), 400
        
        # 查找或创建用户
        user = find_or_create_user(user_info)
        if not user:
            return jsonify({
                'error': 'Failed to create user'
            }), 500
        
        # 更新最后登录时间
        user.last_login_at = datetime.utcnow()
        db.session.commit()
        
        # 创建JWT令牌
        access_token_jwt = create_access_token(identity=user.id)
        refresh_token_jwt = create_refresh_token(identity=user.id)
        
        # 创建会话记录
        session_token = generate_random_string(64)
        expires_at = datetime.utcnow() + timedelta(days=7)
        
        user_session = UserSession(
            user_id=user.id,
            session_token=session_token,
            expires_at=expires_at
        )
        db.session.add(user_session)
        db.session.commit()
        
        return jsonify({
            'access_token': access_token_jwt,
            'refresh_token': refresh_token_jwt,
            'session_token': session_token,
            'user': user.to_dict(),
            'expires_in': 86400  # 24小时
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Authentication failed',
            'details': str(e)
        }), 500


@auth_bp.route('/github/url', methods=['GET'])
def get_github_auth_url():
    """获取GitHub OAuth授权URL"""
    try:
        client_id = current_app.config['GITHUB_CLIENT_ID']
        redirect_uri = current_app.config['GITHUB_REDIRECT_URI']
        
        if not client_id:
            return jsonify({
                'error': 'GitHub OAuth not configured'
            }), 500
        
        # 生成state参数防止CSRF攻击
        state = generate_random_string(32)
        
        auth_url = (
            f"https://github.com/login/oauth/authorize"
            f"?client_id={client_id}"
            f"&redirect_uri={redirect_uri}"
            f"&scope=user:email"
            f"&state={state}"
        )
        
        return jsonify({
            'auth_url': auth_url,
            'state': state
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to generate auth URL',
            'details': str(e)
        }), 500


def exchange_code_for_token(code):
    """交换授权码获取访问令牌"""
    try:
        client_id = current_app.config['GITHUB_CLIENT_ID']
        client_secret = current_app.config['GITHUB_CLIENT_SECRET']
        
        if not client_id or not client_secret:
            return None
        
        response = requests.post(
            'https://github.com/login/oauth/access_token',
            data={
                'client_id': client_id,
                'client_secret': client_secret,
                'code': code
            },
            headers={
                'Accept': 'application/json'
            }
        )
        
        if response.status_code == 200:
            return response.json()
        
        return None
        
    except Exception as e:
        print(f"Token exchange error: {e}")
        return None


def get_github_user_info(access_token):
    """获取GitHub用户信息"""
    try:
        response = requests.get(
            'https://api.github.com/user',
            headers={
                'Authorization': f'token {access_token}',
                'Accept': 'application/vnd.github.v3+json'
            }
        )
        
        if response.status_code == 200:
            return response.json()
        
        return None
        
    except Exception as e:
        print(f"User info fetch error: {e}")
        return None


def find_or_create_user(github_user):
    """查找或创建用户"""
    try:
        # 查找现有用户
        user = User.query.filter_by(github_id=github_user['id']).first()
        
        if user:
            # 更新用户信息
            user.username = github_user['login']
            user.email = github_user.get('email')
            user.name = github_user.get('name')
            user.avatar_url = github_user.get('avatar_url')
            user.bio = github_user.get('bio')
            user.location = github_user.get('location')
            user.company = github_user.get('company')
            user.blog = github_user.get('blog')
            user.public_repos = github_user.get('public_repos', 0)
            user.followers = github_user.get('followers', 0)
            user.following = github_user.get('following', 0)
            user.updated_at = datetime.utcnow()
        else:
            # 创建新用户
            user = User(
                github_id=github_user['id'],
                username=github_user['login'],
                email=github_user.get('email'),
                name=github_user.get('name'),
                avatar_url=github_user.get('avatar_url'),
                bio=github_user.get('bio'),
                location=github_user.get('location'),
                company=github_user.get('company'),
                blog=github_user.get('blog'),
                public_repos=github_user.get('public_repos', 0),
                followers=github_user.get('followers', 0),
                following=github_user.get('following', 0),
                role='user'
            )
            db.session.add(user)
            db.session.flush()  # 获取用户ID
            
            # 创建存储配额记录
            storage_quota = UserStorageQuota(
                user_id=user.id,
                total_quota=104857600,  # 100MB
                used_quota=0,
                purchased_quota=0
            )
            db.session.add(storage_quota)
            
            # 创建钱包（如果需要）
            if current_app.config.get('ENABLE_WALLET', False):
                wallet_address = generate_wallet_address()
                private_key_encrypted = encrypt_private_key(generate_private_key())
                
                wallet = UserWallet(
                    user_id=user.id,
                    wallet_address=wallet_address,
                    private_key_encrypted=private_key_encrypted,
                    crawler_coin_balance=1000000  # 初始余额
                )
                db.session.add(wallet)
        
        db.session.commit()
        return user
        
    except Exception as e:
        db.session.rollback()
        print(f"User creation error: {e}")
        return None


def generate_wallet_address():
    """生成钱包地址（简化版）"""
    random_bytes = secrets.token_bytes(20)
    return '0x' + random_bytes.hex()


def generate_private_key():
    """生成私钥（简化版）"""
    return secrets.token_hex(32)


def encrypt_private_key(private_key):
    """加密私钥（简化版）"""
    # 在实际应用中应该使用更安全的加密方法
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac('sha256', private_key.encode(), salt.encode(), 100000)
    return salt + key.hex()
