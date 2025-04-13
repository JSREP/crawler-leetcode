import * as YAML from 'yaml';
import { extractChallengeFieldComments } from './yamlCommentProcessor';
import { formatYamlValue } from './yamlFormatter';

/**
 * 在 YAML 挑战集合中，更新特定 ID 的挑战，同时保留所有注释
 * @param originalYaml 原始 YAML 集合字符串
 * @param challengeId 要更新的挑战 ID
 * @param updatedChallenge 更新后的挑战对象
 * @returns 更新后的 YAML 字符串，保留注释
 */
export function updateChallengeInCollection(
  originalYaml: string,
  challengeId: number | null,
  updatedChallenge: any
): string {
  if (!challengeId) {
    throw new Error('无效的挑战 ID');
  }
  
  try {
    // 解析 YAML 以确认结构
    const yamlData = YAML.parse(originalYaml);
    
    if (!yamlData || !yamlData.challenges || !Array.isArray(yamlData.challenges)) {
      throw new Error('YAML 不是有效的挑战集合格式');
    }
    
    // 确认挑战 ID 存在
    const challengeIndex = yamlData.challenges.findIndex((c: any) => c.id === challengeId);
    if (challengeIndex === -1) {
      throw new Error(`找不到 ID 为 ${challengeId} 的挑战`);
    }
    
    // 使用正则表达式找到要修改的挑战部分
    // 创建一个正则表达式来定位挑战部分
    const challengeRegex = new RegExp(`([ \\t]+)-\\s+id:\\s*${challengeId}\\b`, 'm');
    const match = challengeRegex.exec(originalYaml);
    
    if (!match) {
      throw new Error(`无法在 YAML 中定位 ID 为 ${challengeId} 的挑战`);
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
    
    // 提取当前挑战的 YAML 文本
    const currentChallengeText = originalYaml.substring(challengeStart, challengeEnd);
    
    // 提取挑战部分的注释
    const challengeWithComments = extractChallengeFieldComments(currentChallengeText);
    
    // 分析原始挑战文本，提取字段顺序
    const originalFieldOrder = extractFieldOrder(currentChallengeText);
    
    // 生成更新后的挑战 YAML，保留缩进和字段顺序
    const updatedChallengePart = generateUpdatedChallengeYaml(
      indent,
      originalFieldOrder,
      challengeWithComments,
      updatedChallenge,
      currentChallengeText
    );
    
    // 替换原始 YAML 中的挑战部分
    const result = originalYaml.substring(0, challengeStart) + 
                  updatedChallengePart + 
                  (nextMatch ? originalYaml.substring(challengeEnd) : '');
    
    return result;
  } catch (error: any) {
    throw new Error(`更新挑战时出错: ${error.message}`);
  }
}

/**
 * 从挑战文本中提取字段顺序
 * @param challengeText 挑战文本
 * @returns 字段顺序数组
 */
function extractFieldOrder(challengeText: string): string[] {
  const lines = challengeText.split('\n');
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
 * 生成更新后的挑战 YAML 文本
 * @param indent 缩进字符串
 * @param fieldOrder 字段顺序
 * @param comments 字段注释
 * @param challenge 挑战数据
 * @param originalText 原始挑战文本
 * @returns 生成的 YAML 文本
 */
function generateUpdatedChallengeYaml(
  indent: string,
  fieldOrder: string[],
  comments: { [key: string]: string[] },
  challenge: any,
  originalText: string
): string {
  // 开始行：ID
  const lines = [`${indent}- id: ${challenge.id}`];
  
  // 根据原始字段顺序生成其他字段
  fieldOrder.forEach(fieldName => {
    // 查找当前字段在 challenge 对象中的值
    let fieldValue = getFieldValue(challenge, fieldName);
    
    // 如果找不到字段值，跳过
    if (fieldValue === null || fieldValue === undefined) return;
    
    // 如果有字段注释，先添加注释
    if (comments[fieldName]) {
      lines.push(...comments[fieldName]);
    }
    
    // 根据字段类型和原始格式添加字段
    if (fieldName === 'description-markdown' && typeof fieldValue === 'string') {
      // 使用原始格式保留 description-markdown
      addFormattedTextField(lines, indent, fieldName, fieldValue, originalText);
    } else if (fieldName === 'tags' && Array.isArray(fieldValue)) {
      // 保留原始标签格式
      addFormattedArrayField(lines, indent, fieldName, fieldValue, originalText, 'tags');
    } else if (fieldName === 'solutions' && Array.isArray(fieldValue)) {
      // 保留原始参考资料格式
      addFormattedArrayField(lines, indent, fieldName, fieldValue, originalText, 'solutions');
    } else {
      // 处理所有其他普通字段
      addFormattedSimpleField(lines, indent, fieldName, fieldValue);
    }
  });
  
  return lines.join('\n');
}

/**
 * 获取字段值，处理不同的字段命名方式
 * @param obj 数据对象
 * @param fieldName 字段名
 * @returns 字段值
 */
function getFieldValue(obj: any, fieldName: string): any {
  // 直接尝试获取
  if (obj[fieldName] !== undefined) {
    return obj[fieldName];
  }
  
  // 尝试转换命名方式
  // 短横线命名 -> 驼峰命名
  const camelCaseKey = fieldName.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  if (obj[camelCaseKey] !== undefined) {
    return obj[camelCaseKey];
  }
  
  // 特定字段的映射
  const fieldMap: Record<string, string> = {
    'id-alias': 'idAlias',
    'name_en': 'nameEn',
    'difficulty-level': 'difficultyLevel',
    'description-markdown': 'description',
    'description-markdown_en': 'descriptionEn',
    'base64-url': 'base64Url',
    'is-expired': 'isExpired',
    'create-time': 'createTime',
    'update-time': 'updateTime'
  };
  
  const mappedKey = fieldMap[fieldName];
  if (mappedKey && obj[mappedKey] !== undefined) {
    return obj[mappedKey];
  }
  
  return undefined;
}

/**
 * 添加格式化的文本字段（保留原始格式）
 * @param lines 行数组
 * @param indent 缩进
 * @param fieldName 字段名
 * @param value 字段值
 * @param originalText 原始文本
 */
function addFormattedTextField(
  lines: string[],
  indent: string,
  fieldName: string,
  value: string,
  originalText: string
): void {
  if (value.includes('\n')) {
    // 查找原始字段的格式
    const originalFormatMatch = originalText.match(new RegExp(`${indent}\\s+${fieldName}:\\s*(.)[\\s\\S]*?(?=${indent}\\s+[a-zA-Z0-9_-]+:|$)`));
    if (originalFormatMatch && originalFormatMatch[1] === '"') {
      // 原始格式使用引号，保持一致
      lines.push(`${indent}  ${fieldName}: "${value.replace(/"/g, '\\"')}"`);
    } else {
      // 原始格式使用竖线，或者无法确定，使用竖线
      lines.push(`${indent}  ${fieldName}: |`);
      value.split('\n').forEach(line => {
        lines.push(`${indent}    ${line}`);
      });
    }
  } else {
    lines.push(`${indent}  ${fieldName}: ${formatYamlValue(value)}`);
  }
}

/**
 * 添加格式化的数组字段（保留原始格式）
 * @param lines 行数组
 * @param indent 缩进
 * @param fieldName 字段名
 * @param value 字段值
 * @param originalText 原始文本
 * @param fieldType 字段类型 ('tags' 或 'solutions')
 */
function addFormattedArrayField(
  lines: string[],
  indent: string,
  fieldName: string,
  value: any[],
  originalText: string,
  fieldType: 'tags' | 'solutions'
): void {
  if (value.length === 0) {
    // 检查原始格式是否使用压缩语法 []
    const emptyArrayMatch = originalText.match(new RegExp(`${fieldName}:\\s*\\[\\s*\\]`));
    if (emptyArrayMatch) {
      lines.push(`${indent}  ${fieldName}: []`);
    } else {
      lines.push(`${indent}  ${fieldName}: []`);
    }
    return;
  }
  
  lines.push(`${indent}  ${fieldName}:`);
  
  // 查找原始缩进和格式
  const formatRegex = new RegExp(`${indent}\\s+${fieldName}:[^\\n]*\\n(\\s+)-(\\s*)`);
  const formatMatch = originalText.match(formatRegex);
  const itemIndent = formatMatch ? formatMatch[1] : `${indent}    `;
  const hasSpace = formatMatch ? formatMatch[2].length > 0 : true;
  
  if (fieldType === 'tags') {
    // 简单的标签数组
    value.forEach(tag => {
      if (hasSpace) {
        lines.push(`${itemIndent}- ${tag}`);
      } else {
        lines.push(`${itemIndent}-${tag}`);
      }
    });
  } else if (fieldType === 'solutions') {
    // 复杂的参考资料对象数组
    value.forEach(solution => {
      if (typeof solution === 'string') {
        // 如果是字符串，直接添加
        lines.push(`${itemIndent}- ${solution}`);
      } else {
        // 如果是对象，使用 YAML 对象格式
        lines.push(`${itemIndent}- title: ${formatYamlValue(solution.title)}`);
        lines.push(`${itemIndent}  url: ${formatYamlValue(solution.url)}`);
        
        if (solution.source) {
          lines.push(`${itemIndent}  source: ${formatYamlValue(solution.source)}`);
        }
        
        if (solution.author) {
          lines.push(`${itemIndent}  author: ${formatYamlValue(solution.author)}`);
        }
      }
    });
  }
}

/**
 * 添加简单字段（标量值）
 * @param lines 行数组
 * @param indent 缩进
 * @param fieldName 字段名
 * @param value 字段值
 */
function addFormattedSimpleField(
  lines: string[],
  indent: string,
  fieldName: string,
  value: any
): void {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    lines.push(`${indent}  ${fieldName}: ${formatYamlValue(value)}`);
  } else if (value === null || value === undefined) {
    // 跳过空值
    return;
  } else {
    // 对于复杂对象，使用 YAML.stringify
    const yamlValue = YAML.stringify(value).trim();
    lines.push(`${indent}  ${fieldName}: ${yamlValue}`);
  }
} 