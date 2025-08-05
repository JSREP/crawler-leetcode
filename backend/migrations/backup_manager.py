#!/usr/bin/env python3
"""
数据库备份管理模块
"""
import os
import re
import subprocess
from datetime import datetime
from pathlib import Path


class BackupManager:
    def __init__(self, app, migration_dir):
        self.app = app
        self.migration_dir = Path(migration_dir)
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
                    match = re.match(r'mysql\+pymysql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)', db_config)
                    if match:
                        user, password, host, port, database = match.groups()
                        
                        # 使用mysqldump备份
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
