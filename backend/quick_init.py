#!/usr/bin/env python3
"""
快速数据库初始化脚本
"""
import os
import sys
import pymysql

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db


def main():
    """主函数"""
    print("🚀 快速初始化数据库...\n")
    
    try:
        # 1. 创建数据库（如果不存在）
        print("📝 创建数据库...")
        connection = pymysql.connect(
            host='localhost',
            port=3306,
            user='root',
            password='cC11001100',
            charset='utf8mb4'
        )
        
        with connection.cursor() as cursor:
            cursor.execute("CREATE DATABASE IF NOT EXISTS crawler_leetcode CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            print("✅ 数据库已创建")
        
        connection.commit()
        connection.close()
        
        # 2. 创建表结构
        print("\n🏗️ 创建表结构...")
        app = create_app()
        with app.app_context():
            db.drop_all()
            db.create_all()
            
            # 验证表创建
            inspector = db.inspect(db.engine)
            tables = inspector.get_table_names()
            print(f"✅ 成功创建 {len(tables)} 个表")
        
        # 3. 测试连接
        print("\n🔍 测试连接...")
        with app.app_context():
            result = db.session.execute(db.text('SELECT VERSION() as version'))
            version = result.fetchone().version
            print(f"✅ 连接成功，MySQL版本: {version}")
        
        print("\n🎉 数据库初始化完成！")
        print("\n📋 下一步:")
        print("1. 启动Flask应用: python run.py")
        print("2. 测试API: python test_api.py")
        
        return True
        
    except Exception as e:
        print(f"❌ 初始化失败: {e}")
        return False


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
