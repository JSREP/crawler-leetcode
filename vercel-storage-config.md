# Vercel 存储配置指南

## 1. 安装依赖

```bash
# 安装 Vercel 存储 SDK
npm install @vercel/blob @vercel/kv @vercel/postgres
```

## 2. 环境变量配置

在 Vercel 项目设置中添加以下环境变量：

```env
# Vercel KV (Redis)
KV_REST_API_URL=your_kv_url
KV_REST_API_TOKEN=your_kv_token

# Vercel Blob
BLOB_READ_WRITE_TOKEN=your_blob_token

# Vercel Postgres
POSTGRES_URL=your_postgres_url
POSTGRES_PRISMA_URL=your_postgres_prisma_url
POSTGRES_URL_NON_POOLING=your_postgres_non_pooling_url
```

## 3. 使用示例

### KV 存储 (缓存和快速数据)

```javascript
// utils/kv-storage.js
import { kv } from '@vercel/kv';

export class KVStorage {
  // 存储挑战数据
  static async saveChallenges(challenges) {
    await kv.set('challenges:all', challenges);
    await kv.expire('challenges:all', 3600); // 1小时过期
  }

  // 获取挑战数据
  static async getChallenges() {
    return await kv.get('challenges:all');
  }

  // 存储用户会话
  static async saveUserSession(userId, sessionData) {
    await kv.set(`session:${userId}`, sessionData);
    await kv.expire(`session:${userId}`, 86400); // 24小时过期
  }

  // 缓存API响应
  static async cacheApiResponse(key, data, ttl = 3600) {
    await kv.set(`cache:${key}`, data);
    await kv.expire(`cache:${key}`, ttl);
  }
}
```

### Blob 存储 (文件和图片)

```javascript
// utils/blob-storage.js
import { put, del, list } from '@vercel/blob';

export class BlobStorage {
  // 上传挑战图片
  static async uploadChallengeImage(challengeId, file) {
    const filename = `challenges/${challengeId}/image.${file.type.split('/')[1]}`;
    
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
    });
    
    return blob.url;
  }

  // 上传挑战文档
  static async uploadChallengeDoc(challengeId, file) {
    const filename = `challenges/${challengeId}/docs/${file.name}`;
    
    const blob = await put(filename, file, {
      access: 'public',
    });
    
    return blob.url;
  }

  // 列出所有文件
  static async listChallengeFiles(challengeId) {
    const { blobs } = await list({
      prefix: `challenges/${challengeId}/`,
    });
    
    return blobs;
  }

  // 删除文件
  static async deleteFile(url) {
    await del(url);
  }
}
```

### Postgres 存储 (结构化数据)

```javascript
// utils/postgres-storage.js
import { sql } from '@vercel/postgres';

export class PostgresStorage {
  // 创建挑战表
  static async createTables() {
    await sql`
      CREATE TABLE IF NOT EXISTS challenges (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        difficulty INTEGER,
        platform VARCHAR(100),
        tags JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
  }

  // 保存挑战
  static async saveChallenge(challenge) {
    const result = await sql`
      INSERT INTO challenges (title, description, difficulty, platform, tags)
      VALUES (${challenge.title}, ${challenge.description}, ${challenge.difficulty}, ${challenge.platform}, ${JSON.stringify(challenge.tags)})
      RETURNING id;
    `;
    
    return result.rows[0].id;
  }

  // 获取所有挑战
  static async getAllChallenges() {
    const result = await sql`
      SELECT * FROM challenges ORDER BY created_at DESC;
    `;
    
    return result.rows;
  }

  // 根据难度筛选
  static async getChallengesByDifficulty(difficulty) {
    const result = await sql`
      SELECT * FROM challenges WHERE difficulty = ${difficulty};
    `;
    
    return result.rows;
  }
}
```

## 4. API 路由示例

```javascript
// pages/api/challenges.js
import { KVStorage, BlobStorage, PostgresStorage } from '../../utils/storage';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // 先尝试从缓存获取
    let challenges = await KVStorage.getChallenges();
    
    if (!challenges) {
      // 缓存未命中，从数据库获取
      challenges = await PostgresStorage.getAllChallenges();
      
      // 存入缓存
      await KVStorage.saveChallenges(challenges);
    }
    
    res.json(challenges);
  }
  
  if (req.method === 'POST') {
    const challenge = req.body;
    
    // 保存到数据库
    const id = await PostgresStorage.saveChallenge(challenge);
    
    // 清除缓存
    await KVStorage.saveChallenges(null);
    
    res.json({ id, message: 'Challenge saved successfully' });
  }
}
```

## 5. 免费额度监控

```javascript
// utils/quota-monitor.js
export class QuotaMonitor {
  static async checkKVUsage() {
    // 监控 KV 使用情况
    const usage = await kv.get('quota:kv:usage') || 0;
    
    if (usage > 25000) { // 接近30k限制
      console.warn('KV quota nearly exceeded');
    }
  }
  
  static async incrementKVUsage() {
    await kv.incr('quota:kv:usage');
  }
}
```

## 6. 部署配置

在 `vercel.json` 中配置：

```json
{
  "functions": {
    "pages/api/**/*.js": {
      "maxDuration": 10
    }
  },
  "env": {
    "KV_REST_API_URL": "@kv_rest_api_url",
    "KV_REST_API_TOKEN": "@kv_rest_api_token",
    "BLOB_READ_WRITE_TOKEN": "@blob_read_write_token"
  }
}
```

## 7. 最佳实践

### 数据分层策略
- **KV**: 缓存、会话、计数器
- **Blob**: 图片、文档、静态文件
- **Postgres**: 结构化数据、关系数据

### 成本优化
- 使用 KV 缓存减少数据库查询
- 压缩图片后再上传到 Blob
- 定期清理过期数据

### 监控和告警
- 监控存储使用量
- 设置接近限额的告警
- 实现降级策略

## 8. 迁移现有数据

```javascript
// scripts/migrate-to-vercel.js
import fs from 'fs';
import { BlobStorage, PostgresStorage } from '../utils/storage';

async function migrateData() {
  // 迁移 YAML 文件到 Postgres
  const yamlFiles = fs.readdirSync('./docs/challenges');
  
  for (const file of yamlFiles) {
    const challenge = parseYamlFile(file);
    await PostgresStorage.saveChallenge(challenge);
  }
  
  // 迁移图片到 Blob
  const images = fs.readdirSync('./docs/images');
  
  for (const image of images) {
    const file = fs.readFileSync(`./docs/images/${image}`);
    await BlobStorage.uploadChallengeImage('general', file);
  }
}
```

这样配置后，你就可以充分利用 Vercel 的免费存储服务了！
