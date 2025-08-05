/**
 * 数据库配置文件
 * 统一管理数据库连接配置
 */

export const databaseConfig = {
  // Neon Serverless PostgreSQL 配置
  neon: {
    connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
    ssl: process.env.NODE_ENV === 'production',
    maxConnections: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },

  // 传统 Vercel Postgres 配置（向后兼容）
  postgres: {
    connectionString: process.env.POSTGRES_URL,
    ssl: process.env.NODE_ENV === 'production',
    maxConnections: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
  
  // 查询配置
  query: {
    defaultPageSize: 10,
    maxPageSize: 100,
    timeout: 30000,
  },
  
  // 缓存配置
  cache: {
    enabled: process.env.NODE_ENV === 'production',
    ttl: 300, // 5分钟
  }
} as const;

export type DatabaseConfig = typeof databaseConfig;
