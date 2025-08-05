-- 用户角色系统数据库迁移脚本
-- 为users表添加role字段以区分普通用户和管理员

-- 添加role字段
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user';

-- 添加检查约束确保role只能是'user'或'admin'
ALTER TABLE users 
ADD CONSTRAINT IF NOT EXISTS chk_users_role 
CHECK (role IN ('user', 'admin'));

-- 为role字段创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 更新现有用户的role字段为默认值'user'（如果有NULL值）
UPDATE users SET role = 'user' WHERE role IS NULL;

-- 验证迁移结果
-- 查看表结构
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'role';

-- 查看约束
SELECT 
    constraint_name, 
    constraint_type,
    check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'users' AND tc.constraint_type = 'CHECK';

-- 查看索引
SELECT 
    indexname, 
    indexdef
FROM pg_indexes 
WHERE tablename = 'users' AND indexname = 'idx_users_role';

-- 统计当前用户角色分布
SELECT 
    role,
    COUNT(*) as user_count
FROM users 
GROUP BY role
ORDER BY role;
