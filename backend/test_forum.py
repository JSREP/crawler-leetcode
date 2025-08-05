#!/usr/bin/env python3
"""
论坛系统测试脚本
"""
import requests
import json
from datetime import datetime


class ForumTester:
    def __init__(self, base_url='http://localhost:5000'):
        self.base_url = base_url
        self.session = requests.Session()
        self.access_token = None
        
    def set_auth_token(self, token):
        """设置认证令牌"""
        self.access_token = token
        self.session.headers.update({
            'Authorization': f'Bearer {token}'
        })
    
    def test_create_forum_post(self):
        """测试创建论坛帖子"""
        print("🔍 测试创建论坛帖子...")
        try:
            post_data = {
                'title': f'测试帖子 - {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}',
                'content': '这是一个测试帖子的内容。\n\n包含多行文本和**Markdown**格式。',
                'challenge_id': None  # 不关联特定挑战
            }
            
            response = self.session.post(
                f"{self.base_url}/api/forum/posts",
                json=post_data,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 201:
                data = response.json()
                post = data['post']
                print(f"✅ 创建论坛帖子成功")
                print(f"   帖子ID: {post['id']}")
                print(f"   标题: {post['title']}")
                print(f"   内容长度: {len(post['content'])} 字符")
                return post['id']
            else:
                print(f"❌ 创建论坛帖子失败: {response.status_code}")
                if response.headers.get('content-type', '').startswith('application/json'):
                    print(f"   错误信息: {response.json()}")
                return None
        except Exception as e:
            print(f"❌ 请求失败: {e}")
            return None
    
    def test_get_forum_posts(self):
        """测试获取论坛帖子列表"""
        print("\n🔍 测试获取论坛帖子列表...")
        try:
            response = self.session.get(f"{self.base_url}/api/forum/posts?per_page=5")
            if response.status_code == 200:
                data = response.json()
                posts = data['posts']
                print(f"✅ 获取论坛帖子列表成功")
                print(f"   帖子总数: {data['total']}")
                print(f"   当前页: {data['current_page']}/{data['pages']}")
                for i, post in enumerate(posts[:3]):  # 只显示前3个
                    print(f"   帖子{i+1}: {post['title']} (浏览: {post['view_count']}, 回复: {post['reply_count']})")
                return posts[0]['id'] if posts else None
            else:
                print(f"❌ 获取论坛帖子列表失败: {response.status_code}")
                return None
        except Exception as e:
            print(f"❌ 请求失败: {e}")
            return None
    
    def test_get_forum_post(self, post_id):
        """测试获取单个论坛帖子"""
        if not post_id:
            print("⚠️ 跳过获取单个帖子测试（无帖子ID）")
            return True
            
        print(f"\n🔍 测试获取单个论坛帖子 (ID: {post_id})...")
        try:
            response = self.session.get(f"{self.base_url}/api/forum/posts/{post_id}")
            if response.status_code == 200:
                post = response.json()
                print(f"✅ 获取论坛帖子成功")
                print(f"   标题: {post['title']}")
                print(f"   浏览次数: {post['view_count']}")
                print(f"   创建时间: {post['created_at'][:19]}")
                return True
            else:
                print(f"❌ 获取论坛帖子失败: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ 请求失败: {e}")
            return False
    
    def test_create_post_reply(self, post_id):
        """测试创建帖子回复"""
        if not post_id:
            print("⚠️ 跳过创建回复测试（无帖子ID）")
            return None
            
        print(f"\n🔍 测试创建帖子回复 (帖子ID: {post_id})...")
        try:
            reply_data = {
                'content': f'这是一个测试回复 - {datetime.now().strftime("%H:%M:%S")}'
            }
            
            response = self.session.post(
                f"{self.base_url}/api/forum/posts/{post_id}/replies",
                json=reply_data,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 201:
                data = response.json()
                reply = data['reply']
                print(f"✅ 创建帖子回复成功")
                print(f"   回复ID: {reply['id']}")
                print(f"   内容: {reply['content'][:50]}...")
                return reply['id']
            else:
                print(f"❌ 创建帖子回复失败: {response.status_code}")
                if response.headers.get('content-type', '').startswith('application/json'):
                    print(f"   错误信息: {response.json()}")
                return None
        except Exception as e:
            print(f"❌ 请求失败: {e}")
            return None
    
    def test_get_post_replies(self, post_id):
        """测试获取帖子回复"""
        if not post_id:
            print("⚠️ 跳过获取回复测试（无帖子ID）")
            return True
            
        print(f"\n🔍 测试获取帖子回复 (帖子ID: {post_id})...")
        try:
            response = self.session.get(f"{self.base_url}/api/forum/posts/{post_id}/replies")
            if response.status_code == 200:
                data = response.json()
                replies = data['replies']
                print(f"✅ 获取帖子回复成功")
                print(f"   回复总数: {data['total']}")
                for i, reply in enumerate(replies[:3]):  # 只显示前3个
                    print(f"   回复{i+1}: {reply['content'][:30]}... (子回复: {reply.get('child_count', 0)})")
                return True
            else:
                print(f"❌ 获取帖子回复失败: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ 请求失败: {e}")
            return False
    
    def test_create_challenge_comment(self, challenge_id=1):
        """测试创建挑战评论"""
        print(f"\n🔍 测试创建挑战评论 (挑战ID: {challenge_id})...")
        try:
            comment_data = {
                'content': f'这是一个测试评论 - {datetime.now().strftime("%H:%M:%S")}'
            }
            
            response = self.session.post(
                f"{self.base_url}/api/challenges/{challenge_id}/comments",
                json=comment_data,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 201:
                data = response.json()
                comment = data['comment']
                print(f"✅ 创建挑战评论成功")
                print(f"   评论ID: {comment['id']}")
                print(f"   内容: {comment['content'][:50]}...")
                return comment['id']
            else:
                print(f"❌ 创建挑战评论失败: {response.status_code}")
                if response.headers.get('content-type', '').startswith('application/json'):
                    print(f"   错误信息: {response.json()}")
                return None
        except Exception as e:
            print(f"❌ 请求失败: {e}")
            return None
    
    def test_get_challenge_comments(self, challenge_id=1):
        """测试获取挑战评论"""
        print(f"\n🔍 测试获取挑战评论 (挑战ID: {challenge_id})...")
        try:
            response = self.session.get(f"{self.base_url}/api/challenges/{challenge_id}/comments")
            if response.status_code == 200:
                data = response.json()
                comments = data['comments']
                print(f"✅ 获取挑战评论成功")
                print(f"   评论总数: {data['total']}")
                for i, comment in enumerate(comments[:3]):  # 只显示前3个
                    print(f"   评论{i+1}: {comment['content'][:30]}... (回复: {comment.get('reply_count', 0)})")
                return True
            else:
                print(f"❌ 获取挑战评论失败: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ 请求失败: {e}")
            return False
    
    def test_wallet_info(self):
        """测试获取钱包信息"""
        print("\n🔍 测试获取钱包信息...")
        try:
            response = self.session.get(f"{self.base_url}/api/wallet/info")
            if response.status_code == 200:
                data = response.json()
                wallet = data['wallet']
                print(f"✅ 获取钱包信息成功")
                print(f"   钱包地址: {wallet['wallet_address'][:10]}...")
                print(f"   余额: {wallet['balance_in_tokens']} CRAWLER")
                return True
            elif response.status_code == 404:
                print("⚠️ 钱包不存在，尝试创建...")
                return self.test_create_wallet()
            else:
                print(f"❌ 获取钱包信息失败: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ 请求失败: {e}")
            return False
    
    def test_create_wallet(self):
        """测试创建钱包"""
        print("🔍 测试创建钱包...")
        try:
            response = self.session.post(f"{self.base_url}/api/wallet/create")
            if response.status_code == 201:
                data = response.json()
                wallet = data['wallet']
                print(f"✅ 创建钱包成功")
                print(f"   钱包地址: {wallet['wallet_address'][:10]}...")
                print(f"   初始余额: {wallet['balance_in_tokens']} CRAWLER")
                return True
            else:
                print(f"❌ 创建钱包失败: {response.status_code}")
                if response.headers.get('content-type', '').startswith('application/json'):
                    print(f"   错误信息: {response.json()}")
                return False
        except Exception as e:
            print(f"❌ 请求失败: {e}")
            return False
    
    def test_wallet_transactions(self):
        """测试获取钱包交易记录"""
        print("\n🔍 测试获取钱包交易记录...")
        try:
            response = self.session.get(f"{self.base_url}/api/wallet/transactions?per_page=5")
            if response.status_code == 200:
                data = response.json()
                transactions = data['transactions']
                print(f"✅ 获取钱包交易记录成功")
                print(f"   交易总数: {data['total']}")
                for i, tx in enumerate(transactions[:3]):  # 只显示前3个
                    print(f"   交易{i+1}: {tx['transaction_type']} - {tx['amount_in_tokens']} CRAWLER")
                return True
            else:
                print(f"❌ 获取钱包交易记录失败: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ 请求失败: {e}")
            return False
    
    def run_all_tests(self):
        """运行所有测试"""
        print("🚀 开始论坛系统测试...\n")
        
        if not self.access_token:
            print("⚠️ 未设置认证令牌，某些测试可能失败")
            print("   使用方法: tester.set_auth_token('your_jwt_token')")
        
        tests = [
            # 论坛帖子测试
            self.test_get_forum_posts,
            self.test_create_forum_post,
            lambda: self.test_get_forum_post(self.test_get_forum_posts()),
            lambda: self.test_create_post_reply(self.test_get_forum_posts()),
            lambda: self.test_get_post_replies(self.test_get_forum_posts()),
            
            # 挑战评论测试
            lambda: self.test_create_challenge_comment(1),
            lambda: self.test_get_challenge_comments(1),
            
            # 钱包测试
            self.test_wallet_info,
            self.test_wallet_transactions,
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
            print("⚠️ 部分测试失败，请检查论坛系统实现")


if __name__ == '__main__':
    import sys
    
    base_url = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:5000'
    
    tester = ForumTester(base_url)
    
    # 如果提供了JWT令牌，设置认证
    if len(sys.argv) > 2:
        tester.set_auth_token(sys.argv[2])
    
    tester.run_all_tests()
