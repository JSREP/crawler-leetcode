import * as YAML from 'yaml';
import { ChallengeFormData, ChallengeData, Solution } from '../types';

/**
 * 将表单数据转换为YAML格式数据
 * @param formData 表单数据
 * @returns YAML格式的字符串
 */
export const generateYamlFromFormData = (formData: ChallengeFormData): string => {
  if (!formData) {
    return '';
  }
  
  // 转换解决方案数组为对象格式
  const solutionsArray = formData.solutions
    ?.map(solution => {
      // 确保解决方案有标题和URL
      if (solution.title && solution.url) {
        return {
          title: solution.title,
          url: solution.url,
          source: solution.source || undefined,
          author: solution.author || undefined
        };
      }
      return null;
    })
    .filter((solution): solution is { 
      title: string; 
      url: string; 
      source?: string; 
      author?: string; 
    } => solution !== null) || [];
  
  // 创建当前时间戳
  const currentTime = new Date().toISOString();
  
  // 创建符合YAML要求的数据结构
  const challengeData: ChallengeData = {
    id: formData.id,
    'id-alias': formData.idAlias || undefined,
    platform: formData.platform,
    name: formData.name,
    name_en: formData.nameEn || undefined,
    'difficulty-level': formData.difficultyLevel,
    'description-markdown': formData.descriptionMarkdown,
    'description-markdown_en': formData.descriptionMarkdownEn || undefined,
    'base64-url': formData.base64Url,
    'is-expired': formData.isExpired,
    tags: formData.tags || [],
    solutions: solutionsArray,
    'create-time': currentTime,
    'update-time': currentTime // 始终使用当前时间作为更新时间
  };
  
  // 转换为YAML字符串
  const yamlString = YAML.stringify(challengeData);
  return yamlString;
};

/**
 * 解析YAML字符串为表单数据
 * @param yamlString YAML格式的字符串
 * @returns 表单数据对象
 */
export const parseYamlToFormData = (yamlString: string): ChallengeFormData | null => {
  if (!yamlString) {
    return null;
  }
  
  try {
    // 解析YAML字符串
    const challengeData = YAML.parse(yamlString) as ChallengeData;
    
    // 转换解决方案
    const solutions = challengeData.solutions?.map(solution => {
      return {
        title: solution.title || '',
        url: solution.url || '',
        source: solution.source,
        author: solution.author
      };
    }) || [];
    
    // 创建表单数据，确保类型一致
    const formData: ChallengeFormData = {
      id: challengeData.id || null,
      idAlias: challengeData['id-alias'] || '',
      platform: (challengeData.platform || 'Web') as 'Web' | 'Android' | 'iOS',
      name: challengeData.name || '',
      nameEn: challengeData.name_en || '',
      difficultyLevel: challengeData['difficulty-level'] || 1,
      // 映射Markdown内容到表单字段
      description: challengeData['description-markdown'] || '',
      descriptionEn: challengeData['description-markdown_en'] || '',
      tags: challengeData.tags || [],
      solutions: solutions,
      // 添加额外字段到表单数据中，让其可以在生成时使用
      example: '',
      testCases: [],
      comments: []
    };
    
    return formData;
  } catch (error) {
    console.error('解析YAML失败:', error);
    return null;
  }
}; 