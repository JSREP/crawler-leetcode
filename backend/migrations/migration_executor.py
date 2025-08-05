#!/usr/bin/env python3
"""
数据迁移主执行器
"""
import os
import sys
from datetime import datetime
from pathlib import Path

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from .backup_manager import BackupManager
from .data_importer import DataImporter
from .migration_validator import MigrationValidator


class MigrationExecutor:
    def __init__(self):
        self.app = create_app()
        self.migration_dir = Path(__file__).parent
        
        # 初始化各个模块
        self.backup_manager = BackupManager(self.app, self.migration_dir)
        self.data_importer = DataImporter(self.app, self.migration_dir)
        self.validator = MigrationValidator(self.app)
        
    def execute_full_migration(self):
        """执行完整的数据迁移"""
        print("🚀 开始执行完整数据迁移...\n")
        
        start_time = datetime.now()
        
        # 步骤1: 创建备份
        backup_file = self.backup_manager.create_backup()
        
        # 步骤2: 验证MySQL连接
        if not self.validator.verify_mysql_connection():
            return False
        
        # 步骤3: 初始化数据库结构
        if not self.validator.initialize_mysql_schema():
            return False
        
        # 步骤4: 加载PostgreSQL数据
        pg_data = self.data_importer.load_postgresql_data()
        if not pg_data:
            return False
        
        # 步骤5: 导入数据
        print("\n📥 开始导入数据...")
        
        # 导入用户
        if pg_data.get('users'):
            if not self.data_importer.import_users(pg_data['users']):
                return False
        
        # 导入挑战
        if pg_data.get('challenges'):
            if not self.data_importer.import_challenges(pg_data['challenges']):
                return False
        
        # 导入存储数据
        if pg_data.get('user_storage'):
            if not self.data_importer.import_storage_data(pg_data['user_storage']):
                return False
        
        # 步骤6: 创建默认配额
        if not self.data_importer.create_default_quotas():
            return False
        
        # 步骤7: 验证迁移结果
        if not self.validator.verify_migration():
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
