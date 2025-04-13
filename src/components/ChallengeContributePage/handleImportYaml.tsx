import * as YAML from 'yaml';

/**
 * 从YAML字符串中提取文件级和文档级注释
 * @param yamlString YAML原始字符串
 * @returns 提取的注释部分和内容开始索引
 */
export function extractYamlComments(yamlString: string): {
  headerComments: string;
  documentComments: { [key: string]: string[] };
  contentStartIndex: number;
} {
  const lines = yamlString.split('\n');
  const headerLines: string[] = [];
  let contentStartIndex = 0;
  
  // 提取文件顶部注释
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '' || line.trim().startsWith('#')) {
      headerLines.push(line);
      contentStartIndex = i + 1;
    } else {
      break;
    }
  }
  
  // 提取文档中的字段级注释
  const documentComments: { [key: string]: string[] } = {};
  let currentField: string | null = null;
  let commentBuffer: string[] = [];
  
  for (let i = contentStartIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('#')) {
      // 这是一行注释
      commentBuffer.push(lines[i]);
    } else if (line === '') {
      // 空行，跳过
      continue;
    } else {
      // 这是一个字段行
      const fieldMatch = line.match(/^(\s*)([a-zA-Z0-9_-]+):/);
      if (fieldMatch) {
        const [, indent, fieldName] = fieldMatch;
        
        // 如果有待处理的注释，将其与当前字段关联
        if (commentBuffer.length > 0) {
          documentComments[fieldName] = [...commentBuffer];
          commentBuffer = [];
        }
        
        currentField = fieldName;
      } else {
        // 不是字段开始，可能是复杂结构的一部分
        // 清空注释缓冲区，因为我们不知道应该将其关联到哪个字段
        commentBuffer = [];
      }
    }
  }
  
  return {
    headerComments: headerLines.join('\n'),
    documentComments,
    contentStartIndex
  };
}

/**
 * 在YAML字符串中保留注释并更新值
 * @param originalYaml 原始YAML字符串
 * @param updatedValues 更新后的值对象
 * @returns 更新后但保留注释的YAML字符串
 */
export function preserveCommentsInYaml(originalYaml: string, updatedValues: any): string {
  // 提取注释
  const { headerComments, documentComments, contentStartIndex } = extractYamlComments(originalYaml);
  
  // 生成更新后的YAML内容
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
  // TODO: 将字段级注释也添加回去(更复杂，需要解析新YAML并在适当位置插入注释)
  
  result += updatedContent;
  
  return result;
}

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
          // 我们不处理这些嵌套字段内的注释
          commentBuffer = [];
        }
      }
    }
    
    // 生成更新后的挑战YAML，保留缩进
    const updatedLines = [`${indent}- id: ${updatedChallenge.id}`];
    
    // 遍历原始字段的顺序和注释，确保按照原始顺序生成
    // 先收集原始字段的顺序
    const originalFieldOrder: string[] = [];
    let lastField = '';
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const fieldMatch = line.match(/^(\s*)([a-zA-Z0-9_-]+):/);
      if (fieldMatch) {
        const fieldName = fieldMatch[2];
        if (!originalFieldOrder.includes(fieldName) && fieldName !== 'id') {
          originalFieldOrder.push(fieldName);
          lastField = fieldName;
        }
      }
    }
    
    console.log('原始字段顺序:', originalFieldOrder);
    
    // 按照原始顺序生成更新后的字段
    originalFieldOrder.forEach(fieldName => {
      // 在updatedChallenge找到对应字段的值
      let fieldValue = null;
      let fieldKey = '';
      
      // 将YAML字段名称转换为JS对象可能使用的变体
      if (fieldName === 'id-alias') fieldKey = 'id-alias';
      else if (fieldName === 'name_en') fieldKey = 'name_en';
      else if (fieldName === 'difficulty-level') fieldKey = 'difficulty-level';
      else if (fieldName === 'description-markdown') fieldKey = 'description-markdown';
      else if (fieldName === 'description-markdown_en') fieldKey = 'description-markdown_en';
      else if (fieldName === 'base64-url') fieldKey = 'base64-url';
      else if (fieldName === 'is-expired') fieldKey = 'is-expired';
      else fieldKey = fieldName;
      
      // 查找该字段在updatedChallenge中的值
      if (updatedChallenge[fieldKey] !== undefined) {
        fieldValue = updatedChallenge[fieldKey];
      } else {
        // 尝试转换为驼峰命名找到字段
        const camelCaseKey = fieldKey.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
        if (updatedChallenge[camelCaseKey] !== undefined) {
          fieldValue = updatedChallenge[camelCaseKey];
        }
      }
      
      // 如果找不到字段值，跳过
      if (fieldValue === null || fieldValue === undefined) return;
      
      // 如果有字段注释，先添加注释
      if (challengeWithComments[fieldName]) {
        updatedLines.push(...challengeWithComments[fieldName]);
      }
      
      // 根据字段类型和原始格式添加字段
      if (fieldName === 'description-markdown' && typeof fieldValue === 'string') {
        // 使用原始格式保留description-markdown
        if (fieldValue.includes('\n')) {
          // 查找原始字段的格式
          const originalDescriptionFormatMatch = currentChallengeText.match(new RegExp(`${indent}\\s+description-markdown:\\s*(.)[\\s\\S]*?(?=${indent}\\s+[a-zA-Z0-9_-]+:|$)`));
          if (originalDescriptionFormatMatch && originalDescriptionFormatMatch[1] === '"') {
            // 原始格式使用引号，保持一致
            updatedLines.push(`${indent}  ${fieldName}: "${fieldValue.replace(/"/g, '\\"')}"`);
          } else {
            // 原始格式使用竖线，或者无法确定，使用竖线
            updatedLines.push(`${indent}  ${fieldName}: |`);
            fieldValue.split('\n').forEach(line => {
              updatedLines.push(`${indent}    ${line}`);
            });
          }
        } else {
          updatedLines.push(`${indent}  ${fieldName}: ${formatYamlValue(fieldValue)}`);
        }
      } else if (fieldName === 'tags' && Array.isArray(fieldValue)) {
        // 保留原始标签格式
        updatedLines.push(`${indent}  ${fieldName}:`);
        
        // 查找原始标签缩进和格式
        const tagLines = currentChallengeText.split('\n').filter(line => line.trim().startsWith('-') && 
                                                              line.includes(currentChallengeText.match(new RegExp(`${indent}\\s+tags:`))?.[0] || ''));
        const tagFormatMatch = currentChallengeText.match(new RegExp(`${indent}\\s+tags:[^\\n]*\\n(\\s+)-(\\s*)\\w+`));
        const tagIndent = tagFormatMatch ? tagFormatMatch[1] : `${indent}  `;
        const hasSpace = tagFormatMatch ? tagFormatMatch[2].length > 0 : true;
        
        // 输出原始格式信息
        console.log('标签格式:', { tagIndent, hasSpace, tagFormatMatch });
        
        fieldValue.forEach(tag => {
          if (hasSpace) {
            updatedLines.push(`${tagIndent}- ${tag}`);
          } else {
            updatedLines.push(`${tagIndent}-${tag}`);
          }
        });
      } else if (fieldName === 'solutions' && Array.isArray(fieldValue)) {
        // 保留原始solutions格式
        if (fieldValue.length === 0) {
          const solutionsFormatMatch = currentChallengeText.match(/solutions:\s*\[\s*\]/);
          if (solutionsFormatMatch) {
            updatedLines.push(solutionsFormatMatch[0]);
          } else {
            updatedLines.push(`${indent}solutions: []`);
          }
        } else {
          updatedLines.push(`${indent}solutions:`);
          fieldValue.forEach(solution => {
            updatedLines.push(`${indent}  - ${solution}`);
          });
        }
      }
    });
    
    return updatedLines.join('\n');
  } catch (error: any) {
    throw new Error(`更新挑战时出错: ${error.message}`);
  }
}

/**
 * 格式化YAML值
 * @param value 要格式化的值
 * @returns 格式化后的YAML值
 */
function formatYamlValue(value: any): string {
  if (typeof value === 'string') {
    return value.replace(/"/g, '\\"');
  } else if (typeof value === 'number') {
    return value.toString();
  } else if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  } else if (typeof value === 'object' && value !== null) {
    return YAML.stringify(value, { indent: 2, lineWidth: -1 });
  } else {
    throw new Error('不支持的YAML值类型');
  }
}