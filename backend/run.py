import os
from app import create_app, db
from app.models.challenge import Challenge

app = create_app(os.getenv('FLASK_CONFIG') or 'default')

@app.shell_context_processor
def make_shell_context():
    return dict(db=db, Challenge=Challenge)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000) 