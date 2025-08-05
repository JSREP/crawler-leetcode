#!/usr/bin/env python3
"""
存储系统设置脚本
"""
import os
import sys
from pathlib import Path

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models import UserStorageQuota


class StorageSetup:
    def __init__(self):
        self.app = create_app()
        
    def setup_storage_directories(self):
        """设置存储目录结构"""
        print("📁 设置存储目录结构...")
        
        storage_root = Path(self.app.config['UPLOAD_FOLDER'])
        
        # 创建主要目录
        directories = [
            storage_root,
            storage_root / 'uploads',
            storage_root / 'avatars',
            storage_root / 'challenges',
            storage_root / 'temp',
            storage_root / 'backups'
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
            print(f"  ✅ 创建目录: {directory}")
            
            # 设置目录权限
            try:
                os.chmod(directory, 0o755)
            except OSError as e:
                print(f"  ⚠️ 设置权限失败 {directory}: {e}")
        
        # 创建.gitkeep文件保持目录结构
        for directory in directories[1:]:  # 跳过根目录
            gitkeep_file = directory / '.gitkeep'
            if not gitkeep_file.exists():
                gitkeep_file.touch()
                print(f"  📝 创建.gitkeep: {gitkeep_file}")
    
    def create_storage_config(self):
        """创建存储配置文件"""
        print("\n⚙️ 创建存储配置文件...")
        
        config_content = f"""# 存储系统配置文件
# 生成时间: {os.popen('date').read().strip()}

# 存储根目录
STORAGE_ROOT={self.app.config['UPLOAD_FOLDER']}

# 最大文件大小 (字节)
MAX_FILE_SIZE={self.app.config.get('MAX_CONTENT_LENGTH', 16 * 1024 * 1024)}

# 允许的文件扩展名
ALLOWED_EXTENSIONS={','.join(self.app.config.get('ALLOWED_EXTENSIONS', set()))}

# 默认存储配额 (字节)
DEFAULT_QUOTA=104857600

# 缩略图设置
THUMBNAIL_SIZE=200x200
THUMBNAIL_QUALITY=85

# 清理设置
CLEANUP_INTERVAL_HOURS=24
TEMP_FILE_RETENTION_HOURS=24

# 备份设置
BACKUP_ENABLED=true
BACKUP_RETENTION_DAYS=30
"""
        
        config_file = Path(self.app.config['UPLOAD_FOLDER']) / 'storage.conf'
        with open(config_file, 'w', encoding='utf-8') as f:
            f.write(config_content)
        
        print(f"  ✅ 配置文件已创建: {config_file}")
    
    def setup_default_quotas(self):
        """设置默认存储配额"""
        print("\n💾 设置默认存储配额...")
        
        with self.app.app_context():
            # 检查是否有用户没有配额记录
            from app.models import User
            
            users_without_quota = db.session.query(User).outerjoin(
                UserStorageQuota, User.id == UserStorageQuota.user_id
            ).filter(UserStorageQuota.user_id.is_(None)).all()
            
            created_count = 0
            
            for user in users_without_quota:
                quota = UserStorageQuota(
                    user_id=user.id,
                    total_quota=104857600,  # 100MB
                    used_quota=0,
                    purchased_quota=0
                )
                db.session.add(quota)
                created_count += 1
                print(f"  ✅ 为用户 {user.username} 创建默认配额")
            
            if created_count > 0:
                db.session.commit()
                print(f"  📊 共创建了 {created_count} 个默认配额记录")
            else:
                print("  ℹ️ 所有用户都已有配额记录")
    
    def create_nginx_config(self):
        """创建Nginx配置示例"""
        print("\n🌐 创建Nginx配置示例...")
        
        storage_root = self.app.config['UPLOAD_FOLDER']
        
        nginx_config = f"""# Nginx配置示例 - 静态文件服务
# 将此配置添加到你的Nginx server块中

# 静态文件服务
location /storage/files/ {{
    alias {storage_root}/;
    
    # 安全设置
    location ~ \\.php$ {{
        deny all;
    }}
    
    # 缓存设置
    expires 1y;
    add_header Cache-Control "public, immutable";
    
    # 文件大小限制
    client_max_body_size 16M;
    
    # 错误页面
    error_page 404 /404.html;
}}

# 文件上传代理到Flask
location /storage/upload {{
    proxy_pass http://localhost:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # 上传大小限制
    client_max_body_size 16M;
    
    # 超时设置
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}}

# 安全头设置
add_header X-Content-Type-Options nosniff;
add_header X-Frame-Options DENY;
add_header X-XSS-Protection "1; mode=block";
"""
        
        config_file = Path(self.app.config['UPLOAD_FOLDER']) / 'nginx.conf.example'
        with open(config_file, 'w', encoding='utf-8') as f:
            f.write(nginx_config)
        
        print(f"  ✅ Nginx配置示例已创建: {config_file}")
    
    def create_systemd_service(self):
        """创建systemd服务文件示例"""
        print("\n🔧 创建systemd服务文件示例...")
        
        project_root = Path(__file__).parent.parent
        
        service_content = f"""[Unit]
Description=Crawler LeetCode Storage Maintenance
After=network.target

[Service]
Type=oneshot
User=www-data
Group=www-data
WorkingDirectory={project_root}
Environment=FLASK_ENV=production
ExecStart={sys.executable} scripts/storage_maintenance.py full
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
"""
        
        service_file = Path(self.app.config['UPLOAD_FOLDER']) / 'storage-maintenance.service.example'
        with open(service_file, 'w', encoding='utf-8') as f:
            f.write(service_content)
        
        print(f"  ✅ systemd服务文件已创建: {service_file}")
        print("  💡 安装方法:")
        print(f"     sudo cp {service_file} /etc/systemd/system/storage-maintenance.service")
        print("     sudo systemctl enable storage-maintenance.service")
    
    def create_cron_job(self):
        """创建cron任务示例"""
        print("\n⏰ 创建cron任务示例...")
        
        project_root = Path(__file__).parent.parent
        
        cron_content = f"""# 存储系统维护cron任务
# 每天凌晨2点执行存储维护
0 2 * * * cd {project_root} && {sys.executable} scripts/storage_maintenance.py full >> /var/log/storage-maintenance.log 2>&1

# 每小时清理临时文件
0 * * * * cd {project_root} && {sys.executable} scripts/storage_maintenance.py cleanup >> /var/log/storage-cleanup.log 2>&1
"""
        
        cron_file = Path(self.app.config['UPLOAD_FOLDER']) / 'crontab.example'
        with open(cron_file, 'w', encoding='utf-8') as f:
            f.write(cron_content)
        
        print(f"  ✅ cron任务示例已创建: {cron_file}")
        print("  💡 安装方法:")
        print(f"     crontab -e")
        print(f"     # 然后添加 {cron_file} 中的内容")
    
    def run_setup(self):
        """运行完整设置"""
        print("🚀 开始存储系统设置...\n")
        
        self.setup_storage_directories()
        self.create_storage_config()
        self.setup_default_quotas()
        self.create_nginx_config()
        self.create_systemd_service()
        self.create_cron_job()
        
        print("\n✅ 存储系统设置完成！")
        print("\n📋 后续步骤:")
        print("1. 检查存储目录权限")
        print("2. 配置Nginx静态文件服务（可选）")
        print("3. 设置定期维护任务")
        print("4. 配置备份策略")
    
    def show_status(self):
        """显示存储系统状态"""
        print("📊 存储系统状态:")
        
        storage_root = Path(self.app.config['UPLOAD_FOLDER'])
        
        # 检查目录
        required_dirs = ['uploads', 'avatars', 'challenges', 'temp']
        for dir_name in required_dirs:
            dir_path = storage_root / dir_name
            status = "✅" if dir_path.exists() else "❌"
            print(f"  {status} {dir_name}/")
        
        # 检查配置文件
        config_files = ['storage.conf', 'nginx.conf.example', 'crontab.example']
        for config_file in config_files:
            file_path = storage_root / config_file
            status = "✅" if file_path.exists() else "❌"
            print(f"  {status} {config_file}")
        
        # 存储使用情况
        if storage_root.exists():
            total_size = sum(f.stat().st_size for f in storage_root.rglob('*') if f.is_file())
            file_count = sum(1 for f in storage_root.rglob('*') if f.is_file())
            
            from app.utils.helpers import format_file_size
            print(f"  📁 总文件数: {file_count}")
            print(f"  💾 总大小: {format_file_size(total_size)}")


def main():
    """主函数"""
    setup = StorageSetup()
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == 'status':
            setup.show_status()
        elif command == 'dirs':
            setup.setup_storage_directories()
        elif command == 'quotas':
            setup.setup_default_quotas()
        elif command == 'config':
            setup.create_storage_config()
        elif command == 'nginx':
            setup.create_nginx_config()
        elif command == 'cron':
            setup.create_cron_job()
        else:
            print("用法: python setup_storage.py [status|dirs|quotas|config|nginx|cron]")
    else:
        setup.run_setup()


if __name__ == '__main__':
    main()
