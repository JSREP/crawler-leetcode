#!/usr/bin/env python3
"""
数据迁移执行脚本 - 完整的PostgreSQL到MySQL迁移流程
重构版本：使用模块化设计
"""
import os
import sys
from datetime import datetime
from pathlib import Path

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from migration_executor import MigrationExecutor as ModularMigrationExecutor


class MigrationExecutor:
    """
    兼容性包装器，保持原有接口的同时使用新的模块化实现
    """
    def __init__(self):
        self.modular_executor = ModularMigrationExecutor()

    def execute_full_migration(self):
        """执行完整的数据迁移 - 委托给模块化实现"""
        return self.modular_executor.execute_full_migration()


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
