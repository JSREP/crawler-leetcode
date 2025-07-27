"""
使用 PostgreSQL 数据库的挑战 API 路由
"""
from flask import jsonify, request
from . import api_bp
from ..database import get_db_manager
import json

@api_bp.route('/db/challenges', methods=['GET'])
def get_db_challenges():
    """从数据库获取挑战列表"""
    try:
        db = get_db_manager()
        
        # 获取查询参数
        platform = request.args.get('platform')
        difficulty = request.args.get('difficulty', type=int)
        tag = request.args.get('tag')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # 构建查询条件
        where_conditions = []
        params = []
        
        if platform:
            where_conditions.append("platform = %s")
            params.append(platform)
            
        if difficulty:
            where_conditions.append("difficulty_level = %s")
            params.append(difficulty)
            
        if tag:
            where_conditions.append("tags @> %s")
            params.append(json.dumps([tag]))
        
        # 构建 WHERE 子句
        where_clause = ""
        if where_conditions:
            where_clause = "WHERE " + " AND ".join(where_conditions)
        
        # 计算偏移量
        offset = (page - 1) * per_page
        
        # 获取总数
        count_query = f"""
        SELECT COUNT(*) as total 
        FROM challenges 
        {where_clause};
        """
        
        count_result = db.execute_query(count_query, params)
        total = count_result[0]['total'] if count_result else 0
        
        # 获取分页数据
        data_query = f"""
        SELECT 
            id, id_alias, name, name_en, platform, difficulty_level,
            description_markdown, description_markdown_en, base64_url,
            is_expired, tags, created_at, updated_at
        FROM challenges 
        {where_clause}
        ORDER BY created_at DESC
        LIMIT %s OFFSET %s;
        """
        
        data_params = params + [per_page, offset]
        challenges = db.execute_query(data_query, data_params)
        
        # 处理结果
        if challenges:
            for challenge in challenges:
                # 确保 tags 是数组格式
                if challenge['tags'] and isinstance(challenge['tags'], str):
                    challenge['tags'] = json.loads(challenge['tags'])
                elif not challenge['tags']:
                    challenge['tags'] = []
                
                # 转换时间格式
                if challenge['created_at']:
                    challenge['created_at'] = challenge['created_at'].isoformat()
                if challenge['updated_at']:
                    challenge['updated_at'] = challenge['updated_at'].isoformat()
        
        # 计算总页数
        total_pages = (total + per_page - 1) // per_page
        
        return jsonify({
            'challenges': challenges or [],
            'total': total,
            'pages': total_pages,
            'current_page': page,
            'per_page': per_page
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/db/challenges/<id_alias>', methods=['GET'])
def get_db_challenge_by_alias(id_alias):
    """根据别名获取单个挑战详情"""
    try:
        db = get_db_manager()
        challenge = db.get_challenge_by_alias(id_alias)
        
        if not challenge:
            return jsonify({'error': 'Challenge not found'}), 404
        
        # 处理结果
        if challenge['tags'] and isinstance(challenge['tags'], str):
            challenge['tags'] = json.loads(challenge['tags'])
        elif not challenge['tags']:
            challenge['tags'] = []
        
        # 转换时间格式
        if challenge['created_at']:
            challenge['created_at'] = challenge['created_at'].isoformat()
        if challenge['updated_at']:
            challenge['updated_at'] = challenge['updated_at'].isoformat()
        
        return jsonify(challenge)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/db/challenges/<int:challenge_id>', methods=['GET'])
def get_db_challenge_by_id(challenge_id):
    """根据ID获取单个挑战详情"""
    try:
        db = get_db_manager()
        
        query = """
        SELECT 
            id, id_alias, name, name_en, platform, difficulty_level,
            description_markdown, description_markdown_en, base64_url,
            is_expired, tags, created_at, updated_at
        FROM challenges 
        WHERE id = %s;
        """
        
        results = db.execute_query(query, (challenge_id,))
        
        if not results:
            return jsonify({'error': 'Challenge not found'}), 404
        
        challenge = results[0]
        
        # 处理结果
        if challenge['tags'] and isinstance(challenge['tags'], str):
            challenge['tags'] = json.loads(challenge['tags'])
        elif not challenge['tags']:
            challenge['tags'] = []
        
        # 转换时间格式
        if challenge['created_at']:
            challenge['created_at'] = challenge['created_at'].isoformat()
        if challenge['updated_at']:
            challenge['updated_at'] = challenge['updated_at'].isoformat()
        
        return jsonify(challenge)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/db/challenges/stats', methods=['GET'])
def get_db_challenges_stats():
    """获取挑战统计信息"""
    try:
        db = get_db_manager()
        
        # 总数统计
        total_query = "SELECT COUNT(*) as total FROM challenges;"
        total_result = db.execute_query(total_query)
        total = total_result[0]['total'] if total_result else 0
        
        # 平台分布
        platform_query = """
        SELECT platform, COUNT(*) as count 
        FROM challenges 
        GROUP BY platform 
        ORDER BY count DESC;
        """
        platform_stats = db.execute_query(platform_query)
        
        # 难度分布
        difficulty_query = """
        SELECT difficulty_level, COUNT(*) as count 
        FROM challenges 
        GROUP BY difficulty_level 
        ORDER BY difficulty_level;
        """
        difficulty_stats = db.execute_query(difficulty_query)
        
        # 标签统计（前10个最常用的标签）
        tag_query = """
        SELECT tag, COUNT(*) as count
        FROM (
            SELECT jsonb_array_elements_text(tags) as tag
            FROM challenges
            WHERE tags IS NOT NULL AND jsonb_array_length(tags) > 0
        ) as tag_list
        GROUP BY tag
        ORDER BY count DESC
        LIMIT 10;
        """
        tag_stats = db.execute_query(tag_query)
        
        return jsonify({
            'total': total,
            'platforms': [dict(row) for row in platform_stats] if platform_stats else [],
            'difficulties': [dict(row) for row in difficulty_stats] if difficulty_stats else [],
            'tags': [dict(row) for row in tag_stats] if tag_stats else []
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/db/challenges', methods=['POST'])
def create_db_challenge():
    """创建新挑战"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # 验证必需字段
        required_fields = ['id_alias', 'name', 'platform', 'difficulty_level', 'base64_url']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        db = get_db_manager()
        challenge_id = db.insert_challenge(data)
        
        if challenge_id:
            return jsonify({'id': challenge_id, 'message': 'Challenge created successfully'}), 201
        else:
            return jsonify({'error': 'Failed to create challenge'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/db/test', methods=['GET'])
def test_db_connection():
    """测试数据库连接"""
    try:
        db = get_db_manager()
        if db.test_connection():
            return jsonify({'status': 'success', 'message': 'Database connection is working'})
        else:
            return jsonify({'status': 'error', 'message': 'Database connection failed'}), 500
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
