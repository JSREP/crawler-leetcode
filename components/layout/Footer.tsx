'use client';

import React from 'react';
import Link from 'next/link';
import { Layout, Space, Divider } from 'antd';
import { 
  GithubOutlined, 
  HeartFilled,
  MailOutlined,
  GlobalOutlined
} from '@ant-design/icons';

const { Footer: AntFooter } = Layout;

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <AntFooter className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="container-responsive">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8">
          {/* 项目信息 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              爬虫技术挑战平台
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              突破各种网站反爬机制，掌握先进爬虫技术，提升数据采集能力，成为爬虫工程师的不二之选。
            </p>
            <div className="mt-4">
              <Space>
                <Link 
                  href="https://github.com/JSREP/crawler-leetcode"
                  target="_blank"
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <GithubOutlined className="text-lg" />
                </Link>
                <Link 
                  href="mailto:contact@example.com"
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <MailOutlined className="text-lg" />
                </Link>
                <Link 
                  href="https://jsrep.github.io"
                  target="_blank"
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <GlobalOutlined className="text-lg" />
                </Link>
              </Space>
            </div>
          </div>

          {/* 快速链接 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              快速链接
            </h3>
            <div className="space-y-2">
              <div>
                <Link 
                  href="/challenges"
                  className="text-gray-600 hover:text-blue-600 transition-colors text-sm"
                >
                  挑战列表
                </Link>
              </div>
              <div>
                <Link 
                  href="/about"
                  className="text-gray-600 hover:text-blue-600 transition-colors text-sm"
                >
                  关于我们
                </Link>
              </div>
              <div>
                <Link 
                  href="/contribute"
                  className="text-gray-600 hover:text-blue-600 transition-colors text-sm"
                >
                  贡献题目
                </Link>
              </div>
              <div>
                <Link 
                  href="/api/db/test"
                  target="_blank"
                  className="text-gray-600 hover:text-blue-600 transition-colors text-sm"
                >
                  API 状态
                </Link>
              </div>
            </div>
          </div>

          {/* 技术栈 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              技术栈
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div>前端: Next.js + TypeScript</div>
              <div>UI: Ant Design + Tailwind CSS</div>
              <div>数据库: Neon Postgres</div>
              <div>部署: Vercel</div>
              <div>版本控制: Git + GitHub</div>
            </div>
          </div>
        </div>

        <Divider className="my-6" />

        {/* 版权信息 */}
        <div className="flex flex-col sm:flex-row justify-between items-center py-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <span>© {currentYear} JSREP. Made with</span>
            <HeartFilled className="text-red-500" />
            <span>for the community.</span>
          </div>
          
          <div className="mt-2 sm:mt-0">
            <Space split={<span className="text-gray-300">|</span>}>
              <Link 
                href="/privacy"
                className="hover:text-gray-700 transition-colors"
              >
                隐私政策
              </Link>
              <Link 
                href="/terms"
                className="hover:text-gray-700 transition-colors"
              >
                使用条款
              </Link>
              <Link 
                href="/license"
                className="hover:text-gray-700 transition-colors"
              >
                开源协议
              </Link>
            </Space>
          </div>
        </div>
      </div>
    </AntFooter>
  );
}
