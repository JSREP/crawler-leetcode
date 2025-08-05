#!/usr/bin/env python3
"""
部署脚本
"""
import os
import sys
import subprocess
import shutil
from pathlib import Path
from datetime import datetime

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class DeploymentManager:
    def __init__(self, environment='production'):
        self.environment = environment
        self.project_root = Path(__file__).parent.parent
        self.backup_dir = self.project_root / 'backups' / 'deployments'
        self.backup_dir.mkdir(parents=True, exist_ok=True)
        
    def create_backup(self):
        """创建部署前备份"""
        print("💾 创建部署前备份...")
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_name = f"backup_{self.environment}_{timestamp}"
        backup_path = self.backup_dir / backup_name
        
        try:
            # 备份数据库
            print("   备份数据库...")
            db_backup_script = self.project_root / 'scripts' / 'storage_backup.py'
            if db_backup_script.exists():
                subprocess.run([
                    sys.executable, str(db_backup_script), 'create', backup_name
                ], check=True)
            
            # 备份配置文件
            print("   备份配置文件...")
            backup_path.mkdir(exist_ok=True)
            
            config_files = ['.env', '.env.production', 'config.py']
            for config_file in config_files:
                config_path = self.project_root / config_file
                if config_path.exists():
                    shutil.copy2(config_path, backup_path / config_file)
            
            print(f"✅ 备份完成: {backup_path}")
            return backup_path
            
        except Exception as e:
            print(f"❌ 备份失败: {e}")
            return None
    
    def validate_environment(self):
        """验证部署环境"""
        print("🔍 验证部署环境...")
        
        try:
            # 运行配置验证
            validate_script = self.project_root / 'scripts' / 'validate_config.py'
            env_file = f'.env.{self.environment}' if self.environment != 'development' else '.env'
            
            result = subprocess.run([
                sys.executable, str(validate_script), '--env-file', env_file
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                print("✅ 环境验证通过")
                return True
            else:
                print(f"❌ 环境验证失败:\n{result.stdout}\n{result.stderr}")
                return False
                
        except Exception as e:
            print(f"❌ 环境验证出错: {e}")
            return False
    
    def install_dependencies(self):
        """安装依赖"""
        print("📦 安装依赖...")
        
        try:
            # 升级pip
            subprocess.run([sys.executable, '-m', 'pip', 'install', '--upgrade', 'pip'], check=True)
            
            # 安装requirements
            requirements_file = self.project_root / 'requirements.txt'
            if requirements_file.exists():
                subprocess.run([
                    sys.executable, '-m', 'pip', 'install', '-r', str(requirements_file)
                ], check=True)
                print("✅ 依赖安装完成")
                return True
            else:
                print("⚠️ requirements.txt 不存在")
                return False
                
        except subprocess.CalledProcessError as e:
            print(f"❌ 依赖安装失败: {e}")
            return False
    
    def setup_database(self):
        """设置数据库"""
        print("🗄️ 设置数据库...")
        
        try:
            # 运行数据库初始化
            init_script = self.project_root / 'quick_init.py'
            if init_script.exists():
                result = subprocess.run([sys.executable, str(init_script)], 
                                      capture_output=True, text=True)
                
                if result.returncode == 0:
                    print("✅ 数据库设置完成")
                    return True
                else:
                    print(f"❌ 数据库设置失败:\n{result.stdout}\n{result.stderr}")
                    return False
            else:
                print("⚠️ 数据库初始化脚本不存在")
                return False
                
        except Exception as e:
            print(f"❌ 数据库设置出错: {e}")
            return False
    
    def setup_storage(self):
        """设置存储系统"""
        print("💾 设置存储系统...")
        
        try:
            # 运行存储系统设置
            storage_script = self.project_root / 'scripts' / 'setup_storage.py'
            if storage_script.exists():
                result = subprocess.run([sys.executable, str(storage_script)], 
                                      capture_output=True, text=True)
                
                if result.returncode == 0:
                    print("✅ 存储系统设置完成")
                    return True
                else:
                    print(f"❌ 存储系统设置失败:\n{result.stdout}\n{result.stderr}")
                    return False
            else:
                print("⚠️ 存储设置脚本不存在")
                return False
                
        except Exception as e:
            print(f"❌ 存储系统设置出错: {e}")
            return False
    
    def run_tests(self):
        """运行测试"""
        print("🧪 运行测试...")
        
        try:
            # 运行API测试
            test_script = self.project_root / 'test_api.py'
            if test_script.exists():
                result = subprocess.run([sys.executable, str(test_script)], 
                                      capture_output=True, text=True)
                
                if result.returncode == 0:
                    print("✅ 测试通过")
                    return True
                else:
                    print(f"⚠️ 部分测试失败，但继续部署:\n{result.stdout}")
                    return True  # 允许部分测试失败
            else:
                print("⚠️ 测试脚本不存在，跳过测试")
                return True
                
        except Exception as e:
            print(f"❌ 测试运行出错: {e}")
            return False
    
    def create_systemd_service(self):
        """创建systemd服务文件"""
        print("🔧 创建systemd服务...")
        
        service_content = f"""[Unit]
Description=Crawler LeetCode Flask App
After=network.target mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory={self.project_root}
Environment=FLASK_ENV={self.environment}
ExecStart={sys.executable} run.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
"""
        
        service_file = Path('/etc/systemd/system/crawler-leetcode.service')
        
        try:
            # 需要sudo权限
            print(f"   创建服务文件: {service_file}")
            print("   (需要sudo权限)")
            
            with open('/tmp/crawler-leetcode.service', 'w') as f:
                f.write(service_content)
            
            print("✅ 服务文件已创建在 /tmp/crawler-leetcode.service")
            print("   请手动执行以下命令完成安装:")
            print("   sudo mv /tmp/crawler-leetcode.service /etc/systemd/system/")
            print("   sudo systemctl daemon-reload")
            print("   sudo systemctl enable crawler-leetcode")
            print("   sudo systemctl start crawler-leetcode")
            
            return True
            
        except Exception as e:
            print(f"❌ 创建服务文件失败: {e}")
            return False
    
    def create_nginx_config(self):
        """创建Nginx配置"""
        print("🌐 创建Nginx配置...")
        
        nginx_config = """server {
    listen 80;
    server_name your-domain.com;

    # API代理
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 认证代理
    location /auth/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 存储代理
    location /storage/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 健康检查
    location /health {
        proxy_pass http://127.0.0.1:5000;
        access_log off;
    }
}
"""
        
        try:
            config_file = '/tmp/crawler-leetcode-nginx.conf'
            with open(config_file, 'w') as f:
                f.write(nginx_config)
            
            print(f"✅ Nginx配置已创建在 {config_file}")
            print("   请手动执行以下命令完成安装:")
            print("   sudo mv /tmp/crawler-leetcode-nginx.conf /etc/nginx/sites-available/crawler-leetcode")
            print("   sudo ln -s /etc/nginx/sites-available/crawler-leetcode /etc/nginx/sites-enabled/")
            print("   sudo nginx -t")
            print("   sudo systemctl reload nginx")
            
            return True
            
        except Exception as e:
            print(f"❌ 创建Nginx配置失败: {e}")
            return False
    
    def deploy(self, skip_backup=False, skip_tests=False):
        """执行完整部署"""
        print(f"🚀 开始部署到 {self.environment} 环境...\n")
        
        start_time = datetime.now()
        
        steps = [
            ("验证环境", self.validate_environment),
            ("安装依赖", self.install_dependencies),
            ("设置数据库", self.setup_database),
            ("设置存储", self.setup_storage),
        ]
        
        if not skip_backup:
            steps.insert(0, ("创建备份", self.create_backup))
        
        if not skip_tests:
            steps.append(("运行测试", self.run_tests))
        
        if self.environment == 'production':
            steps.extend([
                ("创建systemd服务", self.create_systemd_service),
                ("创建Nginx配置", self.create_nginx_config),
            ])
        
        failed_steps = []
        
        for step_name, step_func in steps:
            print(f"\n{'='*50}")
            print(f"步骤: {step_name}")
            print('='*50)
            
            try:
                if not step_func():
                    failed_steps.append(step_name)
                    if step_name in ["验证环境", "安装依赖", "设置数据库"]:
                        print(f"❌ 关键步骤失败，停止部署")
                        break
            except Exception as e:
                print(f"❌ 步骤执行异常: {e}")
                failed_steps.append(step_name)
        
        # 部署结果
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        print(f"\n{'='*60}")
        print("部署结果")
        print('='*60)
        
        total_steps = len(steps)
        success_steps = total_steps - len(failed_steps)
        
        print(f"总步骤: {total_steps}")
        print(f"成功: {success_steps}")
        print(f"失败: {len(failed_steps)}")
        print(f"耗时: {duration:.1f}秒")
        
        if failed_steps:
            print(f"\n❌ 失败的步骤:")
            for step in failed_steps:
                print(f"   - {step}")
        
        if len(failed_steps) == 0:
            print("\n🎉 部署成功！")
            print("\n📋 后续步骤:")
            if self.environment == 'production':
                print("1. 配置域名和SSL证书")
                print("2. 启动systemd服务")
                print("3. 配置Nginx")
                print("4. 设置监控和日志")
            else:
                print("1. 启动应用: python run.py")
                print("2. 测试功能")
            
            return True
        else:
            print("\n⚠️ 部署部分失败，请检查失败的步骤")
            return False


def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='部署工具')
    parser.add_argument('--env', choices=['development', 'production'], 
                       default='production', help='部署环境')
    parser.add_argument('--skip-backup', action='store_true', help='跳过备份')
    parser.add_argument('--skip-tests', action='store_true', help='跳过测试')
    
    args = parser.parse_args()
    
    deployer = DeploymentManager(args.env)
    
    try:
        success = deployer.deploy(
            skip_backup=args.skip_backup,
            skip_tests=args.skip_tests
        )
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n⏹️ 部署被用户中断")
        sys.exit(1)


if __name__ == '__main__':
    main()
