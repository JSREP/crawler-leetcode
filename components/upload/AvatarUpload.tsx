'use client';

import React, { useState, useRef } from 'react';
import { Button, message, Avatar, Card, Space, Typography } from 'antd';
import { UploadOutlined, UserOutlined } from '@ant-design/icons';
import type { PutBlobResult } from '@vercel/blob';

const { Text, Title } = Typography;

interface AvatarUploadProps {
  onUploadSuccess?: (result: PutBlobResult) => void;
  onUploadError?: (error: string) => void;
  defaultAvatar?: string;
}

export default function AvatarUpload({
  onUploadSuccess,
  onUploadError,
  defaultAvatar
}: AvatarUploadProps) {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [blob, setBlob] = useState<PutBlobResult | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!inputFileRef.current?.files) {
      message.error('请选择文件');
      return;
    }

    const file = inputFileRef.current.files[0];
    
    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      const errorMsg = '只支持 JPEG、PNG 和 WebP 格式的图片';
      message.error(errorMsg);
      onUploadError?.(errorMsg);
      return;
    }

    // 验证文件大小 (4.5MB)
    const maxSize = 4.5 * 1024 * 1024;
    if (file.size > maxSize) {
      const errorMsg = '文件大小不能超过 4.5MB';
      message.error(errorMsg);
      onUploadError?.(errorMsg);
      return;
    }

    setUploading(true);

    try {
      const response = await fetch(
        `/api/avatar/upload?filename=${encodeURIComponent(file.name)}`,
        {
          method: 'POST',
          body: file,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const newBlob = (await response.json()) as PutBlobResult;
      
      setBlob(newBlob);
      message.success('头像上传成功！');
      onUploadSuccess?.(newBlob);

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '上传失败';
      message.error(errorMsg);
      onUploadError?.(errorMsg);
      console.error('Avatar upload error:', error);
    } finally {
      setUploading(false);
      if (inputFileRef.current) {
        inputFileRef.current.value = '';
      }
    }
  };

  const currentAvatarUrl = blob?.url || defaultAvatar;

  return (
    <Card title="上传头像" className="w-full max-w-md">
      <Space direction="vertical" className="w-full" size="large" align="center">
        {/* 头像预览 */}
        <div className="text-center">
          <Avatar
            size={120}
            src={currentAvatarUrl}
            icon={!currentAvatarUrl && <UserOutlined />}
            className="mb-4"
          />
          {currentAvatarUrl && (
            <div>
              <Text type="secondary" className="text-sm">
                当前头像
              </Text>
            </div>
          )}
        </div>

        {/* 上传表单 */}
        <form onSubmit={handleSubmit} className="w-full">
          <Space direction="vertical" className="w-full" size="middle">
            <div>
              <input
                name="file"
                ref={inputFileRef}
                type="file"
                accept="image/jpeg, image/png, image/webp"
                required
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  cursor-pointer"
              />
            </div>
            
            <Button
              type="primary"
              htmlType="submit"
              icon={<UploadOutlined />}
              loading={uploading}
              disabled={uploading}
              block
            >
              {uploading ? '上传中...' : '上传头像'}
            </Button>
          </Space>
        </form>

        {/* 上传结果 */}
        {blob && (
          <div className="w-full p-3 bg-green-50 rounded-lg border border-green-200">
            <Text type="success" className="text-sm">
              ✅ 上传成功！
            </Text>
            <br />
            <Text className="text-xs text-gray-600 break-all">
              URL: {blob.url}
            </Text>
          </div>
        )}

        {/* 使用说明 */}
        <div className="text-center text-xs text-gray-500">
          <Text type="secondary">
            支持 JPEG、PNG、WebP 格式<br />
            文件大小不超过 4.5MB
          </Text>
        </div>
      </Space>
    </Card>
  );
}
