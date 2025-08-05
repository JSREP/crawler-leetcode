#!/usr/bin/env python3
"""
存储系统维护脚本
"""
import os
import sys
import shutil
from datetime import datetime, timedelta
from pathlib import Path

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models import UserStorage, UserStorageQuota
from app.utils.helpers import format_file_size


class StorageMaintenance:
    def __init__(self):
        self.app = create_app()
        self.storage_root = Path(self.app.config['UPLOAD_FOLDER'])
        
    def run_maintenance(self):
        """运行存储维护任务"""
        with self.app.app_context():
            print("🧹 开始存储系统维护...")
            
            # 执行各种维护任务
            self.cleanup_orphaned_files()
            self.cleanup_deleted_records()
            self.update_storage_quotas()
            self.generate_missing_thumbnails()
            self.cleanup_old_temp_files()
            self.optimize_storage_structure()
            
            print("✅ 存储系统维护完成！")
    
    def cleanup_orphaned_files(self):
        """清理孤立文件（数据库中没有记录的文件）"""
        print("\n🔍 清理孤立文件...")
        
        # 获取数据库中所有文件路径
        db_file_paths = set()
        storage_records = UserStorage.query.filter_by(is_deleted=False).all()
        for record in storage_records:
            db_file_paths.add(record.file_path)
        
        orphaned_files = []
        total_size = 0
        
        # 扫描存储目录
        for root, dirs, files in os.walk(self.storage_root):
            for file in files:
                file_path = Path(root) / file
                relative_path = file_path.relative_to(self.storage_root)
                
                # 跳过缩略图文件
                if '_thumb.' in file:
                    continue
                
                # 检查是否在数据库中
                if str(relative_path) not in db_file_paths:
                    orphaned_files.append(file_path)
                    total_size += file_path.stat().st_size
        
        # 删除孤立文件
        for file_path in orphaned_files:
            try:
                file_path.unlink()
                print(f"  删除孤立文件: {file_path}")
                
                # 删除对应的缩略图
                thumbnail_path = self.get_thumbnail_path(file_path)
                if thumbnail_path.exists():
                    thumbnail_path.unlink()
                    
            except Exception as e:
                print(f"  删除失败 {file_path}: {e}")
        
        print(f"✅ 清理了 {len(orphaned_files)} 个孤立文件，释放空间: {format_file_size(total_size)}")
    
    def cleanup_deleted_records(self):
        """清理已删除记录对应的物理文件"""
        print("\n🗑️ 清理已删除记录的文件...")
        
        deleted_records = UserStorage.query.filter_by(is_deleted=True).all()
        cleaned_count = 0
        freed_space = 0
        
        for record in deleted_records:
            file_path = self.storage_root / record.file_path
            
            if file_path.exists():
                try:
                    file_size = file_path.stat().st_size
                    file_path.unlink()
                    freed_space += file_size
                    cleaned_count += 1
                    
                    # 删除缩略图
                    thumbnail_path = self.get_thumbnail_path(file_path)
                    if thumbnail_path.exists():
                        thumbnail_path.unlink()
                    
                    print(f"  删除文件: {record.file_path}")
                    
                except Exception as e:
                    print(f"  删除失败 {record.file_path}: {e}")
            
            # 删除数据库记录
            db.session.delete(record)
        
        db.session.commit()
        print(f"✅ 清理了 {cleaned_count} 个已删除文件，释放空间: {format_file_size(freed_space)}")
    
    def update_storage_quotas(self):
        """更新存储配额使用量"""
        print("\n📊 更新存储配额...")
        
        # 获取所有用户的实际使用量
        from sqlalchemy import func
        usage_stats = db.session.query(
            UserStorage.user_id,
            func.sum(UserStorage.file_size).label('total_used')
        ).filter_by(is_deleted=False).group_by(UserStorage.user_id).all()
        
        updated_count = 0
        
        for user_id, actual_used in usage_stats:
            quota = UserStorageQuota.query.filter_by(user_id=user_id).first()
            
            if quota and quota.used_quota != actual_used:
                old_used = quota.used_quota
                quota.used_quota = actual_used or 0
                quota.updated_at = datetime.utcnow()
                
                print(f"  用户 {user_id}: {format_file_size(old_used)} → {format_file_size(quota.used_quota)}")
                updated_count += 1
        
        db.session.commit()
        print(f"✅ 更新了 {updated_count} 个用户的配额信息")
    
    def generate_missing_thumbnails(self):
        """生成缺失的缩略图"""
        print("\n🖼️ 生成缺失的缩略图...")
        
        image_records = UserStorage.query.filter(
            UserStorage.file_type.like('image/%'),
            UserStorage.is_deleted == False
        ).all()
        
        generated_count = 0
        
        for record in image_records:
            file_path = self.storage_root / record.file_path
            thumbnail_path = self.get_thumbnail_path(file_path)
            
            if file_path.exists() and not thumbnail_path.exists():
                try:
                    self.generate_thumbnail(file_path, thumbnail_path)
                    print(f"  生成缩略图: {record.file_path}")
                    generated_count += 1
                except Exception as e:
                    print(f"  生成失败 {record.file_path}: {e}")
        
        print(f"✅ 生成了 {generated_count} 个缩略图")
    
    def cleanup_old_temp_files(self):
        """清理旧的临时文件"""
        print("\n🧽 清理临时文件...")
        
        temp_dirs = [
            self.storage_root / 'temp',
            self.storage_root / 'tmp',
            Path('/tmp') / 'flask_uploads'
        ]
        
        cutoff_time = datetime.now() - timedelta(hours=24)
        cleaned_count = 0
        
        for temp_dir in temp_dirs:
            if not temp_dir.exists():
                continue
                
            for file_path in temp_dir.rglob('*'):
                if file_path.is_file():
                    try:
                        file_time = datetime.fromtimestamp(file_path.stat().st_mtime)
                        if file_time < cutoff_time:
                            file_path.unlink()
                            cleaned_count += 1
                    except Exception as e:
                        print(f"  清理失败 {file_path}: {e}")
        
        print(f"✅ 清理了 {cleaned_count} 个临时文件")
    
    def optimize_storage_structure(self):
        """优化存储目录结构"""
        print("\n📁 优化存储结构...")
        
        # 确保必要的目录存在
        required_dirs = [
            'uploads',
            'avatars', 
            'challenges',
            'temp'
        ]
        
        for dir_name in required_dirs:
            dir_path = self.storage_root / dir_name
            dir_path.mkdir(exist_ok=True)
            print(f"  确保目录存在: {dir_name}")
        
        # 清理空目录
        empty_dirs = []
        for root, dirs, files in os.walk(self.storage_root, topdown=False):
            for dir_name in dirs:
                dir_path = Path(root) / dir_name
                try:
                    if not any(dir_path.iterdir()):
                        empty_dirs.append(dir_path)
                except OSError:
                    pass
        
        for dir_path in empty_dirs:
            try:
                dir_path.rmdir()
                print(f"  删除空目录: {dir_path}")
            except Exception as e:
                print(f"  删除失败 {dir_path}: {e}")
        
        print(f"✅ 优化完成，删除了 {len(empty_dirs)} 个空目录")
    
    def get_thumbnail_path(self, original_path):
        """获取缩略图路径"""
        parent = original_path.parent
        stem = original_path.stem
        suffix = original_path.suffix
        return parent / f"{stem}_thumb{suffix}"
    
    def generate_thumbnail(self, image_path, thumbnail_path):
        """生成缩略图"""
        try:
            from PIL import Image
            
            with Image.open(image_path) as img:
                # 生成缩略图
                img.thumbnail((200, 200), Image.Resampling.LANCZOS)
                
                # 确保输出目录存在
                thumbnail_path.parent.mkdir(parents=True, exist_ok=True)
                
                # 保存缩略图
                img.save(thumbnail_path, optimize=True, quality=85)
                
        except ImportError:
            print("  警告: PIL/Pillow未安装，跳过缩略图生成")
        except Exception as e:
            raise Exception(f"缩略图生成失败: {e}")
    
    def get_storage_stats(self):
        """获取存储统计信息"""
        print("\n📈 存储统计信息:")
        
        # 总文件数和大小
        total_files = 0
        total_size = 0
        
        for root, dirs, files in os.walk(self.storage_root):
            for file in files:
                file_path = Path(root) / file
                try:
                    total_files += 1
                    total_size += file_path.stat().st_size
                except OSError:
                    pass
        
        print(f"  总文件数: {total_files}")
        print(f"  总大小: {format_file_size(total_size)}")
        
        # 数据库记录统计
        with self.app.app_context():
            active_records = UserStorage.query.filter_by(is_deleted=False).count()
            deleted_records = UserStorage.query.filter_by(is_deleted=True).count()
            
            print(f"  活跃记录: {active_records}")
            print(f"  已删除记录: {deleted_records}")


def main():
    """主函数"""
    maintenance = StorageMaintenance()
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == 'stats':
            maintenance.get_storage_stats()
        elif command == 'cleanup':
            maintenance.cleanup_orphaned_files()
            maintenance.cleanup_deleted_records()
        elif command == 'thumbnails':
            maintenance.generate_missing_thumbnails()
        elif command == 'full':
            maintenance.run_maintenance()
        else:
            print("用法: python storage_maintenance.py [stats|cleanup|thumbnails|full]")
    else:
        maintenance.run_maintenance()


if __name__ == '__main__':
    main()
