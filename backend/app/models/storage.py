"""
存储相关数据模型
"""
from datetime import datetime
from app import db


class UserStorage(db.Model):
    """用户存储记录模型"""
    __tablename__ = 'user_storage'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    file_name = db.Column(db.String(255), nullable=False)
    file_size = db.Column(db.BigInteger, nullable=False)
    file_type = db.Column(db.String(100), nullable=False)
    file_path = db.Column(db.Text, nullable=False)  # 本地文件路径
    upload_purpose = db.Column(db.String(50), nullable=False, index=True)
    is_deleted = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<UserStorage {self.file_name}>'
    
    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'file_name': self.file_name,
            'file_size': self.file_size,
            'file_type': self.file_type,
            'file_path': self.file_path,
            'upload_purpose': self.upload_purpose,
            'is_deleted': self.is_deleted,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class UserStorageQuota(db.Model):
    """用户存储配额模型"""
    __tablename__ = 'user_storage_quota'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    total_quota = db.Column(db.BigInteger, default=104857600)  # 100MB
    used_quota = db.Column(db.BigInteger, default=0)
    purchased_quota = db.Column(db.BigInteger, default=0)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<UserStorageQuota user_id={self.user_id}>'
    
    @property
    def available_quota(self):
        """可用配额"""
        return self.total_quota + self.purchased_quota - self.used_quota
    
    @property
    def usage_percentage(self):
        """使用百分比"""
        total = self.total_quota + self.purchased_quota
        if total == 0:
            return 0
        return (self.used_quota / total) * 100
    
    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'total_quota': self.total_quota,
            'used_quota': self.used_quota,
            'purchased_quota': self.purchased_quota,
            'available_quota': self.available_quota,
            'usage_percentage': self.usage_percentage,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
