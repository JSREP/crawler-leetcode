'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Layout, Menu, Button, Drawer, Space, Select } from 'antd';
import {
  MenuOutlined,
  HomeOutlined,
  TrophyOutlined,
  InfoCircleOutlined,
  GithubOutlined,
  PlusOutlined,
  StarOutlined,
  GlobalOutlined,
  MessageOutlined,
  WalletOutlined,
  CloudOutlined
} from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import GitHubLoginButton from '@/components/auth/GitHubLoginButton';
import UserProfile from '@/components/auth/UserProfile';


const { Header: AntHeader } = Layout;

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link href="/">首页</Link>,
    },
    {
      key: '/challenges',
      icon: <TrophyOutlined />,
      label: <Link href="/challenges">挑战列表</Link>,
    },
    {
      key: '/forum',
      icon: <MessageOutlined />,
      label: <Link href="/forum">讨论专区</Link>,
    },
    {
      key: '/wallet',
      icon: <WalletOutlined />,
      label: <Link href="/wallet">我的钱包</Link>,
    },
    {
      key: '/storage',
      icon: <CloudOutlined />,
      label: <Link href="/storage">存储管理</Link>,
    },
    {
      key: '/upload',
      icon: <PlusOutlined />,
      label: <Link href="/upload">文件上传</Link>,
    },
  ];

  const selectedKeys = [pathname];

  return (
    <AntHeader className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="container-responsive">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 relative">
              <Image
                src="/logo.png"
                alt="Web Crawler Challenge Platform"
                width={32}
                height={32}
                className="object-contain"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm text-gray-600">Web Crawler Challenge Platform</div>
              <div className="text-xl font-bold text-gray-900">Crawler LeetCode</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block flex-1 max-w-md">
            <Menu
              mode="horizontal"
              selectedKeys={selectedKeys}
              items={menuItems}
              className="border-none bg-transparent"
              overflowedIndicator={null}
              style={{ minWidth: '400px' }}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Contribute Button - 只有登录用户才显示 */}
            {isAuthenticated && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                className="hidden sm:flex"
              >
                贡献题目
              </Button>
            )}

            {/* Language Selector */}
            <Select
              defaultValue="zh"
              className="hidden sm:block w-20"
              size="small"
              suffixIcon={<GlobalOutlined />}
              options={[
                { value: 'zh', label: '中文' },
                { value: 'en', label: 'EN' }
              ]}
            />

            {/* GitHub Star Button */}
            <Button
              type="text"
              icon={<GithubOutlined />}
              href="https://github.com/JSREP/crawler-leetcode"
              target="_blank"
              className="hidden sm:flex items-center space-x-1"
            >
              <StarOutlined />
            </Button>

            {/* 认证相关UI */}
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <UserProfile />
                ) : (
                  <>
                    <GitHubLoginButton size="small" />
                    <Link href="/auth/config">
                      <Button
                        type="text"
                        size="small"
                        className="text-gray-500 hidden sm:inline-flex"
                      >
                        配置
                      </Button>
                    </Link>
                  </>
                )}
              </>
            )}

            {/* Mobile Menu Button */}
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden"
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <Drawer
        title="菜单"
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={280}
      >
        <div className="flex flex-col space-y-4">
          <Menu
            mode="vertical"
            selectedKeys={selectedKeys}
            items={menuItems}
            className="border-none"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          <div className="pt-4 border-t border-gray-200">
            <Space direction="vertical" className="w-full">
              {/* 认证相关UI */}
              {!isLoading && (
                <>
                  {isAuthenticated ? (
                    <div className="mb-4">
                      <UserProfile showDropdown={false} />
                    </div>
                  ) : (
                    <GitHubLoginButton block />
                  )}
                </>
              )}

              <Button
                type="text"
                icon={<GithubOutlined />}
                href="https://github.com/JSREP/crawler-leetcode"
                target="_blank"
                block
              >
                GitHub
              </Button>

              {/* 贡献题目按钮 - 只有登录用户才显示 */}
              {isAuthenticated && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  block
                >
                  贡献题目
                </Button>
              )}
            </Space>
          </div>
        </div>
      </Drawer>
    </AntHeader>
  );
}

export default Header;
