/**
 * 评论列表组件 - 重构版本
 */

'use client';

import React, { useState, useEffect } from 'react';
import { List, Spin, Empty, Pagination, message } from 'antd';
import { useAuth } from '@/components/auth/AuthProvider';
import { ChallengeComment } from '@/types/forum';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';

interface CommentListProps {
  challengeId: number;
  className?: string;
}

export default function CommentList({ challengeId, className = '' }: CommentListProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<ChallengeComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

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

  const handleCommentSubmitted = () => {
    fetchComments(1); // 刷新评论列表
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
      <CommentForm
        challengeId={challengeId}
        onCommentSubmitted={handleCommentSubmitted}
      />

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
