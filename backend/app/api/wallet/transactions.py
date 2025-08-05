"""
钱包交易功能API
"""
from flask import request, jsonify
from sqlalchemy import or_
from app.api import api_bp
from app import db
from app.models import UserWallet, TokenTransaction, User
from app.auth.middleware import require_auth, get_current_user
from app.utils.helpers import paginate_query
from app.utils.validators import validate_pagination_params


@api_bp.route('/wallet/transactions', methods=['GET'])
@require_auth()
def get_wallet_transactions():
    """获取钱包交易记录"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({
                'error': 'Authentication required'
            }), 401
        
        # 获取查询参数
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        transaction_type = request.args.get('type')
        
        # 验证分页参数
        validation_error = validate_pagination_params(page, per_page)
        if validation_error:
            return jsonify({
                'error': validation_error
            }), 400
        
        # 构建查询（获取用户相关的所有交易）
        query = TokenTransaction.query.filter(
            or_(
                TokenTransaction.from_user_id == current_user.id,
                TokenTransaction.to_user_id == current_user.id
            )
        )
        
        if transaction_type:
            query = query.filter(TokenTransaction.transaction_type == transaction_type)
        
        query = query.order_by(TokenTransaction.created_at.desc())
        
        # 分页
        pagination = paginate_query(query, page, per_page)
        
        # 转换为字典
        transactions = [tx.to_dict() for tx in pagination['items']]
        
        return jsonify({
            'transactions': transactions,
            'total': pagination['total'],
            'pages': pagination['pages'],
            'current_page': pagination['current_page'],
            'per_page': pagination['per_page'],
            'has_prev': pagination['has_prev'],
            'has_next': pagination['has_next']
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch transactions',
            'details': str(e)
        }), 500


@api_bp.route('/wallet/transfer', methods=['POST'])
@require_auth()
def transfer_tokens():
    """转账代币"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({
                'error': 'Authentication required'
            }), 401
        
        data = request.get_json()
        if not data:
            return jsonify({
                'error': 'No data provided'
            }), 400
        
        to_user_id = data.get('to_user_id')
        amount_tokens = data.get('amount', 0)
        description = data.get('description', '')
        
        # 验证参数
        if not to_user_id:
            return jsonify({
                'error': 'Recipient user ID is required'
            }), 400
        
        if amount_tokens <= 0:
            return jsonify({
                'error': 'Amount must be positive'
            }), 400
        
        if amount_tokens > 1000:  # 限制单次转账金额
            return jsonify({
                'error': 'Amount too large (max 1000 tokens)'
            }), 400
        
        # 验证接收用户是否存在
        to_user = User.query.get(to_user_id)
        if not to_user:
            return jsonify({
                'error': 'Recipient user not found'
            }), 404
        
        if to_user_id == current_user.id:
            return jsonify({
                'error': 'Cannot transfer to yourself'
            }), 400
        
        # 获取发送方钱包
        from_wallet = UserWallet.query.filter_by(user_id=current_user.id).first()
        if not from_wallet:
            return jsonify({
                'error': 'Sender wallet not found'
            }), 404
        
        # 获取接收方钱包
        to_wallet = UserWallet.query.filter_by(user_id=to_user_id).first()
        if not to_wallet:
            return jsonify({
                'error': 'Recipient wallet not found'
            }), 404
        
        amount_wei = int(amount_tokens * 1000000)  # 转换为wei
        
        # 检查余额
        if from_wallet.crawler_coin_balance < amount_wei:
            return jsonify({
                'error': 'Insufficient balance'
            }), 400
        
        # 执行转账
        from_wallet.crawler_coin_balance -= amount_wei
        to_wallet.crawler_coin_balance += amount_wei
        
        # 记录交易
        transaction = TokenTransaction(
            from_user_id=current_user.id,
            to_user_id=to_user_id,
            transaction_type='transfer',
            amount=amount_wei,
            status='confirmed',
            description=description or f'Transfer to {to_user.username}'
        )
        
        db.session.add(transaction)
        db.session.commit()
        
        return jsonify({
            'message': 'Transfer completed successfully',
            'transaction': transaction.to_dict(),
            'new_balance': from_wallet.balance_in_tokens
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Transfer failed',
            'details': str(e)
        }), 500
