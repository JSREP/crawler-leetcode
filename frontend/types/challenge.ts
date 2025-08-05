/**
 * 挑战相关的类型定义
 */

export interface Challenge {
  id: number;
  id_alias: string;
  name: string;
  name_en?: string;
  platform: string;
  difficulty_level: number;
  description_markdown?: string;
  description_markdown_en?: string;
  base64_url: string;
  is_expired: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
  
  // 兼容前端的字段
  title?: string;
  titleEN?: string;
  difficulty?: number;
  description?: string;
  descriptionEN?: string;
  base64Url?: string;
  isExpired?: boolean;
  createTime?: Date | string;
  updateTime?: Date | string;
  sourceFile?: string;
  idAlias?: string;
  target_url?: string;
}

export interface DatabaseChallenge {
  id: number;
  id_alias: string;
  name: string;
  name_en?: string;
  platform: string;
  difficulty_level: number;
  description_markdown?: string;
  description_markdown_en?: string;
  base64_url: string;
  is_expired: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ChallengesResponse {
  challenges: Challenge[];
  total: number;
  pages: number;
  current_page: number;
  per_page: number;
}

export interface ChallengeStats {
  total: number;
  platforms: Array<{
    platform: string;
    count: number;
  }>;
  difficulties: Array<{
    difficulty_level: number;
    count: number;
  }>;
  tags: Array<{
    tag: string;
    count: number;
  }>;
}

export interface ChallengeFilters {
  search?: string;
  difficulty?: string;
  tags?: string[];
  platform?: string;
}

export interface PaginationConfig {
  current: number;
  pageSize: number;
  total?: number;
}

// 难度级别映射
export const DIFFICULTY_LEVELS = {
  1: { label: '初级', color: '#52c41a', icon: '🟢' },
  2: { label: '初中级', color: '#1890ff', icon: '🔵' },
  3: { label: '中级', color: '#fa8c16', icon: '🟡' },
  4: { label: '中高级', color: '#f5222d', icon: '🔴' },
  5: { label: '高级', color: '#722ed1', icon: '🟣' },
} as const;

// 平台类型
export const PLATFORMS = {
  Web: { label: 'Web', color: '#1890ff' },
  Mobile: { label: 'Mobile', color: '#52c41a' },
  API: { label: 'API', color: '#fa8c16' },
  Desktop: { label: 'Desktop', color: '#722ed1' },
} as const;

// 常用标签
export const COMMON_TAGS = [
  'waf',
  'captcha',
  'js-reverse',
  'anti-automation',
  'behavior-analysis',
  'device-fingerprint',
  'slider-captcha',
  'login',
  'signature-detection',
  'anomaly-detection',
  'api-protection',
  'dns-level',
  'virtual-patching',
] as const;

// 工具函数
export function transformDatabaseChallenge(dbChallenge: DatabaseChallenge): Challenge {
  return {
    ...dbChallenge,
    // 兼容字段
    title: dbChallenge.name,
    titleEN: dbChallenge.name_en,
    difficulty: dbChallenge.difficulty_level,
    description: dbChallenge.description_markdown,
    descriptionEN: dbChallenge.description_markdown_en,
    base64Url: dbChallenge.base64_url,
    isExpired: dbChallenge.is_expired,
    createTime: new Date(dbChallenge.created_at),
    updateTime: new Date(dbChallenge.updated_at),
    sourceFile: `database-${dbChallenge.id_alias}`,
    idAlias: dbChallenge.id_alias,
  };
}

export function getDifficultyInfo(level: number) {
  return DIFFICULTY_LEVELS[level as keyof typeof DIFFICULTY_LEVELS] || {
    label: '未知',
    color: '#d9d9d9',
    icon: '⚪',
  };
}

export function getPlatformInfo(platform: string) {
  return PLATFORMS[platform as keyof typeof PLATFORMS] || {
    label: platform,
    color: '#d9d9d9',
  };
}
