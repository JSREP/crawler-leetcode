'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Card, Row, Col, Progress, Rate, Tag, Spin } from 'antd';
import {
  TrophyOutlined,
  RocketOutlined,
  ArrowRightOutlined,
  BugOutlined,
  FilterOutlined,
  CodeOutlined,
  FireOutlined,
  // StarOutlined
} from '@ant-design/icons';
import { apiClient } from '@/lib/api-client';
import { type Challenge } from '@/types/challenge';

export default function HomePage() {
  const [stats, setStats] = useState<any>(null);
  const [latestChallenges, setLatestChallenges] = useState<Challenge[]>([]);
  const [popularChallenges, setPopularChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 获取统计数据
        const statsResponse = await apiClient.get('/api/db/stats') as any;
        setStats(statsResponse.data);

        // 获取最新挑战
        const latestResponse = await apiClient.get('/api/db/challenges?page=1&per_page=3') as any;
        setLatestChallenges(latestResponse.challenges || []);

        // 获取热门挑战
        const popularResponse = await apiClient.get('/api/db/challenges?page=1&per_page=6') as any;
        setPopularChallenges((popularResponse.challenges || []).slice(3, 6));
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 计算难度分布百分比
  const getDifficultyPercentage = (level: number) => {
    if (!stats) return 0;
    const difficulty = stats.difficulties.find((d: { difficulty_level: number; count: number }) => d.difficulty_level === level);
    return stats.total > 0 ? Math.round((difficulty?.count || 0) / stats.total * 100) : 0;
  };

  // 渲染难度星级
  const renderDifficultyStars = (level: number) => {
    return <Rate disabled defaultValue={level} count={5} className="text-sm" />;
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="container-responsive">
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} lg={12}>
              <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                  爬虫技术
                  <span className="text-gradient block">挑战合集</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  突破各种网站反爬机制，掌握先进爬虫技术，提升数据采集能力，成为爬虫工程师的不二之选
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/challenges">
                    <Button 
                      type="primary" 
                      size="large" 
                      icon={<RocketOutlined />}
                      className="h-12 px-8 text-lg font-medium"
                    >
                      开始挑战
                      <ArrowRightOutlined />
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button 
                      size="large"
                      className="h-12 px-8 text-lg"
                    >
                      了解更多
                    </Button>
                  </Link>
                </div>
              </div>
            </Col>
            
            <Col xs={24} lg={12}>
              <div className="space-y-6">
                {/* 总挑战数卡片 */}
                <Card className="text-center bg-white shadow-lg">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="text-gray-600 text-sm">总挑战数</div>
                    <div className="flex items-center space-x-2">
                      <TrophyOutlined className="text-2xl text-yellow-500" />
                      <span className="text-3xl font-bold text-gray-900">{stats?.total || 0}</span>
                    </div>
                  </div>
                </Card>
                
                {/* 难度分布卡片 */}
                <Card className="bg-white shadow-lg">
                  <div className="space-y-4">
                    <div className="text-gray-600 text-sm">难度分布</div>
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map(level => {
                        const count = stats?.difficulties.find((d: { difficulty_level: number; count: number }) => d.difficulty_level === level)?.count || 0;
                        const percentage = getDifficultyPercentage(level);
                        const icons = ['🟢', '🔵', '🟡', '🔴', '🟣'];
                        const labels = ['初级', '初中级', '中级', '中高级', '高级'];
                      
                      return (
                        <div key={level} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{icons[level - 1]}</span>
                            <span className="font-medium text-gray-700">
                              {labels[level - 1]}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-bold text-gray-900 w-8 text-right">
                              {count}
                            </span>
                            <Progress 
                              percent={percentage} 
                              size="small" 
                              strokeColor={level === 1 ? '#52c41a' : level === 2 ? '#1890ff' : level === 3 ? '#faad14' : level === 4 ? '#f5222d' : '#722ed1'}
                              className="w-20"
                              showInfo={false}
                            />
                          </div>
                        </div>
                      );
                    })}
                    </div>
                  </div>
                </Card>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              平台特色
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              专业的爬虫技术学习平台，提供系统化的挑战和实战经验
            </p>
          </div>
          
          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <Card className="h-full text-center card-hover">
                <div className="mb-4">
                  <BugOutlined className="text-4xl text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">爬虫挑战</h3>
                <p className="text-gray-600">
                  探索各类爬虫技术难题，从基础数据提取到复杂反爬机制突破
                </p>
              </Card>
            </Col>
            
            <Col xs={24} md={8}>
              <Card className="h-full text-center card-hover">
                <div className="mb-4">
                  <FilterOutlined className="text-4xl text-green-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">技术分类</h3>
                <p className="text-gray-600">
                  按照爬虫技术、目标网站和难度等多维度分类，快速定位学习重点
                </p>
              </Card>
            </Col>
            
            <Col xs={24} md={8}>
              <Card className="h-full text-center card-hover">
                <div className="mb-4">
                  <CodeOutlined className="text-4xl text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">参考资料</h3>
                <p className="text-gray-600">
                  查看详细的爬虫实现思路、代码示例和常见反爬绕过技巧
                </p>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* Challenges Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-responsive">
          <Row gutter={[48, 48]}>
            {/* Latest Challenges */}
            <Col xs={24} lg={12}>
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <RocketOutlined className="text-2xl text-blue-500" />
                  <h3 className="text-2xl font-bold text-gray-900">最新挑战</h3>
                </div>

                <div className="space-y-4">
                  {latestChallenges.map((challenge) => (
                    <Card key={challenge.id} className="card-hover">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">#{challenge.id}</span>
                            <h4 className="font-semibold text-gray-900">{challenge.name}</h4>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {renderDifficultyStars(challenge.difficulty_level)}
                          </div>
                          <div className="flex items-center space-x-2">
                            {challenge.tags.slice(0, 2).map((tag) => (
                              <Tag key={tag} color="blue" className="text-xs">
                                {tag}
                              </Tag>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="space-x-4">
                            <span>创建: {formatDate(challenge.created_at)}</span>
                            <span>更新: {formatDate(challenge.updated_at)}</span>
                          </div>
                          <a
                            href={challenge.base64_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                          >
                            去试试 ➔
                          </a>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="text-center">
                  <Link href="/challenges">
                    <Button type="primary" icon={<ArrowRightOutlined />}>
                      查看更多挑战
                    </Button>
                  </Link>
                </div>
              </div>
            </Col>

            {/* Popular Challenges */}
            <Col xs={24} lg={12}>
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <FireOutlined className="text-2xl text-red-500" />
                  <h3 className="text-2xl font-bold text-gray-900">热门挑战</h3>
                </div>

                <div className="space-y-4">
                  {popularChallenges.map((challenge) => (
                    <Card key={challenge.id} className="card-hover">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">#{challenge.id}</span>
                            <h4 className="font-semibold text-gray-900">{challenge.name}</h4>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {renderDifficultyStars(challenge.difficulty_level)}
                          </div>
                          <div className="flex items-center space-x-2">
                            {challenge.tags.slice(0, 2).map((tag) => (
                              <Tag key={tag} color="orange" className="text-xs">
                                {tag}
                              </Tag>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="space-x-4">
                            <span>创建: {formatDate(challenge.created_at)}</span>
                            <span>更新: {formatDate(challenge.updated_at)}</span>
                          </div>
                          <a
                            href={challenge.base64_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                          >
                            去试试 ➔
                          </a>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="text-center">
                  <Link href="/challenges">
                    <Button type="primary" icon={<ArrowRightOutlined />}>
                      查看更多挑战
                    </Button>
                  </Link>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container-responsive text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            准备好接受挑战了吗？
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            加入我们的爬虫技术社区，与全球开发者一起探索数据采集的无限可能
          </p>
          <Link href="/challenges">
            <Button 
              type="primary" 
              size="large"
              className="h-12 px-8 text-lg font-medium bg-white text-blue-600 border-white hover:bg-gray-50"
            >
              查看所有挑战
              <ArrowRightOutlined />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
