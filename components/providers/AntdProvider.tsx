'use client';

import React from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

interface AntdProviderProps {
  children: React.ReactNode;
}

export function AntdProvider({ children }: AntdProviderProps) {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#3b82f6',
          colorSuccess: '#10b981',
          colorWarning: '#f59e0b',
          colorError: '#ef4444',
          colorInfo: '#3b82f6',
          borderRadius: 8,
          wireframe: false,
        },
        components: {
          Button: {
            borderRadius: 8,
            controlHeight: 40,
          },
          Input: {
            borderRadius: 8,
            controlHeight: 40,
          },
          Card: {
            borderRadius: 12,
          },
          Menu: {
            borderRadius: 8,
          },
          Pagination: {
            borderRadius: 8,
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}

export default AntdProvider;
