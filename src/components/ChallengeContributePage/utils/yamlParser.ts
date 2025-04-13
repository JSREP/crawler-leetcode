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
  result += updatedContent;
  
  return result;
}

/**
 * 格式化YAML值，处理多行文本和特殊字符
 * @param value 要格式化的值
 * @returns 格式化后的字符串
 */
export function formatYamlValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  // 如果是字符串，需要处理多行文本和特殊字符
  if (typeof value === 'string') {
    // 检查是否包含换行符
    if (value.includes('\n')) {
      // 多行文本使用块样式（|）
      return `|\n  ${value.split('\n').join('\n  ')}`;
    }
    
    // 检查是否包含特殊字符，如引号、冒号等
    if (/[:"'{}\[\]#&*!|<>=%@`]/.test(value) || /^\s|\s$/.test(value)) {
      // 使用引号包裹包含特殊字符的字符串
      return `"${value.replace(/"/g, '\\"')}"`;
    }
  } else if (Array.isArray(value)) {
    // 数组格式化
    return value.map(item => formatYamlValue(item)).join(', ');
  } else if (typeof value === 'object') {
    // 对象格式化为YAML子块
    const formatted = Object.entries(value)
      .map(([k, v]) => `${k}: ${formatYamlValue(v)}`)
      .join('\n  ');
    return `{\n  ${formatted}\n}`;
  }
  
  // 其他类型直接转字符串
  return String(value);
} 