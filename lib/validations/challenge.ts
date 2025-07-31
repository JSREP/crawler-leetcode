/**
 * 挑战数据验证规则
 */

import { DIFFICULTY_LEVELS } from '@/constants';

/**
 * 验证挑战ID
 */
export function validateChallengeId(id: unknown): id is number {
  return typeof id === 'number' && id > 0 && Number.isInteger(id);
}

/**
 * 验证难度级别
 */
export function validateDifficulty(difficulty: unknown): difficulty is string {
  return typeof difficulty === 'string' &&
         Object.values(DIFFICULTY_LEVELS).includes(difficulty as 'Easy' | 'Medium' | 'Hard');
}

/**
 * 验证搜索关键词
 */
export function validateSearchQuery(query: unknown): query is string {
  return typeof query === 'string' && query.length <= 100;
}

/**
 * 验证分页参数
 */
export function validatePaginationParams(params: {
  page?: unknown;
  per_page?: unknown;
}): { page: number; per_page: number } {
  const page = typeof params.page === 'string' ? parseInt(params.page, 10) : 1;
  const per_page = typeof params.per_page === 'string' ? parseInt(params.per_page, 10) : 10;

  return {
    page: Math.max(1, isNaN(page) ? 1 : page),
    per_page: Math.min(100, Math.max(1, isNaN(per_page) ? 10 : per_page)),
  };
}

/**
 * 验证标签数组
 */
export function validateTags(tags: unknown): tags is string[] {
  if (!Array.isArray(tags)) return false;
  return tags.every(tag => typeof tag === 'string' && tag.length > 0);
}

/**
 * 验证挑战筛选参数
 */
export interface ChallengeFiltersValidation {
  search?: string;
  difficulty?: string;
  tags?: string[];
  page?: number;
  per_page?: number;
}

export function validateChallengeFilters(
  params: Record<string, unknown>
): ChallengeFiltersValidation {
  const validated: ChallengeFiltersValidation = {};

  // 验证搜索关键词
  if (params.search && validateSearchQuery(params.search)) {
    validated.search = params.search;
  }

  // 验证难度
  if (params.difficulty && validateDifficulty(params.difficulty)) {
    validated.difficulty = params.difficulty;
  }

  // 验证标签
  if (params.tags) {
    let tags: string[] = [];
    if (typeof params.tags === 'string') {
      tags = params.tags.split(',').filter(tag => tag.trim().length > 0);
    } else if (validateTags(params.tags)) {
      tags = params.tags;
    }
    if (tags.length > 0) {
      validated.tags = tags;
    }
  }

  // 验证分页参数
  const pagination = validatePaginationParams(params);
  validated.page = pagination.page;
  validated.per_page = pagination.per_page;

  return validated;
}
