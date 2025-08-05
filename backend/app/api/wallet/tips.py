"""
打赏功能API
"""
from flask import request, jsonify
from app.api import api_bp
from app import db
from app.models import UserWallet, TokenTransaction, TipRecord, User
from app.auth.middleware import require_auth, get_current_user
from app.utils.helpers import paginate_query
from app.utils.validators import validate_pagination_params


@api_bp.route('/wallet/tip', methods=['POST'])
@require_auth()
def tip_user():
    """打赏用户"""
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
        target_type = data.get('target_type')  # post, reply, comment
        target_id = data.get('target_id')
        amount_tokens = data.get('amount', 0)
        message = data.get('message', '')
        is_anonymous = data.get('is_anonymous', False)
        
        # 验证参数
        if not all([to_user_id, target_type, target_id]):
            return jsonify({
                'error': 'Missing required parameters'
            }), 400
        
        if target_type not in ['post', 'reply', 'comment']:
            return jsonify({
                'error': 'Invalid target type'
            }), 400
        
        if amount_tokens <= 0:
            return jsonify({
                'error': 'Tip amount must be positive'
            }), 400
        
        if amount_tokens > 100:  # 限制单次打赏金额
            return jsonify({
                'error': 'Tip amount too large (max 100 tokens)'
            }), 400
        
        # 验证接收用户是否存在
        to_user = User.query.get(to_user_id)
        if not to_user:
            return jsonify({
                'error': 'Recipient user not found'
            }), 404
        
        if to_user_id == current_user.id:
            return jsonify({
                'error': 'Cannot tip yourself'
            }), 400
        
        # 获取钱包
        from_wallet = UserWallet.query.filter_by(user_id=current_user.id).first()
        to_wallet = UserWallet.query.filter_by(user_id=to_user_id).first()
        
        if not from_wallet or not to_wallet:
            return jsonify({
                'error': 'Wallet not found'
            }), 404
        
        amount_wei = int(amount_tokens * 1000000)  # 转换为wei
        
        # 检查余额
        if from_wallet.crawler_coin_balance < amount_wei:
            return jsonify({
                'error': 'Insufficient balance'
            }), 400
        
        # 执行打赏
        from_wallet.crawler_coin_balance -= amount_wei
        to_wallet.crawler_coin_balance += amount_wei
        
        # 记录交易
        transaction = TokenTransaction(
            from_user_id=current_user.id,
            to_user_id=to_user_id,
            transaction_type='tip',
            amount=amount_wei,
            related_id=target_id,
            related_type=target_type,
            status='confirmed',
            description=f'Tip for {target_type} #{target_id}'
        )
        
        db.session.add(transaction)
        db.session.flush()  # 获取交易ID
        
        # 记录打赏记录
        tip_record = TipRecord(
            from_user_id=current_user.id,
            to_user_id=to_user_id,
            target_type=target_type,
            target_id=target_id,
            amount=amount_wei,
            transaction_id=transaction.id,
            message=message,
            is_anonymous=is_anonymous
        )
        
        db.session.add(tip_record)
        db.session.commit()
        
        return jsonify({
            'message': 'Tip sent successfully',
            'tip': tip_record.to_dict(),
            'transaction': transaction.to_dict(),
            'new_balance': from_wallet.balance_in_tokens
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Tip failed',
            'details': str(e)
        }), 500


@api_bp.route('/wallet/tips/received', methods=['GET'])
@require_auth()
def get_received_tips():
    """获取收到的打赏"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({
                'error': 'Authentication required'
            }), 401
        
        # 获取查询参数
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # 验证分页参数
        validation_error = validate_pagination_params(page, per_page)
        if validation_error:
            return jsonify({
                'error': validation_error
            }), 400
        
        # 构建查询
        query = TipRecord.query.filter_by(to_user_id=current_user.id).order_by(TipRecord.created_at.desc())
        
        # 分页
        pagination = paginate_query(query, page, per_page)
        
        # 转换为字典
        tips = [tip.to_dict() for tip in pagination['items']]
        
        return jsonify({
            'tips': tips,
            'total': pagination['total'],
            'pages': pagination['pages'],
            'current_page': pagination['current_page'],
            'per_page': pagination['per_page'],
            'has_prev': pagination['has_prev'],
            'has_next': pagination['has_next']
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch received tips',
            'details': str(e)
        }), 500
