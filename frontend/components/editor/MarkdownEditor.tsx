/**
 * Markdown编辑器组件 - 支持图片上传
 */

'use client';

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { message, Upload, Button, Progress } from 'antd';
import { PictureOutlined, LoadingOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

// 动态导入Markdown编辑器以避免SSR问题
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

interface MarkdownEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  height?: number;
  className?: string;
}

export default function MarkdownEditor({
  value = '',
  onChange,
  placeholder = '请输入内容...',
  height = 400,
  className = ''
}: MarkdownEditorProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // 处理图片上传
  const handleImageUpload = useCallback(async (file: File): Promise<string> => {
    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('purpose', 'post_image');

      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const response = await fetch('/api/forum/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      message.success('图片上传成功');
      
      return result.url;
    } catch (error) {
      console.error('Upload error:', error);
      message.error(error instanceof Error ? error.message : '图片上传失败');
      throw error;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, []);

  // 处理粘贴图片
  const handlePaste = useCallback(async (event: React.ClipboardEvent<HTMLDivElement>) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        event.preventDefault();
        const file = item.getAsFile();
        if (file) {
          try {
            const url = await handleImageUpload(file);
            const imageMarkdown = `![${file.name}](${url})`;
            
            // 插入到当前光标位置
            const textarea = document.querySelector('.w-md-editor-text-textarea') as HTMLTextAreaElement;
            if (textarea) {
              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;
              const newValue = value.substring(0, start) + imageMarkdown + value.substring(end);
              onChange?.(newValue);
            } else {
              onChange?.(value + '\n' + imageMarkdown);
            }
          } catch (error) {
            // 错误已在handleImageUpload中处理
          }
        }
        break;
      }
    }
  }, [value, onChange, handleImageUpload]);

  // 处理拖拽上传
  const handleDrop = useCallback(async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        try {
          const url = await handleImageUpload(file);
          const imageMarkdown = `![${file.name}](${url})`;
          onChange?.(value + '\n' + imageMarkdown);
        } catch (error) {
          // 错误已在handleImageUpload中处理
        }
        break;
      }
    }
  }, [value, onChange, handleImageUpload]);

  // Upload组件配置
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: 'image/*',
    showUploadList: false,
    beforeUpload: async (file) => {
      try {
        const url = await handleImageUpload(file);
        const imageMarkdown = `![${file.name}](${url})`;
        onChange?.(value + '\n' + imageMarkdown);
      } catch (error) {
        // 错误已在handleImageUpload中处理
      }
      return false; // 阻止默认上传
    },
  };

  return (
    <div className={`markdown-editor ${className}`}>
      {/* 上传进度 */}
      {uploading && (
        <div className="mb-4">
          <Progress 
            percent={uploadProgress} 
            status="active"
            format={() => '上传中...'}
          />
        </div>
      )}

      {/* 工具栏 */}
      <div className="mb-2 flex items-center space-x-2">
        <Upload {...uploadProps}>
          <Button 
            icon={uploading ? <LoadingOutlined /> : <PictureOutlined />}
            loading={uploading}
            size="small"
          >
            插入图片
          </Button>
        </Upload>
        <span className="text-sm text-gray-500">
          支持拖拽或粘贴图片上传
        </span>
      </div>

      {/* Markdown编辑器 */}
      <div 
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{ minHeight: height }}
      >
        <MDEditor
          value={value}
          onChange={(val) => onChange?.(val || '')}
          height={height}
          preview="edit"
          hideToolbar={false}
          visibleDragbar={false}
          textareaProps={{
            placeholder,
            style: {
              fontSize: 14,
              lineHeight: 1.6,
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            },
          }}
          data-color-mode="light"
        />
      </div>

      {/* 帮助提示 */}
      <div className="mt-2 text-xs text-gray-500">
        <div className="flex flex-wrap gap-4">
          <span>支持Markdown语法</span>
          <span>**粗体**</span>
          <span>*斜体*</span>
          <span>`代码`</span>
          <span>[链接](url)</span>
          <span>![图片](url)</span>
        </div>
      </div>
    </div>
  );
}
