/**
 * 评论列表组件
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  List, 
  Avatar, 
  Button, 
  Input, 
  message, 
  Spin, 
  Empty,
  Pagination,
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
import { useAuth } from '@/components/auth/AuthProvider';
import { ChallengeComment } from '@/types/forum';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const { TextArea } = Input;

interface CommentListProps {
  challengeId: number;
  className?: string;
}

interface CommentItemProps {
  comment: ChallengeComment;
  onReply: (parentId: number) => void;
  onEdit: (comment: ChallengeComment) => void;
  onDelete: (commentId: number) => void;
  currentUserId?: number;
  isAdmin?: boolean;
}

function CommentItem({ 
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

export default function CommentList({ challengeId, className = '' }: CommentListProps) {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<ChallengeComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = async (page: number = 1) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/comments?challenge_id=${challengeId}&page=${page}&per_page=${pageSize}`
      );
      const data = await response.json();

      if (response.ok) {
        setComments(data.comments);
        setTotal(data.total);
        setCurrentPage(page);
      } else {
        message.error(data.error || '获取评论失败');
      }
    } catch (error) {
      message.error('获取评论失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [challengeId]);

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
        fetchComments(1); // 刷新评论列表
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

  const handleReply = () => {
    fetchComments(currentPage); // 刷新当前页
  };

  const handleEdit = (comment: ChallengeComment) => {
    // TODO: 实现编辑功能
    message.info('编辑功能开发中');
  };

  const handleDelete = async (commentId: number) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        message.success('评论删除成功');
        fetchComments(currentPage);
      } else {
        const data = await response.json();
        message.error(data.error || '删除评论失败');
      }
    } catch (error) {
      message.error('删除评论失败');
    }
  };

  return (
    <div className={`comment-list ${className}`}>
      {/* 发表评论 */}
      {isAuthenticated && (
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
      )}

      {/* 评论列表 */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium">
            评论 ({total})
          </h3>
        </div>

        <Spin spinning={loading}>
          {comments.length > 0 ? (
            <>
              <List
                itemLayout="vertical"
                dataSource={comments}
                renderItem={(comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    onReply={handleReply}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    currentUserId={user?.id}
                    isAdmin={user?.role === 'admin'}
                  />
                )}
              />
              
              {total > pageSize && (
                <div className="p-4 border-t flex justify-center">
                  <Pagination
                    current={currentPage}
                    total={total}
                    pageSize={pageSize}
                    onChange={fetchComments}
                    showSizeChanger={false}
                    showQuickJumper
                    showTotal={(total, range) =>
                      `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
                    }
                  />
                </div>
              )}
            </>
          ) : (
            <div className="p-8">
              <Empty
                description="暂无评论"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          )}
        </Spin>
      </div>
    </div>
  );
}
