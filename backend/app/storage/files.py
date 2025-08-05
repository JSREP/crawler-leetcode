"""
文件访问和管理路由
"""
import os
import mimetypes
from datetime import datetime
from flask import request, jsonify, current_app, send_file, abort
from app.storage import storage_bp
from app import db
from app.models import UserStorage, UserStorageQuota
from app.auth.middleware import require_auth, get_current_user
from app.utils.helpers import format_file_size, paginate_query


@storage_bp.route('/files/<path:file_path>', methods=['GET'])
def serve_file(file_path):
    """提供文件访问"""
    try:
        upload_folder = current_app.config['UPLOAD_FOLDER']
        full_path = os.path.join(upload_folder, file_path)
        
        # 安全检查：确保文件在上传目录内
        if not os.path.abspath(full_path).startswith(os.path.abspath(upload_folder)):
            abort(403)
        
        # 检查文件是否存在
        if not os.path.exists(full_path):
            abort(404)
        
        # 获取文件类型
        mimetype = mimetypes.guess_type(full_path)[0]
        
        # 检查是否请求缩略图
        if request.args.get('thumbnail') == 'true':
            thumbnail_path = get_thumbnail_path(full_path)
            if os.path.exists(thumbnail_path):
                full_path = thumbnail_path
        
        return send_file(
            full_path,
            mimetype=mimetype,
            as_attachment=request.args.get('download') == 'true'
        )
        
    except Exception as e:
        return jsonify({
            'error': 'File access failed',
            'details': str(e)
        }), 500


@storage_bp.route('/quota', methods=['GET'])
@require_auth()
def get_storage_quota():
    """获取存储配额信息"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({
                'error': 'Authentication required'
            }), 401
        
        quota = UserStorageQuota.query.filter_by(user_id=current_user.id).first()
        
        if not quota:
            # 创建默认配额
            quota = UserStorageQuota(
                user_id=current_user.id,
                total_quota=104857600,  # 100MB
                used_quota=0,
                purchased_quota=0
            )
            db.session.add(quota)
            db.session.commit()
        
        return jsonify({
            'quota': quota.to_dict(),
            'formatted': {
                'total_quota': format_file_size(quota.total_quota),
                'used_quota': format_file_size(quota.used_quota),
                'purchased_quota': format_file_size(quota.purchased_quota),
                'available_quota': format_file_size(quota.available_quota)
            }
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch quota',
            'details': str(e)
        }), 500


@storage_bp.route('/files', methods=['GET'])
@require_auth()
def get_user_files():
    """获取用户文件列表"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({
                'error': 'Authentication required'
            }), 401
        
        # 获取查询参数
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        purpose = request.args.get('purpose')
        file_type = request.args.get('file_type')
        
        # 构建查询
        query = UserStorage.query.filter_by(
            user_id=current_user.id,
            is_deleted=False
        )
        
        if purpose:
            query = query.filter(UserStorage.upload_purpose == purpose)
        
        if file_type:
            query = query.filter(UserStorage.file_type.like(f'{file_type}%'))
        
        # 排序
        query = query.order_by(UserStorage.created_at.desc())
        
        # 分页
        pagination = paginate_query(query, page, per_page)
        
        # 转换为字典并添加访问URL
        files = []
        for file_record in pagination['items']:
            file_dict = file_record.to_dict()
            file_dict['access_url'] = f"/storage/files/{file_record.file_path}"
            file_dict['download_url'] = f"/storage/files/{file_record.file_path}?download=true"
            
            # 如果是图片，添加缩略图URL
            if file_record.file_type.startswith('image/'):
                file_dict['thumbnail_url'] = f"/storage/files/{file_record.file_path}?thumbnail=true"
            
            files.append(file_dict)
        
        return jsonify({
            'files': files,
            'total': pagination['total'],
            'pages': pagination['pages'],
            'current_page': pagination['current_page'],
            'per_page': pagination['per_page'],
            'has_prev': pagination['has_prev'],
            'has_next': pagination['has_next']
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch files',
            'details': str(e)
        }), 500


@storage_bp.route('/files/<int:file_id>', methods=['DELETE'])
@require_auth()
def delete_file(file_id):
    """删除文件"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({
                'error': 'Authentication required'
            }), 401
        
        # 查找文件记录
        file_record = UserStorage.query.filter_by(
            id=file_id,
            user_id=current_user.id
        ).first()
        
        if not file_record:
            return jsonify({
                'error': 'File not found'
            }), 404
        
        # 删除物理文件
        upload_folder = current_app.config['UPLOAD_FOLDER']
        file_path = os.path.join(upload_folder, file_record.file_path)
        
        if os.path.exists(file_path):
            os.remove(file_path)
            
            # 删除缩略图（如果存在）
            thumbnail_path = get_thumbnail_path(file_path)
            if os.path.exists(thumbnail_path):
                os.remove(thumbnail_path)
        
        # 更新存储配额
        quota = UserStorageQuota.query.filter_by(user_id=current_user.id).first()
        if quota:
            quota.used_quota = max(0, quota.used_quota - file_record.file_size)
            quota.updated_at = datetime.utcnow()
        
        # 删除数据库记录
        db.session.delete(file_record)
        db.session.commit()
        
        return jsonify({
            'message': 'File deleted successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Failed to delete file',
            'details': str(e)
        }), 500


@storage_bp.route('/files/<int:file_id>/info', methods=['GET'])
@require_auth()
def get_file_info(file_id):
    """获取文件详细信息"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({
                'error': 'Authentication required'
            }), 401
        
        file_record = UserStorage.query.filter_by(
            id=file_id,
            user_id=current_user.id
        ).first()
        
        if not file_record:
            return jsonify({
                'error': 'File not found'
            }), 404
        
        # 检查物理文件是否存在
        upload_folder = current_app.config['UPLOAD_FOLDER']
        file_path = os.path.join(upload_folder, file_record.file_path)
        file_exists = os.path.exists(file_path)
        
        file_info = file_record.to_dict()
        file_info['file_exists'] = file_exists
        file_info['access_url'] = f"/storage/files/{file_record.file_path}"
        file_info['download_url'] = f"/storage/files/{file_record.file_path}?download=true"
        
        if file_record.file_type.startswith('image/'):
            file_info['thumbnail_url'] = f"/storage/files/{file_record.file_path}?thumbnail=true"
        
        # 添加格式化的文件大小
        file_info['formatted_size'] = format_file_size(file_record.file_size)
        
        return jsonify(file_info)
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch file info',
            'details': str(e)
        }), 500


@storage_bp.route('/cleanup', methods=['POST'])
@require_auth()
def cleanup_storage():
    """清理存储空间"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({
                'error': 'Authentication required'
            }), 401
        
        upload_folder = current_app.config['UPLOAD_FOLDER']
        cleaned_files = 0
        freed_space = 0
        
        # 查找已删除的文件记录
        deleted_records = UserStorage.query.filter_by(
            user_id=current_user.id,
            is_deleted=True
        ).all()
        
        for record in deleted_records:
            file_path = os.path.join(upload_folder, record.file_path)
            
            # 删除物理文件
            if os.path.exists(file_path):
                os.remove(file_path)
                freed_space += record.file_size
                cleaned_files += 1
                
                # 删除缩略图
                thumbnail_path = get_thumbnail_path(file_path)
                if os.path.exists(thumbnail_path):
                    os.remove(thumbnail_path)
            
            # 删除数据库记录
            db.session.delete(record)
        
        # 查找孤立的物理文件（数据库中没有记录的文件）
        user_files = UserStorage.query.filter_by(user_id=current_user.id).all()
        db_file_paths = {f.file_path for f in user_files}
        
        # 扫描用户的文件目录
        user_folders = ['uploads', 'avatars', 'challenges']
        for folder in user_folders:
            folder_path = os.path.join(upload_folder, folder)
            if os.path.exists(folder_path):
                for filename in os.listdir(folder_path):
                    file_path = os.path.join(folder, filename)
                    full_path = os.path.join(upload_folder, file_path)
                    
                    # 如果文件不在数据库记录中，删除它
                    if file_path not in db_file_paths and os.path.isfile(full_path):
                        try:
                            file_size = os.path.getsize(full_path)
                            os.remove(full_path)
                            freed_space += file_size
                            cleaned_files += 1
                        except Exception as e:
                            print(f"Failed to remove orphaned file {full_path}: {e}")
        
        db.session.commit()
        
        return jsonify({
            'message': 'Storage cleanup completed',
            'cleaned_files': cleaned_files,
            'freed_space': freed_space,
            'freed_space_formatted': format_file_size(freed_space)
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Storage cleanup failed',
            'details': str(e)
        }), 500


def get_thumbnail_path(original_path):
    """获取缩略图路径"""
    directory = os.path.dirname(original_path)
    filename = os.path.basename(original_path)
    name, ext = os.path.splitext(filename)
    return os.path.join(directory, f"{name}_thumb{ext}")
