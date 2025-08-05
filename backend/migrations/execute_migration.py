#!/usr/bin/env python3
"""
数据迁移执行脚本 - 完整的PostgreSQL到MySQL迁移流程
"""
import os
import sys
import json
import time
from datetime import datetime
from pathlib import Path

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models import *


class MigrationExecutor:
    def __init__(self):
        self.app = create_app()
        self.migration_dir = Path(__file__).parent
        self.backup_dir = self.migration_dir / 'backups'
        self.backup_dir.mkdir(exist_ok=True)
        
    def create_backup(self):
        """创建当前MySQL数据备份"""
        print("💾 创建当前MySQL数据备份...")
        
        backup_file = self.backup_dir / f"mysql_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.sql"
        
        try:
            with self.app.app_context():
                # 获取数据库配置
                db_config = self.app.config['SQLALCHEMY_DATABASE_URI']
                
                # 解析数据库连接信息
                if 'mysql' in db_config:
                    # 提取数据库信息
                    import re
                    match = re.match(r'mysql\+pymysql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)', db_config)
                    if match:
                        user, password, host, port, database = match.groups()
                        
                        # 使用mysqldump备份
                        import subprocess
                        cmd = [
                            'mysqldump',
                            f'--host={host}',
                            f'--port={port}',
                            f'--user={user}',
                            f'--password={password}',
                            '--single-transaction',
                            '--routines',
                            '--triggers',
                            database
                        ]
                        
                        with open(backup_file, 'w') as f:
                            result = subprocess.run(cmd, stdout=f, stderr=subprocess.PIPE, text=True)
                        
                        if result.returncode == 0:
                            print(f"✅ MySQL备份完成: {backup_file}")
                            return backup_file
                        else:
                            print(f"❌ MySQL备份失败: {result.stderr}")
                            return None
                    else:
                        print("❌ 无法解析数据库连接字符串")
                        return None
                else:
                    print("⚠️ 当前不是MySQL数据库，跳过备份")
                    return None
                    
        except Exception as e:
            print(f"❌ 备份过程出错: {e}")
            return None
    
    def verify_mysql_connection(self):
        """验证MySQL连接"""
        print("🔍 验证MySQL连接...")
        
        try:
            with self.app.app_context():
                # 测试数据库连接
                result = db.session.execute(db.text('SELECT VERSION() as version'))
                version = result.fetchone().version
                
                print(f"✅ MySQL连接成功，版本: {version}")
                return True
                
        except Exception as e:
            print(f"❌ MySQL连接失败: {e}")
            return False
    
    def initialize_mysql_schema(self):
        """初始化MySQL数据库结构"""
        print("🏗️ 初始化MySQL数据库结构...")
        
        try:
            with self.app.app_context():
                # 删除所有表（如果存在）
                db.drop_all()
                print("   清理现有表结构")
                
                # 创建所有表
                db.create_all()
                print("   创建新表结构")
                
                # 验证表创建
                inspector = db.inspect(db.engine)
                tables = inspector.get_table_names()
                
                expected_tables = [
                    'users', 'user_sessions', 'challenges', 'challenge_comments',
                    'forum_posts', 'forum_replies', 'user_storage', 'user_storage_quota',
                    'user_wallets', 'token_transactions', 'tip_records'
                ]
                
                missing_tables = set(expected_tables) - set(tables)
                if missing_tables:
                    print(f"⚠️ 缺少表: {missing_tables}")
                    return False
                
                print(f"✅ 成功创建 {len(tables)} 个表")
                return True
                
        except Exception as e:
            print(f"❌ 初始化数据库结构失败: {e}")
            return False
    
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
    
    def verify_migration(self):
        """验证迁移结果"""
        print("🔍 验证迁移结果...")
        
        try:
            with self.app.app_context():
                # 统计各表记录数
                stats = {
                    'users': User.query.count(),
                    'challenges': Challenge.query.count(),
                    'user_storage': UserStorage.query.count(),
                    'user_storage_quota': UserStorageQuota.query.count(),
                }
                
                print("📊 迁移统计:")
                for table, count in stats.items():
                    print(f"   {table}: {count} 条记录")
                
                # 验证数据完整性
                print("\n🔍 数据完整性检查:")
                
                # 检查用户数据
                users_with_github_id = User.query.filter(User.github_id.isnot(None)).count()
                print(f"   有GitHub ID的用户: {users_with_github_id}/{stats['users']}")
                
                # 检查挑战数据
                challenges_with_alias = Challenge.query.filter(Challenge.id_alias.isnot(None)).count()
                print(f"   有别名的挑战: {challenges_with_alias}/{stats['challenges']}")
                
                # 检查存储配额
                users_with_quota = UserStorageQuota.query.count()
                print(f"   有配额的用户: {users_with_quota}/{stats['users']}")
                
                # 检查外键关系
                orphaned_storage = UserStorage.query.filter(
                    ~UserStorage.user_id.in_(db.session.query(User.id))
                ).count()
                print(f"   孤立的存储记录: {orphaned_storage}")
                
                if orphaned_storage == 0:
                    print("✅ 数据完整性检查通过")
                    return True
                else:
                    print("⚠️ 发现数据完整性问题")
                    return False
                
        except Exception as e:
            print(f"❌ 验证过程出错: {e}")
            return False
    
    def execute_full_migration(self):
        """执行完整的数据迁移"""
        print("🚀 开始执行完整数据迁移...\n")
        
        start_time = datetime.now()
        
        # 步骤1: 创建备份
        backup_file = self.create_backup()
        
        # 步骤2: 验证MySQL连接
        if not self.verify_mysql_connection():
            return False
        
        # 步骤3: 初始化数据库结构
        if not self.initialize_mysql_schema():
            return False
        
        # 步骤4: 加载PostgreSQL数据
        pg_data = self.load_postgresql_data()
        if not pg_data:
            return False
        
        # 步骤5: 导入数据
        print("\n📥 开始导入数据...")
        
        # 导入用户
        if pg_data.get('users'):
            if not self.import_users(pg_data['users']):
                return False
        
        # 导入挑战
        if pg_data.get('challenges'):
            if not self.import_challenges(pg_data['challenges']):
                return False
        
        # 导入存储数据
        if pg_data.get('user_storage'):
            if not self.import_storage_data(pg_data['user_storage']):
                return False
        
        # 步骤6: 创建默认配额
        if not self.create_default_quotas():
            return False
        
        # 步骤7: 验证迁移结果
        if not self.verify_migration():
            print("⚠️ 迁移验证失败，但数据已导入")
        
        # 完成
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        print(f"\n🎉 数据迁移完成！")
        print(f"⏱️ 耗时: {duration:.1f}秒")
        
        if backup_file:
            print(f"💾 备份文件: {backup_file}")
        
        return True


def main():
    """主函数"""
    executor = MigrationExecutor()
    
    print("=" * 60)
    print("🔄 PostgreSQL到MySQL数据迁移工具")
    print("=" * 60)
    
    # 确认执行
    response = input("\n⚠️ 此操作将清空当前MySQL数据库并导入PostgreSQL数据。\n是否继续？(y/N): ")
    
    if response.lower() != 'y':
        print("❌ 迁移已取消")
        return
    
    try:
        success = executor.execute_full_migration()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n⏹️ 迁移被用户中断")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 迁移过程中出现异常: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
