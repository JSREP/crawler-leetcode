'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Card,
  Button,
  Tag,
  Spin,
  message,
  Breadcrumb,
  Typography,
  Space,
  Divider
} from 'antd';
import {
  ArrowLeftOutlined,
  StarFilled,
  LinkOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { Challenge } from '@/types/challenge';
import ChallengeComments from '@/components/challenge/ChallengeComments';

const { Title, Paragraph, Text } = Typography;

export default function ChallengeDetailPage() {
  const params = useParams();
  const challengeId = params.id as string;
  
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);

  // 获取挑战详情
  const fetchChallenge = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/db/challenges/${challengeId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch challenge');
      }
      
      const data = await response.json();
      setChallenge(data);
      
    } catch (error) {
      console.error('Failed to fetch challenge:', error);
      message.error('加载挑战详情失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (challengeId) {
      fetchChallenge();
    }
  }, [challengeId]);

  // 渲染难度星级
  const renderDifficultyStars = (level: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, index) => (
          <StarFilled
            key={index}
            className={`text-sm ${
              index < level ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-2">
          {level}/5
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <Spin size="large" />
          <div className="mt-4 text-gray-500">
            正在加载挑战详情...
          </div>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <Title level={3}>挑战不存在</Title>
          <Paragraph>
            抱歉，找不到您要查看的挑战。
          </Paragraph>
          <Link href="/challenges">
            <Button type="primary" icon={<ArrowLeftOutlined />}>
              返回挑战列表
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 面包屑导航 */}
      <Breadcrumb className="mb-6">
        <Breadcrumb.Item>
          <Link href="/challenges">挑战列表</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{challenge.name}</Breadcrumb.Item>
      </Breadcrumb>

      {/* 返回按钮 */}
      <div className="mb-6">
        <Link href="/challenges">
          <Button icon={<ArrowLeftOutlined />}>
            返回挑战列表
          </Button>
        </Link>
      </div>

      {/* 挑战详情 */}
      <Card>
        <div className="space-y-6">
          {/* 标题和基本信息 */}
          <div>
            <Title level={2} className="mb-2">
              {challenge.name}
            </Title>
            {challenge.name_en && (
              <Text type="secondary" className="text-lg">
                {challenge.name_en}
              </Text>
            )}
          </div>

          {/* 元信息 */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Text strong>难度:</Text>
              {renderDifficultyStars(challenge.difficulty_level)}
            </div>
            <div className="flex items-center space-x-2">
              <Text strong>平台:</Text>
              <Tag color="blue">{challenge.platform}</Tag>
            </div>
            {challenge.is_expired && (
              <Tag color="red">已过期</Tag>
            )}
          </div>

          {/* 标签 */}
          {challenge.tags && challenge.tags.length > 0 && (
            <div>
              <Text strong className="block mb-2">技术标签:</Text>
              <Space wrap>
                {challenge.tags.map(tag => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </Space>
            </div>
          )}

          <Divider />

          {/* 描述 */}
          {challenge.description && (
            <div>
              <Title level={4}>挑战描述</Title>
              <Paragraph>
                {challenge.description}
              </Paragraph>
            </div>
          )}

          {/* 目标URL */}
          {challenge.target_url && (
            <div>
              <Title level={4}>目标网站</Title>
              <div className="flex items-center space-x-2">
                <LinkOutlined />
                <a 
                  href={challenge.target_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  {challenge.target_url}
                </a>
              </div>
            </div>
          )}

          {/* 时间信息 */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <ClockCircleOutlined />
              <span>创建于 {new Date(challenge.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <ClockCircleOutlined />
              <span>更新于 {new Date(challenge.updated_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex space-x-4 pt-4">
            {challenge.target_url && (
              <a 
                href={challenge.target_url} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button type="primary" icon={<LinkOutlined />}>
                  开始挑战
                </Button>
              </a>
            )}
            <Link href="/challenges">
              <Button>
                返回列表
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* 评论区 */}
      <ChallengeComments challengeId={parseInt(challengeId)} />
    </div>
  );
}
