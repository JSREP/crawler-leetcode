"""
评论系统API路由
"""
from flask import request, jsonify
from app.api import api_bp
from app import db
from app.models import ChallengeComment, Challenge
from app.auth.middleware import require_auth, get_current_user
from app.utils.helpers import paginate_query
from app.utils.validators import validate_pagination_params


@api_bp.route('/challenges/<int:challenge_id>/comments', methods=['GET'])
def get_challenge_comments(challenge_id):
    """获取挑战评论列表"""
    try:
        # 验证挑战是否存在
        challenge = Challenge.query.get(challenge_id)
        if not challenge:
            return jsonify({
                'error': 'Challenge not found'
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
        
        # 构建查询（只获取顶级评论）
        query = ChallengeComment.query.filter_by(
            challenge_id=challenge_id,
            parent_id=None,
            is_deleted=False
        ).order_by(ChallengeComment.created_at.desc())
        
        # 分页
        pagination = paginate_query(query, page, per_page)
        
        # 转换为字典并包含回复
        comments = []
        for comment in pagination['items']:
            comment_dict = comment.to_dict()
            
            # 获取回复（限制数量）
            replies = ChallengeComment.query.filter_by(
                parent_id=comment.id,
                is_deleted=False
            ).order_by(ChallengeComment.created_at.asc()).limit(5).all()
            
            comment_dict['replies'] = [reply.to_dict() for reply in replies]
            comment_dict['reply_count'] = ChallengeComment.query.filter_by(
                parent_id=comment.id,
                is_deleted=False
            ).count()
            
            comments.append(comment_dict)
        
        return jsonify({
            'comments': comments,
            'total': pagination['total'],
            'pages': pagination['pages'],
            'current_page': pagination['current_page'],
            'per_page': pagination['per_page'],
            'has_prev': pagination['has_prev'],
            'has_next': pagination['has_next']
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch comments',
            'details': str(e)
        }), 500


@api_bp.route('/challenges/<int:challenge_id>/comments', methods=['POST'])
@require_auth()
def create_challenge_comment(challenge_id):
    """创建挑战评论"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({
                'error': 'Authentication required'
            }), 401
        
        # 验证挑战是否存在
        challenge = Challenge.query.get(challenge_id)
        if not challenge:
            return jsonify({
                'error': 'Challenge not found'
            }), 404
        
        data = request.get_json()
        if not data:
            return jsonify({
                'error': 'No data provided'
            }), 400
        
        content = data.get('content', '').strip()
        if not content:
            return jsonify({
                'error': 'Comment content is required'
            }), 400
        
        if len(content) > 5000:
            return jsonify({
                'error': 'Comment too long (max 5000 characters)'
            }), 400
        
        parent_id = data.get('parent_id')
        
        # 如果是回复，验证父评论是否存在
        if parent_id:
            parent_comment = ChallengeComment.query.filter_by(
                id=parent_id,
                challenge_id=challenge_id,
                is_deleted=False
            ).first()
            
            if not parent_comment:
                return jsonify({
                    'error': 'Parent comment not found'
                }), 404
        
        # 创建评论
        comment = ChallengeComment(
            challenge_id=challenge_id,
            user_id=current_user.id,
            content=content,
            parent_id=parent_id
        )
        
        db.session.add(comment)
        db.session.commit()
        
        return jsonify({
            'message': 'Comment created successfully',
            'comment': comment.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Failed to create comment',
            'details': str(e)
        }), 500


@api_bp.route('/comments/<int:comment_id>', methods=['PUT'])
@require_auth()
def update_comment(comment_id):
    """更新评论"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({
                'error': 'Authentication required'
            }), 401
        
        comment = ChallengeComment.query.get(comment_id)
        if not comment:
            return jsonify({
                'error': 'Comment not found'
            }), 404
        
        # 检查权限（只有作者或管理员可以编辑）
        if comment.user_id != current_user.id and not current_user.is_admin():
            return jsonify({
                'error': 'Permission denied'
            }), 403
        
        data = request.get_json()
        if not data:
            return jsonify({
                'error': 'No data provided'
            }), 400
        
        content = data.get('content', '').strip()
        if not content:
            return jsonify({
                'error': 'Comment content is required'
            }), 400
        
        if len(content) > 5000:
            return jsonify({
                'error': 'Comment too long (max 5000 characters)'
            }), 400
        
        comment.content = content
        comment.updated_at = db.func.now()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Comment updated successfully',
            'comment': comment.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Failed to update comment',
            'details': str(e)
        }), 500


@api_bp.route('/comments/<int:comment_id>', methods=['DELETE'])
@require_auth()
def delete_comment(comment_id):
    """删除评论"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({
                'error': 'Authentication required'
            }), 401
        
        comment = ChallengeComment.query.get(comment_id)
        if not comment:
            return jsonify({
                'error': 'Comment not found'
            }), 404
        
        # 检查权限（只有作者或管理员可以删除）
        if comment.user_id != current_user.id and not current_user.is_admin():
            return jsonify({
                'error': 'Permission denied'
            }), 403
        
        # 软删除
        comment.is_deleted = True
        comment.updated_at = db.func.now()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Comment deleted successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Failed to delete comment',
            'details': str(e)
        }), 500


@api_bp.route('/comments/<int:comment_id>/replies', methods=['GET'])
def get_comment_replies(comment_id):
    """获取评论的回复列表"""
    try:
        # 验证父评论是否存在
        parent_comment = ChallengeComment.query.get(comment_id)
        if not parent_comment:
            return jsonify({
                'error': 'Comment not found'
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
        
        # 构建查询
        query = ChallengeComment.query.filter_by(
            parent_id=comment_id,
            is_deleted=False
        ).order_by(ChallengeComment.created_at.asc())
        
        # 分页
        pagination = paginate_query(query, page, per_page)
        
        # 转换为字典
        replies = [reply.to_dict() for reply in pagination['items']]
        
        return jsonify({
            'replies': replies,
            'total': pagination['total'],
            'pages': pagination['pages'],
            'current_page': pagination['current_page'],
            'per_page': pagination['per_page'],
            'has_prev': pagination['has_prev'],
            'has_next': pagination['has_next'],
            'parent_comment': parent_comment.to_dict()
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch replies',
            'details': str(e)
        }), 500
