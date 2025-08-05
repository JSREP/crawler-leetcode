'use client';

import React, { useState, useEffect } from 'react';
import { Card, List, Avatar, Button, Input, message, Spin, Empty, Modal } from 'antd';
import { MessageOutlined, SendOutlined, GiftOutlined } from '@ant-design/icons';
import { useAuth } from '@/components/auth/AuthProvider';
import { ChallengeComment } from '@/types/forum';
import { formatBalance } from '@/lib/wallet/utils';
import { WALLET_CONSTANTS } from '@/types/wallet';

const { TextArea } = Input;

interface ChallengeCommentsProps {
  challengeId: number;
}

interface CommentItemProps {
  comment: ChallengeComment;
  onReply: (parentId: number) => void;
  onTip: (comment: ChallengeComment) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, onReply, onTip }) => {
  const { user } = useAuth();

  return (
    <div className="comment-item">
      <div className="flex items-start space-x-3 p-4 border-b border-gray-100">
        <Avatar
          src={comment.user?.avatar_url}
          alt={comment.user?.username}
          size={40}
        >
          {comment.user?.username?.[0]?.toUpperCase()}
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-medium text-gray-900">
              {comment.user?.username}
            </span>
            {comment.user?.role === 'admin' && (
              <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded">
                管理员
              </span>
            )}
            <span className="text-sm text-gray-500">
              {new Date(comment.created_at).toLocaleString()}
            </span>
          </div>
          
          <div className="text-gray-800 mb-3 whitespace-pre-wrap">
            {comment.content}
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <Button
                  type="text"
                  size="small"
                  icon={<MessageOutlined />}
                  onClick={() => onReply(comment.id)}
                  className="text-gray-500 hover:text-blue-500"
                >
                  回复
                </Button>
                
                <Button
                  type="text"
                  size="small"
                  icon={<GiftOutlined />}
                  onClick={() => onTip(comment)}
                  className="text-gray-500 hover:text-orange-500"
                >
                  打赏
                </Button>
              </>
            )}
          </div>
          
          {/* 回复列表 */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 pl-4 border-l-2 border-gray-200">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  onTip={onTip}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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
  const [tipAmount, setTipAmount] = useState('');
  const [tipMessage, setTipMessage] = useState('');

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
    setTipAmount('');
    setTipMessage('');
    setTipModalVisible(true);
  };

  // 提交打赏
  const handleSubmitTip = async () => {
    if (!tipTarget || !tipAmount) {
      return;
    }

    try {
      const response = await fetch('/api/wallet/tip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to_user_id: tipTarget.user_id,
          target_type: 'comment',
          target_id: tipTarget.id,
          amount: tipAmount,
          message: tipMessage,
        }),
      });

      if (response.ok) {
        message.success('打赏成功');
        setTipModalVisible(false);
      } else {
        const error = await response.json();
        message.error(error.error || '打赏失败');
      }
    } catch (error) {
      console.error('Tip error:', error);
      message.error('打赏失败');
    }
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
      <Modal
        title="打赏"
        open={tipModalVisible}
        onOk={handleSubmitTip}
        onCancel={() => setTipModalVisible(false)}
        okText="确认打赏"
        cancelText="取消"
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
    </Card>
  );
};

export default ChallengeComments;
