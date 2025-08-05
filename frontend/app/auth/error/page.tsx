'use client';

import React from 'react';
import { Result, Button, Typography } from 'antd';
import { ExclamationCircleOutlined, HomeOutlined, ReloadOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const { Paragraph, Text } = Typography;

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const description = searchParams.get('description');

  const getErrorInfo = (errorCode: string | null) => {
    switch (errorCode) {
      case 'no_code':
        return {
          title: '授权失败',
          subtitle: '未收到GitHub授权码',
          description: '在GitHub授权过程中出现问题，请重试。',
        };
      case 'callback_error':
        return {
          title: '登录失败',
          subtitle: 'GitHub OAuth回调处理失败',
          description: '处理GitHub登录回调时出现错误，请重试。',
        };
      case 'access_denied':
        return {
          title: '授权被拒绝',
          subtitle: '您拒绝了GitHub授权',
          description: '要使用GitHub登录功能，需要授权访问您的GitHub账户信息。',
        };
      default:
        return {
          title: '认证错误',
          subtitle: '登录过程中出现未知错误',
          description: '请稍后重试，如果问题持续存在，请联系技术支持。',
        };
    }
  };

  const errorInfo = getErrorInfo(error);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Result
          status="error"
          icon={<ExclamationCircleOutlined className="text-red-500" />}
          title={errorInfo.title}
          subTitle={errorInfo.subtitle}
          extra={[
            <div key="description" className="mb-6">
              <Paragraph className="text-gray-600 text-center">
                {errorInfo.description}
              </Paragraph>
              {description && (
                <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                  <Text code className="text-sm">
                    错误详情: {description}
                  </Text>
                </div>
              )}
            </div>,
            <div key="actions" className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                type="primary" 
                icon={<ReloadOutlined />}
                onClick={() => window.location.href = '/api/auth/github'}
              >
                重新登录
              </Button>
              <Link href="/">
                <Button icon={<HomeOutlined />}>
                  返回首页
                </Button>
              </Link>
            </div>
          ]}
        />
      </div>
    </div>
  );
}
