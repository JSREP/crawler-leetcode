import * as React from 'react';
import { Button, Col, Row, Space, Typography, Statistic, Badge, Progress, Tooltip } from 'antd';
import { ArrowRightOutlined, TrophyOutlined, RocketOutlined, FireOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  // 计算每个难度级别的百分比
  const total = difficultyCounts.easy + difficultyCounts.medium + difficultyCounts.hard || 1;
  const easyPercent = Math.round((difficultyCounts.easy / total) * 100);
  const mediumPercent = Math.round((difficultyCounts.medium / total) * 100);
  const hardPercent = Math.round((difficultyCounts.hard / total) * 100);

  // 难度级别卡片样式
  const difficultyCardStyle = {
    padding: '12px',
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative' as const,
    overflow: 'hidden' as const,
  };

  return (
    <div style={heroSectionStyle}>
      <Row justify="center" align="middle" gutter={[32, 32]}>
        <Col xs={24} md={16} lg={12}>
          <div style={{ animation: 'fadeIn 1s ease-out' }}>
            <Title level={1} style={heroTitleStyle}>
              {t('home.hero.title')}
            </Title>
            <Paragraph style={heroSubtitleStyle}>
              {t('home.hero.subtitle')}
            </Paragraph>
            <Space size="middle">
              <Button 
                type="primary" 
                size="large" 
                onClick={() => navigate('/challenges')}
                style={primaryButtonStyle}
              >
                {t('home.hero.startButton')} <ArrowRightOutlined />
              </Button>
              <Button 
                size="large"
                style={secondaryButtonStyle}
                onClick={() => navigate('/about')}
              >
                {t('home.hero.learnMoreButton')}
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
            width: '100%',
            backdropFilter: 'blur(8px)',
            background: 'linear-gradient(135deg, rgba(30,60,110,0.7) 0%, rgba(40,80,140,0.7) 100%)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* 总挑战数统计 */}
              <div style={{ 
                textAlign: 'center', 
                padding: '8px 0 16px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                marginBottom: '8px'
              }}>
                <Text style={{ 
                  color: 'rgba(255,255,255,0.9)', 
                  fontSize: '18px',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  {t('home.hero.stats.totalChallenges')}
                </Text>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center'
                }}>
                  <div style={{ 
                    background: 'rgba(255,255,255,0.15)',
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '16px',
                    boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
                  }}>
                    <TrophyOutlined style={{ 
                      fontSize: '32px', 
                      color: '#FFD700',
                      filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))'
                    }} />
                  </div>
                  <span style={{ 
                    fontSize: '40px',
                    fontWeight: 'bold',
                    color: 'white',
                    textShadow: '0 0 10px rgba(255,255,255,0.4)'
                  }}>
                    {challenges}
                  </span>
                </div>
              </div>
              
              {/* 难度分布 */}
              <div>
                <Text style={{ 
                  color: 'rgba(255,255,255,0.9)', 
                  fontSize: '16px',
                  fontWeight: 500,
                  display: 'block',
                  marginBottom: '16px'
                }}>
                  {t('home.hero.stats.difficultyDistribution')}
                </Text>
                
                <Row gutter={[16, 16]}>
                  {/* 初级难度 */}
                  <Col span={24} sm={8}>
                    <Tooltip title={`${easyPercent}% ${t('home.hero.stats.ofTotal')}`}>
                      <div 
                        style={{ 
                          ...difficultyCardStyle,
                          background: 'rgba(82, 196, 26, 0.15)',
                          border: '1px solid rgba(82, 196, 26, 0.3)',
                        }}
                        onClick={() => navigate('/challenges?difficulty=easy')}
                      >
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          marginBottom: '8px'
                        }}>
                          <RocketOutlined style={{ color: '#52c41a', fontSize: '20px', marginRight: '8px' }} />
                          <Text style={{ color: '#52c41a', fontWeight: 'bold' }}>
                            {t('home.hero.stats.easy')}
                          </Text>
                        </div>
                        <div style={{ 
                          fontSize: '24px', 
                          fontWeight: 'bold', 
                          color: 'white',
                          marginBottom: '8px',
                          textShadow: '0 0 10px rgba(82, 196, 26, 0.4)'
                        }}>
                          {difficultyCounts.easy}
                        </div>
                        <Progress 
                          percent={easyPercent} 
                          showInfo={false}
                          strokeColor="#52c41a"
                          trailColor="rgba(255,255,255,0.1)"
                          size="small"
                        />
                      </div>
                    </Tooltip>
                  </Col>
                  
                  {/* 中级难度 */}
                  <Col span={24} sm={8}>
                    <Tooltip title={`${mediumPercent}% ${t('home.hero.stats.ofTotal')}`}>
                      <div 
                        style={{ 
                          ...difficultyCardStyle,
                          background: 'rgba(250, 173, 20, 0.15)',
                          border: '1px solid rgba(250, 173, 20, 0.3)',
                        }}
                        onClick={() => navigate('/challenges?difficulty=medium')}
                      >
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          marginBottom: '8px'
                        }}>
                          <FireOutlined style={{ color: '#faad14', fontSize: '20px', marginRight: '8px' }} />
                          <Text style={{ color: '#faad14', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                            {t('home.hero.stats.medium')}
                          </Text>
                        </div>
                        <div style={{ 
                          fontSize: '24px', 
                          fontWeight: 'bold', 
                          color: 'white',
                          marginBottom: '8px',
                          textShadow: '0 0 10px rgba(250, 173, 20, 0.4)'
                        }}>
                          {difficultyCounts.medium}
                        </div>
                        <Progress 
                          percent={mediumPercent} 
                          showInfo={false}
                          strokeColor="#faad14"
                          trailColor="rgba(255,255,255,0.1)"
                          size="small"
                        />
                      </div>
                    </Tooltip>
                  </Col>
                  
                  {/* 高级难度 */}
                  <Col span={24} sm={8}>
                    <Tooltip title={`${hardPercent}% ${t('home.hero.stats.ofTotal')}`}>
                      <div 
                        style={{ 
                          ...difficultyCardStyle,
                          background: 'rgba(245, 34, 45, 0.15)',
                          border: '1px solid rgba(245, 34, 45, 0.3)',
                        }}
                        onClick={() => navigate('/challenges?difficulty=hard')}
                      >
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          marginBottom: '8px'
                        }}>
                          <ThunderboltOutlined style={{ color: '#f5222d', fontSize: '20px', marginRight: '8px' }} />
                          <Text style={{ color: '#f5222d', fontWeight: 'bold' }}>
                            {t('home.hero.stats.hard')}
                          </Text>
                        </div>
                        <div style={{ 
                          fontSize: '24px', 
                          fontWeight: 'bold', 
                          color: 'white',
                          marginBottom: '8px',
                          textShadow: '0 0 10px rgba(245, 34, 45, 0.4)'
                        }}>
                          {difficultyCounts.hard}
                        </div>
                        <Progress 
                          percent={hardPercent} 
                          showInfo={false}
                          strokeColor="#f5222d"
                          trailColor="rgba(255,255,255,0.1)"
                          size="small"
                        />
                      </div>
                    </Tooltip>
                  </Col>
                </Row>
              </div>
            </Space>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default HeroSection; 