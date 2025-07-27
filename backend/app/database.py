"""
数据库连接和操作模块
"""
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import json
from datetime import datetime

# 加载环境变量
load_dotenv()

class DatabaseManager:
    def __init__(self):
        self.connection = None
        self.connect()
    
    def connect(self):
        """连接到数据库"""
        try:
            # 优先使用 POSTGRES_URL，如果没有则使用 DATABASE_URL
            database_url = os.getenv('POSTGRES_URL') or os.getenv('DATABASE_URL')
            
            if not database_url:
                raise ValueError("未找到数据库连接URL，请检查环境变量")
            
            self.connection = psycopg2.connect(
                database_url,
                cursor_factory=RealDictCursor
            )
            self.connection.autocommit = True
            print("✅ 数据库连接成功")
            
        except Exception as e:
            print(f"❌ 数据库连接失败: {e}")
            raise
    
    def disconnect(self):
        """断开数据库连接"""
        if self.connection:
            self.connection.close()
            print("🔌 数据库连接已断开")
    
    def execute_query(self, query, params=None):
        """执行查询"""
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(query, params)
                if cursor.description:  # 如果有返回结果
                    return cursor.fetchall()
                return None
        except Exception as e:
            print(f"❌ 查询执行失败: {e}")
            raise
    
    def create_tables(self):
        """创建数据库表"""
        create_challenges_table = """
        CREATE TABLE IF NOT EXISTS challenges (
            id SERIAL PRIMARY KEY,
            id_alias VARCHAR(100) UNIQUE NOT NULL,
            name VARCHAR(200) NOT NULL,
            name_en VARCHAR(200),
            platform VARCHAR(50) NOT NULL,
            difficulty_level INTEGER NOT NULL,
            description_markdown TEXT,
            description_markdown_en TEXT,
            base64_url TEXT NOT NULL,
            is_expired BOOLEAN DEFAULT FALSE,
            tags JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        
        create_indexes = [
            "CREATE INDEX IF NOT EXISTS idx_challenges_platform ON challenges(platform);",
            "CREATE INDEX IF NOT EXISTS idx_challenges_difficulty ON challenges(difficulty_level);",
            "CREATE INDEX IF NOT EXISTS idx_challenges_tags ON challenges USING GIN(tags);",
            "CREATE INDEX IF NOT EXISTS idx_challenges_alias ON challenges(id_alias);"
        ]
        
        try:
            # 创建表
            self.execute_query(create_challenges_table)
            print("✅ challenges 表创建成功")
            
            # 创建索引
            for index_query in create_indexes:
                self.execute_query(index_query)
            print("✅ 索引创建成功")
            
        except Exception as e:
            print(f"❌ 表创建失败: {e}")
            raise
    
    def insert_challenge(self, challenge_data):
        """插入挑战数据"""
        insert_query = """
        INSERT INTO challenges (
            id_alias, name, name_en, platform, difficulty_level,
            description_markdown, description_markdown_en, base64_url,
            is_expired, tags
        ) VALUES (
            %(id_alias)s, %(name)s, %(name_en)s, %(platform)s, %(difficulty_level)s,
            %(description_markdown)s, %(description_markdown_en)s, %(base64_url)s,
            %(is_expired)s, %(tags)s
        )
        ON CONFLICT (id_alias) DO UPDATE SET
            name = EXCLUDED.name,
            name_en = EXCLUDED.name_en,
            platform = EXCLUDED.platform,
            difficulty_level = EXCLUDED.difficulty_level,
            description_markdown = EXCLUDED.description_markdown,
            description_markdown_en = EXCLUDED.description_markdown_en,
            base64_url = EXCLUDED.base64_url,
            is_expired = EXCLUDED.is_expired,
            tags = EXCLUDED.tags,
            updated_at = CURRENT_TIMESTAMP
        RETURNING id;
        """
        
        try:
            # 确保 tags 是 JSON 字符串
            if isinstance(challenge_data.get('tags'), list):
                challenge_data['tags'] = json.dumps(challenge_data['tags'])
            
            result = self.execute_query(insert_query, challenge_data)
            return result[0]['id'] if result else None
            
        except Exception as e:
            print(f"❌ 插入挑战数据失败: {e}")
            raise
    
    def get_all_challenges(self):
        """获取所有挑战"""
        query = """
        SELECT 
            id, id_alias, name, name_en, platform, difficulty_level,
            description_markdown, description_markdown_en, base64_url,
            is_expired, tags, created_at, updated_at
        FROM challenges 
        ORDER BY created_at DESC;
        """
        
        try:
            results = self.execute_query(query)
            # 解析 JSON 字段
            for result in results:
                if result['tags']:
                    result['tags'] = json.loads(result['tags']) if isinstance(result['tags'], str) else result['tags']
            return results
            
        except Exception as e:
            print(f"❌ 获取挑战数据失败: {e}")
            raise
    
    def get_challenge_by_alias(self, id_alias):
        """根据别名获取挑战"""
        query = """
        SELECT 
            id, id_alias, name, name_en, platform, difficulty_level,
            description_markdown, description_markdown_en, base64_url,
            is_expired, tags, created_at, updated_at
        FROM challenges 
        WHERE id_alias = %s;
        """
        
        try:
            results = self.execute_query(query, (id_alias,))
            if results:
                result = results[0]
                if result['tags']:
                    result['tags'] = json.loads(result['tags']) if isinstance(result['tags'], str) else result['tags']
                return result
            return None
            
        except Exception as e:
            print(f"❌ 获取挑战数据失败: {e}")
            raise
    
    def get_challenges_by_difficulty(self, difficulty):
        """根据难度获取挑战"""
        query = """
        SELECT 
            id, id_alias, name, name_en, platform, difficulty_level,
            description_markdown, description_markdown_en, base64_url,
            is_expired, tags, created_at, updated_at
        FROM challenges 
        WHERE difficulty_level = %s
        ORDER BY created_at DESC;
        """
        
        try:
            results = self.execute_query(query, (difficulty,))
            for result in results:
                if result['tags']:
                    result['tags'] = json.loads(result['tags']) if isinstance(result['tags'], str) else result['tags']
            return results
            
        except Exception as e:
            print(f"❌ 获取挑战数据失败: {e}")
            raise
    
    def test_connection(self):
        """测试数据库连接"""
        try:
            result = self.execute_query("SELECT NOW() as current_time, version() as db_version;")
            if result:
                print(f"✅ 数据库连接测试成功")
                print(f"   当前时间: {result[0]['current_time']}")
                print(f"   数据库版本: {result[0]['db_version']}")
                return True
            return False
            
        except Exception as e:
            print(f"❌ 数据库连接测试失败: {e}")
            return False

# 全局数据库实例
db_manager = None

def get_db_manager():
    """获取数据库管理器实例"""
    global db_manager
    if db_manager is None:
        db_manager = DatabaseManager()
    return db_manager

def init_database():
    """初始化数据库"""
    try:
        db = get_db_manager()
        db.test_connection()
        db.create_tables()
        print("🎉 数据库初始化完成")
        return True
    except Exception as e:
        print(f"❌ 数据库初始化失败: {e}")
        return False

if __name__ == "__main__":
    # 测试数据库连接
    init_database()
