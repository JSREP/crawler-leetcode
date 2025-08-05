"""
论坛系统API路由
"""
from flask import request, jsonify
from sqlalchemy import or_, and_
from app.api import api_bp
from app import db
from app.models import ForumPost, ForumReply, Challenge
from app.auth.middleware import require_auth, require_admin, get_current_user
from app.utils.helpers import paginate_query
from app.utils.validators import validate_pagination_params


@api_bp.route('/forum/posts', methods=['GET'])
def get_forum_posts():
    """获取论坛帖子列表"""
    try:
        # 获取查询参数
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        challenge_id = request.args.get('challenge_id', type=int)
        search = request.args.get('search')
        sort_by = request.args.get('sort_by', 'created_at')  # created_at, view_count, like_count
        
        # 验证分页参数
        validation_error = validate_pagination_params(page, per_page)
        if validation_error:
            return jsonify({
                'error': validation_error
            }), 400
        
        # 构建查询
        query = ForumPost.query.filter_by(is_deleted=False)
        
        # 过滤条件
        if challenge_id:
            query = query.filter_by(challenge_id=challenge_id)
        
        if search:
            search_filter = or_(
                ForumPost.title.contains(search),
                ForumPost.content.contains(search)
            )
            query = query.filter(search_filter)
        
        # 排序
        if sort_by == 'view_count':
            query = query.order_by(ForumPost.view_count.desc())
        elif sort_by == 'like_count':
            query = query.order_by(ForumPost.like_count.desc())
        elif sort_by == 'reply_count':
            query = query.order_by(ForumPost.reply_count.desc())
        else:
            # 置顶帖子优先，然后按创建时间排序
            query = query.order_by(ForumPost.is_pinned.desc(), ForumPost.created_at.desc())
        
        # 分页
        pagination = paginate_query(query, page, per_page)
        
        # 转换为字典
        posts = [post.to_dict() for post in pagination['items']]
        
        return jsonify({
            'posts': posts,
            'total': pagination['total'],
            'pages': pagination['pages'],
            'current_page': pagination['current_page'],
            'per_page': pagination['per_page'],
            'has_prev': pagination['has_prev'],
            'has_next': pagination['has_next']
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch forum posts',
            'details': str(e)
        }), 500


@api_bp.route('/forum/posts', methods=['POST'])
@require_auth()
def create_forum_post():
    """创建论坛帖子"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({
                'error': 'Authentication required'
            }), 401
        
        data = request.get_json()
        if not data:
            return jsonify({
                'error': 'No data provided'
            }), 400
        
        title = data.get('title', '').strip()
        content = data.get('content', '').strip()
        challenge_id = data.get('challenge_id')
        
        # 验证必需字段
        if not title:
            return jsonify({
                'error': 'Post title is required'
            }), 400
        
        if not content:
            return jsonify({
                'error': 'Post content is required'
            }), 400
        
        if len(title) > 255:
            return jsonify({
                'error': 'Title too long (max 255 characters)'
            }), 400
        
        if len(content) > 50000:
            return jsonify({
                'error': 'Content too long (max 50000 characters)'
            }), 400
        
        # 验证挑战是否存在（如果提供）
        if challenge_id:
            challenge = Challenge.query.get(challenge_id)
            if not challenge:
                return jsonify({
                    'error': 'Challenge not found'
                }), 404
        
        # 创建帖子
        post = ForumPost(
            user_id=current_user.id,
            challenge_id=challenge_id,
            title=title,
            content=content
        )
        
        db.session.add(post)
        db.session.commit()
        
        return jsonify({
            'message': 'Forum post created successfully',
            'post': post.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Failed to create forum post',
            'details': str(e)
        }), 500


@api_bp.route('/forum/posts/<int:post_id>', methods=['GET'])
def get_forum_post(post_id):
    """获取单个论坛帖子"""
    try:
        post = ForumPost.query.get(post_id)
        if not post or post.is_deleted:
            return jsonify({
                'error': 'Post not found'
            }), 404
        
        # 增加浏览次数
        post.view_count += 1
        db.session.commit()
        
        return jsonify(post.to_dict())
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch forum post',
            'details': str(e)
        }), 500


@api_bp.route('/forum/posts/<int:post_id>', methods=['PUT'])
@require_auth()
def update_forum_post(post_id):
    """更新论坛帖子"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({
                'error': 'Authentication required'
            }), 401
        
        post = ForumPost.query.get(post_id)
        if not post or post.is_deleted:
            return jsonify({
                'error': 'Post not found'
            }), 404
        
        # 检查权限（只有作者或管理员可以编辑）
        if post.user_id != current_user.id and not current_user.is_admin():
            return jsonify({
                'error': 'Permission denied'
            }), 403
        
        data = request.get_json()
        if not data:
            return jsonify({
                'error': 'No data provided'
            }), 400
        
        # 更新字段
        if 'title' in data:
            title = data['title'].strip()
            if not title:
                return jsonify({
                    'error': 'Post title is required'
                }), 400
            if len(title) > 255:
                return jsonify({
                    'error': 'Title too long (max 255 characters)'
                }), 400
            post.title = title
        
        if 'content' in data:
            content = data['content'].strip()
            if not content:
                return jsonify({
                    'error': 'Post content is required'
                }), 400
            if len(content) > 50000:
                return jsonify({
                    'error': 'Content too long (max 50000 characters)'
                }), 400
            post.content = content
        
        # 管理员可以设置置顶和锁定
        if current_user.is_admin():
            if 'is_pinned' in data:
                post.is_pinned = bool(data['is_pinned'])
            if 'is_locked' in data:
                post.is_locked = bool(data['is_locked'])
        
        post.updated_at = db.func.now()
        db.session.commit()
        
        return jsonify({
            'message': 'Forum post updated successfully',
            'post': post.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Failed to update forum post',
            'details': str(e)
        }), 500


@api_bp.route('/forum/posts/<int:post_id>', methods=['DELETE'])
@require_auth()
def delete_forum_post(post_id):
    """删除论坛帖子"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({
                'error': 'Authentication required'
            }), 401
        
        post = ForumPost.query.get(post_id)
        if not post or post.is_deleted:
            return jsonify({
                'error': 'Post not found'
            }), 404
        
        # 检查权限（只有作者或管理员可以删除）
        if post.user_id != current_user.id and not current_user.is_admin():
            return jsonify({
                'error': 'Permission denied'
            }), 403
        
        # 软删除
        post.is_deleted = True
        post.updated_at = db.func.now()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Forum post deleted successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Failed to delete forum post',
            'details': str(e)
        }), 500


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
