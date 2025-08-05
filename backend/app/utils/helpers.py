"""
通用工具函数
"""
import os
import uuid
import hashlib
from datetime import datetime
from werkzeug.utils import secure_filename


def generate_uuid():
    """生成UUID"""
    return str(uuid.uuid4())


def generate_random_string(length=32):
    """生成随机字符串"""
    return hashlib.sha256(str(uuid.uuid4()).encode()).hexdigest()[:length]


def allowed_file(filename, allowed_extensions):
    """检查文件扩展名是否允许"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions


def get_file_extension(filename):
    """获取文件扩展名"""
    return filename.rsplit('.', 1)[1].lower() if '.' in filename else ''


def generate_filename(original_filename, prefix=''):
    """生成安全的文件名"""
    ext = get_file_extension(original_filename)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    random_str = generate_random_string(8)
    
    if prefix:
        return f"{prefix}_{timestamp}_{random_str}.{ext}"
    else:
        return f"{timestamp}_{random_str}.{ext}"


def ensure_dir(directory):
    """确保目录存在"""
    if not os.path.exists(directory):
        os.makedirs(directory)


def get_file_size(file_path):
    """获取文件大小"""
    try:
        return os.path.getsize(file_path)
    except OSError:
        return 0


def format_file_size(size_bytes):
    """格式化文件大小"""
    if size_bytes == 0:
        return "0B"
    
    size_names = ["B", "KB", "MB", "GB", "TB"]
    i = 0
    while size_bytes >= 1024 and i < len(size_names) - 1:
        size_bytes /= 1024.0
        i += 1
    
    return f"{size_bytes:.1f}{size_names[i]}"


def paginate_query(query, page, per_page, max_per_page=100):
    """分页查询"""
    if per_page > max_per_page:
        per_page = max_per_page
    
    total = query.count()
    items = query.offset((page - 1) * per_page).limit(per_page).all()
    
    return {
        'items': items,
        'total': total,
        'pages': (total + per_page - 1) // per_page,
        'current_page': page,
        'per_page': per_page,
        'has_prev': page > 1,
        'has_next': page * per_page < total
    }
