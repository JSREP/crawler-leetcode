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

  // 生成YAML数据
  const generateYaml = () => {
    console.log('开始调试：generateYaml函数被调用');
    
    // 先确保base64Url字段已被正确编码为base64格式
    const currentBaseUrl = form.getFieldValue('base64Url');
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
    
    // 然后验证表单
    form.validateFields()
      .then(() => {
        // 验证通过，继续生成YAML
        generateYamlFromValidForm();
      })
      .catch(({ errorFields }) => {
        if (errorFields && errorFields.length > 0) {
          // 获取第一个错误字段的名称
          const firstErrorField = errorFields[0].name[0];
          
          // 根据字段名滚动到对应位置
          scrollToField(firstErrorField);
          
          // 显示错误提示
          message.error({
            content: `请填写必填字段: ${errorFields.map((f: any) => f.name[0]).join(', ')}`,
            duration: 3
          });
        }
      });
  };

  // 从已验证的表单生成YAML
  const generateYamlFromValidForm = () => {
    // 直接从表单获取完整值，确保包含隐藏字段
    const values = form.getFieldsValue(true);
    console.log('当前表单值：', values);
    
    // 检查并处理base64Url字段
    if (!values.base64Url) {
      console.warn('警告: base64Url字段为空，无法生成完整YAML');
      message.warning('请输入目标网站URL后再生成YAML');
      
      // 自动滚动到base64Url字段
      scrollToField('base64Url');
      return;
    } else {
      console.log('检测到base64Url字段值:', values.base64Url);
      
      // 确保base64Url是base64编码格式
      try {
        // 使用ensureBase64Format确保值总是base64格式
        const ensuredBase64 = ensureBase64Format(values.base64Url, encodeUrl);
        if (ensuredBase64 !== values.base64Url) {
          console.log('转换base64Url为确保的base64格式:', values.base64Url, ' -> ', ensuredBase64);
          values.base64Url = ensuredBase64;
          
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
        // 添加或更新时间字段
        'create-time': values.createTime || currentDateTime,
        'update-time': currentDateTime
      };
      
      const yamlString = YAML.stringify(yamlObj, {
        indent: 2,
        lineWidth: -1
      });
      
      setYamlOutput(yamlString);
      return;
    }
    
    console.log('使用全新方法处理YAML，保留所有格式和注释');

    // 使用外部函数处理更复杂的原始YAML更新
    const updatedYaml = updateYamlPreservingFormat(values, currentDateTime);
    setYamlOutput(updatedYaml);
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
    }
  };

  return {
    yamlOutput,
    generateYaml,
    handleCopyYaml,
    setYamlOutput
  };
}; 