"""
挑战相关API路由
"""
from flask import request, jsonify
from app.api import api_bp
from app import db
from app.models import Challenge
from app.utils.helpers import paginate_query
from app.utils.validators import validate_challenge_data
from sqlalchemy import or_, and_


@api_bp.route('/db/challenges', methods=['GET'])
def get_challenges():
    """获取挑战列表（分页）"""
    try:
        # 获取查询参数
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        platform = request.args.get('platform')
        difficulty = request.args.get('difficulty', type=int)
        tag = request.args.get('tag')
        query_text = request.args.get('query')
        
        # 限制每页最大数量
        per_page = min(per_page, 100)
        
        # 构建查询
        query = Challenge.query
        
        # 应用过滤条件
        if platform:
            query = query.filter(Challenge.platform == platform)
        
        if difficulty is not None:
            query = query.filter(Challenge.difficulty_level == difficulty)
        
        if tag:
            # MySQL JSON字段查询
            query = query.filter(Challenge.tags.contains(f'"{tag}"'))
        
        if query_text:
            # 搜索挑战名称和描述
            search_filter = or_(
                Challenge.name.contains(query_text),
                Challenge.name_en.contains(query_text),
                Challenge.description_markdown.contains(query_text)
            )
            query = query.filter(search_filter)
        
        # 排序
        query = query.order_by(Challenge.created_at.desc())
        
        # 分页
        pagination = paginate_query(query, page, per_page)
        
        # 转换为字典
        challenges = [challenge.to_dict() for challenge in pagination['items']]
        
        return jsonify({
            'challenges': challenges,
            'total': pagination['total'],
            'pages': pagination['pages'],
            'current_page': pagination['current_page'],
            'per_page': pagination['per_page'],
            'has_prev': pagination['has_prev'],
            'has_next': pagination['has_next']
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch challenges',
            'details': str(e)
        }), 500


@api_bp.route('/db/challenges/<string:alias>', methods=['GET'])
def get_challenge_by_alias(alias):
    """根据别名获取单个挑战"""
    try:
        challenge = Challenge.query.filter_by(id_alias=alias).first()
        
        if not challenge:
            return jsonify({
                'error': 'Challenge not found'
            }), 404
        
        return jsonify(challenge.to_dict())
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch challenge',
            'details': str(e)
        }), 500


@api_bp.route('/db/challenges', methods=['POST'])
def create_challenge():
    """创建新挑战"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'No data provided'
            }), 400
        
        # 验证数据
        validation_error = validate_challenge_data(data)
        if validation_error:
            return jsonify({
                'error': 'Validation failed',
                'details': validation_error
            }), 400
        
        # 检查别名是否已存在
        existing = Challenge.query.filter_by(id_alias=data['id_alias']).first()
        if existing:
            return jsonify({
                'error': 'Challenge with this alias already exists'
            }), 409
        
        # 创建挑战
        challenge = Challenge(
            id_alias=data['id_alias'],
            name=data['name'],
            name_en=data.get('name_en'),
            platform=data['platform'],
            difficulty_level=data['difficulty_level'],
            description_markdown=data.get('description_markdown'),
            description_markdown_en=data.get('description_markdown_en'),
            base64_url=data['base64_url'],
            is_expired=data.get('is_expired', False)
        )
        
        # 设置标签
        if 'tags' in data:
            challenge.tags_list = data['tags']
        
        db.session.add(challenge)
        db.session.commit()
        
        return jsonify({
            'id': challenge.id,
            'message': 'Challenge created successfully',
            'challenge': challenge.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Failed to create challenge',
            'details': str(e)
        }), 500


@api_bp.route('/db/challenges/<int:challenge_id>', methods=['PUT'])
def update_challenge(challenge_id):
    """更新挑战"""
    try:
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
        
        # 更新字段
        updatable_fields = [
            'name', 'name_en', 'platform', 'difficulty_level',
            'description_markdown', 'description_markdown_en',
            'base64_url', 'is_expired'
        ]
        
        for field in updatable_fields:
            if field in data:
                setattr(challenge, field, data[field])
        
        # 更新标签
        if 'tags' in data:
            challenge.tags_list = data['tags']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Challenge updated successfully',
            'challenge': challenge.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Failed to update challenge',
            'details': str(e)
        }), 500


@api_bp.route('/db/challenges/<int:challenge_id>', methods=['DELETE'])
def delete_challenge(challenge_id):
    """删除挑战"""
    try:
        challenge = Challenge.query.get(challenge_id)
        
        if not challenge:
            return jsonify({
                'error': 'Challenge not found'
            }), 404
        
        db.session.delete(challenge)
        db.session.commit()
        
        return jsonify({
            'message': 'Challenge deleted successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Failed to delete challenge',
            'details': str(e)
        }), 500
