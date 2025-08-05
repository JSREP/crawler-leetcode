"""
挑战相关数据模型
"""
from datetime import datetime
from app import db
import json


class Challenge(db.Model):
    """挑战模型"""
    __tablename__ = 'challenges'
    
    id = db.Column(db.Integer, primary_key=True)
    id_alias = db.Column(db.String(255), unique=True, nullable=False, index=True)
    name = db.Column(db.String(255), nullable=False)
    name_en = db.Column(db.String(255))
    platform = db.Column(db.String(100), nullable=False, index=True)
    difficulty_level = db.Column(db.Integer, nullable=False, index=True)
    description_markdown = db.Column(db.Text)
    description_markdown_en = db.Column(db.Text)
    base64_url = db.Column(db.Text, nullable=False)
    is_expired = db.Column(db.Boolean, default=False, index=True)
    tags = db.Column(db.Text)  # JSON字符串存储标签数组
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    comments = db.relationship('ChallengeComment', backref='challenge', lazy='dynamic', cascade='all, delete-orphan')
    forum_posts = db.relationship('ForumPost', backref='challenge', lazy='dynamic')
    
    def __repr__(self):
        return f'<Challenge {self.name}>'
    
    @property
    def tags_list(self):
        """获取标签列表"""
        if self.tags:
            try:
                return json.loads(self.tags)
            except (json.JSONDecodeError, TypeError):
                return []
        return []
    
    @tags_list.setter
    def tags_list(self, value):
        """设置标签列表"""
        if isinstance(value, list):
            self.tags = json.dumps(value, ensure_ascii=False)
        else:
            self.tags = None
    
    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'id_alias': self.id_alias,
            'name': self.name,
            'name_en': self.name_en,
            'platform': self.platform,
            'difficulty_level': self.difficulty_level,
            'description_markdown': self.description_markdown,
            'description_markdown_en': self.description_markdown_en,
            'base64_url': self.base64_url,
            'is_expired': self.is_expired,
            'tags': self.tags_list,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            
            # 兼容前端的字段
            'title': self.name,
            'titleEN': self.name_en,
            'difficulty': self.difficulty_level,
            'description': self.description_markdown,
            'descriptionEN': self.description_markdown_en,
            'base64Url': self.base64_url,
            'isExpired': self.is_expired,
            'createTime': self.created_at.isoformat() if self.created_at else None,
            'updateTime': self.updated_at.isoformat() if self.updated_at else None,
            'idAlias': self.id_alias
        }
    
    @classmethod
    def get_stats(cls):
        """获取挑战统计信息"""
        from sqlalchemy import func
        
        # 总数统计
        total = cls.query.count()
        
        # 平台统计
        platforms = db.session.query(
            cls.platform,
            func.count(cls.id).label('count')
        ).group_by(cls.platform).all()
        
        # 难度统计
        difficulties = db.session.query(
            cls.difficulty_level,
            func.count(cls.id).label('count')
        ).group_by(cls.difficulty_level).all()
        
        # 标签统计（需要特殊处理JSON字段）
        challenges_with_tags = cls.query.filter(cls.tags.isnot(None)).all()
        tag_counts = {}
        for challenge in challenges_with_tags:
            for tag in challenge.tags_list:
                tag_counts[tag] = tag_counts.get(tag, 0) + 1
        
        tags = [{'tag': tag, 'count': count} for tag, count in tag_counts.items()]
        tags.sort(key=lambda x: x['count'], reverse=True)
        
        return {
            'total': total,
            'platforms': [{'platform': p[0], 'count': p[1]} for p in platforms],
            'difficulties': [{'difficulty_level': d[0], 'count': d[1]} for d in difficulties],
            'tags': tags[:20]  # 只返回前20个最常用的标签
        }
