# 🌐 API文档

## 📋 概述

本文档详细描述了爬虫LeetCode项目的RESTful API接口。

**基础URL**: `http://localhost:5000`  
**API版本**: v2.0.0  
**认证方式**: JWT Bearer Token  

## 🔐 认证

### 获取GitHub认证URL

```http
GET /auth/github/url
```

**响应示例**:
```json
{
  "auth_url": "https://github.com/login/oauth/authorize?client_id=..."
}
```

### GitHub OAuth回调

```http
POST /auth/github/callback
Content-Type: application/json

{
  "code": "github_oauth_code"
}
```

**响应示例**:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "name": "Test User",
    "avatar_url": "https://avatars.githubusercontent.com/...",
    "role": "user"
  }
}
```

### 获取当前用户信息

```http
GET /auth/me
Authorization: Bearer <access_token>
```

### 刷新访问令牌

```http
POST /auth/refresh
Authorization: Bearer <refresh_token>
```

### 登出

```http
POST /auth/logout
Authorization: Bearer <access_token>
```

## 🗄️ 数据库API

### 测试数据库连接

```http
GET /api/db/test
```

**响应示例**:
```json
{
  "status": "success",
  "message": "Database connection is working",
  "data": {
    "current_time": "2025-08-06 02:11:53",
    "db_version": "9.3.0",
    "database_type": "MySQL"
  }
}
```

### 获取挑战列表

```http
GET /api/db/challenges?page=1&per_page=10&platform=leetcode&difficulty=2
```

**查询参数**:
- `page`: 页码 (默认: 1)
- `per_page`: 每页数量 (默认: 10, 最大: 100)
- `platform`: 平台筛选
- `difficulty`: 难度筛选 (1-5)
- `search`: 搜索关键词

**响应示例**:
```json
{
  "challenges": [
    {
      "id": 1,
      "id_alias": "two-sum",
      "name": "两数之和",
      "name_en": "Two Sum",
      "platform": "leetcode",
      "difficulty_level": 1,
      "description_markdown": "给定一个整数数组...",
      "tags": ["数组", "哈希表"],
      "created_at": "2025-08-05T18:08:08",
      "is_expired": false
    }
  ],
  "total": 5,
  "page": 1,
  "per_page": 10,
  "pages": 1
}
```

### 获取单个挑战

```http
GET /api/db/challenges/{id_alias}
```

### 创建挑战

```http
POST /api/db/challenges
Content-Type: application/json

{
  "id_alias": "new-challenge",
  "name": "新挑战",
  "name_en": "New Challenge",
  "platform": "leetcode",
  "difficulty_level": 3,
  "description_markdown": "挑战描述...",
  "tags": ["数组", "动态规划"],
  "base64_url": "data:image/png;base64,..."
}
```

### 获取统计信息

```http
GET /api/db/stats
```

**响应示例**:
```json
{
  "status": "success",
  "data": {
    "total": 5,
    "by_platform": {
      "leetcode": 4,
      "test": 1
    },
    "by_difficulty": {
      "1": 1,
      "2": 2,
      "3": 1,
      "4": 1
    },
    "by_tags": {
      "数组": 3,
      "哈希表": 2,
      "链表": 1
    }
  }
}
```

## 💾 存储API

### 获取存储配额

```http
GET /storage/quota
Authorization: Bearer <access_token>
```

**响应示例**:
```json
{
  "quota": {
    "total_quota": 104857600,
    "used_quota": 1024000,
    "purchased_quota": 0,
    "available_quota": 103833600,
    "usage_percentage": 0.98
  }
}
```

### 文件上传

```http
POST /storage/upload
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

file: <binary>
purpose: "general"
category: "uploads"
```

**响应示例**:
```json
{
  "message": "File uploaded successfully",
  "file": {
    "id": 1,
    "file_name": "document.pdf",
    "file_size": 1024000,
    "file_type": "application/pdf",
    "file_path": "uploads/document_20231201_120000_abc123.pdf",
    "upload_purpose": "general",
    "created_at": "2025-08-05T18:08:08"
  }
}
```

### 头像上传

```http
POST /storage/upload/avatar
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

file: <binary>
```

### 获取用户文件列表

```http
GET /storage/files?page=1&per_page=10
Authorization: Bearer <access_token>
```

### 文件访问

```http
GET /storage/files/{file_path}
```

**查询参数**:
- `download=true`: 强制下载
- `thumbnail=true`: 获取缩略图

### 删除文件

```http
DELETE /storage/files/{file_id}
Authorization: Bearer <access_token>
```

### 获取存储统计

```http
GET /storage/quota/stats
Authorization: Bearer <access_token>
```

### 获取存储定价

```http
GET /storage/quota/pricing
```

**响应示例**:
```json
{
  "base_quota": "100MB",
  "currency": "CRAWLER Tokens",
  "pricing": [
    {
      "storage": "1GB",
      "price": 100,
      "description": "1GB additional storage"
    },
    {
      "storage": "5GB",
      "price": 450,
      "description": "5GB additional storage (10% discount)"
    }
  ]
}
```

## 💬 论坛API

### 获取论坛帖子列表

```http
GET /api/forum/posts?page=1&per_page=10&challenge_id=1
```

**响应示例**:
```json
{
  "posts": [
    {
      "id": 1,
      "title": "两数之和的多种解法讨论",
      "content": "大家好，我想分享一下...",
      "user": {
        "id": 1,
        "username": "testuser",
        "avatar_url": "..."
      },
      "challenge": {
        "id": 1,
        "name": "两数之和"
      },
      "view_count": 10,
      "reply_count": 3,
      "created_at": "2025-08-05T18:08:08"
    }
  ],
  "total": 3,
  "page": 1,
  "per_page": 10
}
```

### 创建论坛帖子

```http
POST /api/forum/posts
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "帖子标题",
  "content": "帖子内容...",
  "challenge_id": 1
}
```

### 获取单个帖子

```http
GET /api/forum/posts/{post_id}
```

### 创建帖子回复

```http
POST /api/forum/posts/{post_id}/replies
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "content": "回复内容..."
}
```

### 获取帖子回复

```http
GET /api/forum/posts/{post_id}/replies?page=1&per_page=10
```

### 获取挑战评论

```http
GET /api/challenges/{challenge_id}/comments?page=1&per_page=10
```

### 创建挑战评论

```http
POST /api/challenges/{challenge_id}/comments
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "content": "评论内容..."
}
```

## 💰 钱包API

### 获取钱包信息

```http
GET /api/wallet/info
Authorization: Bearer <access_token>
```

**响应示例**:
```json
{
  "wallet": {
    "wallet_address": "0x1234567890abcdef...",
    "crawler_coin_balance": 1000000,
    "formatted_balance": "1.000000 CRAWLER",
    "created_at": "2025-08-05T18:08:08"
  }
}
```

### 创建钱包

```http
POST /api/wallet/create
Authorization: Bearer <access_token>
```

### 获取交易记录

```http
GET /api/wallet/transactions?page=1&per_page=10
Authorization: Bearer <access_token>
```

### 发送代币

```http
POST /api/wallet/send
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "to_user_id": 2,
  "amount": 100000,
  "transaction_type": "transfer",
  "description": "转账说明"
}
```

### 打赏用户

```http
POST /api/wallet/tip
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "to_user_id": 2,
  "amount": 50000,
  "tip_type": "post",
  "target_id": 1,
  "message": "感谢分享！"
}
```

## 🔧 健康检查

### 应用健康状态

```http
GET /health
```

**响应示例**:
```json
{
  "status": "healthy",
  "timestamp": "2025-08-05T18:16:55.415186",
  "version": "2.0.0",
  "database": "healthy",
  "environment": "development"
}
```

## 📝 错误响应

### 标准错误格式

```json
{
  "error": "错误类型",
  "message": "错误描述",
  "details": "详细错误信息",
  "status_code": 400
}
```

### 常见错误码

- `400 Bad Request`: 请求参数错误
- `401 Unauthorized`: 未授权访问
- `403 Forbidden`: 权限不足
- `404 Not Found`: 资源不存在
- `422 Unprocessable Entity`: 数据验证失败
- `500 Internal Server Error`: 服务器内部错误

### 认证错误

```json
{
  "error": "Authentication required",
  "details": "Missing Authorization Header",
  "status_code": 401
}
```

### 验证错误

```json
{
  "error": "Validation failed",
  "details": {
    "name": ["This field is required"],
    "email": ["Invalid email format"]
  },
  "status_code": 422
}
```

## 📊 分页

所有列表API都支持分页：

**查询参数**:
- `page`: 页码 (默认: 1)
- `per_page`: 每页数量 (默认: 10, 最大: 100)

**响应格式**:
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "per_page": 10,
  "pages": 10
}
```

## 🔍 搜索和筛选

### 挑战搜索

```http
GET /api/db/challenges?search=两数&platform=leetcode&difficulty=1,2
```

### 论坛搜索

```http
GET /api/forum/posts?search=算法&challenge_id=1
```

## 📈 速率限制

- **认证API**: 每分钟10次请求
- **文件上传**: 每分钟5次请求
- **其他API**: 每分钟100次请求

超出限制时返回 `429 Too Many Requests`。
