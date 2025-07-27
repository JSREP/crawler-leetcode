import React from 'react';
import Link from 'next/link';
import { Button, Card, Row, Col, Statistic, Progress } from 'antd';
import { 
  TrophyOutlined, 
  RocketOutlined, 
  FireOutlined, 
  ThunderboltOutlined,
  ArrowRightOutlined,
  BugOutlined,
  FilterOutlined,
  CodeOutlined
} from '@ant-design/icons';
import { getChallengeStats } from '@/lib/database';
import { DIFFICULTY_LEVELS } from '@/types/challenge';

export default async function HomePage() {
  // 获取统计数据
  let stats = null;
  try {
    stats = await getChallengeStats();
  } catch (error) {
    console.error('Failed to fetch stats:', error);
  }

  // 计算难度分布百分比
  const getDifficultyPercentage = (level: number) => {
    if (!stats) return 0;
    const difficulty = stats.difficulties.find(d => d.difficulty_level === level);
    return stats.total > 0 ? Math.round((difficulty?.count || 0) / stats.total * 100) : 0;
  };

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
                {/* 统计卡片 */}
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Card className="text-center">
                      <Statistic
                        title="总挑战数"
                        value={stats?.total || 0}
                        prefix={<TrophyOutlined className="text-yellow-500" />}
                        valueStyle={{ color: '#3f6600' }}
                      />
                    </Card>
                  </Col>
                </Row>
                
                {/* 难度分布 */}
                <Card title="难度分布" className="w-full">
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(level => {
                      const difficultyInfo = DIFFICULTY_LEVELS[level as keyof typeof DIFFICULTY_LEVELS];
                      const count = stats?.difficulties.find(d => d.difficulty_level === level)?.count || 0;
                      const percentage = getDifficultyPercentage(level);
                      
                      return (
                        <div key={level} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 min-w-0 flex-1">
                            <span className="text-lg">{difficultyInfo.icon}</span>
                            <span className="font-medium text-gray-700">
                              {difficultyInfo.label}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <span className="text-sm text-gray-500 w-8 text-right">
                              {count}
                            </span>
                            <Progress 
                              percent={percentage} 
                              size="small" 
                              strokeColor={difficultyInfo.color}
                              className="flex-1"
                            />
                          </div>
                        </div>
                      );
                    })}
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
