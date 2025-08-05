"""
论坛回复API路由
"""
from flask import request, jsonify
from app.api import api_bp
from app import db
from app.models import ForumPost, ForumReply
from app.auth.middleware import require_auth, get_current_user
from app.utils.helpers import paginate_query
from app.utils.validators import validate_pagination_params


@api_bp.route('/forum/posts/<int:post_id>/replies', methods=['GET'])
def get_post_replies(post_id):
    """获取帖子回复列表"""
    try:
        # 验证帖子是否存在
        post = ForumPost.query.get(post_id)
        if not post or post.is_deleted:
            return jsonify({
                'error': 'Post not found'
            }), 404
        
        # 获取查询参数
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # 验证分页参数
        validation_error = validate_pagination_params(page, per_page)
        if validation_error:
            return jsonify({
                'error': validation_error
            }), 400
        
        # 构建查询（只获取顶级回复）
        query = ForumReply.query.filter_by(
            post_id=post_id,
            parent_id=None,
            is_deleted=False
        ).order_by(ForumReply.created_at.asc())
        
        # 分页
        pagination = paginate_query(query, page, per_page)
        
        # 转换为字典并包含子回复
        replies = []
        for reply in pagination['items']:
            reply_dict = reply.to_dict()
            
            # 获取子回复（限制数量）
            child_replies = ForumReply.query.filter_by(
                parent_id=reply.id,
                is_deleted=False
            ).order_by(ForumReply.created_at.asc()).limit(5).all()
            
            reply_dict['children'] = [child.to_dict() for child in child_replies]
            reply_dict['child_count'] = ForumReply.query.filter_by(
                parent_id=reply.id,
                is_deleted=False
            ).count()
            
            replies.append(reply_dict)
        
        return jsonify({
            'replies': replies,
            'total': pagination['total'],
            'pages': pagination['pages'],
            'current_page': pagination['current_page'],
            'per_page': pagination['per_page'],
            'has_prev': pagination['has_prev'],
            'has_next': pagination['has_next']
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch post replies',
            'details': str(e)
        }), 500


@api_bp.route('/forum/posts/<int:post_id>/replies', methods=['POST'])
@require_auth()
def create_post_reply(post_id):
    """创建帖子回复"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({
                'error': 'Authentication required'
            }), 401
        
        # 验证帖子是否存在
        post = ForumPost.query.get(post_id)
        if not post or post.is_deleted:
            return jsonify({
                'error': 'Post not found'
            }), 404
        
        # 检查帖子是否被锁定
        if post.is_locked:
            return jsonify({
                'error': 'Post is locked'
            }), 403
        
        data = request.get_json()
        if not data:
            return jsonify({
                'error': 'No data provided'
            }), 400
        
        content = data.get('content', '').strip()
        if not content:
            return jsonify({
                'error': 'Reply content is required'
            }), 400
        
        if len(content) > 10000:
            return jsonify({
                'error': 'Reply too long (max 10000 characters)'
            }), 400
        
        parent_id = data.get('parent_id')
        
        # 如果是回复，验证父回复是否存在
        if parent_id:
            parent_reply = ForumReply.query.filter_by(
                id=parent_id,
                post_id=post_id,
                is_deleted=False
            ).first()
            
            if not parent_reply:
                return jsonify({
                    'error': 'Parent reply not found'
                }), 404
        
        # 创建回复
        reply = ForumReply(
            post_id=post_id,
            user_id=current_user.id,
            content=content,
            parent_id=parent_id
        )
        
        db.session.add(reply)
        
        # 更新帖子回复数
        post.reply_count += 1
        
        db.session.commit()
        
        return jsonify({
            'message': 'Reply created successfully',
            'reply': reply.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Failed to create reply',
            'details': str(e)
        }), 500
