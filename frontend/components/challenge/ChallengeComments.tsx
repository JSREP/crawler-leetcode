'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Input, message, Spin, Empty } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { useAuth } from '@/components/auth/AuthProvider';
import { ChallengeComment } from '@/types/forum';
import { formatBalance } from '@/lib/wallet/utils';
import { WALLET_CONSTANTS } from '@/types/wallet';
import CommentItem from './CommentItem';
import TipModal from './TipModal';

const { TextArea } = Input;

interface ChallengeCommentsProps {
  challengeId: number;
}

const ChallengeComments: React.FC<ChallengeCommentsProps> = ({ challengeId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<ChallengeComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [tipModalVisible, setTipModalVisible] = useState(false);
  const [tipTarget, setTipTarget] = useState<ChallengeComment | null>(null);

  // 加载评论列表
  const loadComments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/challenges/${challengeId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || '加载评论失败';
        console.error('Load comments error:', errorMessage);

        if (response.status === 404) {
          message.error('挑战不存在');
        } else if (response.status >= 500) {
          message.error('服务器错误，请稍后重试');
        } else {
          message.error(errorMessage);
        }
      }
    } catch (error) {
      console.error('Load comments error:', error);
      message.error('网络连接失败，请检查网络');
    } finally {
      setLoading(false);
    }
  };

  // 提交新评论
  const handleSubmitComment = async () => {
    if (!user) {
      message.warning('请先登录');
      return;
    }

    if (!newComment.trim()) {
      message.warning('请输入评论内容');
      return;
    }

    if (newComment.trim().length > 5000) {
      message.warning('评论内容过长，请控制在5000字符以内');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/challenges/${challengeId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment.trim(),
        }),
      });

      if (response.ok) {
        message.success('评论发表成功');
        setNewComment('');
        loadComments();
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || '发表评论失败';

        if (errorMessage.includes('Payment failed')) {
          message.error('余额不足，发表评论需要消耗代币');
        } else if (errorMessage.includes('Insufficient balance')) {
          message.error('代币余额不足，请先获取代币');
        } else if (errorMessage.includes('too long')) {
          message.error('评论内容过长');
        } else if (response.status === 401) {
          message.error('登录已过期，请重新登录');
        } else {
          message.error(errorMessage);
        }
      }
    } catch (error) {
      console.error('Submit comment error:', error);
      message.error('网络错误，请检查网络连接');
    } finally {
      setSubmitting(false);
    }
  };

  // 提交回复
  const handleSubmitReply = async () => {
    if (!user || !replyingTo) {
      return;
    }

    if (!replyContent.trim()) {
      message.warning('请输入回复内容');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/challenges/${challengeId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: replyContent.trim(),
          parent_id: replyingTo,
        }),
      });

      if (response.ok) {
        message.success('回复发表成功');
        setReplyContent('');
        setReplyingTo(null);
        loadComments();
      } else {
        const error = await response.json();
        message.error(error.error || '发表回复失败');
      }
    } catch (error) {
      console.error('Submit reply error:', error);
      message.error('发表回复失败');
    } finally {
      setSubmitting(false);
    }
  };

  // 处理回复
  const handleReply = (parentId: number) => {
    setReplyingTo(parentId);
    setReplyContent('');
  };

  // 处理打赏
  const handleTip = (comment: ChallengeComment) => {
    setTipTarget(comment);
    setTipModalVisible(true);
  };

  useEffect(() => {
    loadComments();
  }, [challengeId]);

  return (
    <Card title="评论区" className="mt-6">
      {/* 发表评论 */}
      {user && (
        <div className="mb-6">
          <TextArea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={`发表评论需要消耗 ${formatBalance(WALLET_CONSTANTS.REPLY_COST)} CRAWLER Coin`}
            rows={4}
            maxLength={5000}
            showCount
          />
          <div className="mt-2 flex justify-end">
            <Button
              type="primary"
              icon={<SendOutlined />}
              loading={submitting}
              onClick={handleSubmitComment}
              disabled={!newComment.trim()}
            >
              发表评论
            </Button>
          </div>
        </div>
      )}

      {/* 回复框 */}
      {replyingTo && (
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <div className="mb-2 text-sm text-gray-600">
            回复评论：
          </div>
          <TextArea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="输入回复内容..."
            rows={3}
            maxLength={5000}
          />
          <div className="mt-2 flex justify-end space-x-2">
            <Button size="small" onClick={() => setReplyingTo(null)}>
              取消
            </Button>
            <Button
              type="primary"
              size="small"
              loading={submitting}
              onClick={handleSubmitReply}
              disabled={!replyContent.trim()}
            >
              发表回复
            </Button>
          </div>
        </div>
      )}

      {/* 评论列表 */}
      <Spin spinning={loading}>
        {comments.length > 0 ? (
          <div className="space-y-0">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={handleReply}
                onTip={handleTip}
              />
            ))}
          </div>
        ) : (
          <Empty description="暂无评论" />
        )}
      </Spin>

      {/* 打赏弹窗 */}
      <TipModal
        visible={tipModalVisible}
        target={tipTarget}
        onClose={() => setTipModalVisible(false)}
        onSuccess={() => {
          // 可以在这里添加成功后的逻辑，比如刷新评论列表
        }}
      />
    </Card>
  );
};

export default ChallengeComments;
