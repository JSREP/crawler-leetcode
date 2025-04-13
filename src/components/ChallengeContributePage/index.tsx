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
        'is-expired': values.isExpired === undefined ? false : values.isExpired,
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
    
    console.log('使用全新方法处理YAML，保留所有格式和注释');

    // 完全保留原始结构，只替换字段值
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
      }))
    };
    
    // 分析原始YAML文件结构，但保留完整内容
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
    const fieldRanges = {};
    const fieldIndents = {};
    let currentField = null;
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
          fieldRanges[currentField as string].end = i - 1;
        }
        
        // 记录当前字段的开始位置
        currentField = fieldName;
        if (!fieldRanges[currentField]) {
          fieldRanges[currentField] = { start: i, end: -1, valueStart: -1, valueEnd: -1 };
        } else {
          fieldRanges[currentField as string].start = i;
        }
        
        // 找出值的开始位置
        const valueMatch = line.match(/^(\s*[a-zA-Z0-9_-]+:)(\s*)(.*)/);
        if (valueMatch && valueMatch[3]) {
          fieldRanges[currentField as string].valueStart = valueMatch[1].length + valueMatch[2].length;
          fieldRanges[currentField as string].valueEnd = line.length;
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
      fieldRanges[currentField as string].end = lines.length - 1;
    }
    
    console.log('字段范围:', fieldRanges);
    console.log('字段缩进:', fieldIndents);
    console.log('标签格式有空格:', tagHasSpace);
    
    // 创建修改后的行
    const modifiedLines = [...lines];
    
    // 处理简单字段（单行值）
    for (const [fieldName, value] of Object.entries(fieldValueMap)) {
      if (fieldName === 'tags' || fieldName === 'solutions' || fieldName === 'description-markdown') {
        continue; // 这些复杂字段单独处理
      }
      
      // 特殊处理is-expired字段，确保它总是有值
      if (fieldName === 'is-expired' && (value === undefined || value === null)) {
        // 如果is-expired未定义，默认设为false
        fieldValueMap['is-expired'] = false;
      }
      
      if (fieldRanges[fieldName] && fieldRanges[fieldName].valueStart >= 0) {
        const lineIndex = fieldRanges[fieldName].start;
        const line = lines[lineIndex];
        const valueStart = fieldRanges[fieldName].valueStart;
        const valueEnd = fieldRanges[fieldName].valueEnd;
        
        // 仅替换值部分，保留行的其余部分
        modifiedLines[lineIndex] = line.substring(0, valueStart) + value + line.substring(valueEnd);
      }
    }
    
    // 处理description-markdown字段（多行）
    if (fieldValueMap['description-markdown'] && fieldRanges['description-markdown']) {
      const fieldRange = fieldRanges['description-markdown'];
      const startLine = fieldRange.start;
      const indent = fieldIndents['description-markdown'] || '';
      
      // 获取最新的描述内容（确保使用最新表单值）
      const descriptionValue = form.getFieldValue('description') || form.getFieldValue('descriptionMarkdown') || '';
      
      // 检查原始格式是否使用竖线(|)
      if (lines[startLine].includes('|')) {
        // 先保留description-markdown: | 行
        modifiedLines[startLine] = lines[startLine];
        
        // 找出描述内容的起始和结束位置
        let contentStart = startLine + 1;
        let contentEnd = -1;
        
        for (let i = contentStart; i <= fieldRange.end; i++) {
          const lineType = lineTypes[i];
          if (lineType.startsWith('field:')) {
            contentEnd = i - 1;
            break;
          }
          if (i === fieldRange.end) {
            contentEnd = i;
          }
        }
        
        if (contentEnd >= contentStart) {
          // 替换描述内容
          const descLines = descriptionValue.split('\n');
          const contentIndent = indent + '  ';
          
          // 删除现有内容行
          modifiedLines.splice(contentStart, contentEnd - contentStart + 1);
          
          // 插入新的内容行
          for (let i = 0; i < descLines.length; i++) {
            modifiedLines.splice(contentStart + i, 0, `${contentIndent}${descLines[i]}`);
          }
        }
      } else {
        // 单行描述，直接替换
        modifiedLines[startLine] = `${indent}description-markdown: "${descriptionValue.replace(/"/g, '\\"')}"`;
      }
    }
    
    // 处理tags字段
    if (fieldValueMap.tags && fieldRanges.tags) {
      const fieldRange = fieldRanges.tags;
      const tags = fieldValueMap.tags;
      const indent = fieldIndents.tags;
      
      // 找出tags内容的起始和结束位置
      let contentStart = fieldRange.start + 1;
      let contentEnd = -1;
      
      for (let i = contentStart; i <= fieldRange.end; i++) {
        const lineType = lineTypes[i];
        if (lineType.startsWith('field:')) {
          contentEnd = i - 1;
          break;
        }
        if (i === fieldRange.end) {
          contentEnd = i;
        }
      }
      
      if (contentEnd >= contentStart) {
        // 检查是否有非列表项行（如注释）
        const nonListLines = [];
        for (let i = contentStart; i <= contentEnd; i++) {
          if (lineTypes[i] !== 'list-item') {
            nonListLines.push({index: i, line: lines[i]});
          }
        }
        
        // 保留非列表项行（如注释）
        if (nonListLines.length > 0) {
          // 开发这部分逻辑很复杂，暂时保留现有非标签行
          console.log('tags中存在非列表项行，保留它们');
        } else {
          // 没有非列表项行，直接替换所有标签
          // 删除现有标签行
          modifiedLines.splice(contentStart, contentEnd - contentStart + 1);
          
          // 添加新标签行
          tags.forEach((tag, index) => {
            const tagLine = tagHasSpace 
              ? `${tagIndent}- ${tag}` 
              : `${tagIndent}-${tag}`;
            modifiedLines.splice(contentStart + index, 0, tagLine);
          });
        }
      }
    }
    
    // 处理solutions字段 - 与tags类似但需要特殊处理
    if (fieldValueMap.solutions && fieldRanges.solutions) {
      // 类似处理...
    }
    
    // 如果找不到fields，保持原样
    
    // 合并修改后的行
    const resultYaml = modifiedLines.join('\n');
    console.log('成功修改YAML，保留了原始格式和所有注释');
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
        isExpired: challengeData['is-expired'] === true || false,
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