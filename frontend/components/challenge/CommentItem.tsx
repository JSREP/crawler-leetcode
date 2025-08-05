/**
 * 挑战评论项组件
 */

'use client';

import React from 'react';
import { Avatar, Button } from 'antd';
import { MessageOutlined, GiftOutlined } from '@ant-design/icons';
import { useAuth } from '@/components/auth/AuthProvider';
import { ChallengeComment } from '@/types/forum';

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

export default CommentItem;
