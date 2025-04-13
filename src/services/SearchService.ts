import Fuse from 'fuse.js';
import { Challenge } from '../types/challenge';

// Fuse.js配置选项
const fuseOptions = {
  // 搜索键，指定在哪些字段中进行搜索
  keys: [
    { name: 'title', weight: 2 },     // 标题权重更高
    { name: 'description', weight: 1 },
    { name: 'tags', weight: 1.5 },    // 标签权重较高
    { name: 'platform', weight: 1 },
    { name: 'number', weight: 2 },    // 题号权重高
    'id',
    'idAlias',
    'descriptionMarkdown'
  ],
  // 模糊搜索的阈值，越低匹配越严格，范围0-1
  threshold: 0.3,
  // 匹配字符的位置差异，越低匹配越严格
  distance: 100,
  // 是否包含匹配的分数
  includeScore: true,
  // 是否按分数排序
  shouldSort: true,
  // 最小字符匹配长度
  minMatchCharLength: 2,
  // 使用前缀匹配模式
  useExtendedSearch: true,
  // 是否区分大小写
  ignoreLocation: true,
  // 精确匹配时的加分
  findAllMatches: true
};

/**
 * 搜索服务类
 */
class SearchService {
  private fuse: Fuse<Challenge> | null = null;
  private challenges: Challenge[] = [];

  /**
   * 初始化Fuse搜索实例
   * @param challenges 要搜索的挑战数据
   */
  initialize(challenges: Challenge[]) {
    this.challenges = challenges;
    this.fuse = new Fuse(challenges, fuseOptions);
  }

  /**
   * 执行搜索
   * @param query 搜索查询文本
   * @returns 匹配的挑战列表
   */
  search(query: string): Challenge[] {
    if (!query.trim() || !this.fuse) {
      return this.challenges;
    }

    // 执行搜索并返回结果
    const results = this.fuse.search(query);
    return results.map(result => result.item);
  }

  /**
   * 根据多个条件过滤挑战
   * @param challenges 要过滤的挑战列表
   * @param filters 过滤条件
   * @returns 过滤后的挑战列表
   */
  filterChallenges(
    challenges: Challenge[],
    filters: {
      tags?: string[];
      difficulty?: string;
      platform?: string;
      query?: string;
    }
  ): Challenge[] {
    let filteredList = challenges;

    // 确保已忽略的挑战不会包含在结果中
    filteredList = filteredList.filter(challenge => !challenge.ignored);

    // 如果有搜索查询，先进行搜索
    if (filters.query && filters.query.trim()) {
      this.initialize(filteredList);
      filteredList = this.search(filters.query);
    }

    // 应用其他过滤器
    return filteredList.filter(challenge => {
      // 标签过滤
      const matchesTags = !filters.tags?.length || 
        filters.tags.every(tag => challenge.tags.includes(tag));

      // 难度过滤
      let matchesDifficulty = true;
      if (filters.difficulty && filters.difficulty !== 'all') {
        // 处理逗号分隔的多难度筛选
        const difficultyArray = filters.difficulty.split(',').filter(Boolean);
        if (difficultyArray.length > 0) {
          matchesDifficulty = difficultyArray.some(diff => 
            challenge.difficulty === parseInt(diff)
          );
        }
      }

      // 平台过滤
      const matchesPlatform = !filters.platform || filters.platform === 'all' || 
        challenge.platform === filters.platform;

      return matchesTags && matchesDifficulty && matchesPlatform;
    });
  }
}

// 导出单例实例
export const searchService = new SearchService(); 