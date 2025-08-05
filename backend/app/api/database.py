"""
数据库相关API路由
"""
from flask import jsonify
from app.api import api_bp
from app import db
from app.models import Challenge


@api_bp.route('/db/test', methods=['GET'])
def test_database():
    """测试数据库连接"""
    try:
        # 执行简单查询测试连接
        time_result = db.session.execute(db.text('SELECT NOW() as now_time'))
        time_row = time_result.fetchone()

        version_result = db.session.execute(db.text('SELECT VERSION() as version'))
        version_row = version_result.fetchone()

        return jsonify({
            'status': 'success',
            'message': 'Database connection is working',
            'data': {
                'current_time': str(time_row.now_time),
                'db_version': version_row.version,
                'database_type': 'MySQL'
            }
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': 'Database connection failed',
            'error': str(e)
        }), 500
