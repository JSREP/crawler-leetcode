import * as React from 'react';
import { Suspense, lazy, useState, useEffect } from 'react';
import { Form, Spin } from 'antd';
import { SectionProps } from '../types';
// 导入已抽取的验证规则
import { descriptionValidators } from '../utils/validators';
// 导入钩子
import { useMarkdownEditor } from '../hooks';
import { markdownEditorStyles, customEditorStyles, getEditorConfig } from '../utils/markdownStyleUtils';

// 懒加载Markdown编辑器组件
const MdEditor = lazy(() => 
  import('react-markdown-editor-lite').then(module => {
    // 同时导入样式
    import('react-markdown-editor-lite/lib/index.css');
    return { default: module.default };
  })
);

// 编辑器加载中占位组件
const EditorLoading = () => (
  <div style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f9f9f9', borderRadius: '4px' }}>
    <Spin tip="编辑器加载中..." />
  </div>
);

/**
 * 描述字段组件
 * 提供中英文双语Markdown编辑功能
 */
const DescriptionFields: React.FC<SectionProps> = ({ form }) => {
  // 状态管理
  const [isEditorReady, setIsEditorReady] = useState(false);
  
  // 使用自定义hook管理编辑器状态
  const {
    markdownRenderer,
    editorChineseRef,
    editorEnglishRef,
    styleRef,
    handleChineseEditorChange,
    handleEnglishEditorChange,
    handleImageUpload
  } = useMarkdownEditor({
    form,
    chineseFieldName: 'descriptionMarkdown',
    englishFieldName: 'descriptionMarkdownEn'
  });

  // 添加自定义样式
  useEffect(() => {
    // 插入自定义样式到head中
    const styleElement = document.createElement('style');
    styleElement.innerHTML = markdownEditorStyles + customEditorStyles;
    document.head.appendChild(styleElement);
    
    // 标记编辑器准备就绪
    setIsEditorReady(true);
    
    // 组件卸载时移除样式
    return () => {
      if (styleElement && document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);
  
  // 编辑器配置
  const editorConfig = React.useMemo(() => getEditorConfig(), []);
  
  return (
    <>
      <Form.Item
        name="descriptionMarkdown"
        label="中文描述 (Markdown)"
        rules={descriptionValidators}
      >
        <Suspense fallback={<EditorLoading />}>
          {isEditorReady && (
            <MdEditor
              ref={editorChineseRef}
              style={{ height: '300px' }}
              renderHTML={(text: string) => markdownRenderer.render(text)}
              onChange={handleChineseEditorChange}
              placeholder="请使用Markdown格式输入题目描述，支持图片、代码块等。可以直接粘贴图片！"
              config={editorConfig}
              onImageUpload={handleImageUpload}
            />
          )}
        </Suspense>
      </Form.Item>

      <Form.Item
        name="descriptionMarkdownEn"
        label="英文描述 (Markdown)"
      >
        <Suspense fallback={<EditorLoading />}>
          {isEditorReady && (
            <MdEditor
              ref={editorEnglishRef}
              style={{ height: '300px' }}
              renderHTML={(text: string) => markdownRenderer.render(text)}
              onChange={handleEnglishEditorChange}
              placeholder="请使用Markdown格式输入英文题目描述（可选），英文版将在用户切换语言时显示。可以直接粘贴图片！"
              config={editorConfig}
              onImageUpload={handleImageUpload}
            />
          )}
        </Suspense>
      </Form.Item>
    </>
  );
};

export default DescriptionFields; 