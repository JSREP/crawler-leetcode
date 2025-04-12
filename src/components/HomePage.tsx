// src/components/HomePage.tsx
import { useEffect, useState } from 'react';
import { Card, Col, Row, Typography, Divider, Button, Statistic, Space, Avatar, Badge } from 'antd';
import { challenges, SimpleChallengeList } from './ChallengeListPage/exports';
import { useNavigate } from 'react-router-dom';
import {
  CodeOutlined,
  FileSearchOutlined,
  FilterOutlined,
  FireOutlined,
  TrophyOutlined,
  RocketOutlined,
  ArrowRightOutlined,
  BugOutlined,
  CloudSyncOutlined,
  ApiOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

// 获取不同难度的挑战数量
const getDifficultyCounts = () => {
  const counts = { easy: 0, medium: 0, hard: 0 };
  challenges.forEach(challenge => {
    if (challenge.difficulty === 1) counts.easy++;
    else if (challenge.difficulty === 2) counts.medium++;
    else if (challenge.difficulty === 3) counts.hard++;
  });
  return counts;
};

const features = [
  {
    title: '爬虫挑战',
    content: '探索各类爬虫技术难题，从基础数据提取到复杂反爬机制突破',
    color: '#42b983',
    icon: <BugOutlined />
  },
  {
    title: '技术分类',
    content: '按照爬虫技术、目标网站和难度等多维度分类，快速定位学习重点',
    color: '#1890ff',
    icon: <FilterOutlined />
  },
  {
    title: '解决方案',
    content: '查看详细的爬虫实现思路、代码示例和常见反爬绕过技巧',
    color: '#722ed1',
    icon: <CodeOutlined />
  }
];

/**
 * 首页组件
 * 展示网站主要功能和推荐挑战列表
 */
const HomePage = () => {
  const [animatedStats, setAnimatedStats] = useState(false);
  const navigate = useNavigate();
  const difficultyCounts = getDifficultyCounts();
  
  // 获取最新的3个挑战
  const recentChallenges = [...challenges]
    .sort((a, b) => b.createTime.getTime() - a.createTime.getTime())
    .slice(0, 3);
    
  // 随机获取3个热门挑战
  const popularChallenges = [...challenges]
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);
    
  // 首页列表分页设置
  const [homePagination] = useState({ current: 1, pageSize: 3 });
  
  // 组件挂载后触发数据统计动画
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedStats(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // 处理分页变化 (这里实际不会使用，但需要传递以满足类型要求)
  const handlePaginationChange = () => {};
  
  // 处理标签点击
  const handleTagClick = (tag: string) => {
    navigate(`/challenges?tags=${tag}`);
  };
  
  // 处理难度点击
  const handleDifficultyClick = (difficulty: string) => {
    navigate(`/challenges?difficulty=${difficulty}`);
  };
  
  // 处理平台点击
  const handlePlatformClick = (platform: string) => {
    navigate(`/challenges?platform=${platform}`);
  };

  return (
    <div style={{ padding: '0', overflow: 'hidden' }}>
      {/* 英雄区域 */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1a365d 0%, #153e75 50%, #2a4365 100%)',
        padding: '60px 24px',
        color: 'white',
        borderRadius: '0 0 50px 50px',
        marginBottom: '40px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
      }}>
        <Row justify="center" align="middle" gutter={[32, 32]}>
          <Col xs={24} md={16} lg={12}>
            <div style={{ animation: 'fadeIn 1s ease-out' }}>
              <Title level={1} style={{ color: 'white', fontSize: '2.5rem', marginBottom: '16px' }}>
                爬虫技术挑战合集
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', marginBottom: '24px' }}>
                突破各种网站反爬机制，掌握先进爬虫技术，提升数据采集能力，成为爬虫工程师的不二之选
              </Paragraph>
              <Space size="middle">
                <Button 
                  type="primary" 
                  size="large" 
                  onClick={() => navigate('/challenges')}
                  style={{ 
                    background: '#42b983', 
                    borderColor: '#42b983',
                    height: '46px',
                    borderRadius: '23px',
                    padding: '0 28px'
                  }}
                >
                  开始挑战 <ArrowRightOutlined />
                </Button>
                <Button 
                  size="large"
                  style={{ 
                    borderColor: 'rgba(255,255,255,0.5)', 
                    color: 'white',
                    height: '46px',
                    borderRadius: '23px',
                    padding: '0 28px',
                    background: 'rgba(255,255,255,0.15)',
                    fontWeight: 500,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}
                  onClick={() => navigate('/about')}
                >
                  了解更多
                </Button>
              </Space>
            </div>
          </Col>
          <Col xs={24} md={8} lg={8} style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: '20px',
              padding: '30px', 
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              animation: 'slideInRight 0.8s ease-out',
              transform: animatedStats ? 'translateY(0)' : 'translateY(20px)',
              opacity: animatedStats ? 1 : 0,
              transition: 'transform 0.8s ease-out, opacity 0.8s ease-out',
            }}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Statistic 
                  title={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>总挑战数</Text>} 
                  value={challenges.length} 
                  valueStyle={{ color: 'white' }}
                  prefix={<TrophyOutlined />}
                />
                <Row gutter={16}>
                  <Col span={8}>
                    <Badge color="#52c41a" text={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>初级</Text>} />
                    <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>{difficultyCounts.easy}</div>
                  </Col>
                  <Col span={8}>
                    <Badge color="#faad14" text={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>中级</Text>} />
                    <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>{difficultyCounts.medium}</div>
                  </Col>
                  <Col span={8}>
                    <Badge color="#f5222d" text={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>高级</Text>} />
                    <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>{difficultyCounts.hard}</div>
                  </Col>
                </Row>
              </Space>
            </div>
          </Col>
        </Row>
      </div>
      
      {/* 功能介绍 */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 48px', padding: '0 24px' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '48px' }}>
          平台特色
          <div style={{ 
            height: '4px', 
            width: '80px', 
            background: 'linear-gradient(to right, #42b983, #1890ff)',
            margin: '16px auto 0'
          }}></div>
        </Title>
        
        <Row gutter={[24, 24]} justify="center">
          {features.map((feature, index) => (
            <Col key={index} xs={24} sm={12} md={8}>
              <Card 
                hoverable
                style={{ 
                  height: '100%', 
                  borderRadius: '16px', 
                  overflow: 'hidden',
                  border: 'none',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  textAlign: 'center' 
                }}>
                  <div style={{ 
                    fontSize: '36px', 
                    color: feature.color, 
                    marginBottom: '16px',
                    background: `rgba(${feature.color.replace('#', '').match(/.{2}/g)?.map(c => parseInt(c, 16)).join(',')}, 0.1)`,
                    width: '80px',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '40px'
                  }}>
                    {feature.icon}
                  </div>
                  <Title level={4} style={{ color: feature.color, marginBottom: '8px' }}>
                    {feature.title}
                  </Title>
                  <Text type="secondary" style={{ fontSize: '16px' }}>
                    {feature.content}
                  </Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
      
      <div style={{ background: '#f8fbff', padding: '48px 24px', borderRadius: '40px 40px 0 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Row gutter={[48, 48]}>
            {/* 最新挑战 */}
            <Col xs={24} lg={12}>
              <div style={{ marginBottom: '32px' }}>
                <Space align="center">
                  <RocketOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                  <Title level={3} style={{ margin: 0 }}>最新挑战</Title>
                </Space>
              </div>
              <SimpleChallengeList 
                challenges={recentChallenges}
                selectedTags={[]}
                pagination={homePagination}
                total={recentChallenges.length}
                onPaginationChange={handlePaginationChange}
                onTagClick={handleTagClick}
                onDifficultyClick={handleDifficultyClick}
                onPlatformClick={handlePlatformClick}
                onChallengeClick={(id) => navigate(`/challenge/${id}`)}
              />
              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <Button 
                  type="primary" 
                  ghost
                  onClick={() => navigate('/challenges')}
                  style={{ borderRadius: '20px' }}
                >
                  查看更多挑战 <ArrowRightOutlined />
                </Button>
              </div>
            </Col>
            
            {/* 热门挑战 */}
            <Col xs={24} lg={12}>
              <div style={{ marginBottom: '32px' }}>
                <Space align="center">
                  <FireOutlined style={{ fontSize: '24px', color: '#f5222d' }} />
                  <Title level={3} style={{ margin: 0 }}>热门挑战</Title>
                </Space>
              </div>
              <SimpleChallengeList 
                challenges={popularChallenges}
                selectedTags={[]}
                pagination={homePagination}
                total={popularChallenges.length}
                onPaginationChange={handlePaginationChange}
                onTagClick={handleTagClick}
                onDifficultyClick={handleDifficultyClick}
                onPlatformClick={handlePlatformClick}
                onChallengeClick={(id) => navigate(`/challenge/${id}`)}
              />
              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <Button 
                  type="primary" 
                  ghost
                  onClick={() => navigate('/challenges')}
                  style={{ borderRadius: '20px' }}
                >
                  查看更多挑战 <ArrowRightOutlined />
                </Button>
              </div>
            </Col>
          </Row>
        </div>
      </div>
      
      {/* 添加CSS动画 */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes slideInRight {
            from { opacity: 0; transform: translateX(30px); }
            to { opacity: 1; transform: translateX(0); }
          }
          
          .ant-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          
          .ant-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1) !important;
          }
        `}
      </style>
    </div>
  );
};

export default HomePage;