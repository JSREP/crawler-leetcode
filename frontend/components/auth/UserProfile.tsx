'use client';

import React from 'react';
import { Avatar, Dropdown, Space, Typography, Button, Tag } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  GithubOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  CrownOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useAuth } from './AuthProvider';
import { USER_ROLES } from '@/types/auth';

const { Text } = Typography;

interface UserProfileProps {
  showDropdown?: boolean;
  size?: 'small' | 'default' | 'large';
  className?: string;
}

export function UserProfile({
  showDropdown = true,
  size = 'default',
  className = ''
}: UserProfileProps) {
  const { user, logout, isAuthenticated, isLoading } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  // 获取角色显示信息
  const getRoleInfo = () => {
    if (user.role === USER_ROLES.ADMIN) {
      return {
        label: '管理员',
        color: 'gold',
        icon: <CrownOutlined />,
      };
    }
    return {
      label: '用户',
      color: 'blue',
      icon: <SafetyOutlined />,
    };
  };

  const roleInfo = getRoleInfo();

  const handleLogout = async () => {
    await logout();
  };

  const handleViewProfile = () => {
    if (user.username) {
      window.open(`https://github.com/${user.username}`, '_blank');
    }
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'profile-info',
      label: (
        <div className="px-2 py-1">
          <div className="flex items-center space-x-3">
            <Avatar 
              src={user.avatar_url} 
              size={40}
              icon={<UserOutlined />}
            />
            <div>
              <div className="font-medium text-gray-900">
                {user.name || user.username}
              </div>
              <div className="text-sm text-gray-500">
                @{user.username}
              </div>
              {user.email && (
                <div className="text-xs text-gray-400">
                  {user.email}
                </div>
              )}
              <div className="mt-1">
                <Tag
                  color={roleInfo.color}
                  icon={roleInfo.icon}
                >
                  {roleInfo.label}
                </Tag>
              </div>
            </div>
          </div>
          {user.bio && (
            <div className="mt-2 text-sm text-gray-600">
              {user.bio}
            </div>
          )}
          {(user.location || user.company) && (
            <div className="mt-2 space-y-1">
              {user.location && (
                <div className="flex items-center text-xs text-gray-500">
                  <EnvironmentOutlined className="mr-1" />
                  {user.location}
                </div>
              )}
              {user.company && (
                <div className="flex items-center text-xs text-gray-500">
                  <TeamOutlined className="mr-1" />
                  {user.company}
                </div>
              )}
            </div>
          )}
          <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
            <span>{user.public_repos} 仓库</span>
            <span>{user.followers} 关注者</span>
            <span>{user.following} 关注</span>
          </div>
        </div>
      ),
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'view-github',
      label: (
        <Space>
          <GithubOutlined />
          查看 GitHub 资料
        </Space>
      ),
      onClick: handleViewProfile,
    },
    {
      key: 'settings',
      label: (
        <Space>
          <SettingOutlined />
          设置
        </Space>
      ),
      disabled: true, // 暂时禁用，后续可以添加设置页面
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: (
        <Space>
          <LogoutOutlined />
          退出登录
        </Space>
      ),
      onClick: handleLogout,
    },
  ];

  if (!showDropdown) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Avatar 
          src={user.avatar_url} 
          size={size === 'small' ? 24 : size === 'large' ? 40 : 32}
          icon={<UserOutlined />}
        />
        <div className="hidden sm:block">
          <Text strong>{user.name || user.username}</Text>
        </div>
      </div>
    );
  }

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={['click']}
      placement="bottomRight"
      className={className}
    >
      <Button 
        type="text" 
        className="flex items-center space-x-2 h-auto p-1"
        loading={isLoading}
      >
        <Avatar 
          src={user.avatar_url} 
          size={size === 'small' ? 24 : size === 'large' ? 40 : 32}
          icon={<UserOutlined />}
        />
        <div className="hidden sm:block text-left">
          <div className="text-sm font-medium text-gray-900 flex items-center space-x-1">
            <span>{user.name || user.username}</span>
            {user.role === USER_ROLES.ADMIN && (
              <CrownOutlined className="text-yellow-500 text-xs" title="管理员" />
            )}
          </div>
          <div className="text-xs text-gray-500">
            @{user.username}
          </div>
        </div>
      </Button>
    </Dropdown>
  );
}

export default UserProfile;
