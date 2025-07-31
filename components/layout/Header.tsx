'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Layout, Menu, Button, Drawer, Space } from 'antd';
import {
  MenuOutlined,
  HomeOutlined,
  TrophyOutlined,
  InfoCircleOutlined,
  GithubOutlined,
  PlusOutlined
} from '@ant-design/icons';


const { Header: AntHeader } = Layout;

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      key: '/upload',
      icon: <PlusOutlined />,
      label: <Link href="/upload">文件上传</Link>,
    },
    {
      key: '/about',
      icon: <InfoCircleOutlined />,
      label: <Link href="/about">关于</Link>,
    },
  ];

  const selectedKeys = [pathname];

  return (
    <AntHeader className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="container-responsive">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 relative">
              <Image
                src="/logo.png"
                alt="爬虫挑战平台 Logo"
                width={32}
                height={32}
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">
              爬虫挑战平台
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <Menu
              mode="horizontal"
              selectedKeys={selectedKeys}
              items={menuItems}
              className="border-none bg-transparent"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* GitHub Link */}
            <Button
              type="text"
              icon={<GithubOutlined />}
              href="https://github.com/JSREP/crawler-leetcode"
              target="_blank"
              className="hidden sm:flex"
            >
              GitHub
            </Button>

            {/* Contribute Button */}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="hidden sm:flex"
            >
              贡献题目
            </Button>

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
              <Button
                type="text"
                icon={<GithubOutlined />}
                href="https://github.com/JSREP/crawler-leetcode"
                target="_blank"
                block
              >
                GitHub
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                block
              >
                贡献题目
              </Button>
            </Space>
          </div>
        </div>
      </Drawer>
    </AntHeader>
  );
}

export default Header;
