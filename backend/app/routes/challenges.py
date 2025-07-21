from flask import jsonify, request
from . import api_bp
from ..models.challenge import Challenge
from .. import db

@api_bp.route('/challenges', methods=['GET'])
def get_challenges():
    """获取挑战列表"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # 获取查询参数
    platform = request.args.get('platform')
    difficulty = request.args.get('difficulty', type=int)
    tag = request.args.get('tag')
    
    # 构建查询
    query = Challenge.query
    
    if platform:
        query = query.filter_by(platform=platform)
    if difficulty:
        query = query.filter_by(difficulty_level=difficulty)
    if tag:
        query = query.filter(Challenge.tags.contains([tag]))
        
    # 执行分页查询
    pagination = query.order_by(Challenge.create_time.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    challenges = pagination.items
    
    return jsonify({
        'challenges': [challenge.to_dict() for challenge in challenges],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    })

@api_bp.route('/challenges/<int:id>', methods=['GET'])
def get_challenge(id):
    """获取单个挑战详情"""
    challenge = Challenge.query.get_or_404(id)
    return jsonify(challenge.to_dict())

@api_bp.route('/challenges', methods=['POST'])
def create_challenge():
    """创建新挑战"""
    data = request.get_json()
    
    challenge = Challenge(
        id_alias=data['id_alias'],
        name=data['name'],
        name_en=data.get('name_en'),
        platform=data['platform'],
        difficulty_level=data['difficulty_level'],
        description_markdown=data['description_markdown'],
        description_markdown_en=data.get('description_markdown_en'),
        base64_url=data['base64_url'],
        tags=data.get('tags', [])
    )
    
    db.session.add(challenge)
    db.session.commit()
    
    return jsonify(challenge.to_dict()), 201

@api_bp.route('/challenges/<int:id>', methods=['PUT'])
def update_challenge(id):
    """更新挑战"""
    challenge = Challenge.query.get_or_404(id)
    data = request.get_json()
    
    for key, value in data.items():
        if hasattr(challenge, key):
            setattr(challenge, key, value)
    
    db.session.commit()
    return jsonify(challenge.to_dict())

@api_bp.route('/challenges/<int:id>', methods=['DELETE'])
def delete_challenge(id):
    """删除挑战"""
    challenge = Challenge.query.get_or_404(id)
    db.session.delete(challenge)
    db.session.commit()
    return '', 204 