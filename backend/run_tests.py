#!/usr/bin/env python3
"""
测试运行器 - 统一运行所有测试
"""
import os
import sys
import argparse
import subprocess
from pathlib import Path
from datetime import datetime


class TestRunner:
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.tests_dir = self.project_root / 'tests'
        
    def run_unit_tests(self):
        """运行单元测试"""
        print("🧪 运行单元测试...")
        
        try:
            result = subprocess.run(
                [sys.executable, 'tests/test_integration.py'],
                cwd=self.project_root,
                capture_output=True,
                text=True
            )
            
            print(result.stdout)
            if result.stderr:
                print("错误输出:", result.stderr)
            
            return result.returncode == 0
            
        except Exception as e:
            print(f"❌ 单元测试运行失败: {e}")
            return False
    
    def run_e2e_tests(self):
        """运行端到端测试"""
        print("\n🔄 运行端到端测试...")
        
        try:
            result = subprocess.run(
                [sys.executable, 'tests/test_e2e.py'],
                cwd=self.project_root,
                capture_output=False,  # 实时输出
                text=True
            )
            
            return result.returncode == 0
            
        except Exception as e:
            print(f"❌ 端到端测试运行失败: {e}")
            return False
    
    def run_performance_tests(self):
        """运行性能测试"""
        print("\n⚡ 运行性能测试...")
        
        try:
            result = subprocess.run(
                [sys.executable, 'tests/test_performance.py'],
                cwd=self.project_root,
                capture_output=False,  # 实时输出
                text=True
            )
            
            return result.returncode == 0
            
        except Exception as e:
            print(f"❌ 性能测试运行失败: {e}")
            return False
    
    def run_api_tests(self):
        """运行API测试"""
        print("\n🌐 运行API测试...")
        
        api_tests = [
            ('test_api.py', 'API功能测试'),
            ('test_auth.py', '认证系统测试'),
            ('test_storage.py', '存储系统测试'),
            ('test_forum.py', '论坛系统测试'),
        ]
        
        passed = 0
        total = len(api_tests)
        
        for test_file, test_name in api_tests:
            test_path = self.project_root / test_file
            
            if not test_path.exists():
                print(f"⚠️ 测试文件不存在: {test_file}")
                continue
            
            print(f"\n🔍 运行 {test_name}...")
            
            try:
                result = subprocess.run(
                    [sys.executable, test_file],
                    cwd=self.project_root,
                    capture_output=True,
                    text=True,
                    timeout=60
                )
                
                if result.returncode == 0:
                    print(f"✅ {test_name} 通过")
                    passed += 1
                else:
                    print(f"❌ {test_name} 失败")
                    if result.stdout:
                        print("输出:", result.stdout[-500:])  # 只显示最后500字符
                    if result.stderr:
                        print("错误:", result.stderr[-500:])
                
            except subprocess.TimeoutExpired:
                print(f"⏰ {test_name} 超时")
            except Exception as e:
                print(f"💥 {test_name} 运行异常: {e}")
        
        print(f"\n📊 API测试结果: {passed}/{total} 通过")
        return passed == total
    
    def run_storage_tests(self):
        """运行存储系统测试"""
        print("\n💾 运行存储系统测试...")
        
        storage_scripts = [
            ('scripts/setup_storage.py', 'status', '存储系统状态检查'),
            ('scripts/storage_maintenance.py', 'stats', '存储维护统计'),
        ]
        
        passed = 0
        total = len(storage_scripts)
        
        for script_path, arg, test_name in storage_scripts:
            script_file = self.project_root / script_path
            
            if not script_file.exists():
                print(f"⚠️ 脚本文件不存在: {script_path}")
                continue
            
            print(f"\n🔍 运行 {test_name}...")
            
            try:
                result = subprocess.run(
                    [sys.executable, script_path, arg],
                    cwd=self.project_root,
                    capture_output=True,
                    text=True,
                    timeout=30
                )
                
                if result.returncode == 0:
                    print(f"✅ {test_name} 通过")
                    passed += 1
                    # 显示部分输出
                    if result.stdout:
                        lines = result.stdout.strip().split('\n')
                        for line in lines[:10]:  # 只显示前10行
                            print(f"   {line}")
                else:
                    print(f"❌ {test_name} 失败")
                    if result.stderr:
                        print("错误:", result.stderr[:200])
                
            except subprocess.TimeoutExpired:
                print(f"⏰ {test_name} 超时")
            except Exception as e:
                print(f"💥 {test_name} 运行异常: {e}")
        
        print(f"\n📊 存储测试结果: {passed}/{total} 通过")
        return passed == total
    
    def check_dependencies(self):
        """检查测试依赖"""
        print("🔍 检查测试依赖...")
        
        required_packages = [
            'flask',
            'sqlalchemy',
            'pymysql',
            'requests',
            'pillow'
        ]
        
        missing_packages = []
        
        for package in required_packages:
            try:
                if package == 'pillow':
                    __import__('PIL')  # Pillow的导入名是PIL
                else:
                    __import__(package)
                print(f"   ✅ {package}")
            except ImportError:
                print(f"   ❌ {package} (缺失)")
                missing_packages.append(package)
        
        if missing_packages:
            print(f"\n⚠️ 缺失依赖包: {', '.join(missing_packages)}")
            print("请运行: pip install " + ' '.join(missing_packages))
            return False
        
        print("✅ 所有依赖包都已安装")
        return True
    
    def generate_test_report(self, results):
        """生成测试报告"""
        print("\n" + "="*60)
        print("📋 测试报告")
        print("="*60)
        
        total_tests = len(results)
        passed_tests = sum(1 for result in results.values() if result)
        
        print(f"测试时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"总测试数: {total_tests}")
        print(f"通过: {passed_tests}")
        print(f"失败: {total_tests - passed_tests}")
        print(f"成功率: {passed_tests/total_tests*100:.1f}%")
        
        print("\n详细结果:")
        for test_name, result in results.items():
            status = "✅ 通过" if result else "❌ 失败"
            print(f"   {test_name}: {status}")
        
        # 总体评估
        if passed_tests == total_tests:
            print("\n🎉 所有测试通过！系统运行正常。")
            return True
        elif passed_tests >= total_tests * 0.8:
            print("\n⚠️ 大部分测试通过，但有少数失败。")
            return False
        else:
            print("\n❌ 多个测试失败，系统可能存在问题。")
            return False
    
    def run_all_tests(self, test_types=None):
        """运行所有测试"""
        print("🚀 开始运行测试套件...\n")
        
        start_time = datetime.now()
        
        # 检查依赖
        if not self.check_dependencies():
            return False
        
        # 定义测试类型
        available_tests = {
            'unit': ('单元测试', self.run_unit_tests),
            'api': ('API测试', self.run_api_tests),
            'storage': ('存储测试', self.run_storage_tests),
            'e2e': ('端到端测试', self.run_e2e_tests),
            'performance': ('性能测试', self.run_performance_tests),
        }
        
        # 确定要运行的测试
        if test_types:
            tests_to_run = {k: v for k, v in available_tests.items() if k in test_types}
        else:
            # 默认运行除性能测试外的所有测试
            tests_to_run = {k: v for k, v in available_tests.items() if k != 'performance'}
        
        # 运行测试
        results = {}
        
        for test_key, (test_name, test_func) in tests_to_run.items():
            print(f"\n{'='*50}")
            print(f"运行: {test_name}")
            print('='*50)
            
            try:
                result = test_func()
                results[test_name] = result
            except Exception as e:
                print(f"💥 {test_name} 运行异常: {e}")
                results[test_name] = False
        
        # 生成报告
        success = self.generate_test_report(results)
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        print(f"\n⏱️ 测试完成，总耗时: {duration:.1f}秒")
        
        return success


def main():
    """主函数"""
    parser = argparse.ArgumentParser(description='运行测试套件')
    parser.add_argument(
        '--type', 
        choices=['unit', 'api', 'storage', 'e2e', 'performance', 'all'],
        default='all',
        help='测试类型'
    )
    parser.add_argument(
        '--include-performance',
        action='store_true',
        help='包含性能测试'
    )
    
    args = parser.parse_args()
    
    runner = TestRunner()
    
    if args.type == 'all':
        test_types = None
        if args.include_performance:
            test_types = ['unit', 'api', 'storage', 'e2e', 'performance']
    else:
        test_types = [args.type]
    
    try:
        success = runner.run_all_tests(test_types)
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n⏹️ 测试被用户中断")
        sys.exit(1)


if __name__ == '__main__':
    main()
