/**
 * 评论表单组件
 */

'use client';

import React, { useState } from 'react';
import { Avatar, Button, Input, message } from 'antd';
import { SendOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '@/components/auth/AuthProvider';

const { TextArea } = Input;

interface CommentFormProps {
  challengeId: number;
  onCommentSubmitted: () => void;
  className?: string;
}

export default function CommentForm({ 
  challengeId, 
  onCommentSubmitted, 
  className = '' 
}: CommentFormProps) {
  const { user, isAuthenticated } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async () => {
    if (!isAuthenticated) {
      message.error('请先登录');
      return;
    }

    if (!newComment.trim()) {
      message.error('请输入评论内容');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challenge_id: challengeId,
          content: newComment.trim(),
        }),
      });

      if (response.ok) {
        message.success('评论发表成功');
        setNewComment('');
        onCommentSubmitted();
      } else {
        const data = await response.json();
        message.error(data.error || '发表评论失败');
      }
    } catch (error) {
      message.error('发表评论失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={`comment-form ${className}`}>
      <div className="mb-6 p-4 bg-white rounded-lg border">
        <div className="flex items-start space-x-3">
          <Avatar 
            src={user?.avatar_url} 
            icon={<UserOutlined />}
            size="default"
          />
          <div className="flex-1">
            <TextArea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="发表你的看法..."
              rows={4}
              maxLength={5000}
              showCount
            />
            <div className="mt-3 flex justify-end">
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={isSubmitting}
                onClick={handleSubmitComment}
              >
                发表评论
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
