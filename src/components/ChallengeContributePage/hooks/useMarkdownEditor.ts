import { useState, useEffect, useRef, useCallback } from 'react';
import { FormInstance } from 'antd';
import { safeToString, isInvalidObjectString } from '../utils/textUtils';
import MdEditor from 'react-markdown-editor-lite';

/**
 * Markdown编辑器钩子接口
 */
export interface UseMarkdownEditorProps {
  form: FormInstance;
  chineseFieldName: string;
  englishFieldName: string;
}

/**
 * Markdown编辑器钩子返回值
 */
export interface UseMarkdownEditorReturn {
  markdownRenderer: any;
  editorChineseRef: React.RefObject<MdEditor>;
  editorEnglishRef: React.RefObject<MdEditor>;
  styleRef: React.RefObject<HTMLStyleElement>;
  handleChineseEditorChange: ({ text }: { text: string }) => void;
  handleEnglishEditorChange: ({ text }: { text: string }) => void;
  handleImageUpload: (file: File) => Promise<string>;
}

/**
 * 安全设置编辑器文本的辅助函数
 */
const safeSetEditorText = (editor: MdEditor | null, value: any, isUpdatingRef: React.MutableRefObject<boolean>) => {
  if (!editor?.getMdElement) return;
  
  try {
    // 确保值是字符串
    const textValue = safeToString(value);
    
    // 避免设置[object Object]这样的无意义内容
    if (isInvalidObjectString(textValue)) {
      console.warn('检测到无效文本内容：[object Object]，跳过更新');
      return;
    }
    
    // 设置编辑器文本
    editor.setText(textValue);
  } catch (error) {
    console.error('设置编辑器文本时出错:', error);
    isUpdatingRef.current = false;
  }
};

/**
 * Markdown编辑器自定义钩子
 * 封装Markdown编辑器的状态管理和事件处理
 */
export const useMarkdownEditor = ({ 
  form, 
  chineseFieldName = 'descriptionMarkdown', 
  englishFieldName = 'descriptionMarkdownEn' 
}: UseMarkdownEditorProps): UseMarkdownEditorReturn => {
  // 状态
  const [markdownRenderer, setMarkdownRenderer] = useState<any>({
    render: (text: string) => text
  });
  
  // refs
  const styleRef = useRef<HTMLStyleElement | null>(null);
  const editorChineseRef = useRef<MdEditor | null>(null);
  const editorEnglishRef = useRef<MdEditor | null>(null);
  const hasInitializedRef = useRef<boolean>(false);
  const isUpdatingRef = useRef<boolean>(false); // 防止循环更新的标志
  
  // 当本地存储里的值变化时，重新初始化编辑器内容
  useEffect(() => {
    // 监听存储变化
    const handleStorageChange = () => {
      if (isUpdatingRef.current) return; // 如果正在更新中，跳过
      
      try {
        isUpdatingRef.current = true;
        // 等待一个周期让React首先更新Form
        setTimeout(() => {
          // 从表单直接获取最新状态
          const chineseValue = form.getFieldValue(chineseFieldName);
          const englishValue = form.getFieldValue(englishFieldName);
          
          // 使用安全函数设置编辑器文本
          safeSetEditorText(editorChineseRef.current, chineseValue, isUpdatingRef);
          safeSetEditorText(editorEnglishRef.current, englishValue, isUpdatingRef);
          
          isUpdatingRef.current = false;
        }, 0);
      } catch (err) {
        console.error('处理存储变化时出错:', err);
        isUpdatingRef.current = false;
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [form, chineseFieldName, englishFieldName]);
  
  // 监听description-updated事件
  useEffect(() => {
    const handleDescriptionUpdate = (event: any) => {
      if (isUpdatingRef.current) return; // 如果正在更新中，跳过
      if (event.detail) {
        try {
          isUpdatingRef.current = true;
          const { description, descriptionEn } = event.detail;
          
          // 安全转换为字符串
          const chineseText = safeToString(description);
          const englishText = safeToString(descriptionEn);
          
          // 记录接收到的数据类型，帮助调试
          console.log('接收到description更新事件:', { 
            chineseText, 
            englishText,
            chineseType: typeof description,
            englishType: typeof descriptionEn,
            isChineseObjectString: isInvalidObjectString(chineseText),
            isEnglishObjectString: isInvalidObjectString(englishText)
          });
          
          // 仅更新一次，避免重复设置表单值和编辑器内容
          // 使用批量更新减少重渲染次数
          const formValues: any = {};
          
          if (chineseText && !isInvalidObjectString(chineseText)) {
            formValues.description = chineseText;
            formValues[chineseFieldName] = chineseText;
          }
          
          if (englishText && !isInvalidObjectString(englishText)) {
            formValues.descriptionEn = englishText;
            formValues[englishFieldName] = englishText;
          }
          
          // 批量更新表单值
          if (Object.keys(formValues).length > 0) {
            form.setFieldsValue(formValues);
          }
          
          // 使用setTimeout确保在DOM更新后再更新编辑器内容
          setTimeout(() => {
            // 使用安全函数设置编辑器文本
            if (chineseText && !isInvalidObjectString(chineseText)) {
              safeSetEditorText(editorChineseRef.current, chineseText, isUpdatingRef);
            }
            
            if (englishText && !isInvalidObjectString(englishText)) {
              safeSetEditorText(editorEnglishRef.current, englishText, isUpdatingRef);
            }
            
            isUpdatingRef.current = false;
          }, 100);
        } catch (err) {
          console.error('处理description更新事件时出错:', err);
          isUpdatingRef.current = false;
        }
      }
    };
    
    window.addEventListener('description-updated', handleDescriptionUpdate);
    return () => {
      window.removeEventListener('description-updated', handleDescriptionUpdate);
    };
  }, [form, chineseFieldName, englishFieldName]);
  
  // 初始化编辑器内容
  useEffect(() => {
    if (hasInitializedRef.current) return;
    
    // 等待编辑器加载完成
    setTimeout(() => {
      try {
        // 获取表单中的字段值
        const chineseValue = form.getFieldValue(chineseFieldName);
        const englishValue = form.getFieldValue(englishFieldName);
        
        // 使用安全函数设置编辑器文本
        safeSetEditorText(editorChineseRef.current, chineseValue, isUpdatingRef);
        safeSetEditorText(editorEnglishRef.current, englishValue, isUpdatingRef);
        
        hasInitializedRef.current = true;
      } catch (err) {
        console.error('设置初始编辑器内容时出错:', err);
      }
    }, 300); // 延迟更久以确保编辑器已完全初始化
  }, [form, chineseFieldName, englishFieldName]);
  
  // 初始化markdown-it
  useEffect(() => {
    // 动态加载markdown-it库
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/markdown-it@12.0.4/dist/markdown-it.min.js';
    script.async = true;
    script.onload = () => {
      if (window.markdownit) {
        const parser = window.markdownit({
          html: true,
          linkify: true,
          typographer: true
        });
        setMarkdownRenderer(parser);
      }
    };
    document.head.appendChild(script);
    
    // 组件卸载时移除脚本
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);
  
  // 处理图片上传
  const handleImageUpload = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = () => {
        reject(new Error('Failed to read image file'));
      };
      reader.readAsDataURL(file);
    });
  }, []);

  // 处理中文描述变化
  const handleChineseEditorChange = useCallback(({ text }: { text: string }) => {
    if (isUpdatingRef.current) return; // 如果正在更新中，跳过
    
    // 使用标志位避免循环
    isUpdatingRef.current = true;
    form.setFieldsValue({ [chineseFieldName]: text });
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 0);
  }, [form, chineseFieldName]);
  
  // 处理英文描述变化
  const handleEnglishEditorChange = useCallback(({ text }: { text: string }) => {
    if (isUpdatingRef.current) return; // 如果正在更新中，跳过
    
    // 使用标志位避免循环
    isUpdatingRef.current = true;
    form.setFieldsValue({ [englishFieldName]: text });
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 0);
  }, [form, englishFieldName]);

  return {
    markdownRenderer,
    editorChineseRef,
    editorEnglishRef,
    styleRef,
    handleChineseEditorChange,
    handleEnglishEditorChange,
    handleImageUpload
  };
};

// 声明全局window接口扩展
declare global {
  interface Window {
    markdownit: any;
  }
} 