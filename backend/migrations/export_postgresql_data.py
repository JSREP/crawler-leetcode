#!/usr/bin/env python3
"""
从PostgreSQL导出数据的脚本
"""
import os
import json
import psycopg2
from datetime import datetime
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# PostgreSQL连接配置（从现有的Next.js项目环境变量读取）
PG_CONFIG = {
    'host': 'ep-rough-darkness-a4wnqhqy.us-east-1.aws.neon.tech',
    'port': 5432,
    'database': 'neondb',
    'user': 'neondb_owner',
    'password': os.getenv('POSTGRES_PASSWORD', ''),  # 需要从.env文件读取
    'sslmode': 'require'
}

class PostgreSQLExporter:
    def __init__(self):
        self.conn = None
        
    def connect(self):
        """连接PostgreSQL数据库"""
        try:
            # 尝试使用DATABASE_URL
            database_url = os.getenv('DATABASE_URL') or os.getenv('POSTGRES_URL')
            if database_url:
                self.conn = psycopg2.connect(database_url)
            else:
                self.conn = psycopg2.connect(**PG_CONFIG)
            print("✅ PostgreSQL连接成功")
        except Exception as e:
            print(f"❌ PostgreSQL连接失败: {e}")
            print("请确保环境变量DATABASE_URL或POSTGRES_URL已正确配置")
            return False
        return True
    
    def export_table_to_json(self, table_name, output_dir='exported_data'):
        """导出表数据到JSON文件"""
        try:
            cursor = self.conn.cursor()
            cursor.execute(f"SELECT * FROM {table_name}")
            columns = [desc[0] for desc in cursor.description]
            rows = cursor.fetchall()
            
            # 转换为字典列表
            data = []
            for row in rows:
                row_dict = {}
                for i, value in enumerate(row):
                    if isinstance(value, datetime):
                        row_dict[columns[i]] = value.isoformat()
                    else:
                        row_dict[columns[i]] = value
                data.append(row_dict)
            
            # 确保输出目录存在
            os.makedirs(output_dir, exist_ok=True)
            
            # 写入JSON文件
            output_file = os.path.join(output_dir, f"{table_name}.json")
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            
            print(f"✅ 表 {table_name} 导出完成: {len(data)} 条记录 -> {output_file}")
            return True
            
        except Exception as e:
            print(f"❌ 导出表 {table_name} 失败: {e}")
            return False
    
    def get_table_list(self):
        """获取数据库中的表列表"""
        try:
            cursor = self.conn.cursor()
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_type = 'BASE TABLE'
                ORDER BY table_name
            """)
            tables = [row[0] for row in cursor.fetchall()]
            return tables
        except Exception as e:
            print(f"❌ 获取表列表失败: {e}")
            return []
    
    def export_all_tables(self):
        """导出所有表"""
        if not self.connect():
            return
        
        try:
            tables = self.get_table_list()
            print(f"📋 发现 {len(tables)} 个表: {', '.join(tables)}")
            
            success_count = 0
            for table in tables:
                if self.export_table_to_json(table):
                    success_count += 1
            
            print(f"🎉 导出完成！成功导出 {success_count}/{len(tables)} 个表")
            
        except Exception as e:
            print(f"❌ 导出过程中出错: {e}")
        finally:
            if self.conn:
                self.conn.close()
    
    def export_schema(self, output_file='exported_data/schema.sql'):
        """导出数据库结构"""
        try:
            cursor = self.conn.cursor()
            
            # 获取所有表的创建语句
            tables = self.get_table_list()
            schema_sql = []
            
            for table in tables:
                cursor.execute(f"""
                    SELECT column_name, data_type, is_nullable, column_default
                    FROM information_schema.columns
                    WHERE table_name = '{table}'
                    ORDER BY ordinal_position
                """)
                columns = cursor.fetchall()
                
                create_sql = f"-- Table: {table}\n"
                create_sql += f"CREATE TABLE {table} (\n"
                
                column_defs = []
                for col in columns:
                    col_name, data_type, is_nullable, default = col
                    col_def = f"  {col_name} {data_type}"
                    if is_nullable == 'NO':
                        col_def += " NOT NULL"
                    if default:
                        col_def += f" DEFAULT {default}"
                    column_defs.append(col_def)
                
                create_sql += ",\n".join(column_defs)
                create_sql += "\n);\n\n"
                schema_sql.append(create_sql)
            
            # 写入文件
            os.makedirs(os.path.dirname(output_file), exist_ok=True)
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write("-- PostgreSQL Schema Export\n")
                f.write(f"-- Generated at: {datetime.now().isoformat()}\n\n")
                f.write("\n".join(schema_sql))
            
            print(f"✅ 数据库结构导出完成: {output_file}")
            
        except Exception as e:
            print(f"❌ 导出数据库结构失败: {e}")


if __name__ == '__main__':
    exporter = PostgreSQLExporter()
    
    print("🚀 开始导出PostgreSQL数据...")
    exporter.export_all_tables()
    
    if exporter.conn:
        exporter.export_schema()
        exporter.conn.close()
