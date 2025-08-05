#!/usr/bin/env python3
"""
存储系统备份脚本
"""
import os
import sys
import shutil
import tarfile
import json
from datetime import datetime, timedelta
from pathlib import Path

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models import UserStorage, UserStorageQuota
from app.utils.helpers import format_file_size


class StorageBackup:
    def __init__(self):
        self.app = create_app()
        self.storage_root = Path(self.app.config['UPLOAD_FOLDER'])
        self.backup_root = self.storage_root / 'backups'
        self.backup_root.mkdir(exist_ok=True)
        
    def create_backup(self, backup_name=None):
        """创建完整备份"""
        if not backup_name:
            backup_name = f"storage_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        print(f"📦 创建存储备份: {backup_name}")
        
        backup_dir = self.backup_root / backup_name
        backup_dir.mkdir(exist_ok=True)
        
        # 备份文件
        self._backup_files(backup_dir)
        
        # 备份数据库记录
        self._backup_database_records(backup_dir)
        
        # 创建备份信息文件
        self._create_backup_info(backup_dir)
        
        # 压缩备份
        archive_path = self._compress_backup(backup_dir)
        
        # 清理临时目录
        shutil.rmtree(backup_dir)
        
        print(f"✅ 备份完成: {archive_path}")
        return archive_path
    
    def _backup_files(self, backup_dir):
        """备份文件"""
        print("  📁 备份文件...")
        
        files_backup_dir = backup_dir / 'files'
        files_backup_dir.mkdir(exist_ok=True)
        
        # 备份主要目录
        backup_dirs = ['uploads', 'avatars', 'challenges']
        total_files = 0
        total_size = 0
        
        for dir_name in backup_dirs:
            source_dir = self.storage_root / dir_name
            target_dir = files_backup_dir / dir_name
            
            if source_dir.exists():
                shutil.copytree(source_dir, target_dir, dirs_exist_ok=True)
                
                # 统计文件
                for file_path in target_dir.rglob('*'):
                    if file_path.is_file():
                        total_files += 1
                        total_size += file_path.stat().st_size
                
                print(f"    ✅ 备份目录: {dir_name}")
        
        print(f"    📊 备份了 {total_files} 个文件，总大小: {format_file_size(total_size)}")
    
    def _backup_database_records(self, backup_dir):
        """备份数据库记录"""
        print("  🗄️ 备份数据库记录...")
        
        with self.app.app_context():
            # 备份存储记录
            storage_records = []
            for record in UserStorage.query.all():
                storage_records.append({
                    'id': record.id,
                    'user_id': record.user_id,
                    'file_name': record.file_name,
                    'file_size': record.file_size,
                    'file_type': record.file_type,
                    'file_path': record.file_path,
                    'upload_purpose': record.upload_purpose,
                    'is_deleted': record.is_deleted,
                    'created_at': record.created_at.isoformat() if record.created_at else None
                })
            
            # 备份配额记录
            quota_records = []
            for quota in UserStorageQuota.query.all():
                quota_records.append({
                    'id': quota.id,
                    'user_id': quota.user_id,
                    'total_quota': quota.total_quota,
                    'used_quota': quota.used_quota,
                    'purchased_quota': quota.purchased_quota,
                    'updated_at': quota.updated_at.isoformat() if quota.updated_at else None
                })
            
            # 保存到JSON文件
            db_backup = {
                'storage_records': storage_records,
                'quota_records': quota_records,
                'backup_time': datetime.now().isoformat(),
                'record_counts': {
                    'storage_records': len(storage_records),
                    'quota_records': len(quota_records)
                }
            }
            
            db_backup_file = backup_dir / 'database_records.json'
            with open(db_backup_file, 'w', encoding='utf-8') as f:
                json.dump(db_backup, f, indent=2, ensure_ascii=False)
            
            print(f"    ✅ 备份了 {len(storage_records)} 个存储记录")
            print(f"    ✅ 备份了 {len(quota_records)} 个配额记录")
    
    def _create_backup_info(self, backup_dir):
        """创建备份信息文件"""
        backup_info = {
            'backup_time': datetime.now().isoformat(),
            'backup_version': '1.0',
            'app_version': self.app.config.get('APP_VERSION', 'unknown'),
            'storage_root': str(self.storage_root),
            'backup_type': 'full',
            'created_by': 'storage_backup.py'
        }
        
        info_file = backup_dir / 'backup_info.json'
        with open(info_file, 'w', encoding='utf-8') as f:
            json.dump(backup_info, f, indent=2, ensure_ascii=False)
    
    def _compress_backup(self, backup_dir):
        """压缩备份目录"""
        print("  🗜️ 压缩备份...")
        
        archive_path = backup_dir.with_suffix('.tar.gz')
        
        with tarfile.open(archive_path, 'w:gz') as tar:
            tar.add(backup_dir, arcname=backup_dir.name)
        
        backup_size = archive_path.stat().st_size
        print(f"    ✅ 压缩完成，大小: {format_file_size(backup_size)}")
        
        return archive_path
    
    def restore_backup(self, backup_path):
        """恢复备份"""
        backup_path = Path(backup_path)
        
        if not backup_path.exists():
            raise FileNotFoundError(f"备份文件不存在: {backup_path}")
        
        print(f"🔄 恢复备份: {backup_path}")
        
        # 创建临时目录
        temp_dir = self.backup_root / f"restore_temp_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        temp_dir.mkdir(exist_ok=True)
        
        try:
            # 解压备份
            print("  📦 解压备份文件...")
            with tarfile.open(backup_path, 'r:gz') as tar:
                tar.extractall(temp_dir)
            
            # 找到备份目录
            backup_dirs = [d for d in temp_dir.iterdir() if d.is_dir()]
            if not backup_dirs:
                raise ValueError("备份文件格式错误")
            
            backup_content_dir = backup_dirs[0]
            
            # 验证备份
            self._validate_backup(backup_content_dir)
            
            # 恢复文件
            self._restore_files(backup_content_dir)
            
            # 恢复数据库记录
            self._restore_database_records(backup_content_dir)
            
            print("✅ 备份恢复完成")
            
        finally:
            # 清理临时目录
            shutil.rmtree(temp_dir, ignore_errors=True)
    
    def _validate_backup(self, backup_dir):
        """验证备份完整性"""
        print("  🔍 验证备份完整性...")
        
        required_files = ['backup_info.json', 'database_records.json']
        required_dirs = ['files']
        
        for file_name in required_files:
            if not (backup_dir / file_name).exists():
                raise ValueError(f"备份文件缺失: {file_name}")
        
        for dir_name in required_dirs:
            if not (backup_dir / dir_name).exists():
                raise ValueError(f"备份目录缺失: {dir_name}")
        
        print("    ✅ 备份完整性验证通过")
    
    def _restore_files(self, backup_dir):
        """恢复文件"""
        print("  📁 恢复文件...")
        
        files_dir = backup_dir / 'files'
        
        # 备份当前文件（如果存在）
        if self.storage_root.exists():
            backup_current = self.backup_root / f"current_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            shutil.copytree(self.storage_root, backup_current, dirs_exist_ok=True)
            print(f"    💾 当前文件已备份到: {backup_current}")
        
        # 恢复文件
        restore_dirs = ['uploads', 'avatars', 'challenges']
        
        for dir_name in restore_dirs:
            source_dir = files_dir / dir_name
            target_dir = self.storage_root / dir_name
            
            if source_dir.exists():
                if target_dir.exists():
                    shutil.rmtree(target_dir)
                
                shutil.copytree(source_dir, target_dir)
                print(f"    ✅ 恢复目录: {dir_name}")
    
    def _restore_database_records(self, backup_dir):
        """恢复数据库记录"""
        print("  🗄️ 恢复数据库记录...")
        
        db_backup_file = backup_dir / 'database_records.json'
        
        with open(db_backup_file, 'r', encoding='utf-8') as f:
            db_backup = json.load(f)
        
        with self.app.app_context():
            # 清空现有记录
            UserStorage.query.delete()
            UserStorageQuota.query.delete()
            
            # 恢复存储记录
            for record_data in db_backup['storage_records']:
                record = UserStorage(
                    user_id=record_data['user_id'],
                    file_name=record_data['file_name'],
                    file_size=record_data['file_size'],
                    file_type=record_data['file_type'],
                    file_path=record_data['file_path'],
                    upload_purpose=record_data['upload_purpose'],
                    is_deleted=record_data['is_deleted']
                )
                
                if record_data['created_at']:
                    record.created_at = datetime.fromisoformat(record_data['created_at'])
                
                db.session.add(record)
            
            # 恢复配额记录
            for quota_data in db_backup['quota_records']:
                quota = UserStorageQuota(
                    user_id=quota_data['user_id'],
                    total_quota=quota_data['total_quota'],
                    used_quota=quota_data['used_quota'],
                    purchased_quota=quota_data['purchased_quota']
                )
                
                if quota_data['updated_at']:
                    quota.updated_at = datetime.fromisoformat(quota_data['updated_at'])
                
                db.session.add(quota)
            
            db.session.commit()
            
            print(f"    ✅ 恢复了 {len(db_backup['storage_records'])} 个存储记录")
            print(f"    ✅ 恢复了 {len(db_backup['quota_records'])} 个配额记录")
    
    def list_backups(self):
        """列出所有备份"""
        print("📋 备份列表:")
        
        backup_files = list(self.backup_root.glob('*.tar.gz'))
        backup_files.sort(key=lambda x: x.stat().st_mtime, reverse=True)
        
        if not backup_files:
            print("  📭 没有找到备份文件")
            return
        
        for backup_file in backup_files:
            stat = backup_file.stat()
            size = format_file_size(stat.st_size)
            mtime = datetime.fromtimestamp(stat.st_mtime).strftime('%Y-%m-%d %H:%M:%S')
            
            print(f"  📦 {backup_file.name}")
            print(f"     大小: {size}")
            print(f"     时间: {mtime}")
            print()
    
    def cleanup_old_backups(self, retention_days=30):
        """清理旧备份"""
        print(f"🧹 清理 {retention_days} 天前的备份...")
        
        cutoff_time = datetime.now() - timedelta(days=retention_days)
        backup_files = list(self.backup_root.glob('*.tar.gz'))
        
        cleaned_count = 0
        freed_space = 0
        
        for backup_file in backup_files:
            mtime = datetime.fromtimestamp(backup_file.stat().st_mtime)
            
            if mtime < cutoff_time:
                size = backup_file.stat().st_size
                backup_file.unlink()
                
                cleaned_count += 1
                freed_space += size
                
                print(f"  🗑️ 删除备份: {backup_file.name}")
        
        print(f"✅ 清理了 {cleaned_count} 个备份，释放空间: {format_file_size(freed_space)}")


def main():
    """主函数"""
    backup = StorageBackup()
    
    if len(sys.argv) < 2:
        print("用法: python storage_backup.py [create|restore|list|cleanup] [参数]")
        return
    
    command = sys.argv[1]
    
    if command == 'create':
        backup_name = sys.argv[2] if len(sys.argv) > 2 else None
        backup.create_backup(backup_name)
    
    elif command == 'restore':
        if len(sys.argv) < 3:
            print("用法: python storage_backup.py restore <backup_file>")
            return
        backup.restore_backup(sys.argv[2])
    
    elif command == 'list':
        backup.list_backups()
    
    elif command == 'cleanup':
        retention_days = int(sys.argv[2]) if len(sys.argv) > 2 else 30
        backup.cleanup_old_backups(retention_days)
    
    else:
        print("未知命令:", command)


if __name__ == '__main__':
    main()
