import { useMemo } from 'react';
import { challenges } from '../../ChallengeListPage/ChallengeData';

/**
 * 获取标签使用频率的接口
 */
export interface TagFrequency {
  tag: string;
  count: number;
}

/**
 * 从所有挑战中提取唯一标签的Hook
 * @returns 所有唯一的标签数组
 */
export const useAllTags = (): string[] => {
  return useMemo(() => {
    // 如果challenges未定义或为空，返回空数组
    if (!challenges || challenges.length === 0) {
      return [];
    }

    // 收集所有标签并去重
    const allTags = new Set<string>();
    
    challenges.forEach(challenge => {
      if (challenge.tags && Array.isArray(challenge.tags)) {
        challenge.tags.forEach(tag => {
          if (tag && typeof tag === 'string') {
            allTags.add(tag);
          }
        });
      }
    });
    
    // 将Set转换为数组并按字母顺序排序
    return Array.from(allTags).sort((a, b) => 
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    );
  }, [challenges]);
};

/**
 * 从所有挑战中提取标签使用频率的Hook
 * @returns 所有标签及其使用频率的数组，按频率降序排序
 */
export const useTagsWithFrequency = (): TagFrequency[] => {
  return useMemo(() => {
    // 如果challenges未定义或为空，返回空数组
    if (!challenges || challenges.length === 0) {
      return [];
    }

    // 统计每个标签出现的频率
    const tagFrequency: Record<string, number> = {};
    
    challenges.forEach(challenge => {
      if (challenge.tags && Array.isArray(challenge.tags)) {
        challenge.tags.forEach(tag => {
          if (tag && typeof tag === 'string') {
            tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
          }
        });
      }
    });
    
    // 转换为数组并按频率降序排序
    return Object.entries(tagFrequency)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }, [challenges]);
}; 