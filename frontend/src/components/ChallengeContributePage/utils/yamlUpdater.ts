import * as YAML from 'yaml';
import { extractYamlComments, formatYamlValue } from './yamlParser';

/**
 * 在YAML挑战集合中，更新特定ID的挑战，同时保留所有注释
 * @param originalYaml 原始YAML集合字符串
 * @param challengeId 要更新的挑战ID
 * @param updatedChallenge 更新后的挑战对象
 * @returns 更新后的YAML字符串，保留注释
 */
export function updateChallengeInCollection(
  originalYaml: string,
  challengeId: number | null,
  updatedChallenge: any
): string {
  if (!challengeId) {
    throw new Error('无效的挑战ID');
  }
  
  try {
    // 解析YAML以确认结构
    const yamlData = YAML.parse(originalYaml);
    
    if (!yamlData || !yamlData.challenges || !Array.isArray(yamlData.challenges)) {
      throw new Error('YAML不是有效的挑战集合格式');
    }
    
    // 确认挑战ID存在
    const challengeIndex = yamlData.challenges.findIndex((c: any) => c.id === challengeId);
    if (challengeIndex === -1) {
      throw new Error(`找不到ID为${challengeId}的挑战`);
    }
    
    // 使用正则表达式找到要修改的挑战部分
    // 创建一个正则表达式来定位挑战部分
    const challengeRegex = new RegExp(`([ \\t]+)-\\s+id:\\s*${challengeId}\\b`, 'm');
    const match = challengeRegex.exec(originalYaml);
    
    if (!match) {
      throw new Error(`无法在YAML中定位ID为${challengeId}的挑战`);
    }
    
    // 获取挑战的缩进级别
    const indent = match[1];
    const challengeStart = match.index;
    
    // 查找挑战结束位置
    // 同级别的下一个条目将以相同缩进开始并跟着一个破折号
    // 或者文件结束
    const nextChallengeRegex = new RegExp(`\\n${indent}-`, 'g');
    nextChallengeRegex.lastIndex = challengeStart + match[0].length;
    
    const nextMatch = nextChallengeRegex.exec(originalYaml);
    const challengeEnd = nextMatch ? nextMatch.index : originalYaml.length;
    
    // 提取当前挑战的YAML文本
    const currentChallengeText = originalYaml.substring(challengeStart, challengeEnd);
    
    // 提取挑战部分的注释
    const lines = currentChallengeText.split('\n');
    const challengeWithComments: { [key: string]: string[] } = {};
    let currentField: string | null = null;
    let commentBuffer: string[] = [];
    
    // 从挑战文本中提取字段和对应的注释
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // 跳过第一行（挑战开始行）
      if (i === 0) continue;
      
      if (trimmedLine.startsWith('#')) {
        // 这是注释行，添加到缓冲区
        commentBuffer.push(line);
      } else if (trimmedLine === '') {
        // 空行，跳过
        continue;
      } else {
        // 检查是否是字段行
        const fieldMatch = line.match(/^(\s*)([a-zA-Z0-9_-]+):/);
        if (fieldMatch) {
          // 这是一个字段
          const fieldName = fieldMatch[2];
          
          // 如果有待处理的注释，关联到这个字段
          if (commentBuffer.length > 0) {
            challengeWithComments[fieldName] = [...commentBuffer];
            commentBuffer = [];
          }
          
          currentField = fieldName;
        } else {
          // 不是字段开始，可能是复杂字段的一部分
          // 我们保留这些注释，可能是块级注释或值的一部分
          if (commentBuffer.length > 0 && currentField) {
            // 如果已经有这个字段的注释，添加到现有注释中
            if (challengeWithComments[currentField]) {
              challengeWithComments[currentField].push(...commentBuffer);
            } else {
              challengeWithComments[currentField] = [...commentBuffer];
            }
            commentBuffer = [];
          }
        }
      }
    }
    
    // 生成更新后的挑战YAML
    // 提取原始字段顺序
    const originalFieldOrder = extractFieldOrder(lines);
    
    // 生成更新后的挑战文本
    const updatedChallengeText = generateUpdatedChallenge(
      indent,
      updatedChallenge,
      challengeWithComments,
      originalFieldOrder
    );
    
    // 替换原始YAML中的挑战部分
    return originalYaml.substring(0, challengeStart) + 
           updatedChallengeText + 
           originalYaml.substring(challengeEnd);
           
  } catch (error) {
    console.error('更新挑战失败:', error);
    throw error;
  }
}

/**
 * 从YAML行中提取字段顺序
 * @param lines YAML行数组
 * @returns 字段顺序数组
 */
function extractFieldOrder(lines: string[]): string[] {
  const fieldOrder: string[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const fieldMatch = line.match(/^(\s*)([a-zA-Z0-9_-]+):/);
    if (fieldMatch) {
      const fieldName = fieldMatch[2];
      if (!fieldOrder.includes(fieldName) && fieldName !== 'id') {
        fieldOrder.push(fieldName);
      }
    }
  }
  
  return fieldOrder;
}

/**
 * 生成更新后的挑战YAML文本
 * @param indent 缩进字符串
 * @param challenge 挑战对象
 * @param comments 注释对象
 * @param fieldOrder 字段顺序
 * @returns 更新后的YAML文本
 */
function generateUpdatedChallenge(
  indent: string,
  challenge: any,
  comments: { [key: string]: string[] },
  fieldOrder: string[]
): string {
  const lines = [`${indent}- id: ${challenge.id}`];
  
  // 按照原始顺序生成更新后的字段
  fieldOrder.forEach(fieldName => {
    // 添加字段注释
    if (comments[fieldName]) {
      lines.push(...comments[fieldName]);
    }
    
    // 获取字段值
    const value = getFieldValue(challenge, fieldName);
    if (value !== undefined) {
      lines.push(`${indent}  ${fieldName}: ${formatYamlValue(value)}`);
    }
  });
  
  return lines.join('\n');
}

/**
 * 从挑战对象中获取字段值，处理不同命名风格
 * @param challenge 挑战对象
 * @param fieldName 字段名
 * @returns 字段值
 */
function getFieldValue(challenge: any, fieldName: string): any {
  // 直接字段名匹配
  if (challenge[fieldName] !== undefined) {
    return challenge[fieldName];
  }
  
  // 尝试驼峰命名转换
  const camelCaseKey = fieldName.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  if (challenge[camelCaseKey] !== undefined) {
    return challenge[camelCaseKey];
  }
  
  // 尝试其他命名约定
  const kebabToCamelMap: { [key: string]: string } = {
    'id-alias': 'idAlias',
    'name_en': 'nameEn',
    'difficulty-level': 'difficultyLevel',
    'description-markdown': 'descriptionMarkdown',
    'description-markdown_en': 'descriptionMarkdownEn',
    'base64-url': 'base64Url',
    'is-expired': 'isExpired',
    'create-time': 'createTime',
    'update-time': 'updateTime'
  };
  
  if (kebabToCamelMap[fieldName] && challenge[kebabToCamelMap[fieldName]] !== undefined) {
    return challenge[kebabToCamelMap[fieldName]];
  }
  
  return undefined;
} 