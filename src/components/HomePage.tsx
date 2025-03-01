// src/components/HomePage.tsx
import { Card, Col, Row, Typography } from 'antd';

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

const HomePage = () => {
  return (
      <div style={{ padding: 24 }}>
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
          background: '#f8f9fa',
          borderRadius: 8,
          marginBottom: 48
        }}>
          <Title level={2} style={{ color: '#2c3e50', marginBottom: 16 }}>
            欢迎使用 LeetCode 爬虫工具
          </Title>
          <Text style={{ fontSize: 16, color: '#6c757d' }}>
            一个帮助您整理和管理 LeetCode 编程挑战的平台
          </Text>
        </div>

        <Row gutter={[24, 24]} style={{ maxWidth: 1200, margin: '0 auto' }}>
          {features.map((feature, index) => (
              <Col key={index} xs={24} sm={12} lg={8}>
                <Card
                    hoverable
                    style={{
                      borderRadius: 8,
                      transition: 'all 0.3s',
                      borderColor: feature.color,
                      borderWidth: 1
                    }}
                    bodyStyle={{ padding: 24 }}
                >
                  <Title level={4} style={{ color: feature.color, marginBottom: 16 }}>
                    {feature.title}
                  </Title>
                  <Text style={{ color: '#6c757d', lineHeight: 1.6 }}>
                    {feature.content}
                  </Text>
                </Card>
              </Col>
          ))}
        </Row>
      </div>
  );
};

export default HomePage;