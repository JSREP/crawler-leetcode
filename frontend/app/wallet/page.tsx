'use client';

import React from 'react';
import { Card, Row, Col, Divider } from 'antd';
import { WalletOutlined, HistoryOutlined, BarChartOutlined, MessageOutlined } from '@ant-design/icons';
import WalletBalance from '@/components/wallet/WalletBalance';
import { useAuth } from '@/components/auth/AuthProvider';

const WalletPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="text-center py-12">
            <WalletOutlined className="text-6xl text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-600 mb-2">请先登录</h2>
            <p className="text-gray-500">登录后即可查看和管理您的钱包</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">我的钱包</h1>
          <p className="text-gray-600">管理您的 CRAWLER Coin 代币和交易记录</p>
        </div>

        <Row gutter={[24, 24]}>
          {/* 钱包余额 */}
          <Col xs={24} lg={12}>
            <WalletBalance />
          </Col>

          {/* 使用说明 */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <div className="flex items-center space-x-2">
                  <BarChartOutlined />
                  <span>代币经济说明</span>
                </div>
              }
            >
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">💰 获得代币</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 新用户注册赠送：1,000,000 CRAWLER</li>
                    <li>• 接收他人打赏</li>
                    <li>• 参与社区活动奖励</li>
                  </ul>
                </div>

                <Divider />

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">💸 消耗代币</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 发表帖子：1 CRAWLER</li>
                    <li>• 发表回复/评论：0.5 CRAWLER</li>
                    <li>• 购买存储空间：10 CRAWLER/MB</li>
                    <li>• 打赏其他用户</li>
                  </ul>
                </div>

                <Divider />

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">🎁 打赏功能</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 最小打赏：0.1 CRAWLER</li>
                    <li>• 最大打赏：1,000 CRAWLER</li>
                    <li>• 支持匿名打赏</li>
                    <li>• 区块链记录永久保存</li>
                  </ul>
                </div>

                <Divider />

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">🔐 安全保障</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 私钥加密存储</li>
                    <li>• 交易记录透明可查</li>
                    <li>• 余额实时同步</li>
                    <li>• 多重安全验证</li>
                  </ul>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 快速操作 */}
        <Row gutter={[24, 24]} className="mt-8">
          <Col xs={24}>
            <Card title="快速操作">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <MessageOutlined className="text-3xl text-blue-500 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">发表帖子</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    分享您的经验和见解
                  </p>
                  <a
                    href="/forum/create"
                    className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    立即发帖
                  </a>
                </div>

                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <HistoryOutlined className="text-3xl text-green-500 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">查看挑战</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    探索技术挑战并参与讨论
                  </p>
                  <a
                    href="/challenges"
                    className="inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  >
                    浏览挑战
                  </a>
                </div>

                <div className="text-center p-6 bg-purple-50 rounded-lg">
                  <WalletOutlined className="text-3xl text-purple-500 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">存储管理</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    管理您的文件和存储空间
                  </p>
                  <a
                    href="/storage"
                    className="inline-block px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                  >
                    管理存储
                  </a>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default WalletPage;
