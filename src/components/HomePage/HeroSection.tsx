import * as React from 'react';
import { Button, Col, Row, Space, Typography, Statistic, Badge } from 'antd';
import { ArrowRightOutlined, TrophyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { 
  heroSectionStyle, 
  heroTitleStyle, 
  heroSubtitleStyle, 
  primaryButtonStyle, 
  secondaryButtonStyle,
  statsCardStyle
} from './styles';

const { Title, Text, Paragraph } = Typography;

interface HeroSectionProps {
  challenges: number;
  difficultyCounts: {
    easy: number;
    medium: number;
    hard: number;
  };
  animatedStats: boolean;
}

/**
 * 首页顶部的英雄区域组件
 */
const HeroSection: React.FC<HeroSectionProps> = ({ challenges, difficultyCounts, animatedStats }) => {
  const navigate = useNavigate();

  return (
    <div style={heroSectionStyle}>
      <Row justify="center" align="middle" gutter={[32, 32]}>
        <Col xs={24} md={16} lg={12}>
          <div style={{ animation: 'fadeIn 1s ease-out' }}>
            <Title level={1} style={heroTitleStyle}>
              爬虫技术挑战合集
            </Title>
            <Paragraph style={heroSubtitleStyle}>
              突破各种网站反爬机制，掌握先进爬虫技术，提升数据采集能力，成为爬虫工程师的不二之选
            </Paragraph>
            <Space size="middle">
              <Button 
                type="primary" 
                size="large" 
                onClick={() => navigate('/challenges')}
                style={primaryButtonStyle}
              >
                开始挑战 <ArrowRightOutlined />
              </Button>
              <Button 
                size="large"
                style={secondaryButtonStyle}
                onClick={() => navigate('/about')}
              >
                了解更多
              </Button>
            </Space>
          </div>
        </Col>
        <Col xs={24} md={8} lg={8} style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ 
            ...statsCardStyle,
            transform: animatedStats ? 'translateY(0)' : 'translateY(20px)',
            opacity: animatedStats ? 1 : 0,
            transition: 'transform 0.8s ease-out, opacity 0.8s ease-out',
          }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Statistic 
                title={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>总挑战数</Text>} 
                value={challenges} 
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
  );
};

export default HeroSection; 