// src/components/HomePage.tsx
import { Card, Col, Row, Typography, Divider } from 'antd';
import { challenges, SimpleChallengeList } from './ChallengeListPage/exports';

const { Title, Text } = Typography;

const features = [
  {
    title: '挑战列表',
    content: '浏览完整的 LeetCode 挑战列表，包含详细信息和难度分级',
    color: '#42b983'
  },
  {
    title: '筛选与排序',
    content: '根据难度、创建时间等多种条件筛选和排序挑战',
    color: '#1890ff'
  },
  {
    title: '题解链接',
    content: '获取挑战的参考资料和题解链接，提高解题效率',
    color: '#722ed1'
  }
];

/**
 * 首页组件
 * 展示网站主要功能和推荐挑战列表
 */
const HomePage = () => {
  // 获取最近的3个挑战
  const recentChallenges = challenges.slice(0, 3);

  return (
    <div style={{ padding: '24px' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '24px' }}>
            欢迎来到 LeetCode 爬虫挑战平台
        </Title>
        
        {/* 功能介绍 */}
        <Row gutter={[16, 16]} justify="center" style={{ marginBottom: '32px' }}>
            {features.map((feature, index) => (
                <Col key={index} xs={24} sm={12} md={8}>
                    <Card 
                        hoverable
                        style={{ height: '100%', borderColor: feature.color }}
                        styles={{ body: { display: 'flex', flexDirection: 'column', justifyContent: 'space-between' } }}
                    >
                        <Title level={4} style={{ color: feature.color }}>{feature.title}</Title>
                        <Text type="secondary">{feature.content}</Text>
                    </Card>
                </Col>
            ))}
        </Row>
        
        <Divider />
        
        {/* 最近挑战 */}
        <SimpleChallengeList 
            challenges={recentChallenges} 
            title="最近的挑战"
        />
    </div>
);

};

export default HomePage;