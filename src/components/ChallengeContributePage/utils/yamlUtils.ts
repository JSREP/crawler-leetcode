import * as YAML from 'yaml';
import { ChallengeFormData, ChallengeData, Solution } from '../types';

/**
 * YAML 处理工具统一导出模块
 */

// 从各个模块导出函数
export * from './yamlCommentProcessor';
export * from './yamlFormatter';
export * from './yamlChallengeUpdater';

/**
 * 将 YAML 数据转换为表单数据
 * @param yamlData YAML 数据对象
 * @returns 表单数据对象
 */
export function yamlToFormData(yamlData: any): Partial<ChallengeFormData> {
  if (!yamlData) return {};
  
  const result: Record<string, any> = {};
  
  // 映射特定字段
  const fieldsMap: Record<string, string> = {
    'id': 'id',
    'id-alias': 'idAlias',
    'platform': 'platform',
    'name': 'name',
    'name_en': 'nameEn',
    'difficulty-level': 'difficultyLevel',
    'description-markdown': 'description',
    'description-markdown_en': 'descriptionEn',
    'base64-url': 'base64Url',
    'is-expired': 'isExpired',
    'tags': 'tags',
    'solutions': 'solutions',
    'create-time': 'createTime',
    'update-time': 'updateTime'
  };
  
  // 转换基础字段
  Object.entries(fieldsMap).forEach(([yamlKey, formKey]) => {
    if (yamlData[yamlKey] !== undefined) {
      result[formKey] = yamlData[yamlKey];
    }
  });
  
  // 保存原始 YAML 数据，用于保留注释
  result.rawYaml = yamlData;
  
  return result;
}

/**
 * 将表单数据转换为 YAML 数据
 * @param formData 表单数据对象
 * @returns YAML 数据对象
 */
export function formDataToYaml(formData: Partial<ChallengeFormData>): any {
  if (!formData) return {};
  
  const result: Record<string, any> = {};
  
  // 映射特定字段
  const fieldsMap: Record<string, string> = {
    'id': 'id',
    'idAlias': 'id-alias',
    'platform': 'platform',
    'name': 'name',
    'nameEn': 'name_en',
    'difficultyLevel': 'difficulty-level',
    'description': 'description-markdown',
    'descriptionEn': 'description-markdown_en',
    'base64Url': 'base64-url',
    'isExpired': 'is-expired',
    'tags': 'tags',
    'solutions': 'solutions',
    'createTime': 'create-time',
    'updateTime': 'update-time'
  };
  
  // 转换基础字段
  Object.entries(fieldsMap).forEach(([formKey, yamlKey]) => {
    if (formData[formKey as keyof ChallengeFormData] !== undefined) {
      result[yamlKey] = formData[formKey as keyof ChallengeFormData];
    }
  });
  
  return result;
}

/**
 * 将表单数据转换为YAML格式字符串
 * @param formData 表单数据
 * @returns YAML格式的字符串
 */
export function generateYamlFromFormData(formData: ChallengeFormData): string {
  // 先将表单数据转换为YAML对象格式
  const yamlData = formDataToYaml(formData);
  
  // 生成YAML字符串，保持适当的缩进和格式
  return YAML.stringify(yamlData, {
    indent: 2,
    lineWidth: -1
  });
}

/**
 * 解析YAML字符串为表单数据
 * @param yamlString YAML格式的字符串
 * @returns 表单数据对象
 */
export function parseYamlString(yamlString: string): Partial<ChallengeFormData> | null {
  if (!yamlString || typeof yamlString !== 'string') {
    return null;
  }
  
  try {
    // 解析YAML字符串为对象
    const yamlData = YAML.parse(yamlString);
    
    // 保存原始YAML字符串
    yamlData.originalYaml = yamlString;
    
    // 转换为表单数据
    return yamlToFormData(yamlData);
  } catch (error) {
    console.error('解析YAML字符串失败:', error);
    return null;
  }
} 