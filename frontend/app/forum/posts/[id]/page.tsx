/**
 * 帖子详情页面
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Avatar, 
  Button, 
  Tag, 
  Space, 
  Divider,
  message,
  Spin,
  Empty,
  Typography,
  Breadcrumb,
  Tooltip
} from 'antd';
import { 
  ArrowLeftOutlined,
  EyeOutlined,
  MessageOutlined,
  HeartOutlined,
  ShareAltOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  CrownOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import { useAuth } from '@/components/auth/AuthProvider';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ForumPost, ForumReply } from '@/types/forum';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import dynamic from 'next/dynamic';

// 动态导入Markdown预览组件
const MarkdownPreview = dynamic(
  () => import('@uiw/react-markdown-preview'),
  { ssr: false }
);

const { Title, Text, Paragraph } = Typography;

interface PostDetailPageProps {
  params: {
    id: string;
  };
}

export default function PostDetailPage() {
  const { user, isAuthenticated } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [repliesLoading, setRepliesLoading] = useState(false);

  const postId = params?.id as string;

  // 获取帖子详情
  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/forum/posts/${postId}`);
      if (response.ok) {
        const data = await response.json();
        setPost(data);
      } else if (response.status === 404) {
        message.error('帖子不存在');
        router.push('/forum');
      } else {
        message.error('获取帖子失败');
      }
    } catch (error) {
      message.error('获取帖子失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取回复列表
  const fetchReplies = async () => {
    setRepliesLoading(true);
    try {
      const response = await fetch(`/api/forum/posts/${postId}/replies`);
      if (response.ok) {
        const data = await response.json();
        setReplies(data.replies);
      }
    } catch (error) {
      console.error('Failed to fetch replies:', error);
    } finally {
      setRepliesLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchPost();
      fetchReplies();
    }
  }, [postId]);

  const getRoleTag = (role: string) => {
    if (role === 'admin') {
      return (
        <Tag color="gold" icon={<CrownOutlined />}>
          管理员
        </Tag>
      );
    }
    return (
      <Tag color="blue" icon={<SafetyOutlined />}>
        用户
      </Tag>
    );
  };

  const canEdit = post && user && (post.user_id === user.id || user.role === 'admin');

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Empty description="帖子不存在" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 面包屑导航 */}
      <Breadcrumb className="mb-6">
        <Breadcrumb.Item>
          <Link href="/forum">讨论区</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{post.title}</Breadcrumb.Item>
      </Breadcrumb>

      {/* 返回按钮 */}
      <div className="mb-6">
        <Link href="/forum">
          <Button icon={<ArrowLeftOutlined />} type="text">
            返回讨论区
          </Button>
        </Link>
      </div>

      {/* 帖子内容 */}
      <Card className="mb-6">
        {/* 帖子标题 */}
        <div className="mb-4">
          <Title level={2} className="mb-2">
            {post.title}
          </Title>
          
          {/* 关联挑战 */}
          {post.challenge && (
            <div className="mb-3">
              <Tag color="blue" className="text-sm">
                关联挑战: {post.challenge.name}
              </Tag>
            </div>
          )}
        </div>

        {/* 作者信息 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar 
              src={post.user?.avatar_url} 
              icon={<UserOutlined />}
              size="large"
            />
            <div>
              <div className="flex items-center space-x-2">
                <Text strong>{post.user?.username}</Text>
                {post.user?.role && getRoleTag(post.user.role)}
              </div>
              <Text type="secondary" className="text-sm">
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                  locale: zhCN,
                })}
                {post.updated_at !== post.created_at && ' (已编辑)'}
              </Text>
            </div>
          </div>

          {/* 操作按钮 */}
          <Space>
            <Tooltip title="浏览量">
              <Space>
                <EyeOutlined />
                <span>{post.view_count}</span>
              </Space>
            </Tooltip>
            <Tooltip title="回复数">
              <Space>
                <MessageOutlined />
                <span>{post.reply_count}</span>
              </Space>
            </Tooltip>
            {canEdit && (
              <>
                <Button 
                  icon={<EditOutlined />} 
                  size="small"
                  onClick={() => router.push(`/forum/posts/${post.id}/edit`)}
                >
                  编辑
                </Button>
                <Button 
                  icon={<DeleteOutlined />} 
                  size="small" 
                  danger
                  onClick={() => {
                    // TODO: 实现删除功能
                    message.info('删除功能开发中');
                  }}
                >
                  删除
                </Button>
              </>
            )}
          </Space>
        </div>

        <Divider />

        {/* 帖子内容 */}
        <div className="prose max-w-none">
          <MarkdownPreview 
            source={post.content}
            style={{ 
              backgroundColor: 'transparent',
              color: 'inherit'
            }}
          />
        </div>

        <Divider />

        {/* 互动按钮 */}
        <div className="flex items-center justify-between">
          <Space>
            <Button icon={<HeartOutlined />} type="text">
              点赞 ({post.like_count})
            </Button>
            <Button icon={<ShareAltOutlined />} type="text">
              分享
            </Button>
          </Space>
          
          {isAuthenticated && (
            <Button type="primary" onClick={() => {
              // TODO: 滚动到回复区域
              document.getElementById('reply-section')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              回复帖子
            </Button>
          )}
        </div>
      </Card>

      {/* 回复列表 */}
      <Card title={`回复 (${post.reply_count})`} id="reply-section">
        <Spin spinning={repliesLoading}>
          {replies.length > 0 ? (
            <div className="space-y-4">
              {replies.map((reply) => (
                <div key={reply.id} className="border-l-2 border-gray-200 pl-4">
                  <div className="flex items-start space-x-3">
                    <Avatar 
                      src={reply.user?.avatar_url} 
                      icon={<UserOutlined />}
                      size="default"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Text strong>{reply.user?.username}</Text>
                        {reply.user?.role && getRoleTag(reply.user.role)}
                        <Text type="secondary" className="text-sm">
                          {formatDistanceToNow(new Date(reply.created_at), {
                            addSuffix: true,
                            locale: zhCN,
                          })}
                        </Text>
                      </div>
                      <div className="prose prose-sm max-w-none">
                        <MarkdownPreview 
                          source={reply.content}
                          style={{ 
                            backgroundColor: 'transparent',
                            color: 'inherit'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty 
              description="暂无回复" 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              {isAuthenticated && (
                <Button type="primary">
                  发表第一个回复
                </Button>
              )}
            </Empty>
          )}
        </Spin>
      </Card>
    </div>
  );
}
