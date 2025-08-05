"""
存储配额管理路由
"""
from datetime import datetime
from flask import request, jsonify
from app.storage import storage_bp
from app import db
from app.models import UserStorageQuota, TokenTransaction
from app.auth.middleware import require_auth, get_current_user
from app.utils.helpers import format_file_size


@storage_bp.route('/quota/purchase', methods=['POST'])
@require_auth()
def purchase_storage():
    """购买额外存储空间"""
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
        
        # 获取购买参数
        storage_gb = data.get('storage_gb', 1)  # 默认1GB
        
        if storage_gb <= 0 or storage_gb > 100:
            return jsonify({
                'error': 'Invalid storage amount (1-100 GB)'
            }), 400
        
        # 计算价格（示例：1GB = 100 tokens）
        price_per_gb = 100
        total_cost = storage_gb * price_per_gb
        
        # 检查用户余额（如果启用了钱包系统）
        if hasattr(current_user, 'wallet') and current_user.wallet:
            if current_user.wallet.crawler_coin_balance < total_cost * 1000000:  # 转换为wei
                return jsonify({
                    'error': 'Insufficient balance'
                }), 400
        
        # 获取或创建存储配额记录
        quota = UserStorageQuota.query.filter_by(user_id=current_user.id).first()
        if not quota:
            quota = UserStorageQuota(
                user_id=current_user.id,
                total_quota=104857600,  # 100MB
                used_quota=0,
                purchased_quota=0
            )
            db.session.add(quota)
        
        # 增加购买的配额
        additional_bytes = storage_gb * 1024 * 1024 * 1024  # GB转字节
        quota.purchased_quota += additional_bytes
        quota.updated_at = datetime.utcnow()
        
        # 扣除代币（如果启用了钱包系统）
        if hasattr(current_user, 'wallet') and current_user.wallet:
            current_user.wallet.crawler_coin_balance -= total_cost * 1000000
            
            # 记录交易
            transaction = TokenTransaction(
                from_user_id=current_user.id,
                to_user_id=None,  # 系统收入
                transaction_type='purchase_storage',
                amount=total_cost * 1000000,
                related_id=quota.id,
                related_type='storage_quota',
                status='confirmed',
                description=f'Purchase {storage_gb}GB storage space'
            )
            db.session.add(transaction)
        
        db.session.commit()
        
        return jsonify({
            'message': f'Successfully purchased {storage_gb}GB storage',
            'purchased_storage': storage_gb,
            'cost': total_cost,
            'quota': quota.to_dict(),
            'formatted_quota': {
                'total_quota': format_file_size(quota.total_quota),
                'used_quota': format_file_size(quota.used_quota),
                'purchased_quota': format_file_size(quota.purchased_quota),
                'available_quota': format_file_size(quota.available_quota)
            }
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Storage purchase failed',
            'details': str(e)
        }), 500


@storage_bp.route('/quota/stats', methods=['GET'])
@require_auth()
def get_storage_stats():
    """获取存储使用统计"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({
                'error': 'Authentication required'
            }), 401
        
        # 获取配额信息
        quota = UserStorageQuota.query.filter_by(user_id=current_user.id).first()
        if not quota:
            quota = UserStorageQuota(
                user_id=current_user.id,
                total_quota=104857600,  # 100MB
                used_quota=0,
                purchased_quota=0
            )
            db.session.add(quota)
            db.session.commit()
        
        # 按用途统计文件
        from app.models import UserStorage
        from sqlalchemy import func
        
        purpose_stats = db.session.query(
            UserStorage.upload_purpose,
            func.count(UserStorage.id).label('file_count'),
            func.sum(UserStorage.file_size).label('total_size')
        ).filter_by(
            user_id=current_user.id,
            is_deleted=False
        ).group_by(UserStorage.upload_purpose).all()
        
        # 按文件类型统计
        type_stats = db.session.query(
            func.substring_index(UserStorage.file_type, '/', 1).label('file_category'),
            func.count(UserStorage.id).label('file_count'),
            func.sum(UserStorage.file_size).label('total_size')
        ).filter_by(
            user_id=current_user.id,
            is_deleted=False
        ).group_by('file_category').all()
        
        # 格式化统计数据
        purpose_data = []
        for purpose, count, size in purpose_stats:
            purpose_data.append({
                'purpose': purpose,
                'file_count': count,
                'total_size': size or 0,
                'formatted_size': format_file_size(size or 0)
            })
        
        type_data = []
        for category, count, size in type_stats:
            type_data.append({
                'category': category,
                'file_count': count,
                'total_size': size or 0,
                'formatted_size': format_file_size(size or 0)
            })
        
        return jsonify({
            'quota': quota.to_dict(),
            'formatted_quota': {
                'total_quota': format_file_size(quota.total_quota),
                'used_quota': format_file_size(quota.used_quota),
                'purchased_quota': format_file_size(quota.purchased_quota),
                'available_quota': format_file_size(quota.available_quota)
            },
            'usage_by_purpose': purpose_data,
            'usage_by_type': type_data
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch storage stats',
            'details': str(e)
        }), 500


@storage_bp.route('/quota/pricing', methods=['GET'])
def get_storage_pricing():
    """获取存储空间定价"""
    try:
        pricing_tiers = [
            {
                'size_gb': 1,
                'price_tokens': 100,
                'description': '1GB additional storage'
            },
            {
                'size_gb': 5,
                'price_tokens': 450,
                'description': '5GB additional storage (10% discount)'
            },
            {
                'size_gb': 10,
                'price_tokens': 800,
                'description': '10GB additional storage (20% discount)'
            },
            {
                'size_gb': 50,
                'price_tokens': 3500,
                'description': '50GB additional storage (30% discount)'
            },
            {
                'size_gb': 100,
                'price_tokens': 6000,
                'description': '100GB additional storage (40% discount)'
            }
        ]
        
        return jsonify({
            'pricing_tiers': pricing_tiers,
            'base_quota': {
                'size_mb': 100,
                'description': 'Free storage quota for all users'
            },
            'currency': 'CRAWLER Tokens'
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch pricing',
            'details': str(e)
        }), 500


@storage_bp.route('/quota/history', methods=['GET'])
@require_auth()
def get_quota_history():
    """获取存储配额变更历史"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({
                'error': 'Authentication required'
            }), 401
        
        # 获取相关的代币交易记录
        transactions = TokenTransaction.query.filter_by(
            from_user_id=current_user.id,
            transaction_type='purchase_storage'
        ).order_by(TokenTransaction.created_at.desc()).limit(50).all()
        
        history = []
        for transaction in transactions:
            history.append({
                'id': transaction.id,
                'amount_tokens': transaction.amount // 1000000,  # 转换为代币单位
                'description': transaction.description,
                'status': transaction.status,
                'created_at': transaction.created_at.isoformat(),
                'blockchain_tx_hash': transaction.blockchain_tx_hash
            })
        
        return jsonify({
            'history': history,
            'total_records': len(history)
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch quota history',
            'details': str(e)
        }), 500
