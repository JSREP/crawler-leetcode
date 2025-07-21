import { useCallback } from 'react';
import { FormInstance } from 'antd';

/**
 * 表单字段滚动与高亮 Hook
 * @param form 表单实例
 */
export const useFormScrolling = (form: FormInstance) => {
  /**
   * 滚动到指定表单字段并高亮显示
   * @param fieldName 字段名
   */
  const scrollToField = useCallback((fieldName: string) => {
    // 映射字段名到更具体的元素ID或选择器
    const fieldMapping: Record<string, string> = {
      'name': 'input[id$=name]',
      'difficultyLevel': '[id$=difficultyLevel]',
      'description': '.editor-container', // markdown编辑器容器
      'base64Url': 'input[id$=base64Url]',
      'tags': '[id$=tags]',
      // 添加其他字段的映射
    };

    // 尝试查找元素
    try {
      const selector = fieldMapping[fieldName] || `[id$=${fieldName}]`;
      const element = document.querySelector(selector);
      
      if (element) {
        // 滚动到元素
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // 尝试聚焦元素（如果是输入控件）
        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
          setTimeout(() => element.focus(), 500);
        }
        
        // 高亮显示元素
        element.classList.add('field-highlight');
        setTimeout(() => element.classList.remove('field-highlight'), 3000);
      } else {
        console.warn(`找不到字段 ${fieldName} 对应的DOM元素`);
        
        // 回退方案：使用表单API滚动到字段
        form.scrollToField(fieldName);
      }
    } catch (error) {
      console.error('滚动到字段时出错:', error);
      // 回退方案
      form.scrollToField(fieldName);
    }
  }, [form]);

  /**
   * 高亮显示特定DOM元素
   * @param element 要高亮的DOM元素
   * @param duration 高亮持续时间（毫秒）
   */
  const highlightElement = useCallback((element: Element, duration: number = 3000) => {
    element.classList.add('field-highlight');
    setTimeout(() => element.classList.remove('field-highlight'), duration);
  }, []);

  return {
    scrollToField,
    highlightElement
  };
};

export default useFormScrolling; 