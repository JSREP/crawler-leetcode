#!/usr/bin/env python3
"""
将导出的JSON数据导入到MySQL的脚本
"""
import os
import json
import pymysql
from datetime import datetime
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# MySQL连接配置
MYSQL_CONFIG = {
    'host': os.getenv('MYSQL_HOST', 'localhost'),
    'port': int(os.getenv('MYSQL_PORT', 3306)),
    'database': os.getenv('MYSQL_DATABASE', 'crawler_leetcode'),
    'user': os.getenv('MYSQL_USER', 'root'),
    'password': os.getenv('MYSQL_PASSWORD', ''),
    'charset': 'utf8mb4'
}

class MySQLImporter:
    def __init__(self):
        self.conn = None
        
    def connect(self):
        """连接MySQL数据库"""
        try:
            self.conn = pymysql.connect(**MYSQL_CONFIG)
            print("✅ MySQL连接成功")
            return True
        except Exception as e:
            print(f"❌ MySQL连接失败: {e}")
            return False
    
    def import_table_from_json(self, table_name, json_file, field_mapping=None, transform_func=None):
        """从JSON文件导入表数据"""
        try:
            # 读取JSON数据
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            if not data:
                print(f"⚠️ 文件 {json_file} 没有数据")
                return True
            
            cursor = self.conn.cursor()
            
            # 获取第一行数据的字段
            first_row = data[0]
            columns = list(first_row.keys())
            
            # 应用字段映射
            if field_mapping:
                mapped_columns = [field_mapping.get(col, col) for col in columns]
            else:
                mapped_columns = columns
            
            # 准备插入语句
            placeholders = ', '.join(['%s'] * len(mapped_columns))
            insert_sql = f"INSERT INTO {table_name} ({', '.join(mapped_columns)}) VALUES ({placeholders})"
            
            # 转换数据
            rows = []
            for row_data in data:
                if transform_func:
                    row_data = transform_func(row_data)
                
                row = []
                for col in columns:
                    value = row_data.get(col)
                    # 处理日期时间字符串
                    if isinstance(value, str) and 'T' in value and value.endswith('Z'):
                        try:
                            value = datetime.fromisoformat(value.replace('Z', '+00:00'))
                        except:
                            pass
                    row.append(value)
                rows.append(tuple(row))
            
            # 批量插入
            cursor.executemany(insert_sql, rows)
            self.conn.commit()
            
            print(f"✅ 表 {table_name} 导入完成: {len(rows)} 条记录")
            return True
            
        except Exception as e:
            print(f"❌ 导入表 {table_name} 失败: {e}")
            self.conn.rollback()
            return False
    
    def transform_challenges(self, row):
        """转换challenges表数据"""
        # 处理tags字段
        if row.get('tags'):
            if isinstance(row['tags'], list):
                row['tags'] = json.dumps(row['tags'], ensure_ascii=False)
            elif isinstance(row['tags'], str):
                try:
                    # 验证是否为有效JSON
                    json.loads(row['tags'])
                except:
                    # 如果不是有效JSON，包装为数组
                    row['tags'] = json.dumps([row['tags']], ensure_ascii=False)
        
        return row
    
    def transform_user_storage(self, row):
        """转换user_storage表数据"""
        # 将blob_url转换为file_path
        if row.get('blob_url'):
            filename = row['blob_url'].split('/')[-1]
            row['file_path'] = f"storage/uploads/{filename}"
            # 移除blob_url字段，因为MySQL表中没有这个字段
            if 'blob_url' in row:
                del row['blob_url']
        
        return row
    
    def clear_tables(self):
        """清空所有表"""
        try:
            cursor = self.conn.cursor()
            
            # 禁用外键检查
            cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
            
            # 按依赖关系倒序清空表
            tables = [
                'tip_records', 'token_transactions', 'user_wallets',
                'user_storage_quota', 'user_storage', 'forum_replies',
                'forum_posts', 'challenge_comments', 'challenges',
                'user_sessions', 'users'
            ]
            
            for table in tables:
                cursor.execute(f"DELETE FROM {table}")
                cursor.execute(f"ALTER TABLE {table} AUTO_INCREMENT = 1")
            
            # 重新启用外键检查
            cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
            self.conn.commit()
            
            print("🗑️ 清空所有表完成")
            return True
            
        except Exception as e:
            print(f"❌ 清空表失败: {e}")
            return False
    
    def import_all_tables(self, data_dir='exported_data'):
        """导入所有表"""
        if not self.connect():
            return
        
        try:
            # 清空现有数据
            if not self.clear_tables():
                return
            
            # 按依赖顺序导入表
            import_order = [
                ('users', 'users.json'),
                ('user_sessions', 'user_sessions.json'),
                ('challenges', 'challenges.json', None, self.transform_challenges),
                ('challenge_comments', 'challenge_comments.json'),
                ('forum_posts', 'forum_posts.json'),
                ('forum_replies', 'forum_replies.json'),
                ('user_storage', 'user_storage.json', {'blob_url': 'file_path'}, self.transform_user_storage),
                ('user_storage_quota', 'user_storage_quota.json'),
                ('user_wallets', 'user_wallets.json'),
                ('token_transactions', 'token_transactions.json'),
                ('tip_records', 'tip_records.json'),
            ]
            
            success_count = 0
            for item in import_order:
                table_name = item[0]
                json_file = os.path.join(data_dir, item[1])
                field_mapping = item[2] if len(item) > 2 else None
                transform_func = item[3] if len(item) > 3 else None
                
                if os.path.exists(json_file):
                    if self.import_table_from_json(table_name, json_file, field_mapping, transform_func):
                        success_count += 1
                else:
                    print(f"⚠️ 文件不存在: {json_file}")
            
            print(f"🎉 导入完成！成功导入 {success_count} 个表")
            
        except Exception as e:
            print(f"❌ 导入过程中出错: {e}")
        finally:
            if self.conn:
                self.conn.close()


if __name__ == '__main__':
    importer = MySQLImporter()
    
    print("🚀 开始导入数据到MySQL...")
    importer.import_all_tables()
