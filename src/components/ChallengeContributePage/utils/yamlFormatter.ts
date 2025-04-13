import * as YAML from 'yaml';
import { extractYamlComments } from './yamlCommentProcessor';

/**
 * 格式化 YAML 值
 * @param value 要格式化的值
 * @returns 格式化后的 YAML 值字符串
 */
export function formatYamlValue(value: any): string {
  if (typeof value === 'string') {
    // 如果字符串包含特殊字符，使用引号包裹
    if (value.match(/['":{}[\],&*#?|\-<>=!%@`]/)) {
      return `"${value.replace(/"/g, '\\"')}"`;
    }
    return value;
  } else if (typeof value === 'number') {
    return value.toString();
  } else if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  } else if (Array.isArray(value)) {
    if (value.length === 0) {
      return '[]';
    }
    return YAML.stringify(value, { indent: 2, lineWidth: -1 });
  } else if (typeof value === 'object' && value !== null) {
    return YAML.stringify(value, { indent: 2, lineWidth: -1 });
  } else if (value === null || value === undefined) {
    return 'null';
  } else {
    throw new Error(`不支持的 YAML 值类型: ${typeof value}`);
  }
}

/**
 * 在 YAML 字符串中保留注释并更新值
 * @param originalYaml 原始 YAML 字符串
 * @param updatedValues 更新后的值对象
 * @returns 更新后但保留注释的 YAML 字符串
 */
export function preserveCommentsInYaml(originalYaml: string, updatedValues: any): string {
  // 提取注释
  const { headerComments, documentComments, contentStartIndex } = extractYamlComments(originalYaml);
  
  // 生成更新后的 YAML 内容
  const updatedContent = YAML.stringify(updatedValues, {
    indent: 2,
    lineWidth: -1
  });
  
  // 将顶部注释添加回去
  let result = headerComments;
  if (headerComments && !headerComments.endsWith('\n')) {
    result += '\n';
  }
  
  // 将更新后的内容添加回去
  result += updatedContent;
  
  return result;
}

/**
 * 将驼峰命名转换为短横线命名（kebab-case）
 * @param str 驼峰命名的字符串
 * @returns 短横线命名的字符串
 */
export function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * 将短横线命名（kebab-case）转换为驼峰命名
 * @param str 短横线命名的字符串
 * @returns 驼峰命名的字符串
 */
export function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * 规范化 YAML 字段键名
 * 在 YAML 和表单数据之间转换字段名称
 * @param key YAML 字段键名
 * @param toFormField 是否转换为表单字段名（默认为 false，表示转换为 YAML 字段名）
 * @returns 转换后的字段名
 */
export function normalizeFieldKey(key: string, toFormField = false): string {
  if (toFormField) {
    // YAML 字段名 -> 表单字段名
    switch (key) {
      case 'id-alias': return 'idAlias';
      case 'name_en': return 'nameEn';
      case 'difficulty-level': return 'difficultyLevel';
      case 'description-markdown': return 'description';
      case 'description-markdown_en': return 'descriptionEn';
      case 'base64-url': return 'base64Url';
      case 'is-expired': return 'isExpired';
      case 'create-time': return 'createTime';
      case 'update-time': return 'updateTime';
      default: return kebabToCamel(key);
    }
  } else {
    // 表单字段名 -> YAML 字段名
    switch (key) {
      case 'idAlias': return 'id-alias';
      case 'nameEn': return 'name_en';
      case 'difficultyLevel': return 'difficulty-level';
      case 'description': return 'description-markdown';
      case 'descriptionEn': return 'description-markdown_en';
      case 'base64Url': return 'base64-url';
      case 'isExpired': return 'is-expired';
      case 'createTime': return 'create-time';
      case 'updateTime': return 'update-time';
      default: return camelToKebab(key);
    }
  }
} 