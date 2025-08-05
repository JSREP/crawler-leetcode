'use client';

import React, { useState, useRef } from 'react';
import { Button, message, Progress, Card, Image, Space, Typography } from 'antd';
import { UploadOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { PutBlobResult } from '@vercel/blob';

const { Text, Title } = Typography;

interface FileUploadProps {
  category?: string;
  fileType?: 'image' | 'document' | 'archive';
  maxSize?: number; // in MB
  onUploadSuccess?: (result: PutBlobResult & { filename: string; category: string }) => void;
  onUploadError?: (error: string) => void;
}

interface UploadResult extends PutBlobResult {
  filename: string;
  category: string;
  size: number;
  contentType: string;
  uploadedAt: string;
}

export default function FileUpload({
  category = 'general',
  fileType = 'image',
  maxSize = 4.5,
  onUploadSuccess,
  onUploadError
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadResult[]>([]);
  const inputFileRef = useRef<HTMLInputElement>(null);

  // 文件类型映射
  const fileTypeMap = {
    image: 'image/jpeg, image/png, image/webp, image/gif',
    document: '.pdf, .txt, .json',
    archive: '.zip, .tar'
  };

  const handleFileUpload = async (file: File) => {
    if (!file) {
      message.error('请选择文件');
      return;
    }

    // 检查文件大小
    if (file.size > maxSize * 1024 * 1024) {
      const errorMsg = `文件大小不能超过 ${maxSize}MB`;
      message.error(errorMsg);
      onUploadError?.(errorMsg);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
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

      const response = await fetch(
        `/api/upload?filename=${encodeURIComponent(file.name)}&category=${category}&type=${fileType}`,
        {
          method: 'POST',
          body: file,
        }
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result: UploadResult = await response.json();
      
      setUploadedFiles(prev => [...prev, result]);
      message.success('文件上传成功！');
      onUploadSuccess?.(result);

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '上传失败';
      message.error(errorMsg);
      onUploadError?.(errorMsg);
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (inputFileRef.current) {
        inputFileRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    message.success('文件已移除');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card title="文件上传" className="w-full">
      <Space direction="vertical" className="w-full" size="large">
        {/* 上传区域 */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
          <input
            ref={inputFileRef}
            type="file"
            accept={fileTypeMap[fileType]}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleFileUpload(file);
              }
            }}
            className="hidden"
          />
          
          <div className="space-y-4">
            <UploadOutlined className="text-4xl text-gray-400" />
            <div>
              <Title level={4} className="mb-2">选择文件上传</Title>
              <Text type="secondary">
                支持 {fileTypeMap[fileType]}，最大 {maxSize}MB
              </Text>
            </div>
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={() => inputFileRef.current?.click()}
              loading={uploading}
              disabled={uploading}
            >
              {uploading ? '上传中...' : '选择文件'}
            </Button>
          </div>
        </div>

        {/* 上传进度 */}
        {uploading && (
          <div className="space-y-2">
            <Text>上传进度:</Text>
            <Progress percent={uploadProgress} status="active" />
          </div>
        )}

        {/* 已上传文件列表 */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-4">
            <Title level={5}>已上传文件</Title>
            <div className="space-y-3">
              {uploadedFiles.map((file, index) => (
                <Card key={index} size="small" className="bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {file.contentType.startsWith('image/') && (
                        <Image
                          src={file.url}
                          alt={file.filename}
                          width={40}
                          height={40}
                          className="rounded object-cover"
                          preview={{
                            mask: <EyeOutlined />
                          }}
                        />
                      )}
                      <div>
                        <Text strong>{file.filename}</Text>
                        <br />
                        <Text type="secondary" className="text-xs">
                          {formatFileSize(file.size)} • {file.contentType}
                        </Text>
                      </div>
                    </div>
                    
                    <Space>
                      <Button
                        type="link"
                        icon={<EyeOutlined />}
                        href={file.url}
                        target="_blank"
                        size="small"
                      >
                        查看
                      </Button>
                      <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveFile(index)}
                        size="small"
                      >
                        移除
                      </Button>
                    </Space>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </Space>
    </Card>
  );
}
