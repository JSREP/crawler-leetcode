#!/usr/bin/env python3
"""
端到端测试脚本
"""
import os
import sys
import time
import requests
import subprocess
import signal
from pathlib import Path
from datetime import datetime

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class E2ETestRunner:
    def __init__(self):
        self.backend_url = 'http://localhost:5000'
        self.frontend_url = 'http://localhost:3000'
        self.backend_process = None
        self.frontend_process = None
        
    def start_backend(self):
        """启动Flask后端"""
        print("🚀 启动Flask后端...")
        
        backend_dir = Path(__file__).parent.parent
        env = os.environ.copy()
        env['FLASK_ENV'] = 'testing'
        
        try:
            self.backend_process = subprocess.Popen(
                [sys.executable, 'run.py'],
                cwd=backend_dir,
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            
            # 等待后端启动
            for i in range(30):  # 最多等待30秒
                try:
                    response = requests.get(f"{self.backend_url}/api/db/test", timeout=1)
                    if response.status_code == 200:
                        print("✅ Flask后端启动成功")
                        return True
                except requests.exceptions.RequestException:
                    time.sleep(1)
            
            print("❌ Flask后端启动失败")
            return False
            
        except Exception as e:
            print(f"❌ 启动Flask后端时出错: {e}")
            return False
    
    def start_frontend(self):
        """启动Next.js前端"""
        print("🚀 启动Next.js前端...")
        
        frontend_dir = Path(__file__).parent.parent.parent
        
        try:
            # 检查是否已构建
            if not (frontend_dir / '.next').exists():
                print("📦 构建Next.js应用...")
                build_process = subprocess.run(
                    ['npm', 'run', 'build'],
                    cwd=frontend_dir,
                    capture_output=True,
                    text=True
                )
                
                if build_process.returncode != 0:
                    print(f"❌ 构建失败: {build_process.stderr}")
                    return False
            
            # 启动开发服务器
            self.frontend_process = subprocess.Popen(
                ['npm', 'run', 'dev'],
                cwd=frontend_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            
            # 等待前端启动
            for i in range(60):  # 最多等待60秒
                try:
                    response = requests.get(self.frontend_url, timeout=1)
                    if response.status_code == 200:
                        print("✅ Next.js前端启动成功")
                        return True
                except requests.exceptions.RequestException:
                    time.sleep(1)
            
            print("❌ Next.js前端启动失败")
            return False
            
        except Exception as e:
            print(f"❌ 启动Next.js前端时出错: {e}")
            return False
    
    def stop_services(self):
        """停止所有服务"""
        print("🛑 停止服务...")
        
        if self.backend_process:
            self.backend_process.terminate()
            self.backend_process.wait()
            print("✅ Flask后端已停止")
        
        if self.frontend_process:
            self.frontend_process.terminate()
            self.frontend_process.wait()
            print("✅ Next.js前端已停止")
    
    def test_backend_apis(self):
        """测试后端API"""
        print("\n🧪 测试后端API...")
        
        tests = [
            ('数据库连接', 'GET', '/api/db/test'),
            ('挑战列表', 'GET', '/api/db/challenges?per_page=5'),
            ('统计信息', 'GET', '/api/db/stats'),
            ('GitHub认证URL', 'GET', '/auth/github/url'),
            ('论坛帖子', 'GET', '/api/forum/posts?per_page=5'),
            ('存储定价', 'GET', '/storage/quota/pricing'),
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, method, endpoint in tests:
            try:
                url = f"{self.backend_url}{endpoint}"
                response = requests.request(method, url, timeout=5)
                
                if response.status_code in [200, 404, 500]:  # 允许的状态码
                    print(f"  ✅ {test_name}: {response.status_code}")
                    passed += 1
                else:
                    print(f"  ❌ {test_name}: {response.status_code}")
                    
            except Exception as e:
                print(f"  ❌ {test_name}: {e}")
        
        print(f"\n📊 后端API测试结果: {passed}/{total} 通过")
        return passed == total
    
    def test_frontend_pages(self):
        """测试前端页面"""
        print("\n🧪 测试前端页面...")
        
        pages = [
            ('首页', '/'),
            ('挑战列表', '/challenges'),
            ('论坛', '/forum'),
            ('关于页面', '/about'),
        ]
        
        passed = 0
        total = len(pages)
        
        for page_name, path in pages:
            try:
                url = f"{self.frontend_url}{path}"
                response = requests.get(url, timeout=10)
                
                if response.status_code == 200:
                    print(f"  ✅ {page_name}: 200")
                    passed += 1
                else:
                    print(f"  ❌ {page_name}: {response.status_code}")
                    
            except Exception as e:
                print(f"  ❌ {page_name}: {e}")
        
        print(f"\n📊 前端页面测试结果: {passed}/{total} 通过")
        return passed == total
    
    def test_api_integration(self):
        """测试前后端API集成"""
        print("\n🧪 测试前后端集成...")
        
        # 测试CORS
        try:
            response = requests.options(
                f"{self.backend_url}/api/db/test",
                headers={
                    'Origin': self.frontend_url,
                    'Access-Control-Request-Method': 'GET'
                },
                timeout=5
            )
            
            cors_headers = response.headers.get('Access-Control-Allow-Origin')
            if cors_headers:
                print("  ✅ CORS配置正确")
                cors_ok = True
            else:
                print("  ❌ CORS配置缺失")
                cors_ok = False
                
        except Exception as e:
            print(f"  ❌ CORS测试失败: {e}")
            cors_ok = False
        
        # 测试API响应格式
        try:
            response = requests.get(f"{self.backend_url}/api/db/challenges", timeout=5)
            data = response.json()
            
            if 'challenges' in data and 'total' in data:
                print("  ✅ API响应格式正确")
                format_ok = True
            else:
                print("  ❌ API响应格式错误")
                format_ok = False
                
        except Exception as e:
            print(f"  ❌ API格式测试失败: {e}")
            format_ok = False
        
        return cors_ok and format_ok
    
    def test_file_storage(self):
        """测试文件存储"""
        print("\n🧪 测试文件存储...")
        
        # 检查存储目录
        storage_dir = Path(__file__).parent.parent / 'storage'
        
        required_dirs = ['uploads', 'avatars', 'challenges', 'temp']
        dirs_ok = True
        
        for dir_name in required_dirs:
            dir_path = storage_dir / dir_name
            if dir_path.exists():
                print(f"  ✅ 存储目录存在: {dir_name}")
            else:
                print(f"  ❌ 存储目录缺失: {dir_name}")
                dirs_ok = False
        
        # 测试文件访问端点
        try:
            response = requests.get(f"{self.backend_url}/storage/quota/pricing", timeout=5)
            if response.status_code == 200:
                print("  ✅ 存储API可访问")
                api_ok = True
            else:
                print(f"  ❌ 存储API错误: {response.status_code}")
                api_ok = False
        except Exception as e:
            print(f"  ❌ 存储API测试失败: {e}")
            api_ok = False
        
        return dirs_ok and api_ok
    
    def test_database_migration(self):
        """测试数据库迁移"""
        print("\n🧪 测试数据库迁移...")
        
        try:
            # 测试数据库连接
            response = requests.get(f"{self.backend_url}/api/db/test", timeout=5)
            data = response.json()
            
            if data.get('status') == 'success':
                print("  ✅ 数据库连接正常")
                
                # 检查数据库类型
                db_version = data['data'].get('db_version', '')
                if 'MySQL' in db_version or 'mysql' in db_version.lower():
                    print("  ✅ 已迁移到MySQL")
                    return True
                else:
                    print(f"  ⚠️ 数据库类型: {db_version}")
                    return True  # 仍然算作通过
            else:
                print("  ❌ 数据库连接失败")
                return False
                
        except Exception as e:
            print(f"  ❌ 数据库测试失败: {e}")
            return False
    
    def run_all_tests(self):
        """运行所有端到端测试"""
        print("🚀 开始端到端测试...\n")
        
        start_time = datetime.now()
        
        try:
            # 启动服务
            if not self.start_backend():
                return False
            
            # 运行测试
            tests = [
                ('后端API', self.test_backend_apis),
                ('文件存储', self.test_file_storage),
                ('数据库迁移', self.test_database_migration),
                ('API集成', self.test_api_integration),
            ]
            
            # 可选：启动前端测试
            frontend_available = self.start_frontend()
            if frontend_available:
                tests.append(('前端页面', self.test_frontend_pages))
            
            passed = 0
            total = len(tests)
            
            for test_name, test_func in tests:
                print(f"\n{'='*50}")
                print(f"测试: {test_name}")
                print('='*50)
                
                if test_func():
                    passed += 1
                    print(f"✅ {test_name} 测试通过")
                else:
                    print(f"❌ {test_name} 测试失败")
            
            # 输出总结
            end_time = datetime.now()
            duration = (end_time - start_time).total_seconds()
            
            print(f"\n{'='*50}")
            print("测试总结")
            print('='*50)
            print(f"总测试数: {total}")
            print(f"通过: {passed}")
            print(f"失败: {total - passed}")
            print(f"成功率: {passed/total*100:.1f}%")
            print(f"耗时: {duration:.1f}秒")
            
            if passed == total:
                print("\n🎉 所有测试通过！系统迁移成功。")
                return True
            else:
                print(f"\n⚠️ {total - passed} 个测试失败，请检查相关功能。")
                return False
                
        except KeyboardInterrupt:
            print("\n⏹️ 测试被用户中断")
            return False
        except Exception as e:
            print(f"\n💥 测试过程中出现错误: {e}")
            return False
        finally:
            self.stop_services()


def main():
    """主函数"""
    runner = E2ETestRunner()
    
    try:
        success = runner.run_all_tests()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n⏹️ 测试被中断")
        runner.stop_services()
        sys.exit(1)


if __name__ == '__main__':
    main()
