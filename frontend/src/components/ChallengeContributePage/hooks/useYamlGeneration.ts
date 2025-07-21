import { useState } from 'react';
import { FormInstance, message } from 'antd';
import * as YAML from 'yaml';
import { ChallengeFormData } from '../types';
import { ensureBase64Format, encodeUrl } from './useBase64UrlEncoder';
import { useYamlParser } from '.';
import { useFormScrolling } from './useFormScrolling';
import { dispatchFormValueUpdated } from './useEventListener';

interface UseYamlGenerationProps {
  form: FormInstance<ChallengeFormData>;
}

interface YamlGenerationHook {
  yamlOutput: string;
  generateYaml: () => void;
  handleCopyYaml: () => void;
  setYamlOutput: React.Dispatch<React.SetStateAction<string>>;
}

/**
 * YAML生成逻辑钩子
 */
export const useYamlGeneration = ({ form }: UseYamlGenerationProps): YamlGenerationHook => {
  const [yamlOutput, setYamlOutput] = useState<string>('');
  const { updateYamlPreservingFormat } = useYamlParser();
  const { scrollToField } = useFormScrolling(form);

  /**
   * 滚动到YAML预览区域
   * 使用多种方法确保能找到预览区域并滚动到该位置
   */
  const scrollToYamlPreviewSection = () => {
    console.log('尝试滚动到YAML预览区域');
    
    // 延迟执行，确保DOM已更新
    setTimeout(() => {
      try {
        // 首先尝试通过ID查找
        const previewById = document.getElementById('yaml-preview-section');
        if (previewById) {
          console.log('通过ID找到预览区域，进行滚动');
          previewById.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
        
        // 其次尝试通过类名查找
        const previewByClass = document.querySelector('.yaml-preview-section');
        if (previewByClass) {
          console.log('通过类名找到预览区域，进行滚动');
          previewByClass.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
        
        // 尝试查找包含"YAML生成预览"的标题
        const yamlTitle = Array.from(document.querySelectorAll('h4'))
          .find(el => el.textContent?.includes('YAML生成预览'));
        
        if (yamlTitle) {
          console.log('通过标题文本找到预览区域，进行滚动');
          yamlTitle.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
        
        // 最后尝试滚动到底部
        console.log('找不到特定元素，尝试滚动到底部');
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth'
        });
      } catch (error) {
        console.error('滚动到YAML预览区域时出错:', error);
        // 出错时尝试简单的滚动方法
        try {
          window.scrollTo(0, document.body.scrollHeight);
        } catch (e) {
          console.error('备用滚动方法也失败:', e);
        }
      }
    }, 300); // 增加延迟时间，确保DOM已完全更新
  };

  // 生成YAML数据
  const generateYaml = () => {
    console.log('开始调试：generateYaml函数被调用');
    
    try {
      // 先确保base64Url字段已被正确编码为base64格式
      const currentBaseUrl = form.getFieldValue('base64Url');
      console.log('当前base64Url值:', currentBaseUrl);
      
      if (currentBaseUrl) {
        try {
          const ensuredBase64 = ensureBase64Format(currentBaseUrl, encodeUrl);
          if (ensuredBase64 !== currentBaseUrl) {
            console.log('表单验证前更新base64Url:', currentBaseUrl, ' -> ', ensuredBase64);
            form.setFieldsValue({ base64Url: ensuredBase64 });
          }
        } catch (error) {
          console.error('表单验证前处理base64Url失败:', error);
        }
      }
      
      // 首先获取当前表单的所有值
      const currentValues = form.getFieldsValue(true);
      console.log('当前表单值（验证前）:', currentValues);
      console.log('当前description值:', currentValues.description);
      
      // 尝试直接生成YAML，不管验证是否通过
      if (currentValues) {
        try {
          const directYamlString = generateDirectYaml(currentValues);
          if (directYamlString) {
            console.log('已直接生成YAML，长度:', directYamlString.length);
            // 确保更新YAML输出内容
            setYamlOutput(() => directYamlString);
            // 滚动到YAML预览区域
            scrollToYamlPreviewSection();
          } else {
            console.error('直接生成YAML失败，返回空字符串');
            message.error('生成YAML失败，请检查表单数据');
          }
        } catch (error) {
          console.error('直接生成YAML时出错:', error);
          message.error(`生成YAML出错: ${error instanceof Error ? error.message : '未知错误'}`);
        }
      }
      
      // 然后验证表单
      form.validateFields()
        .then(validatedValues => {
          // 验证通过，继续生成YAML
          console.log('表单验证通过，生成完整YAML');
          console.log('验证后的description值:', validatedValues.description);
          // 强制将rawYaml值设置为undefined，确保使用默认生成方式
          validatedValues.rawYaml = undefined;
          // 将验证后的值传递给生成函数
          generateYamlFromValidForm(validatedValues);
        })
        .catch(({ errorFields }) => {
          if (errorFields && errorFields.length > 0) {
            // 获取第一个错误字段的名称
            const firstErrorField = errorFields[0].name[0];
            
            console.log('表单验证失败，错误字段:', errorFields.map((f: any) => f.name[0]));
            // 根据字段名滚动到对应位置
            scrollToField(firstErrorField);
            
            // 显示错误提示，但仍然使用当前已有的数据生成YAML
            message.warning({
              content: `有必填字段未完成: ${errorFields.map((f: any) => f.name[0]).join(', ')}，但仍会生成部分YAML`,
              duration: 3
            });
          }
        });
    } catch (error) {
      console.error('生成YAML过程中出现未捕获错误:', error);
      message.error('生成YAML时出现错误，请查看控制台日志');
    }
  };

  // 直接从当前值生成YAML，不管验证是否通过
  const generateDirectYaml = (values: ChallengeFormData) => {
    console.log('尝试直接生成YAML，不依赖表单验证');
    console.log('直接生成时的description值:', values.description);
    
    try {
      // 更新update-time为当前时间
      const currentDateTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
      
      // 创建一个基本的YAML对象并转换为字符串
      const yamlObj = {
        'id': values.id || 0,
        'id-alias': values.idAlias || '',
        'platform': values.platform || 'Web',
        'name': values.name || '未命名挑战',
        'name_en': values.nameEn || '',
        'difficulty-level': values.difficultyLevel || 1,
        'description-markdown': values.description || values.descriptionMarkdown || '暂无描述',
        'description-markdown_en': values.descriptionEn || values.descriptionMarkdownEn || '',
        'base64-url': values.base64Url || '',
        'is-expired': values.isExpired === undefined ? false : values.isExpired,
        'tags': values.tags || [],
        'solutions': (values.solutions || [])?.filter((s: any) => s && s.title && s.url).map((s: any) => ({
          title: s.title,
          url: s.url,
          ...(s.source ? {source: s.source} : {}),
          ...(s.author ? {author: s.author} : {})
        })),
        // 添加或更新时间字段
        'create-time': values.createTime || currentDateTime,
        'update-time': currentDateTime
      };
      
      const yamlString = YAML.stringify(yamlObj, {
        indent: 2,
        lineWidth: -1
      });
      
      return yamlString;
    } catch (error) {
      console.error('直接生成YAML时出错:', error);
      return null;
    }
  };

  // 从已验证的表单生成YAML
  const generateYamlFromValidForm = (values?: ChallengeFormData) => {
    // 使用传入的values或者从表单获取完整值，确保包含隐藏字段
    const formValues = values || form.getFieldsValue(true);
    console.log('当前表单值（验证后）：', formValues);
    console.log('验证后处理的description值:', formValues.description);
    
    // 检查并处理base64Url字段
    if (!formValues.base64Url) {
      console.warn('警告: base64Url字段为空，无法生成完整YAML');
      message.warning('请输入目标网站URL后再生成YAML');
      
      // 自动滚动到base64Url字段
      scrollToField('base64Url');
      return;
    } else {
      console.log('检测到base64Url字段值:', formValues.base64Url);
      
      // 确保base64Url是base64编码格式
      try {
        // 使用ensureBase64Format确保值总是base64格式
        const ensuredBase64 = ensureBase64Format(formValues.base64Url, encodeUrl);
        if (ensuredBase64 !== formValues.base64Url) {
          console.log('转换base64Url为确保的base64格式:', formValues.base64Url, ' -> ', ensuredBase64);
          formValues.base64Url = ensuredBase64;
          
          // 同时更新表单字段值
          form.setFieldsValue({ base64Url: ensuredBase64 });
          // 触发表单更新事件
          dispatchFormValueUpdated();
        }
      } catch (error) {
        console.error('处理base64Url字段失败:', error);
      }
    }
    
    // 更新update-time为当前时间
    const currentDateTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    // 修改判断逻辑：强制使用默认生成方式
    // if (!formValues.rawYaml || typeof formValues.rawYaml !== 'string' || formValues.rawYaml === '') {
    // 总是使用默认格式生成，忽略rawYaml
    console.log('强制使用默认格式生成YAML');
    // 创建一个基本的YAML对象并转换为字符串
    const yamlObj = {
      'id': formValues.id,
      'id-alias': formValues.idAlias,
      'platform': formValues.platform,
      'name': formValues.name,
      'name_en': formValues.nameEn,
      'difficulty-level': formValues.difficultyLevel,
      'description-markdown': formValues.description || formValues.descriptionMarkdown,
      'description-markdown_en': formValues.descriptionEn || formValues.descriptionMarkdownEn || '',
      'base64-url': formValues.base64Url,
      'is-expired': formValues.isExpired === undefined ? false : formValues.isExpired,
      'tags': formValues.tags || [],
      'solutions': (formValues.solutions || [])?.filter((s: any) => s.title && s.url).map((s: any) => ({
        title: s.title,
        url: s.url,
        ...(s.source ? {source: s.source} : {}),
        ...(s.author ? {author: s.author} : {})
      })),
      'create-time': formValues.createTime || currentDateTime,
      'update-time': currentDateTime
    };
    
    try {
      const yamlString = YAML.stringify(yamlObj, {
        indent: 2,
        lineWidth: -1
      });
      
      console.log('成功生成YAML字符串，长度:', yamlString.length);
      console.log('YAML内容包含的description:', yamlString.includes(formValues.description || ''));
      
      // 确保异步更新
      setYamlOutput(() => yamlString);
      
      // 检查yamlOutput是否确实被更新
      setTimeout(() => {
        console.log('检查yamlOutput更新状态，当前长度:', yamlOutput.length);
        console.log('检查yamlOutput是否包含description:', yamlOutput.includes(formValues.description || ''));
      }, 50);
      
      // 滚动到YAML预览区域
      scrollToYamlPreviewSection();
    } catch (yamlError) {
      console.error('YAML.stringify失败:', yamlError);
      message.error('YAML生成失败: ' + (yamlError instanceof Error ? yamlError.message : '未知错误'));
    }
    return;
  };

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
    } else {
      message.warning('没有可复制的YAML内容');
    }
  };

  return {
    yamlOutput,
    generateYaml,
    handleCopyYaml,
    setYamlOutput
  };
}; 