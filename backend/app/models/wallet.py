"""
钱包和交易相关数据模型
"""
from datetime import datetime
from app import db


class UserWallet(db.Model):
    """用户钱包模型"""
    __tablename__ = 'user_wallets'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    wallet_address = db.Column(db.String(42), nullable=False, unique=True)
    private_key_encrypted = db.Column(db.Text, nullable=False)
    crawler_coin_balance = db.Column(db.BigInteger, default=1000000)  # wei单位
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系 - 通过user_id关联
    user = db.relationship('User', backref='wallet')
    
    def __repr__(self):
        return f'<UserWallet {self.wallet_address}>'
    
    @property
    def balance_in_tokens(self):
        """以代币单位显示余额"""
        return self.crawler_coin_balance / 1000000  # 假设6位小数
    
    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'wallet_address': self.wallet_address,
            'crawler_coin_balance': self.crawler_coin_balance,
            'balance_in_tokens': self.balance_in_tokens,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class TokenTransaction(db.Model):
    """代币交易记录模型"""
    __tablename__ = 'token_transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    from_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), index=True)
    to_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), index=True)
    transaction_type = db.Column(db.String(50), nullable=False, index=True)
    amount = db.Column(db.BigInteger, nullable=False)
    related_id = db.Column(db.Integer)
    related_type = db.Column(db.String(50))
    blockchain_tx_hash = db.Column(db.String(66))
    status = db.Column(db.String(20), default='pending', index=True)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<TokenTransaction {self.transaction_type} {self.amount}>'
    
    @property
    def amount_in_tokens(self):
        """以代币单位显示金额"""
        return self.amount / 1000000  # 假设6位小数
    
    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'from_user_id': self.from_user_id,
            'to_user_id': self.to_user_id,
            'transaction_type': self.transaction_type,
            'amount': self.amount,
            'amount_in_tokens': self.amount_in_tokens,
            'related_id': self.related_id,
            'related_type': self.related_type,
            'blockchain_tx_hash': self.blockchain_tx_hash,
            'status': self.status,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class TipRecord(db.Model):
    """打赏记录模型"""
    __tablename__ = 'tip_records'
    
    id = db.Column(db.Integer, primary_key=True)
    from_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    to_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    target_type = db.Column(db.String(20), nullable=False, index=True)
    target_id = db.Column(db.Integer, nullable=False)
    amount = db.Column(db.BigInteger, nullable=False)
    transaction_id = db.Column(db.Integer, db.ForeignKey('token_transactions.id'))
    blockchain_tx_hash = db.Column(db.String(66))
    message = db.Column(db.Text)
    is_anonymous = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 关系
    transaction = db.relationship('TokenTransaction', backref='tip_record')
    
    def __repr__(self):
        return f'<TipRecord {self.target_type}:{self.target_id} {self.amount}>'
    
    @property
    def amount_in_tokens(self):
        """以代币单位显示金额"""
        return self.amount / 1000000  # 假设6位小数
    
    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'from_user_id': self.from_user_id,
            'to_user_id': self.to_user_id,
            'target_type': self.target_type,
            'target_id': self.target_id,
            'amount': self.amount,
            'amount_in_tokens': self.amount_in_tokens,
            'transaction_id': self.transaction_id,
            'blockchain_tx_hash': self.blockchain_tx_hash,
            'message': self.message,
            'is_anonymous': self.is_anonymous,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
