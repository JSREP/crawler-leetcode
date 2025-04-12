import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Form } from 'antd';
import { SectionProps } from '../types';
import MdEditor from 'react-markdown-editor-lite';
// 确保导入样式
import 'react-markdown-editor-lite/lib/index.css';

// 更强力的CSS选择器，针对各种可能的徽标样式
const markdownEditorStyles = `
  /* 在全屏模式下隐藏GitHub徽标 */
  .rc-md-editor.full ~ .github-fork-ribbon-wrapper,
  .rc-md-editor.full ~ div > .github-fork-ribbon-wrapper,
  .rc-md-editor.full ~ * > .github-fork-ribbon-wrapper,
  .rc-md-editor.full ~ * > * > .github-fork-ribbon-wrapper {
    display: none !important;
    opacity: 0 !important;
    visibility: hidden !important;
    pointer-events: none !important;
    z-index: -1 !important;
  }

  /* 修复全屏控制按钮样式 */
  .rc-md-editor .full-screen {
    z-index: 9999 !important;
  }
  
  /* 在全屏模式下添加自己的样式 */
  .rc-md-editor.full {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    z-index: 9999 !important;
    background: white !important;
  }

  /* 确保全屏模式下编辑器在最上层 */
  .rc-md-editor.full .rc-md-navigation {
    z-index: 10000 !important;
  }

  /* 简化base64图片显示 */
  .rc-md-editor .editor-container .sec-md .input {
    position: relative;
  }

  .rc-md-editor .editor-container .sec-md .input img[src^="data:"] {
    display: none;
  }

  .rc-md-editor .editor-container .sec-md .input p:has(img[src^="data:"]),
  .rc-md-editor .editor-container .sec-md .input p > img[src^="data:"] {
    position: relative;
    display: inline-block;
    min-width: 50px;
    min-height: 30px;
    background: #f0f0f0;
    border-radius: 4px;
    margin: 4px 0;
  }

  .rc-md-editor .editor-container .sec-md .input p:has(img[src^="data:"]):before,
  .rc-md-editor .editor-container .sec-md .input p > img[src^="data:"]:before {
    content: "[图片]";
    position: absolute;
    left: 0;
    top: 0;
    padding: 2px 8px;
    color: #666;
    font-size: 12px;
    background: #f0f0f0;
    border-radius: 4px;
    z-index: 1;
  }
`;

// 安全地将任何类型的值转换为字符串
const safeToString = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'object') {
    try {
      // 尝试从对象中提取text属性或转换为JSON字符串
      if (value.text && typeof value.text === 'string') {
        return value.text;
      }
      if (value.toString && value.toString() !== '[object Object]') {
        return value.toString();
      }
      return JSON.stringify(value);
    } catch (e) {
      console.error('无法将对象转换为字符串', e);
      return '';
    }
  }
  return String(value);
};

/**
 * 描述字段组件
 */
const DescriptionFields: React.FC<SectionProps> = ({ form }) => {
  // 状态
  const [markdownRenderer, setMarkdownRenderer] = useState<any>({
    render: (text: string) => text
  });
  
  // refs
  const styleRef = useRef<HTMLStyleElement | null>(null);
  const editorChineseRef = useRef<MdEditor | null>(null);
  const editorEnglishRef = useRef<MdEditor | null>(null);
  const hasInitializedRef = useRef<boolean>(false);
  
  // 当本地存储里的值变化时，重新初始化编辑器内容
  useEffect(() => {
    // 监听存储变化
    const handleStorageChange = () => {
      try {
        // 等待一个周期让React首先更新Form
        setTimeout(() => {
          // 从表单直接获取最新状态
          const chineseValue = form.getFieldValue('descriptionMarkdown');
          const englishValue = form.getFieldValue('descriptionMarkdownEn');
          
          // 安全转换为字符串
          const chineseText = safeToString(chineseValue);
          const englishText = safeToString(englishValue);
          
          // 直接更新编辑器内容
          if (editorChineseRef.current?.getMdElement) {
            editorChineseRef.current.setText(chineseText);
          }
          
          if (editorEnglishRef.current?.getMdElement) {
            editorEnglishRef.current.setText(englishText);
          }
        }, 0);
      } catch (err) {
        console.error('处理存储变化时出错:', err);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [form]);
  
  // 初始化编辑器内容
  useEffect(() => {
    if (hasInitializedRef.current) return;
    
    // 等待编辑器加载完成
    setTimeout(() => {
      try {
        // 获取表单中的字段值
        const chineseValue = form.getFieldValue('descriptionMarkdown');
        const englishValue = form.getFieldValue('descriptionMarkdownEn');
        
        // 安全转换为字符串
        const chineseText = safeToString(chineseValue);
        const englishText = safeToString(englishValue);
        
        // 更新编辑器内容
        if (editorChineseRef.current?.getMdElement) {
          editorChineseRef.current.setText(chineseText);
          // 确保表单中也保存了正确的字符串
          form.setFieldsValue({ descriptionMarkdown: chineseText });
        }
        
        if (editorEnglishRef.current?.getMdElement) {
          editorEnglishRef.current.setText(englishText);
          form.setFieldsValue({ descriptionMarkdownEn: englishText });
        }
        
        hasInitializedRef.current = true;
      } catch (err) {
        console.error('设置初始编辑器内容时出错:', err);
      }
    }, 300); // 延迟更久以确保编辑器已完全初始化
  }, [form]);
  
  // 处理图片上传
  const handleImageUpload = (file: File): Promise<string> => {
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
  };

  // 处理中文描述变化
  const handleChineseEditorChange = ({ text }: { text: string }) => {
    // 确保更新的是字符串值
    form.setFieldsValue({ descriptionMarkdown: text });
  };
  
  // 处理英文描述变化
  const handleEnglishEditorChange = ({ text }: { text: string }) => {
    form.setFieldsValue({ descriptionMarkdownEn: text });
  };

  // 自定义配置选项
  const editorConfig = {
    view: { 
      menu: true, 
      md: true, 
      html: true 
    },
    canView: { 
      menu: true, 
      md: true, 
      html: true, 
      fullScreen: true, 
      hideMenu: true 
    },
    plugins: ['full-screen'],
    imageAccept: '.jpg,.jpeg,.png,.gif',
    onImageUpload: true
  };

  // 添加自定义样式
  const customStyles = `
    /* 在编辑器中简化base64显示 */
    .rc-md-editor .editor-container .sec-md .input {
      position: relative;
    }
    
    .rc-md-editor .editor-container .sec-md .input {
      font-size: 14px;
      line-height: 1.6;
    }

    /* 使用CSS省略号效果 */
    .rc-md-editor .editor-container .sec-md .input a[href^="data:image"] {
      display: inline-block;
      max-width: 100px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      vertical-align: bottom;
    }

    /* 添加提示 */
    .rc-md-editor .editor-container .sec-md .input a[href^="data:image"]:hover::after {
      content: "[图片数据已省略]";
      position: absolute;
      background: #f0f0f0;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
      color: #666;
      margin-left: 8px;
    }
  `;

  // 初始化markdown-it和样式
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
    
    // 插入自定义样式到head中
    const styleElement = document.createElement('style');
    styleElement.innerHTML = markdownEditorStyles + customStyles;
    document.head.appendChild(styleElement);
    styleRef.current = styleElement;
    
    // 组件卸载时移除样式和脚本
    return () => {
      if (styleRef.current && document.head.contains(styleRef.current)) {
        document.head.removeChild(styleRef.current);
      }
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);
  
  return (
    <>
      <Form.Item
        name="descriptionMarkdown"
        label="中文描述 (Markdown)"
        rules={[{ required: true, message: '请输入中文描述' }]}
      >
        <MdEditor
          ref={editorChineseRef}
          style={{ height: '300px' }}
          renderHTML={text => markdownRenderer.render(text)}
          onChange={handleChineseEditorChange}
          placeholder="请使用Markdown格式输入题目描述，支持图片、代码块等。可以直接粘贴图片！"
          config={editorConfig}
          onImageUpload={handleImageUpload}
        />
      </Form.Item>

      <Form.Item
        name="descriptionMarkdownEn"
        label="英文描述 (Markdown)"
      >
        <MdEditor
          ref={editorEnglishRef}
          style={{ height: '300px' }}
          renderHTML={text => markdownRenderer.render(text)}
          onChange={handleEnglishEditorChange}
          placeholder="请使用Markdown格式输入英文题目描述（可选），英文版将在用户切换语言时显示。可以直接粘贴图片！"
          config={editorConfig}
          onImageUpload={handleImageUpload}
        />
      </Form.Item>
    </>
  );
};

// 声明全局window接口扩展
declare global {
  interface Window {
    markdownit: any;
  }
}

export default DescriptionFields; 