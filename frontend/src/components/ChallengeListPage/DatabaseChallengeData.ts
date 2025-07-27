/**
 * 从数据库 API 加载挑战数据
 */
import { Challenge } from '../../types/challenge';

// API 基础 URL
const API_BASE_URL = import.meta.env.MODE === 'production' 
  ? 'https://your-production-api.com/api'  // 需要替换为实际的生产环境API地址
  : 'http://localhost:5000/api';

// 数据库 API 响应类型
interface DatabaseChallenge {
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

interface ChallengesResponse {
  challenges: DatabaseChallenge[];
  total: number;
  pages: number;
  current_page: number;
  per_page: number;
}

// 转换数据库格式到前端格式
function transformDatabaseChallenge(dbChallenge: DatabaseChallenge): Challenge {
  return {
    id: dbChallenge.id,
    title: dbChallenge.name,
    name: dbChallenge.name,
    titleEN: dbChallenge.name_en || '',
    name_en: dbChallenge.name_en || '',
    platform: dbChallenge.platform,
    difficulty: dbChallenge.difficulty_level,
    description: dbChallenge.description_markdown || '',
    descriptionEN: dbChallenge.description_markdown_en || '',
    base64Url: dbChallenge.base64_url,
    isExpired: dbChallenge.is_expired,
    tags: dbChallenge.tags || [],
    createTime: new Date(dbChallenge.created_at),
    updateTime: new Date(dbChallenge.updated_at),
    sourceFile: `database-${dbChallenge.id_alias}`,
    // 添加其他可能需要的字段
    idAlias: dbChallenge.id_alias,
  };
}

// 缓存管理
class ChallengeCache {
  private static instance: ChallengeCache;
  private cache: Challenge[] | null = null;
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

  static getInstance(): ChallengeCache {
    if (!ChallengeCache.instance) {
      ChallengeCache.instance = new ChallengeCache();
    }
    return ChallengeCache.instance;
  }

  isValid(): boolean {
    return this.cache !== null && (Date.now() - this.lastFetch) < this.CACHE_DURATION;
  }

  get(): Challenge[] | null {
    return this.isValid() ? this.cache : null;
  }

  set(challenges: Challenge[]): void {
    this.cache = challenges;
    this.lastFetch = Date.now();
  }

  clear(): void {
    this.cache = null;
    this.lastFetch = 0;
  }
}

// 从数据库 API 获取挑战数据
export async function fetchChallengesFromDatabase(): Promise<Challenge[]> {
  const cache = ChallengeCache.getInstance();
  
  // 检查缓存
  const cachedData = cache.get();
  if (cachedData) {
    console.log('从缓存获取挑战数据:', cachedData.length);
    return cachedData;
  }

  try {
    console.log('从数据库API获取挑战数据...');
    
    // 获取所有挑战数据（设置较大的 per_page 值）
    const response = await fetch(`${API_BASE_URL}/db/challenges?per_page=1000`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: ChallengesResponse = await response.json();
    
    console.log('数据库API响应:', data);
    
    // 转换数据格式
    const challenges = data.challenges.map(transformDatabaseChallenge);
    
    console.log('转换后的挑战数据:', challenges.length);
    
    // 缓存数据
    cache.set(challenges);
    
    return challenges;
    
  } catch (error) {
    console.error('从数据库获取挑战数据失败:', error);
    
    // 如果 API 失败，尝试使用虚拟文件系统作为后备
    try {
      console.log('尝试使用虚拟文件系统作为后备...');
      // @ts-ignore - 虚拟文件在构建时生成
      const rawChallenges = await import('/virtual-challenges.js');
      const { parseChallenges } = await import('../../types/challenge');
      
      const fallbackChallenges = parseChallenges(
        Array.isArray(rawChallenges.default) ? rawChallenges.default : []
      );
      
      console.log('虚拟文件系统后备数据:', fallbackChallenges.length);
      return fallbackChallenges;
      
    } catch (fallbackError) {
      console.error('虚拟文件系统后备也失败:', fallbackError);
      return [];
    }
  }
}

// 获取挑战统计信息
export async function fetchChallengeStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/db/challenges/stats`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const stats = await response.json();
    console.log('挑战统计信息:', stats);
    
    return stats;
    
  } catch (error) {
    console.error('获取挑战统计信息失败:', error);
    return null;
  }
}

// 根据别名获取单个挑战
export async function fetchChallengeByAlias(alias: string): Promise<Challenge | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/db/challenges/${alias}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const dbChallenge: DatabaseChallenge = await response.json();
    return transformDatabaseChallenge(dbChallenge);
    
  } catch (error) {
    console.error(`获取挑战 ${alias} 失败:`, error);
    return null;
  }
}

// 测试数据库连接
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/db/test`);
    
    if (!response.ok) {
      return false;
    }
    
    const result = await response.json();
    console.log('数据库连接测试:', result);
    
    return result.status === 'success';
    
  } catch (error) {
    console.error('数据库连接测试失败:', error);
    return false;
  }
}

// 清除缓存（用于强制刷新数据）
export function clearChallengeCache(): void {
  ChallengeCache.getInstance().clear();
  console.log('挑战数据缓存已清除');
}

// 导出默认的挑战数据加载函数
export const loadChallenges = fetchChallengesFromDatabase;
