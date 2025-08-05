"""
文件上传处理路由
"""
import os
import mimetypes
from datetime import datetime
from flask import request, jsonify, current_app, send_file
from werkzeug.utils import secure_filename
from PIL import Image
from app.storage import storage_bp
from app import db
from app.models import UserStorage, UserStorageQuota
from app.auth.middleware import require_auth, get_current_user
from app.utils.helpers import (
    generate_filename, ensure_dir, get_file_size, 
    format_file_size, allowed_file
)
from app.utils.validators import validate_file_upload


@storage_bp.route('/upload', methods=['POST'])
@require_auth()
def upload_file():
    """文件上传"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({
                'error': 'Authentication required'
            }), 401
        
        # 检查文件
        if 'file' not in request.files:
            return jsonify({
                'error': 'No file provided'
            }), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({
                'error': 'No file selected'
            }), 400
        
        # 获取上传参数
        upload_purpose = request.form.get('purpose', 'general')
        category = request.form.get('category', 'uploads')
        
        # 验证文件类型
        if not allowed_file(file.filename, current_app.config['ALLOWED_EXTENSIONS']):
            return jsonify({
                'error': 'File type not allowed'
            }), 400
        
        # 检查文件大小
        file.seek(0, 2)  # 移动到文件末尾
        file_size = file.tell()
        file.seek(0)  # 重置到开头
        
        if file_size > current_app.config['MAX_CONTENT_LENGTH']:
            return jsonify({
                'error': f'File too large (max {format_file_size(current_app.config["MAX_CONTENT_LENGTH"])})'
            }), 400
        
        # 检查存储配额
        quota_check = check_storage_quota(current_user.id, file_size)
        if not quota_check['allowed']:
            return jsonify({
                'error': quota_check['message']
            }), 400
        
        # 生成文件名和路径
        original_filename = secure_filename(file.filename)
        filename = generate_filename(original_filename, category)
        
        # 创建存储目录
        upload_folder = current_app.config['UPLOAD_FOLDER']
        category_folder = os.path.join(upload_folder, category)
        ensure_dir(category_folder)
        
        file_path = os.path.join(category_folder, filename)
        relative_path = os.path.join(category, filename)
        
        # 保存文件
        file.save(file_path)
        
        # 获取文件类型
        file_type = mimetypes.guess_type(file_path)[0] or 'application/octet-stream'
        
        # 如果是图片，生成缩略图
        if file_type.startswith('image/'):
            try:
                generate_thumbnail(file_path, category_folder)
            except Exception as e:
                print(f"Failed to generate thumbnail: {e}")
        
        # 记录到数据库
        storage_record = UserStorage(
            user_id=current_user.id,
            file_name=original_filename,
            file_size=file_size,
            file_type=file_type,
            file_path=relative_path,
            upload_purpose=upload_purpose
        )
        
        db.session.add(storage_record)
        
        # 更新存储配额
        update_storage_quota(current_user.id, file_size)
        
        db.session.commit()
        
        # 生成访问URL
        access_url = f"/storage/files/{relative_path}"
        
        return jsonify({
            'success': True,
            'id': storage_record.id,
            'filename': filename,
            'original_filename': original_filename,
            'file_size': file_size,
            'file_type': file_type,
            'file_path': relative_path,
            'access_url': access_url,
            'upload_purpose': upload_purpose,
            'uploaded_at': storage_record.created_at.isoformat()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'File upload failed',
            'details': str(e)
        }), 500


@storage_bp.route('/upload/avatar', methods=['POST'])
@require_auth()
def upload_avatar():
    """头像上传"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({
                'error': 'Authentication required'
            }), 401
        
        # 检查文件
        if 'file' not in request.files:
            return jsonify({
                'error': 'No file provided'
            }), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({
                'error': 'No file selected'
            }), 400
        
        # 验证是否为图片
        file_type = mimetypes.guess_type(file.filename)[0]
        if not file_type or not file_type.startswith('image/'):
            return jsonify({
                'error': 'Only image files are allowed for avatars'
            }), 400
        
        # 检查文件大小（头像限制更小）
        file.seek(0, 2)
        file_size = file.tell()
        file.seek(0)
        
        max_avatar_size = 2 * 1024 * 1024  # 2MB
        if file_size > max_avatar_size:
            return jsonify({
                'error': f'Avatar too large (max {format_file_size(max_avatar_size)})'
            }), 400
        
        # 生成文件名
        filename = generate_filename(file.filename, f'avatar_{current_user.id}')
        
        # 创建头像目录
        upload_folder = current_app.config['UPLOAD_FOLDER']
        avatar_folder = os.path.join(upload_folder, 'avatars')
        ensure_dir(avatar_folder)
        
        file_path = os.path.join(avatar_folder, filename)
        relative_path = os.path.join('avatars', filename)
        
        # 保存文件
        file.save(file_path)
        
        # 处理图片（调整大小）
        try:
            process_avatar_image(file_path)
        except Exception as e:
            print(f"Failed to process avatar: {e}")
        
        # 删除旧头像文件
        try:
            old_avatars = UserStorage.query.filter_by(
                user_id=current_user.id,
                upload_purpose='avatar'
            ).all()
            
            for old_avatar in old_avatars:
                old_file_path = os.path.join(upload_folder, old_avatar.file_path)
                if os.path.exists(old_file_path):
                    os.remove(old_file_path)
                db.session.delete(old_avatar)
        except Exception as e:
            print(f"Failed to cleanup old avatars: {e}")
        
        # 记录到数据库
        storage_record = UserStorage(
            user_id=current_user.id,
            file_name=secure_filename(file.filename),
            file_size=get_file_size(file_path),
            file_type=file_type,
            file_path=relative_path,
            upload_purpose='avatar'
        )
        
        db.session.add(storage_record)
        
        # 更新用户头像URL
        current_user.avatar_url = f"/storage/files/{relative_path}"
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'avatar_url': current_user.avatar_url,
            'file_size': storage_record.file_size,
            'uploaded_at': storage_record.created_at.isoformat()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Avatar upload failed',
            'details': str(e)
        }), 500


def check_storage_quota(user_id, file_size):
    """检查存储配额"""
    try:
        quota = UserStorageQuota.query.filter_by(user_id=user_id).first()
        
        if not quota:
            # 创建默认配额
            quota = UserStorageQuota(
                user_id=user_id,
                total_quota=104857600,  # 100MB
                used_quota=0,
                purchased_quota=0
            )
            db.session.add(quota)
            db.session.flush()
        
        available = quota.total_quota + quota.purchased_quota - quota.used_quota
        
        if file_size > available:
            return {
                'allowed': False,
                'message': f'Storage quota exceeded. Available: {format_file_size(available)}, Required: {format_file_size(file_size)}'
            }
        
        return {'allowed': True}
        
    except Exception as e:
        return {
            'allowed': False,
            'message': f'Failed to check quota: {str(e)}'
        }


def update_storage_quota(user_id, file_size):
    """更新存储配额使用量"""
    try:
        quota = UserStorageQuota.query.filter_by(user_id=user_id).first()
        if quota:
            quota.used_quota += file_size
            quota.updated_at = datetime.utcnow()
    except Exception as e:
        print(f"Failed to update quota: {e}")


def generate_thumbnail(image_path, output_dir):
    """生成缩略图"""
    try:
        with Image.open(image_path) as img:
            # 生成缩略图
            img.thumbnail((200, 200), Image.Resampling.LANCZOS)
            
            # 保存缩略图
            filename = os.path.basename(image_path)
            name, ext = os.path.splitext(filename)
            thumbnail_filename = f"{name}_thumb{ext}"
            thumbnail_path = os.path.join(output_dir, thumbnail_filename)
            
            img.save(thumbnail_path, optimize=True, quality=85)
            
    except Exception as e:
        raise Exception(f"Thumbnail generation failed: {e}")


def process_avatar_image(image_path):
    """处理头像图片"""
    try:
        with Image.open(image_path) as img:
            # 转换为RGB（如果需要）
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            
            # 调整大小为正方形
            size = min(img.size)
            img = img.crop((
                (img.width - size) // 2,
                (img.height - size) // 2,
                (img.width + size) // 2,
                (img.height + size) // 2
            ))
            
            # 调整到标准尺寸
            img = img.resize((256, 256), Image.Resampling.LANCZOS)
            
            # 保存优化后的图片
            img.save(image_path, optimize=True, quality=90)
            
    except Exception as e:
        raise Exception(f"Avatar processing failed: {e}")
