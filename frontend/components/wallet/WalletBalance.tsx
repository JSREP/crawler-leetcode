'use client';

import React, { useState, useEffect } from 'react';
import { Card, Statistic, Button, Modal, List, Avatar, Tag, Space, Spin, message } from 'antd';
import { WalletOutlined, HistoryOutlined, GiftOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useAuth } from '@/components/auth/AuthProvider';
import { formatBalance } from '@/lib/wallet/utils';
import { WalletInfo, TokenTransaction, WalletStats } from '@/types/wallet';

const WalletBalance: React.FC = () => {
  const { user } = useAuth();
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [walletStats, setWalletStats] = useState<WalletStats | null>(null);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);

  // 加载钱包信息
  const loadWalletInfo = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch('/api/wallet?action=info');
      if (response.ok) {
        const data = await response.json();
        setWalletInfo(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || '加载钱包信息失败';
        console.error('Wallet API error:', errorMessage);

        // 如果是钱包不存在，尝试创建钱包
        if (response.status === 400 && errorMessage.includes('wallet')) {
          try {
            const createResponse = await fetch('/api/wallet', { method: 'POST' });
            if (createResponse.ok) {
              message.success('钱包创建成功');
              // 重新加载钱包信息
              setTimeout(() => loadWalletInfo(), 1000);
              return;
            }
          } catch (createError) {
            console.error('Create wallet error:', createError);
          }
        }

        message.error(errorMessage);
      }
    } catch (error) {
      console.error('Load wallet info error:', error);
      message.error('网络错误，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  // 加载钱包统计
  const loadWalletStats = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/wallet?action=stats');
      if (response.ok) {
        const data = await response.json();
        setWalletStats(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Load wallet stats error:', errorData.error || 'Unknown error');
        // 统计信息加载失败不显示错误消息，因为不是关键功能
      }
    } catch (error) {
      console.error('Load wallet stats error:', error);
      // 网络错误也不显示消息，避免过多干扰
    }
  };

  // 加载交易历史
  const loadTransactions = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/wallet?action=transactions&page=1&per_page=10');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Load transactions error:', errorData.error || 'Unknown error');
        message.error('加载交易记录失败');
      }
    } catch (error) {
      console.error('Load transactions error:', error);
      message.error('网络错误，无法加载交易记录');
    }
  };

  // 格式化交易类型
  const formatTransactionType = (type: string) => {
    const typeMap: { [key: string]: { label: string; color: string } } = {
      initial_grant: { label: '初始赠送', color: 'green' },
      post_cost: { label: '发帖消耗', color: 'red' },
      reply_cost: { label: '回复消耗', color: 'orange' },
      tip: { label: '打赏', color: 'blue' },
      purchase_storage: { label: '购买存储', color: 'purple' },
      transfer: { label: '转账', color: 'cyan' },
    };

    return typeMap[type] || { label: type, color: 'default' };
  };

  // 格式化时间
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString();
  };

  useEffect(() => {
    if (user) {
      loadWalletInfo();
      loadWalletStats();
    }
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <>
      <Card
        title={
          <Space>
            <WalletOutlined />
            钱包余额
          </Space>
        }
        extra={
          <Space>
            <Button
              type="text"
              icon={<HistoryOutlined />}
              onClick={() => {
                loadTransactions();
                setHistoryVisible(true);
              }}
            >
              交易记录
            </Button>
            <Button
              type="text"
              icon={<WalletOutlined />}
              onClick={() => {
                setStatsVisible(true);
              }}
            >
              统计信息
            </Button>
          </Space>
        }
        className="mb-4"
      >
        <Spin spinning={loading}>
          {walletInfo ? (
            <div className="space-y-4">
              <Statistic
                title="CRAWLER Coin 余额"
                value={walletInfo.balance_formatted}
                suffix="CRAWLER"
                valueStyle={{ color: '#1890ff', fontSize: '24px', fontWeight: 'bold' }}
              />
              
              <div className="text-sm text-gray-500">
                钱包地址: {walletInfo.wallet_address.slice(0, 6)}...{walletInfo.wallet_address.slice(-4)}
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center p-3 bg-green-50 rounded">
                  <div className="text-green-600 font-semibold">发帖费用</div>
                  <div className="text-sm text-gray-600">1 CRAWLER</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded">
                  <div className="text-blue-600 font-semibold">回复费用</div>
                  <div className="text-sm text-gray-600">0.5 CRAWLER</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">钱包未初始化</div>
              <Button type="primary" onClick={loadWalletInfo}>
                初始化钱包
              </Button>
            </div>
          )}
        </Spin>
      </Card>

      {/* 交易记录弹窗 */}
      <Modal
        title="交易记录"
        open={historyVisible}
        onCancel={() => setHistoryVisible(false)}
        footer={null}
        width={800}
      >
        <List
          dataSource={transactions}
          renderItem={(transaction) => {
            const typeInfo = formatTransactionType(transaction.transaction_type);
            const isIncoming = transaction.to_user_id === user?.id;
            
            return (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Avatar
                      style={{
                        backgroundColor: isIncoming ? '#52c41a' : '#f5222d',
                      }}
                    >
                      {isIncoming ? '+' : '-'}
                    </Avatar>
                  }
                  title={
                    <Space>
                      <span>{transaction.description || typeInfo.label}</span>
                      <Tag color={typeInfo.color}>{typeInfo.label}</Tag>
                    </Space>
                  }
                  description={
                    <div className="space-y-1">
                      <div>
                        金额: {isIncoming ? '+' : '-'}{formatBalance(transaction.amount)} CRAWLER
                      </div>
                      <div className="text-xs text-gray-500">
                        时间: {formatTime(transaction.created_at)}
                      </div>
                      {transaction.blockchain_tx_hash && (
                        <div className="text-xs text-gray-500">
                          交易哈希: {transaction.blockchain_tx_hash.slice(0, 10)}...
                        </div>
                      )}
                    </div>
                  }
                />
              </List.Item>
            );
          }}
        />
      </Modal>

      {/* 统计信息弹窗 */}
      <Modal
        title="钱包统计"
        open={statsVisible}
        onCancel={() => setStatsVisible(false)}
        footer={null}
        width={600}
      >
        {walletStats && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Statistic
                title="总收入"
                value={formatBalance(walletStats.total_earned)}
                suffix="CRAWLER"
                valueStyle={{ color: '#52c41a' }}
              />
              <Statistic
                title="总支出"
                value={formatBalance(walletStats.total_spent)}
                suffix="CRAWLER"
                valueStyle={{ color: '#f5222d' }}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Statistic
                title="收到打赏"
                value={formatBalance(walletStats.total_tips_received)}
                suffix="CRAWLER"
                valueStyle={{ color: '#1890ff' }}
              />
              <Statistic
                title="发出打赏"
                value={formatBalance(walletStats.total_tips_sent)}
                suffix="CRAWLER"
                valueStyle={{ color: '#fa8c16' }}
              />
            </div>
            
            <Statistic
              title="交易次数"
              value={walletStats.transaction_count}
              suffix="次"
            />
          </div>
        )}
      </Modal>
    </>
  );
};

export default WalletBalance;
