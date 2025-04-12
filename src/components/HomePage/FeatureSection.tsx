import * as React from 'react';
import { Card, Col, Row, Typography } from 'antd';
import { 
  CodeOutlined, 
  FilterOutlined, 
  BugOutlined 
} from '@ant-design/icons';
import { 
  featureSectionStyle, 
  sectionTitleStyle, 
  sectionTitleDividerStyle,
  featureCardStyle,
  featureCardContentStyle
} from './styles';

const { Title, Text } = Typography;

// 功能特性数据
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
 * 功能介绍区域组件
 */
const FeatureSection: React.FC = () => {
  return (
    <div style={featureSectionStyle}>
      <Title level={2} style={sectionTitleStyle}>
        平台特色
        <div style={sectionTitleDividerStyle}></div>
      </Title>
      
      <Row gutter={[24, 24]} justify="center">
        {features.map((feature, index) => (
          <Col key={index} xs={24} sm={12} md={8}>
            <Card 
              hoverable
              style={featureCardStyle}
            >
              <div style={featureCardContentStyle}>
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
  );
};

export default FeatureSection; 