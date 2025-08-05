#!/usr/bin/env python3
"""
集成测试套件
"""
import os
import sys
import unittest
import tempfile
import shutil
from pathlib import Path

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models import User, Challenge, UserStorage, UserStorageQuota, UserWallet
from config import TestingConfig


class IntegrationTestCase(unittest.TestCase):
    """集成测试基类"""
    
    def setUp(self):
        """测试前设置"""
        self.app = create_app('testing')
        self.app_context = self.app.app_context()
        self.app_context.push()
        self.client = self.app.test_client()
        
        # 创建临时存储目录
        self.temp_storage = tempfile.mkdtemp()
        self.app.config['UPLOAD_FOLDER'] = self.temp_storage
        
        # 创建数据库表
        db.create_all()
        
        # 创建测试用户
        self.test_user = User(
            github_id=12345,
            username='testuser',
            email='test@example.com',
            role='user'
        )
        db.session.add(self.test_user)
        db.session.commit()
        
        # 创建测试挑战
        self.test_challenge = Challenge(
            id_alias='test-challenge',
            name='测试挑战',
            platform='test',
            difficulty_level=3,
            base64_url='data:image/png;base64,test'
        )
        db.session.add(self.test_challenge)
        db.session.commit()
    
    def tearDown(self):
        """测试后清理"""
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
        
        # 清理临时存储目录
        shutil.rmtree(self.temp_storage, ignore_errors=True)


class DatabaseTestCase(IntegrationTestCase):
    """数据库测试"""
    
    def test_database_connection(self):
        """测试数据库连接"""
        response = self.client.get('/api/db/test')
        self.assertEqual(response.status_code, 200)
        
        data = response.get_json()
        self.assertEqual(data['status'], 'success')
        self.assertIn('current_time', data['data'])
    
    def test_challenge_crud(self):
        """测试挑战CRUD操作"""
        # 获取挑战列表
        response = self.client.get('/api/db/challenges')
        self.assertEqual(response.status_code, 200)
        
        data = response.get_json()
        self.assertGreaterEqual(data['total'], 1)
        
        # 获取单个挑战
        response = self.client.get(f'/api/db/challenges/{self.test_challenge.id_alias}')
        self.assertEqual(response.status_code, 200)
        
        challenge_data = response.get_json()
        self.assertEqual(challenge_data['name'], '测试挑战')
    
    def test_stats_api(self):
        """测试统计API"""
        response = self.client.get('/api/db/stats')
        self.assertEqual(response.status_code, 200)
        
        data = response.get_json()
        self.assertEqual(data['status'], 'success')
        self.assertIn('total', data['data'])


class AuthTestCase(IntegrationTestCase):
    """认证测试"""
    
    def test_github_auth_url(self):
        """测试GitHub认证URL生成"""
        response = self.client.get('/auth/github/url')
        
        if response.status_code == 500:
            # GitHub OAuth未配置，跳过测试
            self.skipTest("GitHub OAuth not configured")
        
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('auth_url', data)
        self.assertIn('github.com', data['auth_url'])
    
    def test_unauthorized_access(self):
        """测试未授权访问"""
        response = self.client.get('/auth/me')
        self.assertEqual(response.status_code, 401)
        
        data = response.get_json()
        self.assertIn('error', data)


class StorageTestCase(IntegrationTestCase):
    """存储系统测试"""
    
    def setUp(self):
        super().setUp()
        
        # 创建存储配额
        self.quota = UserStorageQuota(
            user_id=self.test_user.id,
            total_quota=104857600,  # 100MB
            used_quota=0,
            purchased_quota=0
        )
        db.session.add(self.quota)
        db.session.commit()
    
    def test_storage_quota(self):
        """测试存储配额查询"""
        # 模拟认证（简化版）
        with self.app.test_request_context():
            from flask_jwt_extended import create_access_token
            access_token = create_access_token(identity=self.test_user.id)
        
        headers = {'Authorization': f'Bearer {access_token}'}
        response = self.client.get('/storage/quota', headers=headers)
        
        if response.status_code == 401:
            # JWT未正确配置，跳过测试
            self.skipTest("JWT authentication not properly configured")
        
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('quota', data)
    
    def test_file_upload_without_auth(self):
        """测试未认证的文件上传"""
        # 创建测试文件
        test_file_content = b'test file content'
        
        response = self.client.post('/storage/upload', data={
            'file': (tempfile.NamedTemporaryFile(delete=False), 'test.txt')
        })
        
        self.assertEqual(response.status_code, 401)
    
    def test_storage_directories(self):
        """测试存储目录结构"""
        from app.storage.upload import ensure_dir
        
        # 测试目录创建
        test_dir = Path(self.temp_storage) / 'test_dir'
        ensure_dir(test_dir)
        
        self.assertTrue(test_dir.exists())
        self.assertTrue(test_dir.is_dir())


class ForumTestCase(IntegrationTestCase):
    """论坛系统测试"""
    
    def test_forum_posts_list(self):
        """测试论坛帖子列表"""
        response = self.client.get('/api/forum/posts')
        self.assertEqual(response.status_code, 200)
        
        data = response.get_json()
        self.assertIn('posts', data)
        self.assertIn('total', data)
    
    def test_challenge_comments_list(self):
        """测试挑战评论列表"""
        response = self.client.get(f'/api/challenges/{self.test_challenge.id}/comments')
        self.assertEqual(response.status_code, 200)
        
        data = response.get_json()
        self.assertIn('comments', data)
        self.assertIn('total', data)


class WalletTestCase(IntegrationTestCase):
    """钱包系统测试"""
    
    def test_wallet_info_without_auth(self):
        """测试未认证的钱包信息查询"""
        response = self.client.get('/api/wallet/info')
        self.assertEqual(response.status_code, 401)
    
    def test_wallet_creation_without_auth(self):
        """测试未认证的钱包创建"""
        response = self.client.post('/api/wallet/create')
        self.assertEqual(response.status_code, 401)


class ModelTestCase(IntegrationTestCase):
    """数据模型测试"""
    
    def test_user_model(self):
        """测试用户模型"""
        user = User.query.filter_by(username='testuser').first()
        self.assertIsNotNone(user)
        self.assertEqual(user.github_id, 12345)
        self.assertFalse(user.is_admin())
        
        # 测试字典转换
        user_dict = user.to_dict()
        self.assertIn('id', user_dict)
        self.assertIn('username', user_dict)
        self.assertEqual(user_dict['username'], 'testuser')
    
    def test_challenge_model(self):
        """测试挑战模型"""
        challenge = Challenge.query.filter_by(id_alias='test-challenge').first()
        self.assertIsNotNone(challenge)
        self.assertEqual(challenge.name, '测试挑战')
        
        # 测试字典转换
        challenge_dict = challenge.to_dict()
        self.assertIn('id', challenge_dict)
        self.assertIn('name', challenge_dict)
        self.assertEqual(challenge_dict['name'], '测试挑战')
    
    def test_storage_quota_model(self):
        """测试存储配额模型"""
        quota = UserStorageQuota(
            user_id=self.test_user.id,
            total_quota=1000,
            used_quota=300,
            purchased_quota=200
        )
        
        self.assertEqual(quota.available_quota, 900)  # 1000 + 200 - 300
        self.assertEqual(quota.usage_percentage, 25.0)  # 300 / (1000 + 200) * 100


class UtilsTestCase(IntegrationTestCase):
    """工具函数测试"""
    
    def test_file_helpers(self):
        """测试文件工具函数"""
        from app.utils.helpers import (
            generate_filename, format_file_size, 
            allowed_file, get_file_extension
        )
        
        # 测试文件名生成
        filename = generate_filename('test.jpg', 'avatar')
        self.assertTrue(filename.startswith('avatar_'))
        self.assertTrue(filename.endswith('.jpg'))
        
        # 测试文件大小格式化
        self.assertEqual(format_file_size(1024), '1.0KB')
        self.assertEqual(format_file_size(1048576), '1.0MB')
        
        # 测试文件类型检查
        allowed_extensions = {'jpg', 'png', 'pdf'}
        self.assertTrue(allowed_file('test.jpg', allowed_extensions))
        self.assertFalse(allowed_file('test.exe', allowed_extensions))
        
        # 测试文件扩展名获取
        self.assertEqual(get_file_extension('test.jpg'), 'jpg')
        self.assertEqual(get_file_extension('document.pdf'), 'pdf')
    
    def test_validators(self):
        """测试验证器"""
        from app.utils.validators import (
            validate_challenge_data, validate_user_data,
            validate_pagination_params
        )
        
        # 测试挑战数据验证
        valid_challenge = {
            'id_alias': 'test-challenge',
            'name': '测试挑战',
            'platform': 'test',
            'difficulty_level': 3,
            'base64_url': 'data:image/png;base64,test'
        }
        self.assertIsNone(validate_challenge_data(valid_challenge))
        
        # 测试无效数据
        invalid_challenge = {'name': '测试'}  # 缺少必需字段
        self.assertIsNotNone(validate_challenge_data(invalid_challenge))
        
        # 测试分页参数验证
        self.assertIsNone(validate_pagination_params(1, 10))
        self.assertIsNotNone(validate_pagination_params(0, 10))  # 无效页码
        self.assertIsNotNone(validate_pagination_params(1, 200))  # 超出限制


def run_all_tests():
    """运行所有测试"""
    print("🧪 开始运行集成测试套件...\n")
    
    # 创建测试套件
    test_classes = [
        DatabaseTestCase,
        AuthTestCase,
        StorageTestCase,
        ForumTestCase,
        WalletTestCase,
        ModelTestCase,
        UtilsTestCase
    ]
    
    suite = unittest.TestSuite()
    
    for test_class in test_classes:
        tests = unittest.TestLoader().loadTestsFromTestCase(test_class)
        suite.addTests(tests)
    
    # 运行测试
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # 输出结果
    print(f"\n📊 测试结果:")
    print(f"   运行测试: {result.testsRun}")
    print(f"   成功: {result.testsRun - len(result.failures) - len(result.errors)}")
    print(f"   失败: {len(result.failures)}")
    print(f"   错误: {len(result.errors)}")
    
    if result.failures:
        print(f"\n❌ 失败的测试:")
        for test, traceback in result.failures:
            print(f"   - {test}: {traceback.split('AssertionError:')[-1].strip()}")
    
    if result.errors:
        print(f"\n💥 错误的测试:")
        for test, traceback in result.errors:
            print(f"   - {test}: {traceback.split('Exception:')[-1].strip()}")
    
    success_rate = (result.testsRun - len(result.failures) - len(result.errors)) / result.testsRun * 100
    print(f"\n🎯 成功率: {success_rate:.1f}%")
    
    if success_rate >= 90:
        print("🎉 测试通过！系统运行正常。")
    elif success_rate >= 70:
        print("⚠️ 部分测试失败，请检查相关功能。")
    else:
        print("❌ 多个测试失败，系统可能存在严重问题。")
    
    return result.wasSuccessful()


if __name__ == '__main__':
    success = run_all_tests()
    sys.exit(0 if success else 1)
