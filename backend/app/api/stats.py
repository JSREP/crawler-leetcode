"""
统计信息API路由
"""
from flask import jsonify
from app.api import api_bp
from app.models import Challenge


@api_bp.route('/db/stats', methods=['GET'])
def get_stats():
    """获取统计信息"""
    try:
        stats = Challenge.get_stats()
        
        return jsonify({
            'status': 'success',
            'data': stats
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': 'Failed to fetch statistics',
            'error': str(e)
        }), 500
