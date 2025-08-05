#!/usr/bin/env python3
"""
数据导入模块
"""
import json
from datetime import datetime
from pathlib import Path
from app import db
from app.models import User, Challenge, UserStorage, UserStorageQuota


class DataImporter:
    def __init__(self, app, migration_dir):
        self.app = app
        self.migration_dir = Path(migration_dir)
        
    def load_postgresql_data(self):
        """加载PostgreSQL导出的数据"""
        print("📂 加载PostgreSQL导出数据...")
        
        data_file = self.migration_dir / 'exported_data' / 'database_records.json'
        
        if not data_file.exists():
            print(f"❌ 数据文件不存在: {data_file}")
            print("请先运行: python export_postgresql_data.py")
            return None
        
        try:
            with open(data_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            print(f"✅ 成功加载数据文件")
            print(f"   用户数: {len(data.get('users', []))}")
            print(f"   挑战数: {len(data.get('challenges', []))}")
            print(f"   存储记录数: {len(data.get('user_storage', []))}")
            
            return data
            
        except Exception as e:
            print(f"❌ 加载数据文件失败: {e}")
            return None
    
    def import_users(self, users_data):
        """导入用户数据"""
        print("👥 导入用户数据...")
        
        try:
            imported_count = 0
            
            for user_data in users_data:
                user = User(
                    github_id=user_data['github_id'],
                    username=user_data['username'],
                    email=user_data.get('email'),
                    name=user_data.get('name'),
                    avatar_url=user_data.get('avatar_url'),
                    bio=user_data.get('bio'),
                    location=user_data.get('location'),
                    company=user_data.get('company'),
                    blog=user_data.get('blog'),
                    public_repos=user_data.get('public_repos', 0),
                    followers=user_data.get('followers', 0),
                    following=user_data.get('following', 0),
                    role=user_data.get('role', 'user')
                )
                
                # 设置时间戳
                if user_data.get('created_at'):
                    user.created_at = datetime.fromisoformat(user_data['created_at'].replace('Z', '+00:00'))
                if user_data.get('updated_at'):
                    user.updated_at = datetime.fromisoformat(user_data['updated_at'].replace('Z', '+00:00'))
                if user_data.get('last_login_at'):
                    user.last_login_at = datetime.fromisoformat(user_data['last_login_at'].replace('Z', '+00:00'))
                
                db.session.add(user)
                imported_count += 1
            
            db.session.commit()
            print(f"✅ 成功导入 {imported_count} 个用户")
            return True
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ 导入用户数据失败: {e}")
            return False
    
    def import_challenges(self, challenges_data):
        """导入挑战数据"""
        print("🎯 导入挑战数据...")
        
        try:
            imported_count = 0
            
            for challenge_data in challenges_data:
                challenge = Challenge(
                    id_alias=challenge_data['id_alias'],
                    name=challenge_data['name'],
                    name_en=challenge_data.get('name_en'),
                    platform=challenge_data['platform'],
                    difficulty_level=challenge_data['difficulty_level'],
                    description_markdown=challenge_data.get('description_markdown'),
                    description_markdown_en=challenge_data.get('description_markdown_en'),
                    base64_url=challenge_data['base64_url'],
                    is_expired=challenge_data.get('is_expired', False)
                )
                
                # 处理标签
                if challenge_data.get('tags'):
                    if isinstance(challenge_data['tags'], str):
                        try:
                            challenge.tags = challenge_data['tags']
                        except:
                            challenge.tags = json.dumps([challenge_data['tags']])
                    else:
                        challenge.tags = json.dumps(challenge_data['tags'])
                
                # 设置时间戳
                if challenge_data.get('created_at'):
                    challenge.created_at = datetime.fromisoformat(challenge_data['created_at'].replace('Z', '+00:00'))
                if challenge_data.get('updated_at'):
                    challenge.updated_at = datetime.fromisoformat(challenge_data['updated_at'].replace('Z', '+00:00'))
                
                db.session.add(challenge)
                imported_count += 1
            
            db.session.commit()
            print(f"✅ 成功导入 {imported_count} 个挑战")
            return True
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ 导入挑战数据失败: {e}")
            return False

    def import_storage_data(self, storage_data):
        """导入存储数据"""
        print("💾 导入存储数据...")

        try:
            imported_count = 0

            for storage_record in storage_data:
                # 转换blob_url为本地路径
                file_path = storage_record.get('file_path', storage_record.get('blob_url', ''))
                if file_path.startswith('https://'):
                    # 从URL提取文件名
                    filename = file_path.split('/')[-1]
                    file_path = f"uploads/{filename}"

                user_storage = UserStorage(
                    user_id=storage_record['user_id'],
                    file_name=storage_record['file_name'],
                    file_size=storage_record['file_size'],
                    file_type=storage_record['file_type'],
                    file_path=file_path,
                    upload_purpose=storage_record.get('upload_purpose', 'general'),
                    is_deleted=storage_record.get('is_deleted', False)
                )

                # 设置时间戳
                if storage_record.get('created_at'):
                    user_storage.created_at = datetime.fromisoformat(storage_record['created_at'].replace('Z', '+00:00'))

                db.session.add(user_storage)
                imported_count += 1

            db.session.commit()
            print(f"✅ 成功导入 {imported_count} 个存储记录")
            return True

        except Exception as e:
            db.session.rollback()
            print(f"❌ 导入存储数据失败: {e}")
            return False

    def create_default_quotas(self):
        """为所有用户创建默认存储配额"""
        print("📊 创建默认存储配额...")

        try:
            users = User.query.all()
            created_count = 0

            for user in users:
                # 检查是否已有配额记录
                existing_quota = UserStorageQuota.query.filter_by(user_id=user.id).first()
                if existing_quota:
                    continue

                # 计算用户实际使用量
                used_quota = db.session.query(db.func.sum(UserStorage.file_size)).filter_by(
                    user_id=user.id,
                    is_deleted=False
                ).scalar() or 0

                quota = UserStorageQuota(
                    user_id=user.id,
                    total_quota=104857600,  # 100MB
                    used_quota=used_quota,
                    purchased_quota=0
                )

                db.session.add(quota)
                created_count += 1

            db.session.commit()
            print(f"✅ 成功创建 {created_count} 个配额记录")
            return True

        except Exception as e:
            db.session.rollback()
            print(f"❌ 创建配额记录失败: {e}")
            return False
