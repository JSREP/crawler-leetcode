/**
 * YAML 注释处理模块
 * 用于提取、保留和恢复 YAML 文件中的注释
 */

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
 * 提取单个挑战的字段注释
 * @param challengeText 挑战文本
 * @returns 字段与注释的映射
 */
export function extractChallengeFieldComments(challengeText: string): { [key: string]: string[] } {
  const lines = challengeText.split('\n');
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
  
  return challengeWithComments;
} 