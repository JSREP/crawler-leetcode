/**
 * 单个评论项组件
 */

'use client';

import React, { useState } from 'react';
import { 
  List, 
  Avatar, 
  Button, 
  Input, 
  message, 
  Popconfirm,
  Tag
} from 'antd';
import { 
  MessageOutlined, 
  EditOutlined, 
  DeleteOutlined,
  SendOutlined,
  UserOutlined
} from '@ant-design/icons';
import { ChallengeComment } from '@/types/forum';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const { TextArea } = Input;

interface CommentItemProps {
  comment: ChallengeComment;
  onReply: (parentId: number) => void;
  onEdit: (comment: ChallengeComment) => void;
  onDelete: (commentId: number) => void;
  currentUserId?: number;
  isAdmin?: boolean;
}

export default function CommentItem({ 
  comment, 
  onReply, 
  onEdit, 
  onDelete, 
  currentUserId,
  isAdmin 
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canEdit = currentUserId === comment.user_id;
  const canDelete = canEdit || isAdmin;

  const handleReply = async () => {
    if (!replyContent.trim()) {
      message.error('请输入回复内容');
      return;
    }

    setIsSubmitting(true);
    try {
      await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challenge_id: comment.challenge_id,
          content: replyContent.trim(),
          parent_id: comment.id,
        }),
      });

      message.success('回复成功');
      setReplyContent('');
      setShowReplyForm(false);
      onReply(comment.id);
    } catch (error) {
      message.error('回复失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleTag = (role: string) => {
    if (role === 'admin') {
      return <Tag color="gold">管理员</Tag>;
    }
    return <Tag color="blue">用户</Tag>;
  };

  return (
    <div className="comment-item">
      <List.Item
        actions={[
          <Button
            key="reply"
            type="text"
            size="small"
            icon={<MessageOutlined />}
            onClick={() => setShowReplyForm(!showReplyForm)}
          >
            回复
          </Button>,
          ...(canEdit ? [
            <Button
              key="edit"
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(comment)}
            >
              编辑
            </Button>
          ] : []),
          ...(canDelete ? [
            <Popconfirm
              key="delete"
              title="确定要删除这条评论吗？"
              onConfirm={() => onDelete(comment.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                danger
              >
                删除
              </Button>
            </Popconfirm>
          ] : []),
        ]}
      >
        <List.Item.Meta
          avatar={
            <Avatar 
              src={comment.user?.avatar_url} 
              icon={<UserOutlined />}
              size="default"
            />
          }
          title={
            <div className="flex items-center space-x-2">
              <span className="font-medium">{comment.user?.username}</span>
              {comment.user?.role && getRoleTag(comment.user.role)}
              <span className="text-gray-500 text-sm">
                {formatDistanceToNow(new Date(comment.created_at), {
                  addSuffix: true,
                  locale: zhCN,
                })}
              </span>
            </div>
          }
          description={
            <div className="mt-2">
              <div className="whitespace-pre-wrap text-gray-800">
                {comment.content}
              </div>
            </div>
          }
        />
      </List.Item>

      {/* 回复表单 */}
      {showReplyForm && (
        <div className="ml-12 mt-4 p-4 bg-gray-50 rounded-lg">
          <TextArea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder={`回复 @${comment.user?.username}`}
            rows={3}
            maxLength={5000}
            showCount
          />
          <div className="mt-2 flex justify-end space-x-2">
            <Button size="small" onClick={() => setShowReplyForm(false)}>
              取消
            </Button>
            <Button
              type="primary"
              size="small"
              icon={<SendOutlined />}
              loading={isSubmitting}
              onClick={handleReply}
            >
              发送
            </Button>
          </div>
        </div>
      )}

      {/* 回复列表 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-12 mt-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  );
}
