"""
Flask应用启动文件
"""
import os
from dotenv import load_dotenv
from app import create_app, db

# 加载环境变量
load_dotenv()

# 创建应用实例
app = create_app()


@app.route('/health')
def health_check():
    """健康检查端点"""
    from datetime import datetime
    from flask import jsonify

    try:
        # 测试数据库连接
        db.session.execute(db.text('SELECT 1'))
        db_status = 'healthy'
    except Exception as e:
        db_status = f'unhealthy: {str(e)}'

    return jsonify({
        'status': 'healthy' if db_status == 'healthy' else 'unhealthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': app.config.get('APP_VERSION', '2.0.0'),
        'database': db_status,
        'environment': app.config.get('FLASK_ENV', 'unknown')
    })

@app.cli.command()
def init_db():
    """初始化数据库"""
    db.create_all()
    print("Database initialized!")

@app.cli.command()
def reset_db():
    """重置数据库"""
    db.drop_all()
    db.create_all()
    print("Database reset!")

if __name__ == '__main__':
    # 端口配置：57523 - 禁止修改此端口号
    # 此端口号由项目规范指定，请勿随意更改
    app.run(
        host='0.0.0.0',
        port=int(os.environ.get('PORT', 57523)),
        debug=True
    )
