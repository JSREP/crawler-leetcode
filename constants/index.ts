/**
 * 应用常量定义
 */

// 难度级别
export const DIFFICULTY_LEVELS = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
} as const;

export const DIFFICULTY_COLORS = {
  [DIFFICULTY_LEVELS.EASY]: '#52c41a',
  [DIFFICULTY_LEVELS.MEDIUM]: '#faad14',
  [DIFFICULTY_LEVELS.HARD]: '#f5222d',
} as const;

// 挑战状态
export const CHALLENGE_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const;

// API路由
export const API_ROUTES = {
  CHALLENGES: '/api/db/challenges',
  CHALLENGE_BY_ID: '/api/db/challenges',
  STATS: '/api/db/stats',
  TEST: '/api/db/test',
} as const;

// 页面路由
export const PAGE_ROUTES = {
  HOME: '/',
  CHALLENGES: '/challenges',
  CHALLENGE_DETAIL: '/challenges',
} as const;

// 本地存储键
export const STORAGE_KEYS = {
  THEME: 'leetcode-theme',
  FILTERS: 'leetcode-filters',
  PAGE_SIZE: 'leetcode-page-size',
} as const;

// 错误消息
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  SERVER_ERROR: '服务器错误，请稍后重试',
  NOT_FOUND: '请求的资源不存在',
  VALIDATION_ERROR: '输入数据格式错误',
  UNKNOWN_ERROR: '未知错误，请联系管理员',
} as const;

// 成功消息
export const SUCCESS_MESSAGES = {
  DATA_LOADED: '数据加载成功',
  OPERATION_SUCCESS: '操作成功',
} as const;
