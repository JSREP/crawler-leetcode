from datetime import datetime
from .. import db

class Challenge(db.Model):
    __tablename__ = 'challenges'
    
    id = db.Column(db.Integer, primary_key=True)
    id_alias = db.Column(db.String(100), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    name_en = db.Column(db.String(100))
    platform = db.Column(db.String(50), nullable=False)
    difficulty_level = db.Column(db.Integer, nullable=False)
    description_markdown = db.Column(db.Text)
    description_markdown_en = db.Column(db.Text)
    base64_url = db.Column(db.Text, nullable=False)
    is_expired = db.Column(db.Boolean, default=False)
    tags = db.Column(db.JSON)  # 存储标签数组
    create_time = db.Column(db.DateTime, default=datetime.utcnow)
    update_time = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
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
            'tags': self.tags,
            'create_time': self.create_time.isoformat(),
            'update_time': self.update_time.isoformat()
        } 