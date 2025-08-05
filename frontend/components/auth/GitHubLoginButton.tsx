'use client';

import React from 'react';
import { Button } from 'antd';
import { GithubOutlined } from '@ant-design/icons';
import { useAuth } from './AuthProvider';

interface GitHubLoginButtonProps {
  size?: 'small' | 'middle' | 'large';
  type?: 'default' | 'primary' | 'dashed' | 'link' | 'text';
  block?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function GitHubLoginButton({
  size = 'middle',
  type = 'default',
  block = false,
  className = '',
  children,
}: GitHubLoginButtonProps) {
  const { login, isLoading } = useAuth();

  const handleLogin = () => {
    login();
  };

  return (
    <Button
      type={type}
      size={size}
      block={block}
      icon={<GithubOutlined />}
      loading={isLoading}
      onClick={handleLogin}
      className={`github-login-button ${className}`}
    >
      {children || 'GitHub 登录'}
    </Button>
  );
}

export default GitHubLoginButton;
