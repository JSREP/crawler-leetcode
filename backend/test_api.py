#!/usr/bin/env python3
"""
Flask API测试脚本
"""
import requests
import json
from datetime import datetime


class APITester:
    def __init__(self, base_url='http://localhost:5000'):
        self.base_url = base_url
        self.session = requests.Session()
        
    def test_database_connection(self):
        """测试数据库连接"""
        print("🔍 测试数据库连接...")
        try:
            response = self.session.get(f"{self.base_url}/api/db/test")
            if response.status_code == 200:
                data = response.json()
                print(f"✅ 数据库连接成功: {data['message']}")
                print(f"   数据库版本: {data['data']['db_version']}")
                return True
            else:
                print(f"❌ 数据库连接失败: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ 请求失败: {e}")
            return False
    
    def test_get_challenges(self):
        """测试获取挑战列表"""
        print("\n🔍 测试获取挑战列表...")
        try:
            # 测试基本查询
            response = self.session.get(f"{self.base_url}/api/db/challenges?per_page=5")
            if response.status_code == 200:
                data = response.json()
                print(f"✅ 获取挑战列表成功: 共 {data['total']} 个挑战")
                print(f"   当前页: {data['current_page']}/{data['pages']}")
                if data['challenges']:
                    print(f"   第一个挑战: {data['challenges'][0]['name']}")
                return True
            else:
                print(f"❌ 获取挑战列表失败: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ 请求失败: {e}")
            return False
    
    def test_get_challenge_by_alias(self, alias='test-challenge'):
        """测试根据别名获取挑战"""
        print(f"\n🔍 测试获取挑战 (alias: {alias})...")
        try:
            response = self.session.get(f"{self.base_url}/api/db/challenges/{alias}")
            if response.status_code == 200:
                data = response.json()
                print(f"✅ 获取挑战成功: {data['name']}")
                return True
            elif response.status_code == 404:
                print(f"⚠️ 挑战不存在: {alias}")
                return True  # 这是预期的结果
            else:
                print(f"❌ 获取挑战失败: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ 请求失败: {e}")
            return False
    
    def test_create_challenge(self):
        """测试创建挑战"""
        print("\n🔍 测试创建挑战...")
        try:
            challenge_data = {
                'id_alias': f'test-challenge-{int(datetime.now().timestamp())}',
                'name': '测试挑战',
                'name_en': 'Test Challenge',
                'platform': 'test',
                'difficulty_level': 3,
                'description_markdown': '这是一个测试挑战',
                'description_markdown_en': 'This is a test challenge',
                'base64_url': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
                'is_expired': False,
                'tags': ['test', 'api']
            }
            
            response = self.session.post(
                f"{self.base_url}/api/db/challenges",
                json=challenge_data,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 201:
                data = response.json()
                print(f"✅ 创建挑战成功: ID {data['id']}")
                return data['id']
            else:
                print(f"❌ 创建挑战失败: {response.status_code}")
                if response.headers.get('content-type', '').startswith('application/json'):
                    print(f"   错误信息: {response.json()}")
                return None
        except Exception as e:
            print(f"❌ 请求失败: {e}")
            return None
    
    def test_get_stats(self):
        """测试获取统计信息"""
        print("\n🔍 测试获取统计信息...")
        try:
            response = self.session.get(f"{self.base_url}/api/db/stats")
            if response.status_code == 200:
                data = response.json()
                stats = data['data']
                print(f"✅ 获取统计信息成功:")
                print(f"   总挑战数: {stats['total']}")
                print(f"   平台数: {len(stats['platforms'])}")
                print(f"   难度分布: {len(stats['difficulties'])}")
                print(f"   标签数: {len(stats['tags'])}")
                return True
            else:
                print(f"❌ 获取统计信息失败: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ 请求失败: {e}")
            return False
    
    def run_all_tests(self):
        """运行所有测试"""
        print("🚀 开始API测试...\n")
        
        tests = [
            self.test_database_connection,
            self.test_get_challenges,
            lambda: self.test_get_challenge_by_alias('non-existent'),
            self.test_create_challenge,
            self.test_get_stats
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            try:
                if test():
                    passed += 1
            except Exception as e:
                print(f"❌ 测试异常: {e}")
        
        print(f"\n📊 测试结果: {passed}/{total} 通过")
        
        if passed == total:
            print("🎉 所有测试通过！")
        else:
            print("⚠️ 部分测试失败，请检查API实现")


if __name__ == '__main__':
    import sys
    
    base_url = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:5000'
    
    tester = APITester(base_url)
    tester.run_all_tests()
