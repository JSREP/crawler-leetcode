/**
 * 用户角色系统数据库迁移脚本
 * 为users表添加role字段以区分普通用户和管理员
 */

// 加载环境变量
require('dotenv').config({ path: '.env.local' });

const { neon } = require('@neondatabase/serverless');

// 从环境变量获取数据库连接
const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL || '');

async function runUserRoleMigration() {
  try {
    console.log('🚀 开始执行用户角色系统数据库迁移...');

    // 定义迁移SQL语句
    const migrations = [
      // 添加role字段
      `ALTER TABLE users 
       ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user'`,

      // 添加检查约束（先检查是否存在）
      `DO $$
       BEGIN
         IF NOT EXISTS (
           SELECT 1 FROM information_schema.table_constraints
           WHERE table_name = 'users' AND constraint_name = 'chk_users_role'
         ) THEN
           ALTER TABLE users ADD CONSTRAINT chk_users_role CHECK (role IN ('user', 'admin'));
         END IF;
       END $$`,

      // 创建索引
      `CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`,

      // 更新现有用户的role字段
      `UPDATE users SET role = 'user' WHERE role IS NULL`,
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
    
    // 检查role字段是否添加成功
    const columnResult = await sql`
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default,
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role'
    `;
    
    if (columnResult.length > 0) {
      console.log('📊 role字段信息:');
      const col = columnResult[0];
      console.log(`  - 字段名: ${col.column_name}`);
      console.log(`  - 数据类型: ${col.data_type}`);
      console.log(`  - 可为空: ${col.is_nullable}`);
      console.log(`  - 默认值: ${col.column_default}`);
      console.log(`  - 最大长度: ${col.character_maximum_length}`);
    } else {
      throw new Error('role字段未找到，迁移可能失败');
    }
    
    // 检查约束
    const constraintResult = await sql`
      SELECT 
        constraint_name, 
        constraint_type
      FROM information_schema.table_constraints 
      WHERE table_name = 'users' AND constraint_name = 'chk_users_role'
    `;
    
    console.log('📊 约束信息:');
    constraintResult.forEach(row => {
      console.log(`  - ${row.constraint_name}: ${row.constraint_type}`);
    });
    
    // 检查索引
    const indexResult = await sql`
      SELECT 
        indexname, 
        indexdef
      FROM pg_indexes 
      WHERE tablename = 'users' AND indexname = 'idx_users_role'
    `;
    
    console.log('📊 索引信息:');
    indexResult.forEach(row => {
      console.log(`  - ${row.indexname}`);
      console.log(`    定义: ${row.indexdef}`);
    });
    
    // 统计用户角色分布
    const roleStatsResult = await sql`
      SELECT 
        role,
        COUNT(*) as user_count
      FROM users 
      GROUP BY role
      ORDER BY role
    `;
    
    console.log('📊 用户角色分布:');
    roleStatsResult.forEach(row => {
      console.log(`  - ${row.role}: ${row.user_count} 用户`);
    });
    
    console.log('🎉 用户角色系统数据库迁移完成！');
    
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
runUserRoleMigration();
