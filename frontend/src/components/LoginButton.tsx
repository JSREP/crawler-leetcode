import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from 'antd';
import { GithubOutlined } from '@ant-design/icons';

export const LoginButton: React.FC = () => {
  const { loginWithRedirect, isAuthenticated, logout, user } = useAuth0();

  if (isAuthenticated) {
    return (
      <Button 
        onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
        icon={<GithubOutlined />}
      >
        退出 ({user?.name})
      </Button>
    );
  }

  return (
    <Button 
      type="primary" 
      onClick={() => loginWithRedirect({
        authorizationParams: {
          connection: 'github'  // 指定使用GitHub登录
        }
      })}
      icon={<GithubOutlined />}
    >
      GitHub登录
    </Button>
  );
}; 