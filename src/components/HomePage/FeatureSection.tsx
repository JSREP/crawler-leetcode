import * as React from 'react';
import { Card, Col, Row, Typography } from 'antd';
import { 
  CodeOutlined, 
  FilterOutlined, 
  BugOutlined 
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { 
  featureSectionStyle, 
  sectionTitleStyle, 
  sectionTitleDividerStyle,
  featureCardStyle,
  featureCardContentStyle
} from './styles';

const { Title, Text } = Typography;

/**
 * 功能介绍区域组件
 */
const FeatureSection: React.FC = () => {
  const { t } = useTranslation();

  // 从i18n获取功能特性数据
  const features = [
    {
      title: t('home.features.items.0.title'),
      content: t('home.features.items.0.content'),
      color: '#42b983',
      icon: <BugOutlined />
    },
    {
      title: t('home.features.items.1.title'),
      content: t('home.features.items.1.content'),
      color: '#1890ff',
      icon: <FilterOutlined />
    },
    {
      title: t('home.features.items.2.title'),
      content: t('home.features.items.2.content'),
      color: '#722ed1',
      icon: <CodeOutlined />
    }
  ];

  return (
    <div style={featureSectionStyle}>
      <Title level={2} style={sectionTitleStyle}>
        {t('home.features.title')}
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