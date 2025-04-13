import { useState, useCallback } from 'react';
import { message } from 'antd';
import { dump } from 'js-yaml';
import { useAppSelector } from '@/redux/hooks';
import { ChallengeFormData } from '../types';

/**
 * YAML构建器hook
 */
export default function useYamlBuilder() {
  const [yamlOutput, setYamlOutput] = useState<string>('');
  
  // 从Redux获取表单数据
  const formData = useAppSelector(state => state.challengeForm.data);
  
  /**
   * 生成YAML
   */
  const generateYaml = useCallback(() => {
    try {
      // 创建YAML对象
      const yamlObject = buildYamlObject(formData);
      
      // 转换为YAML字符串
      const yamlString = dump(yamlObject, {
        indent: 2,
        lineWidth: -1, // 不限制行宽
        sortKeys: false, // 保持键的顺序
      });
      
      // 设置YAML输出
      setYamlOutput(yamlString);
      
      // 滚动到YAML预览区域
      scrollToYamlPreview();
      
      return yamlString;
    } catch (error) {
      console.error('生成YAML时出错:', error);
      message.error('生成YAML时出错，请检查表单数据');
      return '';
    }
  }, [formData]);
  
  /**
   * 复制YAML到剪贴板
   */
  const copyYaml = useCallback(() => {
    if (!yamlOutput) {
      message.warning('请先生成YAML', 2);
      return;
    }
    
    try {
      navigator.clipboard.writeText(yamlOutput);
      message.success('已复制YAML到剪贴板', 2);
    } catch (error) {
      console.error('复制YAML时出错:', error);
      message.error('复制YAML时出错');
    }
  }, [yamlOutput]);

  /**
   * 滚动到YAML预览区域
   */
  const scrollToYamlPreview = useCallback(() => {
    setTimeout(() => {
      const previewElement = document.getElementById('yaml-preview-section');
      if (previewElement) {
        previewElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }, []);
  
  return {
    yamlOutput,
    generateYaml,
    copyYaml,
    scrollToYamlPreview
  };
}

/**
 * 构建YAML对象
 */
function buildYamlObject(formData: ChallengeFormData) {
  const {
    title,
    titleSlug,
    difficulty,
    categoryTitle,
    description,
    metaData,
    constraints,
    exampleTestcases,
    notes,
    solution,
    similarQuestions,
    hints,
    tags
  } = formData;

  // 构建基本的YAML对象
  const yamlObject: any = {
    title,
    titleSlug,
    difficulty,
    categoryTitle,
    description: formatMultilineString(description),
  };

  // 添加元数据
  if (metaData && Object.keys(metaData).length > 0) {
    yamlObject.metaData = metaData;
  }

  // 添加约束条件
  if (constraints && constraints.trim()) {
    yamlObject.constraints = formatMultilineString(constraints);
  }

  // 添加示例测试用例
  if (exampleTestcases && exampleTestcases.trim()) {
    yamlObject.exampleTestcases = formatMultilineString(exampleTestcases);
  }

  // 添加题解
  if (solution && solution.trim()) {
    yamlObject.solution = formatMultilineString(solution);
  }

  // 添加笔记
  if (notes && notes.trim()) {
    yamlObject.notes = formatMultilineString(notes);
  }

  // 添加相似题目
  if (similarQuestions && similarQuestions.length > 0) {
    yamlObject.similarQuestions = similarQuestions;
  }

  // 添加提示
  if (hints && hints.length > 0) {
    yamlObject.hints = hints.map(hint => formatMultilineString(hint));
  }

  // 添加标签
  if (tags && tags.length > 0) {
    yamlObject.tags = tags;
  }

  return yamlObject;
}

/**
 * 格式化多行字符串为YAML兼容格式
 */
function formatMultilineString(text: string): string {
  if (!text || text.trim() === '') return '';
  
  // 如果是多行文本，使用YAML的块样式
  if (text.includes('\n')) {
    return text;
  }
  
  return text;
}