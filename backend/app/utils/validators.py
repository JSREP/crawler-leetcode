"""
数据验证工具函数
"""
import re
from typing import Dict, Any, Optional


def validate_challenge_data(data: Dict[str, Any]) -> Optional[str]:
    """验证挑战数据"""
    required_fields = ['id_alias', 'name', 'platform', 'difficulty_level', 'base64_url']
    
    # 检查必需字段
    for field in required_fields:
        if field not in data or not data[field]:
            return f"Missing required field: {field}"
    
    # 验证id_alias格式
    if not re.match(r'^[a-zA-Z0-9_-]+$', data['id_alias']):
        return "id_alias must contain only letters, numbers, underscores, and hyphens"
    
    # 验证难度级别
    if not isinstance(data['difficulty_level'], int) or data['difficulty_level'] < 1 or data['difficulty_level'] > 5:
        return "difficulty_level must be an integer between 1 and 5"
    
    # 验证平台名称
    if len(data['platform']) > 100:
        return "platform name too long (max 100 characters)"
    
    # 验证名称长度
    if len(data['name']) > 255:
        return "name too long (max 255 characters)"
    
    if data.get('name_en') and len(data['name_en']) > 255:
        return "name_en too long (max 255 characters)"
    
    # 验证标签
    if 'tags' in data:
        if not isinstance(data['tags'], list):
            return "tags must be a list"
        
        for tag in data['tags']:
            if not isinstance(tag, str):
                return "all tags must be strings"
            if len(tag) > 50:
                return "tag too long (max 50 characters)"
    
    return None


def validate_user_data(data: Dict[str, Any]) -> Optional[str]:
    """验证用户数据"""
    required_fields = ['github_id', 'username']
    
    # 检查必需字段
    for field in required_fields:
        if field not in data or not data[field]:
            return f"Missing required field: {field}"
    
    # 验证GitHub ID
    if not isinstance(data['github_id'], int) or data['github_id'] <= 0:
        return "github_id must be a positive integer"
    
    # 验证用户名
    if not re.match(r'^[a-zA-Z0-9_-]+$', data['username']):
        return "username must contain only letters, numbers, underscores, and hyphens"
    
    if len(data['username']) > 255:
        return "username too long (max 255 characters)"
    
    # 验证邮箱格式
    if data.get('email'):
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, data['email']):
            return "invalid email format"
    
    # 验证角色
    if data.get('role') and data['role'] not in ['user', 'admin']:
        return "role must be either 'user' or 'admin'"
    
    return None


def validate_file_upload(file_data: Dict[str, Any]) -> Optional[str]:
    """验证文件上传数据"""
    required_fields = ['filename', 'file_size', 'file_type']
    
    # 检查必需字段
    for field in required_fields:
        if field not in file_data or not file_data[field]:
            return f"Missing required field: {field}"
    
    # 验证文件大小
    max_size = 16 * 1024 * 1024  # 16MB
    if file_data['file_size'] > max_size:
        return f"File too large (max {max_size} bytes)"
    
    # 验证文件类型
    allowed_types = {
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'text/plain', 'text/markdown'
    }
    if file_data['file_type'] not in allowed_types:
        return f"File type not allowed. Allowed types: {', '.join(allowed_types)}"
    
    # 验证文件名
    if len(file_data['filename']) > 255:
        return "filename too long (max 255 characters)"
    
    # 检查文件名中的危险字符
    dangerous_chars = ['..', '/', '\\', '<', '>', ':', '"', '|', '?', '*']
    for char in dangerous_chars:
        if char in file_data['filename']:
            return f"filename contains dangerous character: {char}"
    
    return None


def validate_pagination_params(page: int, per_page: int) -> Optional[str]:
    """验证分页参数"""
    if page < 1:
        return "page must be >= 1"
    
    if per_page < 1:
        return "per_page must be >= 1"
    
    if per_page > 100:
        return "per_page must be <= 100"
    
    return None
