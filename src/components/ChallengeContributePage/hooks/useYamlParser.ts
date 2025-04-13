import { ChallengeFormData } from '../types';

interface FieldRange {
  start: number;
  end: number;
  valueStart: number;
  valueEnd: number;
}

/**
 * YAML解析器钩子
 */
export const useYamlParser = () => {
  
  /**
   * 解析YAML内容，保留格式和注释
   */
  const updateYamlPreservingFormat = (
    values: ChallengeFormData, 
    currentDateTime: string
  ): string => {
    if (!values.rawYaml) {
      return '';
    }
    
    // 所需替换的字段和值的映射
    const fieldValueMap = {
      'id': values.id,
      'id-alias': values.idAlias,
      'platform': values.platform,
      'name': values.name,
      'name_en': values.nameEn,
      'difficulty-level': values.difficultyLevel,
      'description-markdown': values.description || values.descriptionMarkdown || '',
      'description-markdown_en': values.descriptionEn || values.descriptionMarkdownEn || '',
      'base64-url': values.base64Url,
      'is-expired': values.isExpired === undefined ? false : values.isExpired,
      'tags': values.tags || [],
      'solutions': (values.solutions || [])?.filter((s: any) => s.title && s.url).map((s: any) => ({
        title: s.title,
        url: s.url,
        ...(s.source ? {source: s.source} : {}),
        ...(s.author ? {author: s.author} : {})
      })),
      // 更新时间字段
      'create-time': values.createTime || currentDateTime,
      'update-time': currentDateTime
    };
    
    // 分析原始YAML文件结构
    const lines = values.rawYaml.split('\n');
    
    // 新的方法：创建行类型映射，标记每行是什么类型
    const lineTypes = lines.map((line: string) => {
      const trimmedLine = line.trim();
      if (trimmedLine === '') return 'empty';
      if (trimmedLine.startsWith('#')) return 'comment';
      if (trimmedLine.startsWith('-') && !trimmedLine.includes(':')) return 'list-item';
      
      // 检查是否是字段行（包含冒号）
      const fieldMatch = line.match(/^\s*([a-zA-Z0-9_-]+):/);
      if (fieldMatch) return `field:${fieldMatch[1]}`;
      
      // 如果是字段内容（缩进后的内容）
      return 'content';
    });
    
    // 定位所有字段及其范围
    const fieldRanges: Record<string, FieldRange> = {};
    const fieldIndents: Record<string, string> = {};
    let currentField: string | null = null;
    let inTags = false;
    let inSolutions = false;
    let tagIndent = '';
    let tagHasSpace = true;
    
    // 第一遍扫描：找出所有字段的位置和范围
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineType = lineTypes[i];
      
      // 如果是字段行，记录位置
      if (lineType.startsWith('field:')) {
        const fieldName = lineType.split(':')[1];
        const indentMatch = line.match(/^(\s*)/);
        const indent = indentMatch ? indentMatch[1] : '';
        
        fieldIndents[fieldName] = indent;
        
        // 如果之前有字段，记录其结束位置
        if (currentField) {
          if (!fieldRanges[currentField]) {
            fieldRanges[currentField] = { start: -1, end: -1, valueStart: -1, valueEnd: -1 };
          }
          fieldRanges[currentField].end = i - 1;
        }
        
        // 记录当前字段的开始位置
        currentField = fieldName;
        if (!fieldRanges[currentField]) {
          fieldRanges[currentField] = { start: i, end: -1, valueStart: -1, valueEnd: -1 };
        } else {
          fieldRanges[currentField].start = i;
        }
        
        // 找出值的开始位置
        const valueMatch = line.match(/^(\s*[a-zA-Z0-9_-]+:)(\s*)(.*)/);
        if (valueMatch && valueMatch[3]) {
          fieldRanges[currentField].valueStart = valueMatch[1].length + valueMatch[2].length;
          fieldRanges[currentField].valueEnd = line.length;
        }
        
        // 处理tags和solutions字段
        if (fieldName === 'tags') {
          inTags = true;
          inSolutions = false;
        } else if (fieldName === 'solutions') {
          inTags = false;
          inSolutions = true;
        } else {
          inTags = false;
          inSolutions = false;
        }
      }
      // 如果是tags字段的列表项，检查格式
      else if (inTags && lineType === 'list-item') {
        const tagLineMatch = line.match(/^(\s*)-/);
        if (tagLineMatch) {
          tagIndent = tagLineMatch[1];
          // 检测标签格式（是否有空格）
          const tagSpaceMatch = line.match(/^(\s*)-(\s+)/);
          tagHasSpace = !!tagSpaceMatch;
        }
      }
    }
    
    // 设置最后一个字段的结束位置
    if (currentField && fieldRanges[currentField]) {
      fieldRanges[currentField].end = lines.length - 1;
    }
    
    console.log('字段范围:', fieldRanges);
    console.log('字段缩进:', fieldIndents);
    
    // 创建修改后的行
    const modifiedLines = [...lines];
    
    // 处理基本字段（单行值）
    for (const [fieldName, value] of Object.entries(fieldValueMap)) {
      // 跳过复杂字段，单独处理
      if (
        fieldName === 'tags' || 
        fieldName === 'solutions' || 
        fieldName === 'description-markdown' || 
        fieldName === 'description-markdown_en'
      ) {
        continue;
      }
      
      // 特殊处理is-expired字段，确保它总是有值
      if (fieldName === 'is-expired' && (value === undefined || value === null)) {
        // 如果is-expired未定义，默认设为false
        (fieldValueMap as any)['is-expired'] = false;
      }
      
      if (fieldRanges[fieldName] && fieldRanges[fieldName].valueStart >= 0) {
        const lineIndex = fieldRanges[fieldName].start;
        const line = lines[lineIndex];
        const valueStart = fieldRanges[fieldName].valueStart;
        const valueEnd = fieldRanges[fieldName].valueEnd;
        
        // 仅替换值部分，保留行的其余部分
        modifiedLines[lineIndex] = line.substring(0, valueStart) + formatYamlValue(value) + line.substring(valueEnd);
      }
    }
    
    // 判断是否存在base64-url字段
    let hasBase64UrlField = false;
    let base64UrlLineIndex = -1;
    
    // 使用更严格的正则表达式检查base64-url字段
    for (let i = 0; i < modifiedLines.length; i++) {
      // 使用正则表达式查找格式为"base64-url:"的字段（可能有空格）
      if (/^\s*base64-url\s*:/.test(modifiedLines[i])) {
        hasBase64UrlField = true;
        base64UrlLineIndex = i;
        
        // 检查该字段是否有值
        const valueMatch = modifiedLines[i].match(/^\s*base64-url\s*:\s*(.*)$/);
        // 如果找到了匹配但值为空或只有空格，则更新它
        if (!valueMatch || !valueMatch[1] || !valueMatch[1].trim()) {
          console.log('发现base64-url字段，但值为空，更新它');
          // 提取开头部分（包括冒号和空格）
          const prefixMatch = modifiedLines[i].match(/^(\s*base64-url\s*:\s*)/);
          if (prefixMatch && prefixMatch[1]) {
            // 替换为相同的前缀但添加值
            modifiedLines[i] = prefixMatch[1] + values.base64Url;
          } else {
            // 如果无法提取前缀，使用一个合理的默认值
            modifiedLines[i] = `base64-url: ${values.base64Url}`;
          }
        }
        break;
      }
    }

    // 如果YAML中不存在base64-url字段，则添加它
    if (!hasBase64UrlField && values.base64Url) {
      console.log('在YAML中添加缺失的base64-url字段');
      // 找一个合适的位置添加，优先选择在description-markdown字段之后
      let insertPosition = modifiedLines.length - 1;
      
      // 寻找description-markdown字段作为插入点
      if (fieldRanges['description-markdown']) {
        insertPosition = fieldRanges['description-markdown'].end + 1;
        console.log(`根据字段范围，找到description-markdown字段结束位置: ${insertPosition}`);
      } else {
        // 如果找不到字段范围，尝试找到包含description-markdown的行
        for (let i = 0; i < modifiedLines.length; i++) {
          if (modifiedLines[i].includes('description-markdown:')) {
            insertPosition = i + 1;
            // 跳过多行内容
            while (insertPosition < modifiedLines.length && 
                  (modifiedLines[insertPosition].trim() === '' || 
                   modifiedLines[insertPosition].startsWith(' ') || 
                   modifiedLines[insertPosition].startsWith('\t'))) {
              insertPosition++;
            }
            console.log(`根据行内容查找，找到description-markdown字段后的插入位置: ${insertPosition}`);
            break;
          }
        }
      }
      
      // 获取正确的缩进格式
      let commonIndent = '';
      if (Object.keys(fieldIndents).length > 0) {
        // 优先使用和其他字段相同的缩进
        Object.values(fieldIndents).forEach(indent => {
          if (indent && (!commonIndent || indent.length <= commonIndent.length)) {
            commonIndent = indent;
          }
        });
      } else {
        // 如果没有找到任何字段缩进，使用默认缩进
        commonIndent = '';
      }
      
      console.log(`使用缩进格式:'${commonIndent}'，长度:${commonIndent.length}`);
      
      // 添加base64-url字段，确保使用正确的缩进
      modifiedLines.splice(insertPosition, 0, `${commonIndent}base64-url: ${values.base64Url}`);
      console.log(`已在位置 ${insertPosition} 添加base64-url字段`);
    } else if (hasBase64UrlField && base64UrlLineIndex >= 0 && values.base64Url) {
      // 如果字段存在但我们需要更新其值（例如值发生了变化）
      const currentLine = modifiedLines[base64UrlLineIndex];
      const valueMatch = currentLine.match(/^(\s*base64-url\s*:\s*)(.*)$/);
      if (valueMatch) {
        const prefix = valueMatch[1];
        const currentValue = valueMatch[2];
        
        // 只有当值不同时才更新
        if (currentValue !== values.base64Url) {
          console.log(`更新base64-url字段，从 '${currentValue}' 到 '${values.base64Url}'`);
          modifiedLines[base64UrlLineIndex] = prefix + values.base64Url;
        }
      }
    }
    
    // 合并所有行并返回
    return modifiedLines.join('\n');
  };

  /**
   * 格式化不同类型的值为YAML兼容的格式
   */
  const formatYamlValue = (value: any): string => {
    if (value === null || value === undefined) {
      return 'null';
    }
    
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    
    if (typeof value === 'string') {
      // 如果字符串是空的，返回空引号
      if (value === '') {
        return '""';
      }
      
      // 如果字符串是多行的
      if (value.includes('\n')) {
        // 使用YAML多行语法（|）
        return '|\n    ' + value.split('\n').join('\n    ');
      }
      
      // 如果字符串包含特殊字符
      if (value.includes(':') || value.includes('#') || 
          value.includes('{') || value.includes('}') || 
          value.includes('[') || value.includes(']') ||
          value.includes('*') || value.includes('&')) {
        // 用引号括起来并转义内部引号
        return `"${value.replace(/"/g, '\\"')}"`;
      }
      
      return value;
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return '[]';
      }
    }
    
    return String(value);
  };
  
  return {
    updateYamlPreservingFormat,
    formatYamlValue
  };
}; 