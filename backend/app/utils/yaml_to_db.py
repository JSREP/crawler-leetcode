import os
import yaml
from datetime import datetime
from app import create_app, db
from app.models.challenge import Challenge

def load_yaml_files(challenges_dir):
    """加载所有YAML文件中的挑战数据"""
    challenges = []
    for filename in os.listdir(challenges_dir):
        if filename.endswith('.yml') and filename != 'meta.yml':
            with open(os.path.join(challenges_dir, filename), 'r', encoding='utf-8') as f:
                data = yaml.safe_load(f)
                if data and 'challenges' in data:
                    challenges.extend(data['challenges'])
    return challenges

def import_challenges_to_db(challenges_data):
    """将挑战数据导入到数据库"""
    for data in challenges_data:
        challenge = Challenge(
            id=data['id'],
            id_alias=data['id-alias'],
            name=data['name'],
            name_en=data.get('name_en'),
            platform=data['platform'],
            difficulty_level=data['difficulty-level'],
            description_markdown=data.get('description-markdown'),
            description_markdown_en=data.get('description-markdown_en'),
            base64_url=data['base64-url'],
            is_expired=data.get('is-expired', False),
            tags=data.get('tags', []),
            create_time=datetime.strptime(data['create-time'], '%Y-%m-%d %H:%M:%S'),
            update_time=datetime.strptime(data['update-time'], '%Y-%m-%d %H:%M:%S')
        )
        db.session.add(challenge)
    
    try:
        db.session.commit()
        print("Successfully imported challenges to database")
    except Exception as e:
        db.session.rollback()
        print(f"Error importing challenges: {str(e)}")

def main():
    """主函数"""
    app = create_app('development')
    with app.app_context():
        # 创建所有表
        db.create_all()
        
        # 加载YAML文件
        challenges_dir = '../../frontend/docs/challenges'
        challenges_data = load_yaml_files(challenges_dir)
        
        # 导入数据
        import_challenges_to_db(challenges_data)

if __name__ == '__main__':
    main() 