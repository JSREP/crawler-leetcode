#!/usr/bin/env python3
"""
MySQL连接测试脚本
"""
import pymysql
import sys


def test_mysql_connection():
    """测试MySQL连接"""
    print("🔍 测试MySQL连接...")
    print("配置信息:")
    print("   主机: localhost")
    print("   端口: 3306")
    print("   用户: root")
    print("   密码: cC11001100")
    
    try:
        # 测试连接到MySQL服务器
        connection = pymysql.connect(
            host='localhost',
            port=3306,
            user='root',
            password='cC11001100',
            charset='utf8mb4'
        )
        
        print("✅ MySQL服务器连接成功")
        
        with connection.cursor() as cursor:
            # 获取MySQL版本
            cursor.execute("SELECT VERSION() as version")
            version = cursor.fetchone()[0]
            print(f"   MySQL版本: {version}")
            
            # 检查数据库列表
            cursor.execute("SHOW DATABASES")
            databases = [row[0] for row in cursor.fetchall()]
            print(f"   可用数据库: {', '.join(databases)}")
            
            # 检查crawler_leetcode数据库是否存在
            if 'crawler_leetcode' in databases:
                print("✅ crawler_leetcode 数据库已存在")
                
                # 连接到具体数据库
                cursor.execute("USE crawler_leetcode")
                
                # 检查表
                cursor.execute("SHOW TABLES")
                tables = [row[0] for row in cursor.fetchall()]
                
                if tables:
                    print(f"   数据库中的表: {', '.join(tables)}")
                else:
                    print("   数据库为空（无表）")
            else:
                print("⚠️ crawler_leetcode 数据库不存在")
        
        connection.close()
        return True
        
    except pymysql.Error as e:
        print(f"❌ MySQL连接失败: {e}")
        return False
    except Exception as e:
        print(f"❌ 连接测试出错: {e}")
        return False


def test_flask_db_connection():
    """测试Flask应用的数据库连接"""
    print("\n🔍 测试Flask应用数据库连接...")
    
    try:
        import os
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        
        from app import create_app, db
        
        app = create_app()
        with app.app_context():
            # 测试数据库连接
            result = db.session.execute(db.text('SELECT VERSION() as version'))
            version = result.fetchone().version
            
            print(f"✅ Flask数据库连接成功")
            print(f"   通过SQLAlchemy连接的MySQL版本: {version}")
            
            # 测试表查询
            try:
                inspector = db.inspect(db.engine)
                tables = inspector.get_table_names()
                
                if tables:
                    print(f"   数据库表: {', '.join(tables)}")
                else:
                    print("   数据库中没有表")
                    
            except Exception as e:
                print(f"   表查询失败: {e}")
            
            return True
            
    except ImportError as e:
        print(f"❌ 导入Flask应用失败: {e}")
        print("   请确保在backend目录下运行此脚本")
        return False
    except Exception as e:
        print(f"❌ Flask数据库连接失败: {e}")
        return False


def check_dependencies():
    """检查依赖包"""
    print("\n🔍 检查Python依赖包...")
    
    required_packages = [
        ('pymysql', 'PyMySQL'),
        ('sqlalchemy', 'SQLAlchemy'),
        ('flask', 'Flask'),
        ('flask_sqlalchemy', 'Flask-SQLAlchemy'),
    ]
    
    missing_packages = []
    
    for package, display_name in required_packages:
        try:
            __import__(package)
            print(f"   ✅ {display_name}")
        except ImportError:
            print(f"   ❌ {display_name} (未安装)")
            missing_packages.append(display_name)
    
    if missing_packages:
        print(f"\n⚠️ 缺少依赖包: {', '.join(missing_packages)}")
        print("请运行: pip install -r requirements.txt")
        return False
    
    print("✅ 所有依赖包都已安装")
    return True


def main():
    """主函数"""
    print("🚀 MySQL连接测试工具\n")
    
    # 检查依赖
    if not check_dependencies():
        return False
    
    # 测试直接MySQL连接
    if not test_mysql_connection():
        return False
    
    # 测试Flask应用连接
    if not test_flask_db_connection():
        return False
    
    print("\n🎉 所有连接测试通过！")
    print("\n📋 下一步:")
    print("1. 初始化数据库: python scripts/init_database.py")
    print("2. 启动Flask应用: python run.py")
    
    return True


if __name__ == '__main__':
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n⏹️ 测试被用户中断")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 测试过程中出现异常: {e}")
        sys.exit(1)
