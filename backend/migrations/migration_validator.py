#!/usr/bin/env python3
"""
迁移验证模块
"""
from app import db
from app.models import User, Challenge, UserStorage, UserStorageQuota


class MigrationValidator:
    def __init__(self, app):
        self.app = app
        
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
