'use client';

import React, { useState } from 'react';
import { Button, Modal, Input, Space, Tag, message } from 'antd';
import { GiftOutlined } from '@ant-design/icons';
import { useAuth } from '@/components/auth/AuthProvider';
import { formatBalance, parseBalance } from '@/lib/wallet/utils';
import { WALLET_CONSTANTS } from '@/types/wallet';

const { TextArea } = Input;

interface TipButtonProps {
  targetType: 'post' | 'reply' | 'comment';
  targetId: number;
  toUserId: number;
  toUsername?: string;
  size?: 'small' | 'middle' | 'large';
  type?: 'default' | 'primary' | 'text';
  className?: string;
  onTipSuccess?: () => void;
}

const TipButton: React.FC<TipButtonProps> = ({
  targetType,
  targetId,
  toUserId,
  toUsername,
  size = 'small',
  type = 'text',
  className = '',
  onTipSuccess,
}) => {
  const { user } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 预设金额选项
  const presetAmounts = ['0.1', '0.5', '1', '5', '10', '50'];

  // 处理打赏
  const handleTip = async () => {
    if (!user) {
      (message as any).warning('请先登录');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      (message as any).warning('请输入有效的打赏金额');
      return;
    }

    if (user.id === toUserId) {
      (message as any).warning('不能给自己打赏');
      return;
    }

    // 验证金额格式
    try {
      const amountInWei = parseBalance(amount);
      if (!validateAmount(amountInWei)) {
        (message as any).warning('打赏金额超出允许范围');
        return;
      }
    } catch (error) {
      (message as any).warning('金额格式无效');
      return;
    }

    setSubmitting(true);
    try {
      // 将金额转换为wei
      const amountInWei = parseBalance(amount);

      const response = await fetch('/api/wallet/tip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to_user_id: toUserId,
          target_type: targetType,
          target_id: targetId,
          amount: amountInWei,
          message: message.trim() || undefined,
          is_anonymous: isAnonymous,
        }),
      });

      if (response.ok) {
        (message as any).success('打赏成功！');
        setModalVisible(false);
        setAmount('');
        setMessage('');
        setIsAnonymous(false);
        onTipSuccess?.();
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || '打赏失败';

        // 根据错误类型提供更具体的提示
        if (errorMessage.includes('Insufficient balance')) {
          (message as any).error('余额不足，请先充值');
        } else if (errorMessage.includes('Payment failed')) {
          (message as any).error('支付失败，请检查钱包余额');
        } else if (errorMessage.includes('Invalid')) {
          (message as any).error('参数无效，请检查输入');
        } else {
          (message as any).error(errorMessage);
        }
      }
    } catch (error) {
      console.error('Tip error:', error);
      if (error instanceof Error) {
        (message as any).error(`网络错误: ${error.message}`);
      } else {
        (message as any).error('网络连接失败，请重试');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // 选择预设金额
  const selectPresetAmount = (presetAmount: string) => {
    setAmount(presetAmount);
  };

  // 验证金额
  const validateAmount = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      return false;
    }

    try {
      const amountInWei = parseBalance(value);
      const minAmount = BigInt(WALLET_CONSTANTS.MIN_TIP_AMOUNT);
      const maxAmount = BigInt(WALLET_CONSTANTS.MAX_TIP_AMOUNT);
      const amountBigInt = BigInt(amountInWei);

      return amountBigInt >= minAmount && amountBigInt <= maxAmount;
    } catch {
      return false;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Button
        type={type}
        size={size}
        icon={<GiftOutlined />}
        onClick={() => setModalVisible(true)}
        className={`text-gray-500 hover:text-orange-500 ${className}`}
      >
        打赏
      </Button>

      <Modal
        title={
          <Space>
            <GiftOutlined className="text-orange-500" />
            <span>打赏{toUsername ? ` @${toUsername}` : ''}</span>
          </Space>
        }
        open={modalVisible}
        onOk={handleTip}
        onCancel={() => setModalVisible(false)}
        okText="确认打赏"
        cancelText="取消"
        confirmLoading={submitting}
        okButtonProps={{
          disabled: !validateAmount(amount),
        }}
      >
        <div className="space-y-4">
          {/* 金额输入 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              打赏金额 (CRAWLER Coin)
            </label>
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="输入打赏金额"
              type="number"
              min="0.1"
              step="0.1"
              suffix="CRAWLER"
              status={amount && !validateAmount(amount) ? 'error' : ''}
            />
            {amount && !validateAmount(amount) && (
              <div className="text-red-500 text-xs mt-1">
                金额必须在 {formatBalance(WALLET_CONSTANTS.MIN_TIP_AMOUNT)} - {formatBalance(WALLET_CONSTANTS.MAX_TIP_AMOUNT)} CRAWLER 之间
              </div>
            )}
          </div>

          {/* 预设金额 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              快速选择
            </label>
            <Space wrap>
              {presetAmounts.map((presetAmount) => (
                <Tag
                  key={presetAmount}
                  color={amount === presetAmount ? 'blue' : 'default'}
                  className="cursor-pointer"
                  onClick={() => selectPresetAmount(presetAmount)}
                >
                  {presetAmount} CRAWLER
                </Tag>
              ))}
            </Space>
          </div>

          {/* 打赏留言 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              打赏留言（可选）
            </label>
            <TextArea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="写下你的打赏留言..."
              rows={3}
              maxLength={200}
              showCount
            />
          </div>

          {/* 匿名选项 */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="anonymous" className="text-sm text-gray-600">
              匿名打赏
            </label>
          </div>

          {/* 提示信息 */}
          <div className="bg-orange-50 border border-orange-200 rounded p-3">
            <div className="text-sm text-orange-800">
              <div className="font-medium mb-1">💡 打赏说明</div>
              <ul className="text-xs space-y-1">
                <li>• 打赏将直接转账给对方，无法撤销</li>
                <li>• 打赏记录将在区块链上永久保存</li>
                <li>• 匿名打赏不会显示你的用户名</li>
                <li>• 最小打赏金额：{formatBalance(WALLET_CONSTANTS.MIN_TIP_AMOUNT)} CRAWLER</li>
              </ul>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default TipButton;
