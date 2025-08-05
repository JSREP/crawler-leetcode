/**
 * 认证系统数据库迁移脚本
 * 执行用户表和会话表的创建
 */

// 加载环境变量
require('dotenv').config({ path: '.env.local' });

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// 从环境变量获取数据库连接
const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL || '');

async function runMigration() {
  try {
    console.log('🚀 开始执行认证系统数据库迁移...');

    // 直接定义SQL语句
    const migrations = [
      // 创建用户表
      `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        github_id INTEGER UNIQUE NOT NULL,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        name VARCHAR(255),
        avatar_url TEXT,
        bio TEXT,
        location VARCHAR(255),
        company VARCHAR(255),
        blog VARCHAR(255),
        public_repos INTEGER DEFAULT 0,
        followers INTEGER DEFAULT 0,
        following INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login_at TIMESTAMP
      )`,

      // 创建用户会话表
      `CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        session_token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // 创建索引
      `CREATE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id)`,
      `CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`,
      `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
      `CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token)`,
      `CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at)`,
    ];

    console.log(`📝 找到 ${migrations.length} 个SQL语句需要执行`);

    // 逐个执行SQL语句
    for (let i = 0; i < migrations.length; i++) {
      const statement = migrations[i];
      try {
        console.log(`⏳ 执行语句 ${i + 1}/${migrations.length}...`);
        await sql.query(statement);
        console.log(`✅ 语句 ${i + 1} 执行成功`);
      } catch (error) {
        console.error(`❌ 语句 ${i + 1} 执行失败:`, error.message);
        // 如果是"已存在"错误，继续执行
        if (error.message.includes('already exists') || error.message.includes('does not exist')) {
          console.log(`⚠️  跳过已存在的对象，继续执行...`);
          continue;
        }
        throw error;
      }
    }
    
    // 验证表是否创建成功
    console.log('🔍 验证表创建结果...');
    
    const usersResult = await sql`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `;
    
    const sessionsResult = await sql`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user_sessions' 
      ORDER BY ordinal_position
    `;
    
    console.log('📊 用户表结构:');
    usersResult.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
    console.log('📊 会话表结构:');
    sessionsResult.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
    // 检查索引
    const indexResult = await sql`
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE tablename IN ('users', 'user_sessions')
      ORDER BY tablename, indexname
    `;
    
    console.log('📊 创建的索引:');
    indexResult.forEach(row => {
      console.log(`  - ${row.tablename}.${row.indexname}`);
    });
    
    console.log('🎉 认证系统数据库迁移完成！');
    
  } catch (error) {
    console.error('💥 迁移失败:', error);
    process.exit(1);
  }
}

// 检查环境变量
if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
  console.error('❌ 错误: 未找到数据库连接字符串');
  console.error('请设置 DATABASE_URL 或 POSTGRES_URL 环境变量');
  process.exit(1);
}

// 执行迁移
runMigration();
