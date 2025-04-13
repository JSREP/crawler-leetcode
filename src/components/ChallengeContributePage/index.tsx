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
    console.log('原始YAML是否存在：', !!values.rawYaml);
    console.log('原始YAML长度：', values.rawYaml ? values.rawYaml.length : 0);
    
    if (values.rawYaml) {
      try {
        console.log('使用原始YAML作为模板生成新YAML，尝试直接替换字段值，保留所有注释');
        console.log('原始YAML前100个字符：', values.rawYaml.substring(0, 100));
        
        // 提取顶部注释（直接从文件开始到第一个非注释、非空白行）
        const topComments = [];
        const lines = values.rawYaml.split('\n');
        let contentStartLine = 0;
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line === '' || line.startsWith('#')) {
            topComments.push(lines[i]);
            contentStartLine = i + 1;
          } else {
            break;
          }
        }
        
        console.log('提取到的顶部注释：', topComments);
        console.log('内容开始行：', contentStartLine, '内容：', lines[contentStartLine]);
        
        // 将原始YAML作为起点
        let resultYaml = values.rawYaml;
        
        // 检查是否是集合格式YAML
        const isCollection = resultYaml.includes('challenges:') && 
            resultYaml.match(/\s+-\s+id:\s*\d+/);
        console.log('是否为集合格式YAML：', isCollection);
        
        if (isCollection) {
          // 提取挑战ID
          const challengeId = values.id ? parseInt(values.id.toString()) : null;
          console.log('当前编辑的挑战ID：', challengeId);
          
          try {
            console.log('尝试在集合中更新挑战');
            
            // 检查YAML解析结果，判断是否只有一个挑战
            const yamlData = YAML.parse(resultYaml);
            console.log('解析后的YAML数据：', yamlData);
            
            const isSingleChallenge = yamlData && yamlData.challenges && Array.isArray(yamlData.challenges) && yamlData.challenges.length === 1;
            console.log('是否为单挑战集合：', isSingleChallenge);
            console.log('集合中的challenges长度：', yamlData?.challenges?.length || 0);

            if (isSingleChallenge && challengeId === yamlData.challenges[0].id) {
              console.log('检测到只有一个挑战的集合文件，使用updateChallengeInCollection直接更新并保留所有注释');
              
              try {
                // 在调用updateChallengeInCollection前先分析原始YAML中的标签格式
                const tagFormatHasSpace = values.rawYaml.includes('- waf') || values.rawYaml.includes('- signature');
                console.log('标签格式是否有空格:', tagFormatHasSpace);
                
                // 处理标签格式
                let rawYaml = values.rawYaml;
                if (!tagFormatHasSpace) {
                  // 修改结果YAML为无空格的标签格式
                  console.log('准备将标签修改为无空格格式');
                  
                  // 直接使用updateChallengeInCollection函数，这个函数会保留所有注释
                  resultYaml = updateChallengeInCollection(
                    resultYaml,
                    challengeId,
                    {
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
                    }
                  );
                  
                  // 修复标签格式（将"- tag"替换为"-tag"）
                  resultYaml = resultYaml.replace(/(\n\s+)- (waf|signature-detection)/g, '$1-$2');
                  
                  console.log('标签空格修复后YAML前100个字符:', resultYaml.substring(0, 100));
                } else {
                  // 直接使用updateChallengeInCollection函数，这个函数会保留所有注释
                  resultYaml = updateChallengeInCollection(
                    resultYaml,
                    challengeId,
                    {
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
                    }
                  );
                }
                
                // 处理solutions字段
                // 如果原始YAML不包含solutions字段，就去掉生成的solutions字段
                if (!values.rawYaml.includes('solutions:')) {
                  console.log('原始YAML不包含solutions字段，删除生成的solutions字段');
                  const lines = resultYaml.split('\n');
                  const filteredLines = lines.filter(line => !line.includes('solutions:') && 
                                                          !line.includes('title:') && 
                                                          !line.includes('url:'));
                  resultYaml = filteredLines.join('\n');
                }
                
                console.log('成功更新单挑战集合并保留所有注释');
                console.log('更新后YAML前100个字符：', resultYaml.substring(0, 100));
                setYamlOutput(resultYaml);
                return;
              } catch (error) {
                console.error('更新YAML失败:', error);
                console.warn('回退到常规更新方式');
                
                // 直接使用updateChallengeInCollection函数，这个函数会保留所有注释
                resultYaml = updateChallengeInCollection(
                  resultYaml,
                  challengeId,
                  {
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
                  }
                );
                console.log('成功更新单挑战集合并保留所有注释');
                console.log('更新后YAML前100个字符：', resultYaml.substring(0, 100));
                setYamlOutput(resultYaml);
                return;
              }
            }
            
            // 如果不是单挑战或ID不匹配，使用常规方法更新
            resultYaml = updateChallengeInCollection(
              resultYaml,
              challengeId,
              {
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
              }
            );
            console.log('集合更新成功，保留了注释');
            setYamlOutput(resultYaml);
            return;
          } catch (error) {
            console.error('更新集合中的挑战失败:', error);
            console.warn('尝试单独处理挑战，放弃集合格式');
          }
        } else {
          console.log('处理普通的单挑战YAML');
          // 常规字段替换（对于非集合格式）
          const standardFields = [
            'id', 'id-alias', 'platform', 'name', 'name_en', 'difficulty-level',
            'description-markdown', 'description-markdown_en', 'base64-url', 'is-expired'
          ];
          
          for (const field of standardFields) {
            console.log(`尝试替换字段 ${field}`);
            let valueKey = field;
            
            // 将中划线字段名映射到驼峰式字段名
            if (field === 'id-alias') valueKey = 'idAlias';
            else if (field === 'difficulty-level') valueKey = 'difficultyLevel';
            else if (field === 'description-markdown') valueKey = 'description';
            else if (field === 'description-markdown_en') valueKey = 'descriptionEn';
            else if (field === 'base64-url') valueKey = 'base64Url';
            else if (field === 'is-expired') valueKey = 'isExpired';
            else if (field === 'name_en') valueKey = 'nameEn';
            
            // 获取对应的值
            const value = values[valueKey as keyof typeof values];
            console.log(`字段 ${field} 对应的值:`, value);
            
            if (value !== undefined) {
              // 匹配字段行及其可能的前导注释
              const fieldRegex = new RegExp(`(\\n?\\s*)(#[^\\n]*\\n)*(\\s*)${field}:\\s*[^\\n]*`, 'g');
              resultYaml = resultYaml.replace(
                fieldRegex,
                (match, beforeComment, comments, beforeField) => {
                  console.log(`找到字段匹配: ${match}`);
                  return `${beforeComment || ''}${comments || ''}${beforeField || ''}${field}: ${formatValue(value)}`;
                }
              );
            }
          }
          
          // 特殊处理tags字段
          if (values.tags) {
            console.log('处理tags字段:', values.tags);
            const tagsRegex = new RegExp(`(\\n?\\s*)(#[^\\n]*\\n)*(\\s*)tags:([^]*?)(\\n\\s*[a-zA-Z0-9_-]+:|$)`, 'g');
            resultYaml = resultYaml.replace(
              tagsRegex,
              (match, beforeComment, comments, beforeField, existingTags, after) => {
                console.log(`找到tags匹配: ${match}`);
                let tagsStr = `${beforeComment || ''}${comments || ''}${beforeField || ''}tags:`;
                
                if (!values.tags || values.tags.length === 0) {
                  tagsStr += ' []';
                } else {
                  // 保持原有缩进
                  const indentMatch = existingTags.match(/\n(\s+)/);
                  const indent = indentMatch ? indentMatch[1] : '  ';
                  
                  values.tags.forEach(tag => {
                    tagsStr += `\n${indent}- ${tag}`;
                  });
                }
                
                return tagsStr + after;
              }
            );
          }
          
          // 特殊处理solutions字段
          if (values.solutions && Array.isArray(values.solutions)) {
            console.log('处理solutions字段:', values.solutions);
            const solutionsRegex = new RegExp(`(\\n?\\s*)(#[^\\n]*\\n)*(\\s*)solutions:([^]*?)(\\n\\s*[a-zA-Z0-9_-]+:|$)`, 'g');
            resultYaml = resultYaml.replace(
              solutionsRegex,
              (match, beforeComment, comments, beforeField, existingSolutions, after) => {
                console.log(`找到solutions匹配: ${match}`);
                let solutionsStr = `${beforeComment || ''}${comments || ''}${beforeField || ''}solutions:`;
                
                if (!values.solutions || values.solutions.length === 0) {
                  solutionsStr += ' []';
                } else {
                  const solutionsList = values.solutions || [];
                  solutionsList.forEach(solution => {
                    if (solution.title && solution.url) {
                      solutionsStr += `\n  - title: ${solution.title}`;
                      solutionsStr += `\n    url: ${solution.url}`;
                      if (solution.source) {
                        solutionsStr += `\n    source: ${solution.source}`;
                      }
                      if (solution.author) {
                        solutionsStr += `\n    author: ${solution.author}`;
                      }
                    }
                  });
                }
                
                return solutionsStr + after;
              }
            );
          }
          
          // 更新时间戳
          const updateTimeRegex = new RegExp(`(\\n?\\s*)(#[^\\n]*\\n)*(\\s*)update-time:\\s*[^\\n]*`, 'g');
          resultYaml = resultYaml.replace(
            updateTimeRegex,
            (match, beforeComment, comments, beforeField) => {
              console.log(`找到update-time匹配: ${match}`);
              return `${beforeComment || ''}${comments || ''}${beforeField || ''}update-time: ${new Date().toISOString()}`;
            }
          );
        }
        
        console.log('成功保留注释并更新YAML值');
        setYamlOutput(resultYaml);
        return;
      } catch (error) {
        console.error('直接替换YAML值失败:', error);
        console.warn('回退到默认方式，但仍将尝试保留顶部注释');
        
        try {
          // 提取顶部注释
          console.log('尝试保留顶部注释');
          const topComments = [];
          const lines = values.rawYaml.split('\n');
          let contentStartLine = 0;
          
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === '' || line.startsWith('#')) {
              topComments.push(lines[i]);
              contentStartLine = i + 1;
            } else {
              break;
            }
          }
          
          console.log('提取到的顶部注释：', topComments);
          
          // 准备要输出的yaml对象
          const yamlObj = {
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
          
          // 生成YAML
          const contentYaml = YAML.stringify(yamlObj, {
            indent: 2,
            lineWidth: -1
          });
          
          // 合并顶部注释和内容
          const resultYaml = topComments.join('\n') + (topComments.length > 0 ? '\n' : '') + contentYaml;
          
          console.log('成功保留顶部注释');
          setYamlOutput(resultYaml);
          return;
        } catch (commentError) {
          console.error('保留顶部注释失败:', commentError);
        }
      }
    }
    
    console.log('使用默认YAML生成方式');
    // 如果没有原始YAML或更新失败，使用默认格式
    const yamlObj = {
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
    
    const yamlString = YAML.stringify(yamlObj, {
      indent: 2,
      lineWidth: -1
    });
    setYamlOutput(yamlString);
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