#!/usr/bin/env python3
"""
数据库初始化脚本
"""
import os
import sys
import pymysql
from pathlib import Path

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models import *


def create_database_if_not_exists():
    """创建数据库（如果不存在）"""
    print("🔍 检查数据库是否存在...")
    
    try:
        # 连接到MySQL服务器（不指定数据库）
        connection = pymysql.connect(
            host='localhost',
            port=3306,
            user='root',
            password='cC11001100',
            charset='utf8mb4'
        )
        
        with connection.cursor() as cursor:
            # 检查数据库是否存在
            cursor.execute("SHOW DATABASES LIKE 'crawler_leetcode'")
            result = cursor.fetchone()
            
            if result:
                print("✅ 数据库 'crawler_leetcode' 已存在")
            else:
                print("📝 创建数据库 'crawler_leetcode'...")
                cursor.execute("""
                    CREATE DATABASE crawler_leetcode 
                    CHARACTER SET utf8mb4 
                    COLLATE utf8mb4_unicode_ci
                """)
                print("✅ 数据库创建成功")
        
        connection.commit()
        connection.close()
        return True
        
    except Exception as e:
        print(f"❌ 数据库操作失败: {e}")
        return False


def test_connection():
    """测试数据库连接"""
    print("🔍 测试数据库连接...")
    
    try:
        app = create_app()
        with app.app_context():
            # 测试连接
            result = db.session.execute(db.text('SELECT VERSION() as version'))
            version = result.fetchone().version
            
            print(f"✅ 连接成功，MySQL版本: {version}")
            return True
            
    except Exception as e:
        print(f"❌ 连接失败: {e}")
        return False


def create_tables():
    """创建数据表"""
    print("🏗️ 创建数据表...")
    
    try:
        app = create_app()
        with app.app_context():
            # 删除所有表（如果存在）
            db.drop_all()
            print("   清理现有表")
            
            # 创建所有表
            db.create_all()
            print("   创建新表")
            
            # 验证表创建
            inspector = db.inspect(db.engine)
            tables = inspector.get_table_names()
            
            print(f"✅ 成功创建 {len(tables)} 个表:")
            for table in sorted(tables):
                print(f"   - {table}")
            
            return True
            
    except Exception as e:
        print(f"❌ 创建表失败: {e}")
        return False


def create_sample_data():
    """创建示例数据"""
    print("📝 创建示例数据...")

    try:
        app = create_app()
        with app.app_context():
            # 创建示例用户
            sample_user = User(
                github_id=123456,
                username='demo_user',
                email='demo@example.com',
                name='演示用户',
                role='user'
            )
            db.session.add(sample_user)
            db.session.flush()  # 获取用户ID
            
            # 创建示例挑战
            sample_challenge = Challenge(
                id_alias='demo-challenge',
                name='演示挑战',
                name_en='Demo Challenge',
                platform='demo',
                difficulty_level=3,
                description_markdown='这是一个演示挑战',
                description_markdown_en='This is a demo challenge',
                base64_url='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
            )
            db.session.add(sample_challenge)
            
            # 创建存储配额
            sample_quota = UserStorageQuota(
                user_id=sample_user.id,
                total_quota=104857600,  # 100MB
                used_quota=0,
                purchased_quota=0
            )
            db.session.add(sample_quota)
            
            db.session.commit()
            
            print("✅ 示例数据创建成功:")
            print(f"   - 用户: {sample_user.username}")
            print(f"   - 挑战: {sample_challenge.name}")
            print(f"   - 存储配额: {sample_quota.total_quota} 字节")
            
            return True
            
    except Exception as e:
        db.session.rollback()
        print(f"❌ 创建示例数据失败: {e}")
        return False


def verify_setup():
    """验证设置"""
    print("🔍 验证数据库设置...")
    
    try:
        app = create_app()
        with app.app_context():
            # 统计记录数
            user_count = User.query.count()
            challenge_count = Challenge.query.count()
            quota_count = UserStorageQuota.query.count()
            
            print("📊 数据库统计:")
            print(f"   用户数: {user_count}")
            print(f"   挑战数: {challenge_count}")
            print(f"   配额记录数: {quota_count}")
            
            # 测试查询
            if user_count > 0:
                first_user = User.query.first()
                print(f"   第一个用户: {first_user.username}")
            
            if challenge_count > 0:
                first_challenge = Challenge.query.first()
                print(f"   第一个挑战: {first_challenge.name}")
            
            print("✅ 数据库设置验证通过")
            return True
            
    except Exception as e:
        print(f"❌ 验证失败: {e}")
        return False


def main():
    """主函数"""
    print("🚀 开始初始化数据库...\n")
    
    steps = [
        ("创建数据库", create_database_if_not_exists),
        ("测试连接", test_connection),
        ("创建表结构", create_tables),
        ("创建示例数据", create_sample_data),
        ("验证设置", verify_setup),
    ]
    
    for step_name, step_func in steps:
        print(f"\n{'='*50}")
        print(f"步骤: {step_name}")
        print('='*50)
        
        if not step_func():
            print(f"\n❌ 步骤 '{step_name}' 失败，初始化中止")
            return False
    
    print(f"\n🎉 数据库初始化完成！")
    print("\n📋 后续步骤:")
    print("1. 启动Flask应用: python run.py")
    print("2. 测试API: python test_api.py")
    print("3. 运行完整测试: python run_tests.py")
    
    return True


if __name__ == '__main__':
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n⏹️ 初始化被用户中断")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 初始化过程中出现异常: {e}")
        sys.exit(1)
