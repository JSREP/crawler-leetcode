#!/usr/bin/env python3
"""
从PostgreSQL迁移数据到MySQL的脚本
"""
import os
import sys
import json
import pymysql
import psycopg2
from datetime import datetime
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# PostgreSQL连接配置
PG_CONFIG = {
    'host': os.getenv('POSTGRES_HOST', 'localhost'),
    'port': int(os.getenv('POSTGRES_PORT', 5432)),
    'database': os.getenv('POSTGRES_DATABASE', 'crawler_leetcode'),
    'user': os.getenv('POSTGRES_USER', 'postgres'),
    'password': os.getenv('POSTGRES_PASSWORD', ''),
}

# MySQL连接配置
MYSQL_CONFIG = {
    'host': os.getenv('MYSQL_HOST', 'localhost'),
    'port': int(os.getenv('MYSQL_PORT', 3306)),
    'database': os.getenv('MYSQL_DATABASE', 'crawler_leetcode'),
    'user': os.getenv('MYSQL_USER', 'root'),
    'password': os.getenv('MYSQL_PASSWORD', ''),
    'charset': 'utf8mb4'
}

class DataMigrator:
    def __init__(self):
        self.pg_conn = None
        self.mysql_conn = None
        
    def connect_databases(self):
        """连接数据库"""
        try:
            # 连接PostgreSQL
            self.pg_conn = psycopg2.connect(**PG_CONFIG)
            print("✅ PostgreSQL连接成功")
            
            # 连接MySQL
            self.mysql_conn = pymysql.connect(**MYSQL_CONFIG)
            print("✅ MySQL连接成功")
            
        except Exception as e:
            print(f"❌ 数据库连接失败: {e}")
            sys.exit(1)
    
    def close_connections(self):
        """关闭数据库连接"""
        if self.pg_conn:
            self.pg_conn.close()
        if self.mysql_conn:
            self.mysql_conn.close()
    
    def migrate_table(self, table_name, field_mapping=None, transform_func=None):
        """迁移单个表"""
        print(f"🔄 迁移表: {table_name}")
        
        try:
            # 从PostgreSQL读取数据
            pg_cursor = self.pg_conn.cursor()
            pg_cursor.execute(f"SELECT * FROM {table_name}")
            columns = [desc[0] for desc in pg_cursor.description]
            rows = pg_cursor.fetchall()
            
            if not rows:
                print(f"⚠️ 表 {table_name} 没有数据")
                return
            
            # 准备MySQL插入语句
            mysql_cursor = self.mysql_conn.cursor()
            
            # 应用字段映射
            if field_mapping:
                mapped_columns = [field_mapping.get(col, col) for col in columns]
            else:
                mapped_columns = columns
            
            placeholders = ', '.join(['%s'] * len(mapped_columns))
            insert_sql = f"INSERT INTO {table_name} ({', '.join(mapped_columns)}) VALUES ({placeholders})"
            
            # 转换和插入数据
            converted_rows = []
            for row in rows:
                if transform_func:
                    row = transform_func(dict(zip(columns, row)))
                    row = tuple(row[col] for col in columns if col in row)
                converted_rows.append(row)
            
            mysql_cursor.executemany(insert_sql, converted_rows)
            self.mysql_conn.commit()
            
            print(f"✅ 表 {table_name} 迁移完成，共 {len(rows)} 条记录")
            
        except Exception as e:
            print(f"❌ 表 {table_name} 迁移失败: {e}")
            self.mysql_conn.rollback()
    
    def transform_challenges(self, row):
        """转换challenges表数据"""
        # 处理tags字段：PostgreSQL的JSON数组转换为MySQL的JSON
        if row.get('tags'):
            if isinstance(row['tags'], str):
                try:
                    # 如果是字符串，尝试解析为JSON
                    tags = json.loads(row['tags'])
                    row['tags'] = json.dumps(tags, ensure_ascii=False)
                except:
                    row['tags'] = json.dumps([row['tags']], ensure_ascii=False)
            elif isinstance(row['tags'], list):
                row['tags'] = json.dumps(row['tags'], ensure_ascii=False)
        
        return row
    
    def transform_user_storage(self, row):
        """转换user_storage表数据"""
        # 将blob_url转换为file_path（本地路径）
        if row.get('blob_url'):
            # 从blob URL提取文件名，生成本地路径
            filename = row['blob_url'].split('/')[-1]
            row['file_path'] = f"storage/uploads/{filename}"
        
        return row
    
    def run_migration(self):
        """执行完整迁移"""
        print("🚀 开始数据迁移...")
        
        self.connect_databases()
        
        try:
            # 清空MySQL表（可选）
            mysql_cursor = self.mysql_conn.cursor()
            tables = [
                'tip_records', 'token_transactions', 'user_wallets',
                'user_storage_quota', 'user_storage', 'forum_replies',
                'forum_posts', 'challenge_comments', 'challenges',
                'user_sessions', 'users'
            ]
            
            for table in tables:
                mysql_cursor.execute(f"DELETE FROM {table}")
                mysql_cursor.execute(f"ALTER TABLE {table} AUTO_INCREMENT = 1")
            
            self.mysql_conn.commit()
            print("🗑️ 清空MySQL表完成")
            
            # 按依赖顺序迁移表
            self.migrate_table('users')
            self.migrate_table('user_sessions')
            self.migrate_table('challenges', transform_func=self.transform_challenges)
            self.migrate_table('challenge_comments')
            self.migrate_table('forum_posts')
            self.migrate_table('forum_replies')
            self.migrate_table('user_storage', 
                             field_mapping={'blob_url': 'file_path'},
                             transform_func=self.transform_user_storage)
            self.migrate_table('user_storage_quota')
            self.migrate_table('user_wallets')
            self.migrate_table('token_transactions')
            self.migrate_table('tip_records')
            
            print("🎉 数据迁移完成！")
            
        except Exception as e:
            print(f"❌ 迁移过程中出错: {e}")
            
        finally:
            self.close_connections()


if __name__ == '__main__':
    migrator = DataMigrator()
    migrator.run_migration()
