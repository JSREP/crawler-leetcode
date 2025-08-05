/**
 * 打赏弹窗组件
 */

'use client';

import React, { useState } from 'react';
import { Modal, Input, message } from 'antd';
import { ChallengeComment } from '@/types/forum';

const { TextArea } = Input;

interface TipModalProps {
  visible: boolean;
  target: ChallengeComment | null;
  onClose: () => void;
  onSuccess: () => void;
}

const TipModal: React.FC<TipModalProps> = ({ 
  visible, 
  target, 
  onClose, 
  onSuccess 
}) => {
  const [tipAmount, setTipAmount] = useState('');
  const [tipMessage, setTipMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitTip = async () => {
    if (!target || !tipAmount) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/wallet/tip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to_user_id: target.user_id,
          target_type: 'comment',
          target_id: target.id,
          amount: tipAmount,
          message: tipMessage,
        }),
      });

      if (response.ok) {
        message.success('打赏成功');
        onSuccess();
        onClose();
        setTipAmount('');
        setTipMessage('');
      } else {
        const error = await response.json();
        message.error(error.error || '打赏失败');
      }
    } catch (error) {
      console.error('Tip error:', error);
      message.error('打赏失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    onClose();
    setTipAmount('');
    setTipMessage('');
  };

  return (
    <Modal
      title="打赏"
      open={visible}
      onOk={handleSubmitTip}
      onCancel={handleCancel}
      okText="确认打赏"
      cancelText="取消"
      confirmLoading={submitting}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            打赏金额 (CRAWLER Coin)
          </label>
          <Input
            value={tipAmount}
            onChange={(e) => setTipAmount(e.target.value)}
            placeholder="输入打赏金额"
            type="number"
            min="0.1"
            step="0.1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            打赏留言（可选）
          </label>
          <TextArea
            value={tipMessage}
            onChange={(e) => setTipMessage(e.target.value)}
            placeholder="输入打赏留言..."
            rows={3}
            maxLength={200}
          />
        </div>
      </div>
    </Modal>
  );
};

export default TipModal;
