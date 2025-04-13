import { Rule } from 'antd/es/form';
import { ChallengeFormData } from '../types';

/**
 * 集中管理表单验证规则
 */

// 基本必填验证
export const requiredRule = (message: string): Rule => ({
  required: true,
  message
});

// ID验证规则
export const idValidators = [
  requiredRule('请输入挑战ID'),
  {
    pattern: /^\d+$/,
    message: 'ID必须是数字'
  }
];

// 名称验证规则
export const nameValidators = [
  requiredRule('请输入挑战名称'),
  {
    min: 3,
    message: '名称至少需要3个字符'
  }
];

// 名称英文验证规则 (非必填)
export const nameEnValidators = [
  {
    min: 3,
    message: '英文名称至少需要3个字符'
  }
];

// URL验证器工厂函数
export const createUrlValidators = (decodeFunc: (value: string) => string): Rule[] => {
  return [
    requiredRule('请输入URL'),
    {
      validator: async (_: any, value: string) => {
        if (!value) return Promise.resolve();
        
        try {
          // 尝试解码，如果是base64格式
          const url = decodeFunc ? decodeFunc(value) : value;
          
          // 检查URL格式
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return Promise.reject('URL必须以http://或https://开头');
          }
          
          // 尝试构造URL对象验证URL格式
          try {
            new URL(url);
            return Promise.resolve();
          } catch (e) {
            return Promise.reject('URL格式不正确');
          }
        } catch (error) {
          return Promise.reject('URL格式不正确，请检查输入');
        }
      }
    }
  ];
};

// 标签验证
export const tagsValidators = [
  {
    validator: (_: any, value: string[]) => {
      if (!value || value.length === 0) {
        return Promise.reject('请至少添加一个标签');
      }
      return Promise.resolve();
    }
  }
];

// 参考资料验证
export const solutionsValidator = {
  validator: (_: any, value: any) => {
    if (!value || value.length === 0) {
      // 参考资料是可选的，允许为空
      return Promise.resolve();
    }

    if (!Array.isArray(value)) {
      return Promise.reject('参考资料必须是数组');
    }

    // 检查每个参考资料的必填字段
    for (let i = 0; i < value.length; i++) {
      const solution = value[i];
      if (!solution.title || !solution.title.trim()) {
        return Promise.reject(`第${i+1}个参考资料缺少标题`);
      }
      if (!solution.url || !solution.url.trim()) {
        return Promise.reject(`第${i+1}个参考资料缺少URL`);
      }
      
      // 验证URL格式
      if (!solution.url.startsWith('http://') && !solution.url.startsWith('https://')) {
        return Promise.reject(`第${i+1}个参考资料的URL必须以http://或https://开头`);
      }
    }

    return Promise.resolve();
  }
};

// 描述验证
export const descriptionValidators = [
  requiredRule('请输入挑战描述'),
  {
    min: 10,
    message: '描述至少需要10个字符'
  }
];

// 难度验证
export const difficultyValidators = [
  requiredRule('请选择难度级别')
]; 