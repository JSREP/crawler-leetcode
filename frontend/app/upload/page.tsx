'use client';

import React, { useState } from 'react';
import { Row, Col, Card, Tabs, Typography, Space, Alert, Button } from 'antd';
import { InfoCircleOutlined, CloudUploadOutlined } from '@ant-design/icons';
import FileUpload from '@/components/upload/FileUpload';
import AvatarUpload from '@/components/upload/AvatarUpload';
// import type { PutBlobResult } from '@vercel/blob';

const { Title, Paragraph, Text } = Typography;

export default function UploadPage() {
  const [uploadResults, setUploadResults] = useState<unknown[]>([]);

  const handleUploadSuccess = (result: unknown) => {
    setUploadResults(prev => [...prev, result]);
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <Title level={1} className="mb-4">
            <CloudUploadOutlined className="mr-3" />
            文件上传演示
          </Title>
          <Paragraph className="text-lg text-gray-600">
            基于 Vercel Blob Store 的文件上传功能演示
          </Paragraph>
        </div>

        {/* 功能说明 */}
        <Alert
          message="功能说明"
          description={
            <div>
              <p>• 支持多种文件类型：图片、文档、压缩包</p>
              <p>• 文件大小限制：4.5MB（服务器上传限制）</p>
              <p>• 自动生成唯一文件名，避免冲突</p>
              <p>• 文件存储在 Vercel Blob Store，全球CDN加速</p>
            </div>
          }
          type="info"
          icon={<InfoCircleOutlined />}
          className="mb-8"
        />

        {/* 上传组件演示 */}
        <Tabs
          defaultActiveKey="general"
          size="large"
          items={[
            {
              key: 'general',
              label: '通用文件上传',
              children: (
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <FileUpload
                  category="demo"
                  fileType="image"
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={handleUploadError}
                />
              </Col>
              <Col xs={24} lg={12}>
                <Card title="上传说明" className="h-full">
                  <Space direction="vertical" size="middle">
                    <div>
                      <Text strong>支持的图片格式：</Text>
                      <br />
                      <Text type="secondary">JPEG, PNG, WebP, GIF</Text>
                    </div>
                    <div>
                      <Text strong>文件大小限制：</Text>
                      <br />
                      <Text type="secondary">最大 4.5MB</Text>
                    </div>
                    <div>
                      <Text strong>存储位置：</Text>
                      <br />
                      <Text type="secondary">Vercel Blob Store</Text>
                    </div>
                    <div>
                      <Text strong>访问权限：</Text>
                      <br />
                      <Text type="secondary">公开访问，全球CDN</Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>
              )
            },
            {
              key: 'avatar',
              label: '头像上传',
              children: (
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <AvatarUpload
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={handleUploadError}
                />
              </Col>
              <Col xs={24} lg={12}>
                <Card title="头像上传说明" className="h-full">
                  <Space direction="vertical" size="middle">
                    <div>
                      <Text strong>专为头像优化：</Text>
                      <br />
                      <Text type="secondary">自动存储到 avatars/ 目录</Text>
                    </div>
                    <div>
                      <Text strong>支持格式：</Text>
                      <br />
                      <Text type="secondary">JPEG, PNG, WebP</Text>
                    </div>
                    <div>
                      <Text strong>实时预览：</Text>
                      <br />
                      <Text type="secondary">上传后立即显示新头像</Text>
                    </div>
                    <div>
                      <Text strong>基于官方示例：</Text>
                      <br />
                      <Text type="secondary">遵循 Vercel 最佳实践</Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>
              )
            },
            {
              key: 'document',
              label: '文档上传',
              children: (
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <FileUpload
                  category="documents"
                  fileType="document"
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={handleUploadError}
                />
              </Col>
              <Col xs={24} lg={12}>
                <Card title="文档上传说明" className="h-full">
                  <Space direction="vertical" size="middle">
                    <div>
                      <Text strong>支持的文档格式：</Text>
                      <br />
                      <Text type="secondary">PDF, TXT, JSON</Text>
                    </div>
                    <div>
                      <Text strong>存储分类：</Text>
                      <br />
                      <Text type="secondary">自动分类到 documents/ 目录</Text>
                    </div>
                    <div>
                      <Text strong>用途示例：</Text>
                      <br />
                      <Text type="secondary">用户手册、配置文件、数据导入</Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>
              )
            }
          ]}
        />

        {/* 上传结果展示 */}
        {uploadResults.length > 0 && (
          <Card title="上传历史" className="mt-8">
            <div className="space-y-3">
              {uploadResults.map((result, index) => {
                const uploadResult = result as { filename: string; category: string; contentType: string; url: string };
                return (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <Text strong>{uploadResult.filename}</Text>
                      <br />
                      <Text type="secondary" className="text-sm">
                        {uploadResult.category} • {uploadResult.contentType}
                      </Text>
                    </div>
                    <Button
                      type="link"
                      href={uploadResult.url}
                      target="_blank"
                      size="small"
                    >
                      查看
                    </Button>
                  </div>
                </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
