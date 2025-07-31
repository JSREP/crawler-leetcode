# Neon Serverless PostgreSQL 集成文档

本项目已成功集成 Neon Serverless PostgreSQL 数据库，提供高性能的无服务器数据库服务。

## 功能特性

- ✅ **无服务器架构**: 自动扩缩容，按需付费
- ✅ **PostgreSQL兼容**: 完全兼容PostgreSQL 17.5
- ✅ **全球分布**: 多区域部署，低延迟访问
- ✅ **自动备份**: 内置备份和恢复功能
- ✅ **连接池**: 内置连接池优化性能
- ✅ **实时查询**: 支持实时数据查询

## 环境配置

### 1. 安装依赖

```bash
npm install @neondatabase/serverless
```

### 2. 环境变量配置

在 `.env.local` 文件中添加：

```env
# Neon Serverless PostgreSQL配置
DATABASE_URL="postgres://neondb_owner:npg_AQKS2xGvmN9s@ep-shiny-thunder-adchn8lk-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"

# 无连接池版本（特殊用途）
DATABASE_URL_UNPOOLED="postgresql://neondb_owner:npg_AQKS2xGvmN9s@ep-shiny-thunder-adchn8lk.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"

# 分离的连接参数
PGHOST="ep-shiny-thunder-adchn8lk-pooler.c-2.us-east-1.aws.neon.tech"
PGUSER="neondb_owner"
PGDATABASE="neondb"
PGPASSWORD="npg_AQKS2xGvmN9s"
```

### 3. 数据库连接

```typescript
import { neon } from '@neondatabase/serverless';

// 创建数据库连接
const sql = neon(process.env.DATABASE_URL || '');

// 执行查询
const result = await sql`SELECT NOW() as current_time`;
console.log(result[0].current_time);
```

## API接口

### 数据库测试

**端点**: `GET /api/db/test`

测试数据库连接状态。

**响应示例**:
```json
{
  "status": "success",
  "message": "Database connection is working",
  "timestamp": "2025-07-27T03:45:08.202Z"
}
```

### 获取挑战列表

**端点**: `GET /api/db/challenges`

**查询参数**:
- `page` (可选): 页码，默认为1
- `per_page` (可选): 每页数量，默认为10
- `difficulty` (可选): 难度筛选
- `tag` (可选): 标签筛选
- `query` (可选): 搜索关键词

**响应示例**:
```json
{
  "challenges": [...],
  "total": 36,
  "pages": 4,
  "current_page": 1,
  "per_page": 10
}
```

### 获取单个挑战

**端点**: `GET /api/db/challenges/[alias]`

根据挑战别名获取详细信息。

### 获取统计信息

**端点**: `GET /api/db/stats`

**响应示例**:
```json
{
  "total": 36,
  "platforms": [{"platform": "Web", "count": 36}],
  "difficulties": [
    {"difficulty_level": 1, "count": 4},
    {"difficulty_level": 2, "count": 7}
  ],
  "tags": [
    {"tag": "js-reverse", "count": 18},
    {"tag": "behavior-analysis", "count": 5}
  ]
}
```

## 数据库操作

### 基本查询

```typescript
// 简单查询
const users = await sql`SELECT * FROM users`;

// 参数化查询
const user = await sql`SELECT * FROM users WHERE id = ${userId}`;

// 插入数据
const result = await sql`
  INSERT INTO challenges (name, difficulty_level) 
  VALUES (${name}, ${difficulty}) 
  RETURNING id
`;
```

### 事务处理

```typescript
// Neon Serverless 支持事务
await sql.transaction(async (tx) => {
  await tx`INSERT INTO table1 (data) VALUES (${data1})`;
  await tx`INSERT INTO table2 (data) VALUES (${data2})`;
});
```

### 连接池配置

```typescript
// 配置连接池参数
const sql = neon(connectionString, {
  poolConfig: {
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  }
});
```

## 性能优化

### 1. 查询优化

- 使用索引优化查询性能
- 避免 N+1 查询问题
- 使用适当的 LIMIT 和 OFFSET

### 2. 连接管理

- 使用连接池版本的URL
- 合理设置连接超时时间
- 避免长时间持有连接

### 3. 数据类型

- 使用适当的PostgreSQL数据类型
- 利用JSONB类型存储复杂数据
- 使用数组类型存储标签等数据

## 迁移指南

### 从 @vercel/postgres 迁移

1. **更新导入语句**:
```typescript
// 旧版本
import { sql } from '@vercel/postgres';

// 新版本
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL || '');
```

2. **更新查询结果访问**:
```typescript
// 旧版本
const result = await sql`SELECT * FROM table`;
console.log(result.rows[0]);

// 新版本
const result = await sql`SELECT * FROM table`;
console.log(result[0]);
```

3. **更新错误处理**:
```typescript
// 检查结果长度而不是 rowCount
if (result.length > 0) {
  // 处理结果
}
```

## 故障排除

### 常见问题

1. **连接失败**
   - 检查 `DATABASE_URL` 环境变量
   - 确认网络连接正常
   - 验证数据库凭据

2. **查询语法错误**
   - 确保使用模板字符串语法
   - 避免使用 `.query()` 方法
   - 检查SQL语法正确性

3. **性能问题**
   - 使用连接池版本URL
   - 优化查询语句
   - 添加适当索引

### 调试技巧

1. 启用查询日志
2. 监控连接池状态
3. 使用 Neon 控制台监控

## 更多资源

- [Neon 官方文档](https://neon.tech/docs)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)
- [项目GitHub仓库](https://github.com/JSREP/crawler-leetcode)
