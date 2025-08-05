"""
Flask后端项目安装脚本
"""
from setuptools import setup, find_packages

setup(
    name='crawler-leetcode-backend',
    version='1.0.0',
    description='爬虫LeetCode项目后端API',
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
    install_requires=[
        'Flask>=3.0.0',
        'Flask-SQLAlchemy>=3.1.1',
        'Flask-Migrate>=4.0.5',
        'Flask-CORS>=4.0.0',
        'Flask-JWT-Extended>=4.6.0',
        'PyMySQL>=1.1.0',
        'cryptography>=41.0.8',
        'Pillow>=10.1.0',
        'python-magic>=0.4.27',
        'python-dotenv>=1.0.0',
        'marshmallow>=3.20.2',
        'requests>=2.31.0',
        'pyyaml>=6.0.1',
        'authlib>=1.2.1',
    ],
    extras_require={
        'dev': [
            'pytest>=7.4.3',
            'pytest-flask>=1.3.0',
            'black>=23.11.0',
            'flake8>=6.1.0',
        ],
        'prod': [
            'gunicorn>=21.2.0',
        ]
    },
    python_requires='>=3.8',
)
