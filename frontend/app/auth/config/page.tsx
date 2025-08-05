'use client';

import React from 'react';
import { Card, Alert, Typography, Steps, Button, Space, Divider } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Paragraph, Text, Link: AntLink } = Typography;

export default function AuthConfigPage() {
  // 模拟配置检查（在实际应用中，这些信息应该从API获取）
  const configStatus = {
    githubClientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || 'your-github-client-id',
    hasValidConfig: false, // 这里应该是实际的验证结果
  };

  const isConfigured = !configStatus.githubClientId.startsWith('your-');

  const steps = [
    {
      title: '创建GitHub OAuth应用',
      description: '在GitHub Developer Settings中创建新的OAuth应用',
      status: 'process' as 'process',
    },
    {
      title: '配置环境变量',
      description: '将Client ID和Secret添加到.env.local文件',
      status: isConfigured ? ('finish' as 'finish') : ('wait' as 'wait'),
    },
    {
      title: '重启开发服务器',
      description: '重启服务器以加载新的环境变量',
      status: isConfigured ? ('finish' as 'finish') : ('wait' as 'wait'),
    },
    {
      title: '测试GitHub登录',
      description: '验证GitHub OAuth登录功能是否正常工作',
      status: isConfigured ? ('finish' as 'finish') : ('wait' as 'wait'),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Title level={1}>GitHub OAuth 配置状态</Title>
          <Paragraph>
            检查和配置GitHub OAuth认证系统的状态
          </Paragraph>
        </div>

        {/* 配置状态卡片 */}
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <Title level={3} className="mb-2">当前配置状态</Title>
              <Space direction="vertical" size="small">
                <div className="flex items-center space-x-2">
                  <Text strong>GitHub Client ID:</Text>
                  <Text code>{configStatus.githubClientId}</Text>
                  {isConfigured ? (
                    <CheckCircleOutlined className="text-green-500" />
                  ) : (
                    <ExclamationCircleOutlined className="text-orange-500" />
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Text strong>配置状态:</Text>
                  {isConfigured ? (
                    <Text type="success">已配置</Text>
                  ) : (
                    <Text type="warning">需要配置</Text>
                  )}
                </div>
              </Space>
            </div>
            <div>
              {isConfigured ? (
                <Alert
                  message="配置完成"
                  description="GitHub OAuth已正确配置"
                  type="success"
                  showIcon
                />
              ) : (
                <Alert
                  message="需要配置"
                  description="请按照下面的步骤配置GitHub OAuth"
                  type="warning"
                  showIcon
                />
              )}
            </div>
          </div>
        </Card>

        {/* 配置步骤 */}
        <Card title="配置步骤" className="mb-6">
          <Steps
            direction="vertical"
            current={isConfigured ? 4 : 0}
            items={steps}
          />
        </Card>

        {/* 详细配置指南 */}
        <Card title="详细配置指南" className="mb-6">
          <div className="space-y-6">
            <div>
              <Title level={4}>1. 创建GitHub OAuth应用</Title>
              <Paragraph>
                <ol className="list-decimal list-inside space-y-2">
                  <li>访问 <AntLink href="https://github.com/settings/developers" target="_blank">GitHub Developer Settings</AntLink></li>
                  <li>点击 "OAuth Apps" 标签</li>
                  <li>点击 "New OAuth App" 按钮</li>
                  <li>填写应用信息：
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                      <li><Text strong>Application name:</Text> Crawler LeetCode Platform (Dev)</li>
                      <li><Text strong>Homepage URL:</Text> <Text code>http://localhost:61395</Text></li>
                      <li><Text strong>Application description:</Text> 爬虫技术挑战平台 - 开发环境</li>
                      <li><Text strong>Authorization callback URL:</Text> <Text code>http://localhost:61395/api/auth/github/callback</Text></li>
                    </ul>
                  </li>
                  <li>点击 "Register application"</li>
                </ol>
              </Paragraph>
            </div>

            <Divider />

            <div>
              <Title level={4}>2. 获取Client ID和Secret</Title>
              <Paragraph>
                创建应用后，您会看到：
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li><Text strong>Client ID:</Text> 类似 <Text code>Ov23liAbCdEfGhIjKlMn</Text></li>
                  <li><Text strong>Client Secret:</Text> 点击 "Generate a new client secret" 生成</li>
                </ul>
              </Paragraph>
            </div>

            <Divider />

            <div>
              <Title level={4}>3. 更新环境变量</Title>
              <Paragraph>
                将获取到的信息更新到 <Text code>.env.local</Text> 文件中：
              </Paragraph>
              <div className="bg-gray-100 p-4 rounded-lg">
                <Text code>
                  {`# GitHub OAuth 认证配置
GITHUB_CLIENT_ID=你的实际Client_ID
GITHUB_CLIENT_SECRET=你的实际Client_Secret
NEXTAUTH_SECRET=一个随机的长字符串作为JWT密钥`}
                </Text>
              </div>
            </div>

            <Divider />

            <div>
              <Title level={4}>4. 重启开发服务器</Title>
              <Paragraph>
                更新环境变量后，需要重启开发服务器：
              </Paragraph>
              <div className="bg-gray-100 p-4 rounded-lg">
                <Text code>npm run dev</Text>
              </div>
            </div>
          </div>
        </Card>

        {/* 操作按钮 */}
        <Card>
          <Space>
            <Link href="/">
              <Button type="primary">返回首页</Button>
            </Link>
            <Button 
              href="https://github.com/settings/developers" 
              target="_blank"
              icon={<InfoCircleOutlined />}
            >
              GitHub Developer Settings
            </Button>
            {isConfigured && (
              <Link href="/api/auth/github">
                <Button type="default">测试GitHub登录</Button>
              </Link>
            )}
          </Space>
        </Card>
      </div>
    </div>
  );
}
