/**
 * 讨论区页面
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  List, 
  Avatar, 
  Button, 
  Input, 
  Select, 
  Tag, 
  Space,
  Pagination,
  Empty,
  Spin,
  message
} from 'antd';
import { 
  PlusOutlined, 
  MessageOutlined, 
  EyeOutlined,
  SearchOutlined,
  UserOutlined,
  PushpinOutlined
} from '@ant-design/icons';
import { useAuth } from '@/components/auth/AuthProvider';
import { ForumPost } from '@/types/forum';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import Link from 'next/link';

const { Search } = Input;
const { Option } = Select;

export default function ForumPage() {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [challengeFilter, setChallengeFilter] = useState<string>('');

  const fetchPosts = async (page: number = 1, search?: string, challengeId?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: pageSize.toString(),
      });

      if (search) params.append('search', search);
      if (challengeId) params.append('challenge_id', challengeId);

      console.log('Fetching posts with params:', params.toString());
      const response = await fetch(`/api/forum/posts?${params}`);
      const data = await response.json();
      console.log('Posts response:', data);

      if (response.ok) {
        setPosts(data.posts || []);
        setTotal(data.total || 0);
        setCurrentPage(page);
        console.log('Posts set:', data.posts?.length || 0);
      } else {
        console.error('Posts fetch error:', data);
        message.error(data.error || '获取帖子失败');
      }
    } catch (error) {
      console.error('Posts fetch exception:', error);
      message.error('获取帖子失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    fetchPosts(1, value, challengeFilter);
  };

  const handleChallengeFilter = (value: string) => {
    setChallengeFilter(value);
    fetchPosts(1, searchQuery, value);
  };

  const handlePageChange = (page: number) => {
    fetchPosts(page, searchQuery, challengeFilter);
  };

  const getRoleTag = (role: string) => {
    if (role === 'admin') {
      return <Tag color="gold">管理员</Tag>;
    }
    return <Tag color="blue">用户</Tag>;
  };

  const renderPostItem = (post: ForumPost) => (
    <List.Item key={post.id}>
      <Card 
        hoverable
        className="w-full"
        bodyStyle={{ padding: '16px' }}
      >
        <div className="flex items-start space-x-4">
          {/* 用户头像 */}
          <Avatar 
            src={post.user?.avatar_url} 
            icon={<UserOutlined />}
            size="large"
          />

          {/* 帖子内容 */}
          <div className="flex-1 min-w-0">
            {/* 标题和置顶标识 */}
            <div className="flex items-center space-x-2 mb-2">
              {post.is_pinned && (
                <PushpinOutlined className="text-orange-500" />
              )}
              <Link 
                href={`/forum/posts/${post.id}`}
                className="text-lg font-medium text-gray-900 hover:text-blue-600 truncate"
              >
                {post.title}
              </Link>
            </div>

            {/* 用户信息和时间 */}
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm font-medium text-gray-700">
                {post.user?.username}
              </span>
              {post.user?.role && getRoleTag(post.user.role)}
              <span className="text-gray-500 text-sm">
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                  locale: zhCN,
                })}
              </span>
            </div>

            {/* 关联挑战 */}
            {post.challenge && (
              <div className="mb-2">
                <Tag color="blue">
                  关联挑战: {post.challenge.name}
                </Tag>
              </div>
            )}

            {/* 内容预览 */}
            <div className="text-gray-600 text-sm mb-3 line-clamp-2">
              {post.content.substring(0, 200)}
              {post.content.length > 200 && '...'}
            </div>

            {/* 统计信息 */}
            <div className="flex items-center space-x-4 text-gray-500 text-sm">
              <Space>
                <EyeOutlined />
                <span>{post.view_count}</span>
              </Space>
              <Space>
                <MessageOutlined />
                <span>{post.reply_count}</span>
              </Space>
              {post.latest_reply && (
                <span className="text-xs">
                  最后回复: {post.latest_reply.user?.username || '未知用户'} · {
                    formatDistanceToNow(new Date(post.latest_reply.created_at), {
                      addSuffix: true,
                      locale: zhCN,
                    })
                  }
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </List.Item>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">讨论区</h1>
        <p className="text-gray-600">分享经验，讨论技术，共同成长</p>
      </div>

      {/* 操作栏 */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          {/* 搜索 */}
          <Search
            placeholder="搜索帖子..."
            allowClear
            style={{ width: 300 }}
            onSearch={handleSearch}
            enterButton={<SearchOutlined />}
          />

          {/* 挑战筛选 */}
          <Select
            placeholder="筛选挑战"
            style={{ width: 200 }}
            allowClear
            onChange={handleChallengeFilter}
          >
            <Option value="">全部挑战</Option>
            {/* TODO: 从API获取挑战列表 */}
          </Select>
        </div>

        {/* 发帖按钮 - 暂时跳过认证检查 */}
        <Link href="/forum/create">
          <Button type="primary" icon={<PlusOutlined />}>
            发表帖子
          </Button>
        </Link>
      </div>

      {/* 帖子列表 */}
      <Spin spinning={loading}>
        {posts.length > 0 ? (
          <>
            <List
              dataSource={posts}
              renderItem={renderPostItem}
              split={false}
              className="space-y-4"
            />

            {/* 分页 */}
            {total > pageSize && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  current={currentPage}
                  total={total}
                  pageSize={pageSize}
                  onChange={handlePageChange}
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
          <div className="text-center py-12">
            <Empty
              description="暂无帖子"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Link href="/forum/create">
                <Button type="primary" icon={<PlusOutlined />}>
                  发表第一个帖子
                </Button>
              </Link>
            </Empty>
          </div>
        )}
      </Spin>
    </div>
  );
}
