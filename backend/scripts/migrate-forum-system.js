/**
 * 论坛系统数据库迁移脚本
 * 包含评论系统、讨论区、文件存储、Web3钱包和代币系统
 */

// 加载环境变量
require('dotenv').config({ path: '.env.local' });

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// 从环境变量获取数据库连接
const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL || '');

async function runForumSystemMigration() {
  try {
    console.log('🚀 开始执行论坛系统数据库迁移...');

    // 读取SQL文件
    const sqlFilePath = path.join(__dirname, 'migrate-forum-system.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // 手动分割SQL语句，正确处理函数定义
    const statements = [];
    const lines = sqlContent.split('\n');
    let currentStatement = '';
    let inFunction = false;

    for (const line of lines) {
      const trimmedLine = line.trim();

      // 跳过注释行
      if (trimmedLine.startsWith('--') || trimmedLine === '') {
        continue;
      }

      currentStatement += line + '\n';

      // 检测函数开始
      if (trimmedLine.includes('CREATE OR REPLACE FUNCTION')) {
        inFunction = true;
      }

      // 检测函数结束
      if (inFunction && trimmedLine.includes("$$ language 'plpgsql'")) {
        inFunction = false;
        statements.push(currentStatement.trim());
        currentStatement = '';
        continue;
      }

      // 普通语句以分号结束
      if (!inFunction && trimmedLine.endsWith(';')) {
        statements.push(currentStatement.trim());
        currentStatement = '';
      }
    }

    // 添加最后一个语句（如果有）
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }

    console.log(`📝 找到 ${statements.length} 个SQL语句需要执行`);

    // 逐个执行SQL语句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        console.log(`⏳ 执行语句 ${i + 1}/${statements.length}...`);
        
        // 对于复杂的语句，使用原始查询
        if (statement.includes('CREATE OR REPLACE FUNCTION') || 
            statement.includes('CREATE TRIGGER')) {
          await sql.query(statement);
        } else {
          await sql.query(statement);
        }
        
        console.log(`✅ 语句 ${i + 1} 执行成功`);
      } catch (error) {
        console.error(`❌ 语句 ${i + 1} 执行失败:`, error.message);
        // 如果是"已存在"错误，继续执行
        if (error.message.includes('already exists') || 
            error.message.includes('does not exist') ||
            error.message.includes('duplicate key')) {
          console.log(`⚠️  跳过已存在的对象，继续执行...`);
          continue;
        }
        throw error;
      }
    }
    
    // 验证迁移结果
    console.log('🔍 验证迁移结果...');
    
    // 检查新创建的表
    const tables = [
      'challenge_comments',
      'forum_posts', 
      'forum_replies',
      'user_storage',
      'user_wallets',
      'token_transactions',
      'tip_records',
      'user_storage_quota'
    ];
    
    for (const tableName of tables) {
      const result = await sql`
        SELECT table_name, column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = ${tableName}
        ORDER BY ordinal_position
      `;
      
      if (result.length > 0) {
        console.log(`✅ 表 ${tableName} 创建成功，包含 ${result.length} 个字段`);
      } else {
        console.log(`❌ 表 ${tableName} 未找到`);
      }
    }
    
    // 检查索引
    const indexResult = await sql`
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE tablename IN (${tables.join(',').split(',').map(t => `'${t}'`).join(',')})
      AND schemaname = 'public'
    `;
    
    console.log(`📊 创建了 ${indexResult.length} 个索引`);
    
    // 检查触发器
    const triggerResult = await sql`
      SELECT trigger_name, event_object_table 
      FROM information_schema.triggers 
      WHERE event_object_table IN (${tables.join(',').split(',').map(t => `'${t}'`).join(',')})
    `;
    
    console.log(`📊 创建了 ${triggerResult.length} 个触发器`);
    
    console.log('🎉 论坛系统数据库迁移完成！');
    
    // 显示表结构摘要
    console.log('\n📋 数据库表结构摘要:');
    console.log('1. challenge_comments - 挑战评论表');
    console.log('2. forum_posts - 讨论区帖子表');
    console.log('3. forum_replies - 帖子回复表');
    console.log('4. user_storage - 用户存储记录表');
    console.log('5. user_wallets - 用户钱包表');
    console.log('6. token_transactions - 代币交易记录表');
    console.log('7. tip_records - 打赏记录表');
    console.log('8. user_storage_quota - 用户存储配额表');
    
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
runForumSystemMigration();
