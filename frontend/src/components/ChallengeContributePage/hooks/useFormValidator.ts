import { useCallback } from 'react';
import { FormValues } from '../types';

interface ValidationResult {
  isValid: boolean;
  errors: {
    field: string;
    message: string;
  }[];
}

/**
 * 自定义Hook：表单验证
 * 提供表单字段验证功能
 */
export const useFormValidator = () => {
  /**
   * 验证表单数据
   * @param values 表单值
   * @returns 验证结果
   */
  const validateForm = useCallback((values: FormValues): ValidationResult => {
    const errors: { field: string; message: string }[] = [];

    // 验证基本信息
    if (!values.id) {
      errors.push({ field: 'id', message: '题目ID不能为空' });
    } else if (!/^\d+$/.test(values.id)) {
      errors.push({ field: 'id', message: '题目ID必须为数字' });
    }

    if (!values.platform) {
      errors.push({ field: 'platform', message: '请选择题目平台' });
    }

    if (!values.nameZh && !values.nameEn) {
      errors.push({ field: 'nameZh', message: '中文名称和英文名称至少填写一项' });
      errors.push({ field: 'nameEn', message: '中文名称和英文名称至少填写一项' });
    }

    // 验证难度
    if (!values.difficulty) {
      errors.push({ field: 'difficulty', message: '请选择题目难度' });
    }

    // 验证描述内容
    if (!values.contentZh && !values.contentEn) {
      errors.push({ field: 'contentZh', message: '中文内容和英文内容至少填写一项' });
      errors.push({ field: 'contentEn', message: '中文内容和英文内容至少填写一项' });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  /**
   * 高亮显示错误字段
   * @param fieldName 字段名称
   */
  const highlightField = useCallback((fieldName: string) => {
    // 查找字段对应的DOM元素
    const field = document.querySelector(`[data-field="${fieldName}"]`);
    if (field) {
      field.scrollIntoView({ behavior: 'smooth', block: 'center' });
      field.classList.add('field-error');
      
      // 3秒后移除高亮
      setTimeout(() => {
        field.classList.remove('field-error');
      }, 3000);
    }
  }, []);

  return {
    validateForm,
    highlightField
  };
}; 