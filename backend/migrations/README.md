# 数据库迁移指南

本目录包含从PostgreSQL迁移到MySQL的完整工具和脚本。

## 📋 迁移概述

### 源数据库 (PostgreSQL)
- **平台**: Neon Serverless PostgreSQL
- **表数量**: 11个主要表
- **数据类型**: 包含JSON字段、时间戳、外键关系

### 目标数据库 (MySQL)
- **版本**: MySQL 8.0+
- **字符集**: utf8mb4
- **存储引擎**: InnoDB

## 🛠️ 迁移工具

### 1. `init_db.sql`
MySQL数据库初始化脚本，创建所有表结构。

**使用方法:**
```bash
mysql -u root -p < init_db.sql
```

### 2. `export_postgresql_data.py`
从PostgreSQL导出数据到JSON文件。

**功能:**
- 导出所有表数据为JSON格式
- 导出数据库结构为SQL文件
- 自动处理日期时间格式转换

**使用方法:**
```bash
cd backend/migrations
python export_postgresql_data.py
```

### 3. `import_to_mysql.py`
将JSON数据导入到MySQL。

**功能:**
- 批量导入JSON数据
- 自动处理数据类型转换
- 维护外键依赖关系

**使用方法:**
```bash
python import_to_mysql.py
```

### 4. `migrate_from_postgresql.py`
直接从PostgreSQL迁移到MySQL（一步完成）。

**功能:**
- 直接连接两个数据库
- 实时数据转换和迁移
- 自动处理字段映射

**使用方法:**
```bash
python migrate_from_postgresql.py
```

## 📊 表结构映射

### 主要差异

| PostgreSQL | MySQL | 说明 |
|------------|-------|------|
| `SERIAL` | `AUTO_INCREMENT` | 自增主键 |
| `TIMESTAMP` | `DATETIME` | 时间戳类型 |
| `TEXT` | `TEXT` | 长文本 |
| `JSON` | `JSON` | JSON字段 |
| `BOOLEAN` | `BOOLEAN` | 布尔类型 |

### 字段映射

#### user_storage表
- `blob_url` → `file_path` (Vercel Blob URL转换为本地路径)

#### challenges表
- `tags` 字段：PostgreSQL JSON数组 → MySQL JSON

## 🔧 环境配置

### 1. PostgreSQL连接
在 `.env` 文件中配置：
```env
# PostgreSQL (源数据库)
DATABASE_URL=postgresql://user:password@host:port/database
# 或者
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DATABASE=crawler_leetcode
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
```

### 2. MySQL连接
```env
# MySQL (目标数据库)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=crawler_leetcode
MYSQL_USER=root
MYSQL_PASSWORD=your_password
```

## 📝 迁移步骤

### 方法一：分步迁移（推荐）

1. **准备MySQL数据库**
```bash
# 创建数据库
mysql -u root -p -e "CREATE DATABASE crawler_leetcode CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 初始化表结构
mysql -u root -p crawler_leetcode < init_db.sql
```

2. **导出PostgreSQL数据**
```bash
cd backend/migrations
pip install psycopg2-binary
python export_postgresql_data.py
```

3. **导入到MySQL**
```bash
pip install pymysql
python import_to_mysql.py
```

### 方法二：直接迁移

1. **安装依赖**
```bash
pip install psycopg2-binary pymysql
```

2. **执行迁移**
```bash
python migrate_from_postgresql.py
```

## ⚠️ 注意事项

### 1. 数据备份
迁移前请备份原始数据：
```bash
# PostgreSQL备份
pg_dump -h host -U user -d database > backup.sql

# MySQL备份
mysqldump -u user -p database > backup.sql
```

### 2. 字符编码
确保MySQL使用utf8mb4字符集以支持完整的Unicode字符。

### 3. 外键约束
迁移过程中会暂时禁用外键检查，确保数据完整性。

### 4. 文件路径转换
`user_storage`表中的`blob_url`会转换为本地`file_path`，需要确保对应的文件已下载到本地存储目录。

## 🔍 验证迁移

### 1. 检查表结构
```sql
-- 查看所有表
SHOW TABLES;

-- 查看表结构
DESCRIBE users;
DESCRIBE challenges;
```

### 2. 检查数据完整性
```sql
-- 检查记录数量
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM challenges;
SELECT COUNT(*) FROM user_storage;

-- 检查外键关系
SELECT COUNT(*) FROM user_sessions WHERE user_id NOT IN (SELECT id FROM users);
```

### 3. 检查JSON字段
```sql
-- 验证challenges表的tags字段
SELECT id, name, tags FROM challenges WHERE tags IS NOT NULL LIMIT 5;

-- 验证JSON格式
SELECT JSON_VALID(tags) as is_valid FROM challenges WHERE tags IS NOT NULL;
```

## 🐛 故障排除

### 常见问题

1. **字符编码问题**
   - 确保MySQL使用utf8mb4字符集
   - 检查连接字符串中的charset参数

2. **外键约束错误**
   - 检查数据导入顺序
   - 验证引用的记录是否存在

3. **JSON格式错误**
   - 检查PostgreSQL中的JSON数据格式
   - 验证转换后的JSON是否有效

4. **连接超时**
   - 增加数据库连接超时时间
   - 分批处理大量数据

### 日志查看
迁移脚本会输出详细的进度信息，包括：
- ✅ 成功操作
- ❌ 错误信息
- ⚠️ 警告提示
- 🔄 进度状态
