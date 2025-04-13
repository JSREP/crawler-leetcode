import * as React from 'react';
import { FormInstance, message } from 'antd';
import { ChallengeFormData } from '../types';
import { parseYamlString } from '../utils/yamlUtils';
import { dispatchCustomEvent } from './useEventListener';

interface UseYamlImportProps {
  form: FormInstance<ChallengeFormData>;
  calculateNextId: () => number;
}

/**
 * YAML导入逻辑钩子
 */
export const useYamlImport = ({ form, calculateNextId }: UseYamlImportProps) => {
  // 处理YAML导入
  const handleImportYaml = (yamlContent: string) => {
    try {
      console.log('开始导入YAML, 长度:', yamlContent.length, '字节');
      
      // 使用新的YAML解析函数
      const formData = parseYamlString(yamlContent);
      
      if (!formData) {
        throw new Error('解析YAML失败');
      }
      
      // 如果缺少ID，使用自动生成的ID
      if (formData.id === undefined || formData.id === null) {
        console.warn('导入的YAML缺少id字段，将使用自动生成的ID');
        formData.id = calculateNextId();
      }
      
      // 更新时间字段为当前时间
      const currentDateTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
      formData.updateTime = currentDateTime;
      
      console.log('正在设置表单值');
      
      // 先重置表单
      form.resetFields();
      
      // 设置解析后的值
      form.setFieldsValue(formData);
      
      // 手动触发表单字段的值变更事件，确保所有组件获取到最新值
      // 发送描述字段更新事件
      dispatchCustomEvent('description-updated', { 
        description: formData.description || formData.descriptionMarkdown,
        descriptionEn: formData.descriptionEn || formData.descriptionMarkdownEn
      });
      
      // 处理base64Url
      if (formData.base64Url) {
        dispatchCustomEvent('base64-url-updated', { 
          base64Url: formData.base64Url.toString()
        });
      }
      
      // 处理标签
      if (formData.tags && Array.isArray(formData.tags)) {
        dispatchCustomEvent('tags-updated', { tags: formData.tags });
      }
      
      // 处理参考资料
      if (formData.solutions && Array.isArray(formData.solutions)) {
        dispatchCustomEvent('solutions-updated', { solutions: formData.solutions });
      }
      
      // 显示成功信息
      message.success('YAML数据已成功导入到表单');
      return formData;
    } catch (error) {
      console.error('解析YAML失败:', error);
      message.error(`YAML导入失败: ${error instanceof Error ? error.message : '未知错误'}`);
      return false;
    }
  };

  return {
    handleImportYaml
  };
}; 