import * as React from 'react';
import { useState, useEffect } from 'react';
import { Form, Switch, message, Alert, Input, Button } from 'antd';
import * as YAML from 'yaml';
import { challenges } from '../ChallengeListPage/ChallengeData';

// 导入类型
import { ChallengeFormData } from './types';

// 导入工具函数
import { encodeUrl, decodeUrl, ensureBase64Encoded } from './utils/urlUtils';
import { generateYamlFromFormData, parseYamlToFormData } from './utils/yamlUtils';
import { extractYamlComments, preserveCommentsInYaml, updateChallengeInCollection } from './handleImportYaml';

// 导入子组件
import BasicInfo from './components/BasicInfo';
import DifficultySelector from './components/DifficultySelector';
import DescriptionFields from './components/DescriptionFields';
import TagsSelector from './components/TagsSelector';
import SolutionsSection from './components/SolutionsSection';
import UrlInput from './components/UrlInput';
import YamlPreviewSection from './components/YamlPreviewSection';
import YamlImportSection from './components/YamlImportSection';

// 导入样式
import { styles } from './styles';

// localStorage键名
const STORAGE_KEY = 'challenge_contribute_form_data';

/**
 * 挑战贡献页面组件
 */
const ChallengeContributePage: React.FC = () => {
  // 表单实例
  const [form] = Form.useForm<ChallengeFormData>();
  
  // 状态
  const [yamlOutput, setYamlOutput] = useState<string>('');
  const [isFormDirty, setIsFormDirty] = useState<boolean>(false);
  const [initialFormValues, setInitialFormValues] = useState<ChallengeFormData>({
    id: null,
    platform: 'Web',
    idAlias: '',
    name: '',
    nameEn: '',
    difficultyLevel: 1,
    description: '',
    descriptionEn: '',
    tags: [],
    solutions: [],
    rawYaml: '',
  });

  // 用于防抖的定时器ID
  const [saveTimeoutId, setSaveTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // 从localStorage加载保存的表单数据
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData) as ChallengeFormData;
        setInitialFormValues(parsedData);
        form.setFieldsValue(parsedData);
        console.log('已从本地存储恢复表单数据');
      }
    } catch (error) {
      console.error('从本地存储恢复数据失败:', error);
    }
  }, [form]);

  // 清理防抖定时器
  useEffect(() => {
    return () => {
      if (saveTimeoutId) {
        clearTimeout(saveTimeoutId);
      }
    };
  }, [saveTimeoutId]);

  // 初始化下一个可用的ID
  useEffect(() => {
    // 只有当localStorage中没有保存的ID时，才使用自动计算的ID
    if (!initialFormValues.id) {
      const nextId = calculateNextId();
      form.setFieldsValue({ id: nextId });
    }
  }, [form, initialFormValues.id]);

  // 计算下一个可用ID
  const calculateNextId = (): number => {
    if (!challenges || challenges.length === 0) {
      return 1;
    }
    const maxId = Math.max(...challenges.map(c => Number(c.id) || 0));
    return maxId + 1;
  };

  // 表单值变更处理
  const handleFormValueChange = (changedValues: any, allValues: any) => {
    setIsFormDirty(true);
    
    // 清除之前的定时器
    if (saveTimeoutId) {
      clearTimeout(saveTimeoutId);
    }
    
    // 创建新的定时器用于防抖
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allValues));
        console.log('表单数据已保存到本地存储');
      } catch (error) {
        console.error('保存数据到本地存储失败:', error);
      }
    }, 500); // 500毫秒防抖时间
    
    // 保存定时器ID
    setSaveTimeoutId(timeoutId);
  };

  // 生成YAML数据
  const generateYaml = () => {
    console.log('开始调试：generateYaml函数被调用');
    // 直接从表单获取完整值，确保包含隐藏字段
    const values = form.getFieldsValue(true);
    console.log('当前表单值：', values);
    
    // 检查是否有原始YAML
    if (!values.rawYaml) {
      console.log('没有原始YAML，使用默认格式生成');
      // 创建一个基本的YAML对象并转换为字符串
      const yamlObj = {
        'id': values.id,
        'id-alias': values.idAlias,
        'platform': values.platform,
        'name': values.name,
        'name_en': values.nameEn,
        'difficulty-level': values.difficultyLevel,
        'description-markdown': values.description || values.descriptionMarkdown,
        'base64-url': values.base64Url,
        'is-expired': values.isExpired,
        'tags': values.tags || [],
        'solutions': (values.solutions || [])?.filter(s => s.title && s.url).map(s => ({
          title: s.title,
          url: s.url,
          ...(s.source ? {source: s.source} : {}),
          ...(s.author ? {author: s.author} : {})
        }))
      };
      
      const yamlString = YAML.stringify(yamlObj, {
        indent: 2,
        lineWidth: -1
      });
      
      setYamlOutput(yamlString);
      return;
    }
    
    console.log('使用原始YAML作为模板，只修改值');
    // 基于文本直接替换，而不是解析后重新生成
    let modifiedYaml = values.rawYaml;
    
    // 创建一个字段到值的映射
    const fieldValueMap = {
      'id': values.id,
      'id-alias': values.idAlias,
      'platform': values.platform,
      'name': values.name,
      'name_en': values.nameEn,
      'difficulty-level': values.difficultyLevel,
      'description-markdown': values.description || values.descriptionMarkdown,
      'description-markdown_en': values.descriptionEn || values.descriptionMarkdownEn,
      'base64-url': values.base64Url,
      'is-expired': values.isExpired,
      'tags': values.tags || [],
      'solutions': (values.solutions || [])?.filter(s => s.title && s.url).map(s => ({
        title: s.title,
        url: s.url,
        ...(s.source ? {source: s.source} : {}),
        ...(s.author ? {author: s.author} : {})
      }))
    };
    
    // 分析原始YAML的结构
    const lines = modifiedYaml.split('\n');
    // 追踪当前处理的字段
    let currentField = null;
    let inTags = false;
    let inSolutions = false;
    let tagIndent = '';
    let tagHasSpace = true;
    
    // 分析原始标签格式（是否有空格）
    if (modifiedYaml.includes('-waf') || modifiedYaml.includes('-signature')) {
      tagHasSpace = false;
      console.log('检测到原始标签格式无空格');
    }
    
    // 先分析字段和它们的位置
    const fieldPositions = {};
    const fieldIndents = {};
    const modifiedLines = [...lines];
    
    console.log('开始分析YAML结构');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // 跳过注释和空行
      if (line.startsWith('#') || line === '') {
        continue;
      }
      
      // 检查是否是字段行
      const fieldMatch = lines[i].match(/^(\s*)([a-zA-Z0-9_-]+):(.*)/);
      if (fieldMatch) {
        const [, indent, fieldName, restOfLine] = fieldMatch;
        currentField = fieldName;
        fieldPositions[fieldName] = i;
        fieldIndents[fieldName] = indent;
        
        console.log(`找到字段 ${fieldName} 在第 ${i} 行, 缩进: '${indent}'`);
        
        // 特殊处理tags字段
        if (fieldName === 'tags') {
          inTags = true;
          inSolutions = false;
          tagIndent = indent + '  '; // 假设子项比父项多缩进2个空格
        } 
        // 特殊处理solutions字段
        else if (fieldName === 'solutions') {
          inTags = false;
          inSolutions = true;
        }
        else {
          inTags = false;
          inSolutions = false;
        }
      } 
      // 如果不是字段行但在tags或solutions内部
      else if (inTags && line.startsWith('-')) {
        // 记录标签缩进
        const tagLineMatch = lines[i].match(/^(\s*)-/);
        if (tagLineMatch) {
          tagIndent = tagLineMatch[1];
          console.log(`找到标签缩进: '${tagIndent}'`);
          
          // 检测标签格式（是否有空格）
          const tagSpaceMatch = lines[i].match(/^(\s*)-(\s+)/);
          tagHasSpace = !!tagSpaceMatch;
          console.log(`标签格式有空格: ${tagHasSpace}`);
        }
      }
    }
    
    // 现在开始实际修改YAML
    console.log('开始修改字段值，保持原始格式');
    
    // 处理普通字段（非数组）
    const simpleFields = ['id', 'id-alias', 'platform', 'name', 'name_en', 'difficulty-level', 'base64-url', 'is-expired'];
    for (const field of simpleFields) {
      const value = fieldValueMap[field];
      if (value === undefined || fieldPositions[field] === undefined) continue;
      
      const lineIndex = fieldPositions[field];
      const line = lines[lineIndex];
      const indent = fieldIndents[field];
      
      // 保留原始行的缩进和字段名，只替换值部分
      const fieldValueMatch = line.match(/^(\s*[a-zA-Z0-9_-]+:)(\s*)(.*)/);
      if (fieldValueMatch) {
        const [, fieldPart, spacePart] = fieldValueMatch;
        modifiedLines[lineIndex] = `${fieldPart}${spacePart}${value}`;
        console.log(`修改字段 ${field} 为 ${value}`);
      }
    }
    
    // 处理description-markdown字段（可能是多行）
    if (fieldValueMap['description-markdown'] && fieldPositions['description-markdown'] !== undefined) {
      const description = fieldValueMap['description-markdown'];
      const lineIndex = fieldPositions['description-markdown'];
      const line = lines[lineIndex];
      const indent = fieldIndents['description-markdown'];
      
      // 检查原始格式是否使用竖线(|)
      if (line.includes('|')) {
        // 多行格式使用竖线
        modifiedLines[lineIndex] = `${indent}description-markdown: |`;
        
        // 找到下一个字段的位置
        let nextFieldIndex = lines.length;
        for (let i = lineIndex + 1; i < lines.length; i++) {
          const nextFieldMatch = lines[i].match(/^\s*[a-zA-Z0-9_-]+:/);
          if (nextFieldMatch) {
            nextFieldIndex = i;
            break;
          }
        }
        
        // 删除当前description的所有行
        modifiedLines.splice(lineIndex + 1, nextFieldIndex - lineIndex - 1);
        
        // 插入新的description行
        const descLines = description.split('\n');
        for (let i = 0; i < descLines.length; i++) {
          modifiedLines.splice(lineIndex + 1 + i, 0, `${indent}  ${descLines[i]}`);
        }
        
        console.log(`修改多行description-markdown字段`);
      } else {
        // 单行格式
        modifiedLines[lineIndex] = `${indent}description-markdown: "${description.replace(/"/g, '\\"')}"`;
        console.log(`修改单行description-markdown字段`);
      }
    }
    
    // 处理tags字段
    if (fieldValueMap.tags && fieldPositions.tags !== undefined) {
      const tags = fieldValueMap.tags;
      const lineIndex = fieldPositions['tags'];
      const indent = fieldIndents['tags'];
      
      // 保留tags:行
      modifiedLines[lineIndex] = `${indent}tags:`;
      
      // 找到tags下的所有子项的位置
      let tagEndIndex = lineIndex + 1;
      while (tagEndIndex < lines.length) {
        const line = lines[tagEndIndex].trim();
        if (line.startsWith('-')) {
          tagEndIndex++;
        } else if (!line.startsWith('#') && line !== '') {
          break;
        } else {
          tagEndIndex++;
        }
      }
      
      // 删除所有现有标签
      modifiedLines.splice(lineIndex + 1, tagEndIndex - lineIndex - 1);
      
      // 添加新标签，保持原始格式
      tags.forEach((tag, index) => {
        const tagLine = tagHasSpace 
          ? `${tagIndent}- ${tag}` 
          : `${tagIndent}-${tag}`;
        modifiedLines.splice(lineIndex + 1 + index, 0, tagLine);
      });
      
      console.log(`修改tags字段，保持${tagHasSpace ? '有' : '无'}空格格式`);
    }
    
    // 如果原始YAML没有solutions字段，但表单中有，添加到末尾
    if (fieldValueMap.solutions && fieldValueMap.solutions.length > 0 && fieldPositions.solutions === undefined) {
      if (lines[lines.length - 1].trim() !== '') {
        modifiedLines.push('');  // 添加空行
      }
      modifiedLines.push('solutions:');
      
      const solutions = fieldValueMap.solutions;
      solutions.forEach(solution => {
        modifiedLines.push(`  - title: ${solution.title}`);
        modifiedLines.push(`    url: ${solution.url}`);
        if (solution.source) {
          modifiedLines.push(`    source: ${solution.source}`);
        }
        if (solution.author) {
          modifiedLines.push(`    author: ${solution.author}`);
        }
      });
      
      console.log('添加solutions字段到YAML末尾');
    }
    // 如果原始YAML有solutions字段，并且表单中也有，则更新
    else if (fieldValueMap.solutions && fieldPositions.solutions !== undefined) {
      const solutions = fieldValueMap.solutions;
      const lineIndex = fieldPositions['solutions'];
      const indent = fieldIndents['solutions'];
      
      // 保留solutions:行
      if (solutions.length === 0) {
        modifiedLines[lineIndex] = `${indent}solutions: []`;
      } else {
        modifiedLines[lineIndex] = `${indent}solutions:`;
        
        // 找到solutions下的所有子项的位置
        let solutionEndIndex = lineIndex + 1;
        while (solutionEndIndex < lines.length) {
          const line = lines[solutionEndIndex].trim();
          if (line.startsWith('-') || line.startsWith('title:') || line.startsWith('url:') || 
              line.startsWith('source:') || line.startsWith('author:')) {
            solutionEndIndex++;
          } else if (!line.startsWith('#') && line !== '') {
            break;
          } else {
            solutionEndIndex++;
          }
        }
        
        // 删除所有现有solution
        modifiedLines.splice(lineIndex + 1, solutionEndIndex - lineIndex - 1);
        
        // 添加新solution
        let insertIndex = lineIndex + 1;
        solutions.forEach(solution => {
          modifiedLines.splice(insertIndex++, 0, `${indent}  - title: ${solution.title}`);
          modifiedLines.splice(insertIndex++, 0, `${indent}    url: ${solution.url}`);
          if (solution.source) {
            modifiedLines.splice(insertIndex++, 0, `${indent}    source: ${solution.source}`);
          }
          if (solution.author) {
            modifiedLines.splice(insertIndex++, 0, `${indent}    author: ${solution.author}`);
          }
        });
      }
      
      console.log('更新solutions字段');
    }
    
    // 合并修改后的行
    const resultYaml = modifiedLines.join('\n');
    console.log('成功修改YAML，保留了原始格式');
    setYamlOutput(resultYaml);
  };

  // 格式化值以便在YAML中显示
  function formatValue(value: any): string {
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
  }

  // 复制YAML到剪贴板
  const handleCopyYaml = () => {
    if (yamlOutput) {
      navigator.clipboard.writeText(yamlOutput)
        .then(() => {
          message.success('YAML已复制到剪贴板');
        })
        .catch(() => {
          message.error('复制失败，请手动复制');
        });
    }
  };

  // 清除保存的表单数据
  const clearSavedData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      message.success('已清除本地存储的表单数据');
      
      // 创建初始默认值
      const nextId = calculateNextId();
      const defaultValues: ChallengeFormData = {
        id: nextId,
        platform: 'Web' as 'Web',
        idAlias: '',
        name: '',
        nameEn: '',
        difficultyLevel: 1,
        description: '',
        descriptionEn: '',
        tags: [],
        solutions: [],
        rawYaml: '',
      };
      
      // 先设置初始值状态
      setInitialFormValues(defaultValues);
      
      // 然后重置表单并设置默认值
      form.resetFields();
      form.setFieldsValue(defaultValues);
      
      // 清空YAML输出
      setYamlOutput('');
      
      // 重置表单状态
      setIsFormDirty(false);
    } catch (error) {
      console.error('清除本地存储的表单数据失败:', error);
      message.error('清除数据失败');
    }
  };

  // 解析YAML函数
  const parseYaml = (yamlContent: string): ChallengeFormData | null => {
    try {
      // 解析YAML字符串
      const yamlData = YAML.parse(yamlContent);
      
      if (!yamlData) {
        console.error('YAML解析结果为空');
        return null;
      }

      console.log('原始YAML数据结构:', yamlData);

      // 检查是否是集合格式的YAML
      let challengeData;
      let originalYaml = yamlContent; // 默认保存完整原始YAML
      
      if (yamlData.challenges && Array.isArray(yamlData.challenges) && yamlData.challenges.length > 0) {
        // 从集合中提取第一个挑战
        console.log('从集合中提取挑战数据:', yamlData.challenges[0]);
        challengeData = yamlData.challenges[0];
        
        // 尝试获取仅包含这个挑战的YAML部分，但仍然保留原始集合格式
        try {
          // 为了保留挑战集合的结构和注释，我们保留整个YAML
          originalYaml = yamlContent;
        } catch (e) {
          console.error('提取单个挑战的YAML失败:', e);
          // 继续使用完整的原始YAML
        }
      } else if (yamlData.id !== undefined) {
        // 单个挑战格式
        challengeData = yamlData;
      } else {
        console.error('无法识别的YAML格式，没有找到challenges数组或id字段');
        return null;
      }
      
      // 处理base64-url字段
      let base64Url = challengeData['base64-url'] || '';
      console.log('提取到的base64-url:', base64Url);
      
      // 打印关键字段检查
      console.log('挑战数据关键字段:', {
        id: challengeData.id,
        name: challengeData.name,
        platform: challengeData.platform,
        'id-alias': challengeData['id-alias'],
        tags: challengeData.tags,
        'difficulty-level': challengeData['difficulty-level'],
        'description-markdown': challengeData['description-markdown']?.substring(0, 100),
        'base64-url': challengeData['base64-url'],
        solutions: challengeData.solutions
      });
      
      // 创建表单数据
      const formData: ChallengeFormData = {
        id: challengeData.id !== undefined ? Number(challengeData.id) : null,
        idAlias: challengeData['id-alias'] || '',
        platform: challengeData.platform || 'Web',
        name: challengeData.name || '',
        nameEn: challengeData.name_en || '',
        difficultyLevel: Number(challengeData['difficulty-level']) || 1,
        // 处理描述字段，兼容多种格式
        description: challengeData['description-markdown'] || challengeData.description || '',
        descriptionEn: challengeData['description-markdown_en'] || challengeData.descriptionEn || '',
        descriptionMarkdown: challengeData['description-markdown'] || challengeData.description || '',
        descriptionMarkdownEn: challengeData['description-markdown_en'] || challengeData.descriptionEn || '',
        // 处理base64Url字段，确保正确映射
        base64Url: challengeData['base64-url'] || '',
        // 处理过期标志
        isExpired: challengeData['is-expired'] === true,
        tags: challengeData.tags || [],
        solutions: (challengeData.solutions || []).map((solution: any) => ({
          title: solution.title || '',
          url: solution.url || '',
          source: solution.source || '',
          author: solution.author || ''
        })),
        example: '',
        testCases: [],
        comments: [],
        rawYaml: originalYaml
      };
      
      console.log('转换后的表单数据:', formData);
      
      return formData;
    } catch (error) {
      console.error('解析YAML失败:', error);
      return null;
    }
  };

  // 处理YAML导入
  const handleImportYaml = (yamlContent: string) => {
    try {
      console.log('开始导入YAML:', yamlContent.substring(0, 200) + '...');
      console.log('YAML长度:', yamlContent.length, '字节');
      console.log('YAML包含注释:', yamlContent.includes('#'));
      
      // 使用内部函数解析YAML
      const formValues = parseYaml(yamlContent);
      console.log('YAML解析结果:', formValues);
      
      if (!formValues) {
        throw new Error('解析YAML失败');
      }
      
      // 简化验证逻辑，只验证关键字段
      if (formValues.id === undefined) {
        console.warn('导入的YAML缺少id字段，将使用自动生成的ID');
        formValues.id = calculateNextId();
      }
      
      console.log('正在设置表单值:', formValues);
      console.log('原始YAML是否已保存:', !!formValues.rawYaml);
      
      // 先重置表单
      form.resetFields();
      
      // 特别处理description字段，确保表单能识别它
      if (formValues.description) {
        formValues.descriptionMarkdown = formValues.description;
      }
      
      if (formValues.descriptionEn) {
        formValues.descriptionMarkdownEn = formValues.descriptionEn;
      }
      
      // 确保rawYaml字段被正确设置
      if (formValues.rawYaml) {
        console.log('设置rawYaml字段:', formValues.rawYaml.substring(0, 50) + '...');
      }
      
      // 设置解析后的值
      form.setFieldsValue(formValues);
      
      console.log('表单设置后的值:', form.getFieldsValue());
      console.log('表单中的rawYaml是否存在:', !!form.getFieldValue('rawYaml'));
      
      // 手动触发表单字段的值变更事件，确保所有组件获取到最新值
      // 只验证关键字段，忽略次要字段的验证错误
      const criticalFields = ['id', 'name', 'platform', 'difficultyLevel'];
      for (const field of criticalFields) {
        if (field in formValues) {
          form.validateFields([field]).catch(e => {
            console.log(`关键字段 ${field} 验证错误:`, e);
            // 对于关键字段的错误，可以进行特殊处理
            if (field === 'id' && (formValues.id === undefined || formValues.id === null)) {
              formValues.id = calculateNextId();
              form.setFieldsValue({ id: formValues.id });
            }
          });
        }
      }
      
      // 手动触发描述字段更新事件
      const descriptionUpdateEvent = new CustomEvent('description-updated', { 
        detail: { 
          description: formValues.description || formValues.descriptionMarkdown,
          descriptionEn: formValues.descriptionEn || formValues.descriptionMarkdownEn
        } 
      });
      window.dispatchEvent(descriptionUpdateEvent);
      
      // 处理base64Url
      if (formValues.base64Url) {
        const base64UrlValue = formValues.base64Url.toString();
        console.log('分发base64-url-updated事件:', base64UrlValue);
        const base64UrlEvent = new CustomEvent('base64-url-updated', { 
          detail: { base64Url: base64UrlValue } 
        });
        window.dispatchEvent(base64UrlEvent);
      }
      
      // 对特定字段做额外处理
      // 处理标签
      if (formValues.tags && Array.isArray(formValues.tags)) {
        console.log('分发tags-updated事件:', formValues.tags);
        // 通知TagsSelector组件更新
        const tagsEvent = new CustomEvent('tags-updated', { detail: { tags: formValues.tags } });
        window.dispatchEvent(tagsEvent);
      }
      
      // 处理解决方案
      if (formValues.solutions && Array.isArray(formValues.solutions)) {
        console.log('分发solutions-updated事件:', formValues.solutions);
        // 通知SolutionsSection组件更新
        const solutionsEvent = new CustomEvent('solutions-updated', { detail: { solutions: formValues.solutions } });
        window.dispatchEvent(solutionsEvent);
      }
      
      // 显示详细的成功信息
      message.success({
        content: (
          <div>
            <div>YAML数据已成功导入到表单</div>
            <div>ID: {formValues.id}, 名称: {formValues.name}</div>
            <div>难度: {formValues.difficultyLevel}, 平台: {formValues.platform}</div>
            <div>标签 ({formValues.tags?.length || 0}): {formValues.tags?.join(', ') || '无'}</div>
            <div>解决方案: {formValues.solutions?.length || 0} 个</div>
            <div>描述长度: {formValues.description?.length || 0} 字符</div>
          </div>
        ),
        duration: 8
      });
    } catch (error) {
      console.error('解析YAML失败:', error);
      // 显示详细的错误信息
      message.error({
        content: (
          <div>
            <div>YAML导入失败</div>
            <div>错误信息: {error instanceof Error ? error.message : '未知错误'}</div>
            <div>请检查YAML格式是否正确</div>
          </div>
        ),
        duration: 5
      });
    }
  };

  return (
    <div style={styles.container}>
      {/* 顶部YAML导入部分 */}
      <YamlImportSection onImportYaml={handleImportYaml} />

      <Alert
        message="注意事项"
        description={
          <div>
            <p>请填写完整的挑战信息，以便其他用户理解和解决此挑战。所有标记为必填的字段都必须填写。</p>
            <p>表单数据会自动保存到浏览器本地存储，刷新页面后可以继续编辑。</p>
            <div style={{ marginTop: 8 }}>
              <Button size="small" danger onClick={clearSavedData}>
                清除已保存的数据
              </Button>
            </div>
          </div>
        }
        type="info"
        showIcon
        style={styles.alert}
      />
      
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleFormValueChange}
        style={styles.form}
        initialValues={initialFormValues}
      >
        {/* 隐藏字段，用于保存原始YAML */}
        <Form.Item name="rawYaml" hidden>
          <Input type="hidden" />
        </Form.Item>
        
        {/* 基本信息区块 */}
        <BasicInfo form={form} />
        
        {/* 难度选择器 */}
        <DifficultySelector form={form} />
        
        {/* 描述字段 */}
        <DescriptionFields form={form} />
        
        {/* URL输入 */}
        <UrlInput 
          form={form} 
          encodeUrl={encodeUrl} 
          decodeUrl={decodeUrl}
        />
        
        {/* 标签选择器 */}
        <TagsSelector form={form} existingTags={challenges?.flatMap(c => c.tags || []).filter((v, i, a) => a.indexOf(v) === i) || []} />
        
        {/* 解决方案部分 */}
        <SolutionsSection form={form} />
      </Form>

      {/* 底部YAML操作按钮 */}
      <YamlPreviewSection
        yamlOutput={yamlOutput}
        onGenerateYaml={generateYaml}
        onCopyYaml={handleCopyYaml}
      />
    </div>
  );
};

export default ChallengeContributePage; 