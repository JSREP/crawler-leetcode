#!/usr/bin/env python3
"""
存储系统测试脚本
"""
import requests
import json
import io
import os
from PIL import Image


class StorageTester:
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
    
    def test_storage_quota(self):
        """测试获取存储配额"""
        print("🔍 测试获取存储配额...")
        try:
            response = self.session.get(f"{self.base_url}/storage/quota")
            if response.status_code == 200:
                data = response.json()
                quota = data['quota']
                formatted = data['formatted']
                print(f"✅ 获取存储配额成功")
                print(f"   总配额: {formatted['total_quota']}")
                print(f"   已使用: {formatted['used_quota']}")
                print(f"   已购买: {formatted['purchased_quota']}")
                print(f"   可用空间: {formatted['available_quota']}")
                print(f"   使用率: {quota['usage_percentage']:.1f}%")
                return True
            else:
                print(f"❌ 获取存储配额失败: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ 请求失败: {e}")
            return False
    
    def test_file_upload(self):
        """测试文件上传"""
        print("\n🔍 测试文件上传...")
        try:
            # 创建测试图片
            test_image = self.create_test_image()
            
            files = {
                'file': ('test_image.png', test_image, 'image/png')
            }
            
            data = {
                'purpose': 'test',
                'category': 'uploads'
            }
            
            response = self.session.post(
                f"{self.base_url}/storage/upload",
                files=files,
                data=data
            )
            
            if response.status_code == 201:
                result = response.json()
                print(f"✅ 文件上传成功")
                print(f"   文件ID: {result['id']}")
                print(f"   文件名: {result['filename']}")
                print(f"   文件大小: {result['file_size']} 字节")
                print(f"   访问URL: {result['access_url']}")
                return result['id']
            else:
                print(f"❌ 文件上传失败: {response.status_code}")
                if response.headers.get('content-type', '').startswith('application/json'):
                    print(f"   错误信息: {response.json()}")
                return None
        except Exception as e:
            print(f"❌ 请求失败: {e}")
            return None
    
    def test_avatar_upload(self):
        """测试头像上传"""
        print("\n🔍 测试头像上传...")
        try:
            # 创建测试头像
            avatar_image = self.create_test_avatar()
            
            files = {
                'file': ('avatar.png', avatar_image, 'image/png')
            }
            
            response = self.session.post(
                f"{self.base_url}/storage/upload/avatar",
                files=files
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ 头像上传成功")
                print(f"   头像URL: {result['avatar_url']}")
                print(f"   文件大小: {result['file_size']} 字节")
                return True
            else:
                print(f"❌ 头像上传失败: {response.status_code}")
                if response.headers.get('content-type', '').startswith('application/json'):
                    print(f"   错误信息: {response.json()}")
                return False
        except Exception as e:
            print(f"❌ 请求失败: {e}")
            return False
    
    def test_get_user_files(self):
        """测试获取用户文件列表"""
        print("\n🔍 测试获取用户文件列表...")
        try:
            response = self.session.get(f"{self.base_url}/storage/files?per_page=10")
            if response.status_code == 200:
                data = response.json()
                files = data['files']
                print(f"✅ 获取文件列表成功")
                print(f"   文件总数: {data['total']}")
                print(f"   当前页: {data['current_page']}/{data['pages']}")
                for i, file_info in enumerate(files[:3]):  # 只显示前3个
                    print(f"   文件{i+1}: {file_info['file_name']} ({file_info['file_size']} 字节)")
                return files[0]['id'] if files else None
            else:
                print(f"❌ 获取文件列表失败: {response.status_code}")
                return None
        except Exception as e:
            print(f"❌ 请求失败: {e}")
            return None
    
    def test_file_access(self, file_id):
        """测试文件访问"""
        if not file_id:
            print("⚠️ 跳过文件访问测试（无文件ID）")
            return True
            
        print(f"\n🔍 测试文件访问 (ID: {file_id})...")
        try:
            # 获取文件信息
            response = self.session.get(f"{self.base_url}/storage/files/{file_id}/info")
            if response.status_code == 200:
                file_info = response.json()
                print(f"✅ 获取文件信息成功")
                print(f"   文件名: {file_info['file_name']}")
                print(f"   文件存在: {file_info['file_exists']}")
                print(f"   访问URL: {file_info['access_url']}")
                
                # 测试文件下载
                if file_info['file_exists']:
                    download_response = self.session.get(
                        f"{self.base_url}{file_info['access_url']}"
                    )
                    if download_response.status_code == 200:
                        print(f"   ✅ 文件下载成功 ({len(download_response.content)} 字节)")
                    else:
                        print(f"   ❌ 文件下载失败: {download_response.status_code}")
                
                return True
            else:
                print(f"❌ 获取文件信息失败: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ 请求失败: {e}")
            return False
    
    def test_storage_stats(self):
        """测试存储统计"""
        print("\n🔍 测试存储统计...")
        try:
            response = self.session.get(f"{self.base_url}/storage/quota/stats")
            if response.status_code == 200:
                data = response.json()
                print(f"✅ 获取存储统计成功")
                
                # 显示配额信息
                formatted = data['formatted_quota']
                print(f"   配额使用: {formatted['used_quota']} / {formatted['total_quota']}")
                
                # 显示按用途统计
                if data['usage_by_purpose']:
                    print("   按用途统计:")
                    for purpose_stat in data['usage_by_purpose']:
                        print(f"     {purpose_stat['purpose']}: {purpose_stat['file_count']} 文件, {purpose_stat['formatted_size']}")
                
                # 显示按类型统计
                if data['usage_by_type']:
                    print("   按类型统计:")
                    for type_stat in data['usage_by_type']:
                        print(f"     {type_stat['category']}: {type_stat['file_count']} 文件, {type_stat['formatted_size']}")
                
                return True
            else:
                print(f"❌ 获取存储统计失败: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ 请求失败: {e}")
            return False
    
    def test_storage_pricing(self):
        """测试存储定价"""
        print("\n🔍 测试存储定价...")
        try:
            response = self.session.get(f"{self.base_url}/storage/quota/pricing")
            if response.status_code == 200:
                data = response.json()
                print(f"✅ 获取存储定价成功")
                print(f"   基础配额: {data['base_quota']['size_mb']}MB")
                print(f"   货币单位: {data['currency']}")
                print("   定价层级:")
                for tier in data['pricing_tiers']:
                    print(f"     {tier['size_gb']}GB: {tier['price_tokens']} tokens - {tier['description']}")
                return True
            else:
                print(f"❌ 获取存储定价失败: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ 请求失败: {e}")
            return False
    
    def create_test_image(self):
        """创建测试图片"""
        img = Image.new('RGB', (100, 100), color='red')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        return img_bytes
    
    def create_test_avatar(self):
        """创建测试头像"""
        img = Image.new('RGB', (256, 256), color='blue')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        return img_bytes
    
    def run_all_tests(self):
        """运行所有测试"""
        print("🚀 开始存储系统测试...\n")
        
        if not self.access_token:
            print("⚠️ 未设置认证令牌，某些测试可能失败")
            print("   使用方法: tester.set_auth_token('your_jwt_token')")
        
        tests = [
            self.test_storage_quota,
            self.test_file_upload,
            self.test_avatar_upload,
            self.test_get_user_files,
            lambda: self.test_file_access(self.test_get_user_files()),
            self.test_storage_stats,
            self.test_storage_pricing
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
            print("⚠️ 部分测试失败，请检查存储系统实现")


if __name__ == '__main__':
    import sys
    
    base_url = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:5000'
    
    tester = StorageTester(base_url)
    
    # 如果提供了JWT令牌，设置认证
    if len(sys.argv) > 2:
        tester.set_auth_token(sys.argv[2])
    
    tester.run_all_tests()
