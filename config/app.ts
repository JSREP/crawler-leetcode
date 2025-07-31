/**
 * 应用配置文件
 * 统一管理应用级别的配置
 */

export const appConfig = {
  // 应用基本信息
  name: 'LeetCode Crawler',
  description: 'A Next.js application for crawling and displaying LeetCode challenges',
  version: '1.0.0',
  
  // 环境配置
  env: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
  
  // URL配置
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:61395',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
  
  // 分页配置
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50],
    maxPageSize: 100,
  },
  
  // UI配置
  ui: {
    theme: {
      primaryColor: '#1890ff',
      borderRadius: 6,
    },
    layout: {
      headerHeight: 64,
      siderWidth: 256,
      footerHeight: 48,
    },
  },
  
  // 功能开关
  features: {
    enableSearch: true,
    enableFilters: true,
    enablePagination: true,
    enableStats: true,
  },
} as const;

export type AppConfig = typeof appConfig;
