"""
用户相关数据模型
"""
from datetime import datetime
from app import db


class User(db.Model):
    """用户模型"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    github_id = db.Column(db.Integer, unique=True, nullable=False, index=True)
    username = db.Column(db.String(255), nullable=False, index=True)
    email = db.Column(db.String(255), index=True)
    name = db.Column(db.String(255))
    avatar_url = db.Column(db.Text)
    bio = db.Column(db.Text)
    location = db.Column(db.String(255))
    company = db.Column(db.String(255))
    blog = db.Column(db.String(255))
    public_repos = db.Column(db.Integer, default=0)
    followers = db.Column(db.Integer, default=0)
    following = db.Column(db.Integer, default=0)
    role = db.Column(db.String(20), nullable=False, default='user', index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_at = db.Column(db.DateTime)
    
    # 关系
    sessions = db.relationship('UserSession', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    storage_records = db.relationship('UserStorage', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    storage_quota = db.relationship('UserStorageQuota', backref='user', uselist=False, cascade='all, delete-orphan')

    # 交易关系
    sent_transactions = db.relationship('TokenTransaction', foreign_keys='TokenTransaction.from_user_id', backref='from_user', lazy='dynamic')
    received_transactions = db.relationship('TokenTransaction', foreign_keys='TokenTransaction.to_user_id', backref='to_user', lazy='dynamic')
    sent_tips = db.relationship('TipRecord', foreign_keys='TipRecord.from_user_id', backref='tipper', lazy='dynamic')
    received_tips = db.relationship('TipRecord', foreign_keys='TipRecord.to_user_id', backref='recipient', lazy='dynamic')
    
    def __repr__(self):
        return f'<User {self.username}>'
    
    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'github_id': self.github_id,
            'username': self.username,
            'email': self.email,
            'name': self.name,
            'avatar_url': self.avatar_url,
            'bio': self.bio,
            'location': self.location,
            'company': self.company,
            'blog': self.blog,
            'public_repos': self.public_repos,
            'followers': self.followers,
            'following': self.following,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'last_login_at': self.last_login_at.isoformat() if self.last_login_at else None
        }
    
    def is_admin(self):
        """检查是否为管理员"""
        return self.role == 'admin'


class UserSession(db.Model):
    """用户会话模型"""
    __tablename__ = 'user_sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    session_token = db.Column(db.String(255), unique=True, nullable=False, index=True)
    expires_at = db.Column(db.DateTime, nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<UserSession {self.session_token[:10]}...>'
    
    def is_expired(self):
        """检查会话是否过期"""
        return datetime.utcnow() > self.expires_at
    
    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'session_token': self.session_token,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_expired': self.is_expired()
        }
