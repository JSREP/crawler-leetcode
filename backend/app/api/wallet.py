"""
钱包和交易API路由 - 重构版本
导入模块化的钱包功能
"""
# 导入所有钱包相关的API端点
from .wallet import *


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
        from sqlalchemy import or_
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
