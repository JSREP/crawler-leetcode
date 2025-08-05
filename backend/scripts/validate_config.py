#!/usr/bin/env python3
"""
配置验证脚本
"""
import os
import sys
import secrets
from pathlib import Path

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class ConfigValidator:
    def __init__(self):
        self.errors = []
        self.warnings = []
        
    def validate_required_vars(self):
        """验证必需的环境变量"""
        print("🔍 验证必需的环境变量...")
        
        required_vars = [
            'SECRET_KEY',
            'MYSQL_HOST',
            'MYSQL_USER', 
            'MYSQL_PASSWORD',
            'MYSQL_DATABASE'
        ]
        
        missing_vars = []
        weak_vars = []
        
        for var in required_vars:
            value = os.environ.get(var)
            if not value:
                missing_vars.append(var)
            elif var in ['SECRET_KEY', 'JWT_SECRET_KEY'] and len(value) < 32:
                weak_vars.append(var)
        
        if missing_vars:
            self.errors.append(f"缺少必需的环境变量: {', '.join(missing_vars)}")
        
        if weak_vars:
            self.warnings.append(f"密钥长度不足（建议32字符以上）: {', '.join(weak_vars)}")
        
        if not missing_vars and not weak_vars:
            print("✅ 所有必需的环境变量都已设置")
        
        return len(missing_vars) == 0
    
    def validate_database_config(self):
        """验证数据库配置"""
        print("\n🗄️ 验证数据库配置...")
        
        try:
            import pymysql
            
            host = os.environ.get('MYSQL_HOST', 'localhost')
            port = int(os.environ.get('MYSQL_PORT', 3306))
            user = os.environ.get('MYSQL_USER', 'root')
            password = os.environ.get('MYSQL_PASSWORD', '')
            database = os.environ.get('MYSQL_DATABASE', 'crawler_leetcode')
            
            # 测试连接
            connection = pymysql.connect(
                host=host,
                port=port,
                user=user,
                password=password,
                charset='utf8mb4'
            )
            
            with connection.cursor() as cursor:
                # 检查数据库是否存在
                cursor.execute(f"SHOW DATABASES LIKE '{database}'")
                result = cursor.fetchone()
                
                if result:
                    print(f"✅ 数据库连接成功，数据库 '{database}' 存在")
                else:
                    self.warnings.append(f"数据库 '{database}' 不存在，需要创建")
            
            connection.close()
            return True
            
        except ImportError:
            self.errors.append("PyMySQL库未安装")
            return False
        except Exception as e:
            self.errors.append(f"数据库连接失败: {e}")
            return False
    
    def validate_storage_config(self):
        """验证存储配置"""
        print("\n💾 验证存储配置...")
        
        upload_folder = os.environ.get('UPLOAD_FOLDER', './storage')
        upload_path = Path(upload_folder)
        
        try:
            # 检查目录是否存在
            if not upload_path.exists():
                upload_path.mkdir(parents=True, exist_ok=True)
                print(f"✅ 创建存储目录: {upload_path}")
            else:
                print(f"✅ 存储目录存在: {upload_path}")
            
            # 检查写权限
            test_file = upload_path / 'test_write.tmp'
            try:
                test_file.write_text('test')
                test_file.unlink()
                print("✅ 存储目录可写")
            except Exception as e:
                self.errors.append(f"存储目录无写权限: {e}")
                return False
            
            # 检查子目录
            subdirs = ['uploads', 'avatars', 'challenges', 'temp']
            for subdir in subdirs:
                subdir_path = upload_path / subdir
                subdir_path.mkdir(exist_ok=True)
                print(f"✅ 子目录: {subdir}")
            
            return True
            
        except Exception as e:
            self.errors.append(f"存储配置验证失败: {e}")
            return False
    
    def validate_github_oauth(self):
        """验证GitHub OAuth配置"""
        print("\n🔐 验证GitHub OAuth配置...")
        
        client_id = os.environ.get('GITHUB_CLIENT_ID')
        client_secret = os.environ.get('GITHUB_CLIENT_SECRET')
        redirect_uri = os.environ.get('GITHUB_REDIRECT_URI')
        
        if not client_id or not client_secret:
            self.warnings.append("GitHub OAuth未配置，认证功能将不可用")
            return False
        
        if not redirect_uri:
            self.warnings.append("GitHub重定向URI未设置，使用默认值")
        
        print("✅ GitHub OAuth配置完整")
        return True
    
    def validate_cors_config(self):
        """验证CORS配置"""
        print("\n🌐 验证CORS配置...")
        
        cors_origins = os.environ.get('CORS_ORIGINS', 'http://localhost:3000')
        origins = [origin.strip() for origin in cors_origins.split(',')]
        
        print(f"✅ CORS允许的源: {', '.join(origins)}")
        
        # 检查是否包含生产域名
        has_localhost = any('localhost' in origin for origin in origins)
        has_production = any('localhost' not in origin and 'http' in origin for origin in origins)
        
        if has_localhost and not has_production:
            self.warnings.append("CORS配置只包含localhost，生产环境可能需要添加实际域名")
        
        return True
    
    def validate_flask_config(self):
        """验证Flask配置"""
        print("\n🌶️ 验证Flask配置...")
        
        flask_env = os.environ.get('FLASK_ENV', 'development')
        flask_debug = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
        
        print(f"✅ Flask环境: {flask_env}")
        print(f"✅ Debug模式: {flask_debug}")
        
        if flask_env == 'production' and flask_debug:
            self.warnings.append("生产环境不应启用Debug模式")
        
        return True
    
    def generate_secure_keys(self):
        """生成安全密钥"""
        print("\n🔑 生成安全密钥...")
        
        secret_key = secrets.token_urlsafe(32)
        jwt_secret = secrets.token_urlsafe(32)
        
        print("建议的密钥配置:")
        print(f"SECRET_KEY={secret_key}")
        print(f"JWT_SECRET_KEY={jwt_secret}")
        
        return secret_key, jwt_secret
    
    def validate_all(self):
        """运行所有验证"""
        print("🚀 开始配置验证...\n")
        
        validations = [
            self.validate_required_vars,
            self.validate_database_config,
            self.validate_storage_config,
            self.validate_github_oauth,
            self.validate_cors_config,
            self.validate_flask_config,
        ]
        
        success_count = 0
        
        for validation in validations:
            try:
                if validation():
                    success_count += 1
            except Exception as e:
                self.errors.append(f"验证过程出错: {e}")
        
        # 显示结果
        print(f"\n{'='*60}")
        print("配置验证结果")
        print('='*60)
        
        print(f"验证项目: {len(validations)}")
        print(f"通过: {success_count}")
        print(f"失败: {len(validations) - success_count}")
        
        if self.errors:
            print(f"\n❌ 错误 ({len(self.errors)}):")
            for error in self.errors:
                print(f"   - {error}")
        
        if self.warnings:
            print(f"\n⚠️ 警告 ({len(self.warnings)}):")
            for warning in self.warnings:
                print(f"   - {warning}")
        
        if not self.errors and not self.warnings:
            print("\n🎉 所有配置验证通过！")
            return True
        elif not self.errors:
            print("\n✅ 配置基本正确，但有一些警告需要注意")
            return True
        else:
            print("\n❌ 配置验证失败，请修复错误后重试")
            return False


def load_env_file(env_file='.env'):
    """加载环境变量文件"""
    env_path = Path(env_file)
    
    if not env_path.exists():
        print(f"⚠️ 环境变量文件不存在: {env_file}")
        return False
    
    print(f"📁 加载环境变量文件: {env_file}")
    
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ[key] = value
    
    return True


def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='配置验证工具')
    parser.add_argument('--env-file', default='.env', help='环境变量文件路径')
    parser.add_argument('--generate-keys', action='store_true', help='生成安全密钥')
    
    args = parser.parse_args()
    
    # 加载环境变量文件
    if args.env_file:
        load_env_file(args.env_file)
    
    validator = ConfigValidator()
    
    if args.generate_keys:
        validator.generate_secure_keys()
        return
    
    try:
        success = validator.validate_all()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n⏹️ 验证被用户中断")
        sys.exit(1)


if __name__ == '__main__':
    main()
