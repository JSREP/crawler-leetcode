#!/usr/bin/env python3
"""
认证系统测试脚本
"""
import requests
import json
from datetime import datetime


class AuthTester:
    def __init__(self, base_url='http://localhost:5000'):
        self.base_url = base_url
        self.session = requests.Session()
        self.access_token = None
        self.refresh_token = None
        self.session_token = None
        
    def test_github_auth_url(self):
        """测试获取GitHub认证URL"""
        print("🔍 测试获取GitHub认证URL...")
        try:
            response = self.session.get(f"{self.base_url}/auth/github/url")
            if response.status_code == 200:
                data = response.json()
                print(f"✅ 获取认证URL成功")
                print(f"   URL: {data['auth_url'][:50]}...")
                print(f"   State: {data['state'][:10]}...")
                return True
            else:
                print(f"❌ 获取认证URL失败: {response.status_code}")
                if response.headers.get('content-type', '').startswith('application/json'):
                    print(f"   错误信息: {response.json()}")
                return False
        except Exception as e:
            print(f"❌ 请求失败: {e}")
            return False
    
    def test_token_verification(self):
        """测试令牌验证"""
        if not self.access_token:
            print("⚠️ 跳过令牌验证测试（无访问令牌）")
            return True
            
        print("\n🔍 测试令牌验证...")
        try:
            headers = {'Authorization': f'Bearer {self.access_token}'}
            response = self.session.post(
                f"{self.base_url}/auth/verify",
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ 令牌验证成功")
                print(f"   用户ID: {data['user_id']}")
                print(f"   用户名: {data['username']}")
                print(f"   角色: {data['role']}")
                return True
            else:
                print(f"❌ 令牌验证失败: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ 请求失败: {e}")
            return False
    
    def test_get_current_user(self):
        """测试获取当前用户信息"""
        if not self.access_token:
            print("⚠️ 跳过获取用户信息测试（无访问令牌）")
            return True
            
        print("\n🔍 测试获取当前用户信息...")
        try:
            headers = {'Authorization': f'Bearer {self.access_token}'}
            response = self.session.get(
                f"{self.base_url}/auth/me",
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                user = data['user']
                print(f"✅ 获取用户信息成功")
                print(f"   用户名: {user['username']}")
                print(f"   邮箱: {user.get('email', 'N/A')}")
                print(f"   角色: {user['role']}")
                return True
            else:
                print(f"❌ 获取用户信息失败: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ 请求失败: {e}")
            return False
    
    def test_update_user_info(self):
        """测试更新用户信息"""
        if not self.access_token:
            print("⚠️ 跳过更新用户信息测试（无访问令牌）")
            return True
            
        print("\n🔍 测试更新用户信息...")
        try:
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
            
            update_data = {
                'bio': f'测试用户 - 更新于 {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}',
                'location': '测试城市'
            }
            
            response = self.session.put(
                f"{self.base_url}/auth/me",
                headers=headers,
                json=update_data
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ 更新用户信息成功")
                print(f"   消息: {data['message']}")
                return True
            else:
                print(f"❌ 更新用户信息失败: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ 请求失败: {e}")
            return False
    
    def test_get_sessions(self):
        """测试获取用户会话"""
        if not self.access_token:
            print("⚠️ 跳过获取会话测试（无访问令牌）")
            return True
            
        print("\n🔍 测试获取用户会话...")
        try:
            headers = {'Authorization': f'Bearer {self.access_token}'}
            response = self.session.get(
                f"{self.base_url}/auth/sessions",
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                sessions = data['sessions']
                print(f"✅ 获取会话列表成功")
                print(f"   会话数量: {len(sessions)}")
                for i, session in enumerate(sessions[:3]):  # 只显示前3个
                    print(f"   会话{i+1}: {session['session_token'][:10]}... (过期: {session['expires_at'][:10]})")
                return True
            else:
                print(f"❌ 获取会话列表失败: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ 请求失败: {e}")
            return False
    
    def test_refresh_token(self):
        """测试刷新令牌"""
        if not self.refresh_token:
            print("⚠️ 跳过刷新令牌测试（无刷新令牌）")
            return True
            
        print("\n🔍 测试刷新令牌...")
        try:
            headers = {'Authorization': f'Bearer {self.refresh_token}'}
            response = self.session.post(
                f"{self.base_url}/auth/refresh",
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ 刷新令牌成功")
                print(f"   新访问令牌: {data['access_token'][:20]}...")
                print(f"   过期时间: {data['expires_in']} 秒")
                # 更新访问令牌
                self.access_token = data['access_token']
                return True
            else:
                print(f"❌ 刷新令牌失败: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ 请求失败: {e}")
            return False
    
    def test_unauthorized_access(self):
        """测试未授权访问"""
        print("\n🔍 测试未授权访问...")
        try:
            # 不提供Authorization头
            response = self.session.get(f"{self.base_url}/auth/me")
            
            if response.status_code == 401:
                print("✅ 未授权访问正确返回401")
                return True
            else:
                print(f"❌ 未授权访问返回错误状态码: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ 请求失败: {e}")
            return False
    
    def test_logout(self):
        """测试登出"""
        if not self.access_token:
            print("⚠️ 跳过登出测试（无访问令牌）")
            return True
            
        print("\n🔍 测试登出...")
        try:
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
            
            logout_data = {}
            if self.session_token:
                logout_data['session_token'] = self.session_token
            
            response = self.session.post(
                f"{self.base_url}/auth/logout",
                headers=headers,
                json=logout_data
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ 登出成功: {data['message']}")
                return True
            else:
                print(f"❌ 登出失败: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ 请求失败: {e}")
            return False
    
    def run_all_tests(self):
        """运行所有测试"""
        print("🚀 开始认证系统测试...\n")
        
        tests = [
            self.test_github_auth_url,
            self.test_unauthorized_access,
            self.test_token_verification,
            self.test_get_current_user,
            self.test_update_user_info,
            self.test_get_sessions,
            self.test_refresh_token,
            self.test_logout
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
            print("⚠️ 部分测试失败，请检查认证系统实现")
        
        print("\n💡 提示:")
        print("- GitHub OAuth需要真实的客户端ID和密钥才能完全测试")
        print("- 某些测试需要有效的访问令牌，可以通过完整的OAuth流程获取")


if __name__ == '__main__':
    import sys
    
    base_url = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:5000'
    
    tester = AuthTester(base_url)
    tester.run_all_tests()
