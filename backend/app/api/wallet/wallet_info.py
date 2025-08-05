"""
钱包信息管理API
"""
from flask import request, jsonify
from app.api import api_bp
from app import db
from app.models import UserWallet, TokenTransaction
from app.auth.middleware import require_auth, get_current_user
from app.utils.helpers import generate_random_string


@api_bp.route('/wallet/info', methods=['GET'])
@require_auth()
def get_wallet_info():
    """获取钱包信息"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({
                'error': 'Authentication required'
            }), 401
        
        wallet = UserWallet.query.filter_by(user_id=current_user.id).first()
        
        if not wallet:
            return jsonify({
                'error': 'Wallet not found',
                'message': 'Please create a wallet first'
            }), 404
        
        return jsonify({
            'wallet': wallet.to_dict()
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch wallet info',
            'details': str(e)
        }), 500


@api_bp.route('/wallet/create', methods=['POST'])
@require_auth()
def create_wallet():
    """创建钱包"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({
                'error': 'Authentication required'
            }), 401
        
        # 检查是否已有钱包
        existing_wallet = UserWallet.query.filter_by(user_id=current_user.id).first()
        if existing_wallet:
            return jsonify({
                'error': 'Wallet already exists'
            }), 409
        
        # 生成钱包地址和私钥（简化版）
        wallet_address = '0x' + generate_random_string(40)
        private_key_encrypted = generate_random_string(64)  # 实际应用中需要真正的加密
        
        # 创建钱包
        wallet = UserWallet(
            user_id=current_user.id,
            wallet_address=wallet_address,
            private_key_encrypted=private_key_encrypted,
            crawler_coin_balance=1000000  # 初始余额 1 CRAWLER
        )
        
        db.session.add(wallet)
        
        # 记录初始赠送交易
        initial_transaction = TokenTransaction(
            from_user_id=None,  # 系统赠送
            to_user_id=current_user.id,
            transaction_type='initial_grant',
            amount=1000000,
            status='confirmed',
            description='Initial wallet creation grant'
        )
        
        db.session.add(initial_transaction)
        db.session.commit()
        
        return jsonify({
            'message': 'Wallet created successfully',
            'wallet': wallet.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Failed to create wallet',
            'details': str(e)
        }), 500
