import * as React from 'react';
import { Button, Col, Row, Space, Typography } from 'antd';
import { ArrowRightOutlined, FireOutlined, RocketOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Challenge } from '../../types/challenge';
import { SimpleChallengeList } from '../ChallengeListPage/exports';
import { 
  challengeSectionStyle, 
  challengeContainerStyle,
  challengeTitleContainerStyle,
  viewMoreButtonContainerStyle,
  viewMoreButtonStyle,
  challengeSectionMobileStyle,
  challengeTitleMobileStyle,
  viewMoreButtonMobileStyle
} from './styles';
import { useMediaQuery } from 'react-responsive';

const { Title } = Typography;

interface ChallengeSectionProps {
  recentChallenges: Challenge[];
  popularChallenges: Challenge[];
  homePagination: { current: number; pageSize: number };
  onPaginationChange: (page: number, pageSize: number) => void;
  onTagClick: (tag: string) => void;
  onDifficultyClick: (difficulty: string) => void;
  onPlatformClick: (platform: string) => void;
}

/**
 * 挑战列表区域组件，包含最新挑战和热门挑战
 */
const ChallengeSection: React.FC<ChallengeSectionProps> = ({
  recentChallenges,
  popularChallenges,
  homePagination,
  onPaginationChange,
  onTagClick,
  onDifficultyClick,
  onPlatformClick
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <div style={{ ...challengeSectionStyle, ...(isMobile ? challengeSectionMobileStyle : {}) }}>
      <div style={challengeContainerStyle}>
        <Row gutter={[48, 48]}>
          {/* 最新挑战 */}
          <Col xs={24} lg={12}>
            <div 
              style={{ ...challengeTitleContainerStyle, ...(isMobile ? challengeTitleMobileStyle : {}) }}
              className="challenge-section-title"
            >
              <Space align="center">
                <RocketOutlined style={{ fontSize: isMobile ? '20px' : '24px', color: '#1890ff' }} />
                <Title level={3} style={{ margin: 0, fontSize: isMobile ? '1.3rem' : '1.5rem' }}>
                  {t('home.challenges.recent.title')}
                </Title>
              </Space>
            </div>
            <SimpleChallengeList 
              challenges={recentChallenges}
              selectedTags={[]}
              pagination={homePagination}
              total={recentChallenges.length}
              onPaginationChange={onPaginationChange}
              onTagClick={onTagClick}
              onDifficultyClick={onDifficultyClick}
              onPlatformClick={onPlatformClick}
              onChallengeClick={(id) => navigate(`/challenge/${id}`)}
              hidePagination={true}
            />
            <div style={viewMoreButtonContainerStyle}>
              <Button 
                type="primary" 
                ghost
                onClick={() => navigate('/challenges')}
                style={{ ...viewMoreButtonStyle, ...(isMobile ? viewMoreButtonMobileStyle : {}) }}
                className="challenge-more-button"
              >
                {t('home.challenges.recent.viewMore')} <ArrowRightOutlined />
              </Button>
            </div>
          </Col>
          
          {/* 热门挑战 */}
          <Col xs={24} lg={12}>
            <div 
              style={{ ...challengeTitleContainerStyle, ...(isMobile ? challengeTitleMobileStyle : {}) }}
              className="challenge-section-title"
            >
              <Space align="center">
                <FireOutlined style={{ fontSize: isMobile ? '20px' : '24px', color: '#f5222d' }} />
                <Title level={3} style={{ margin: 0, fontSize: isMobile ? '1.3rem' : '1.5rem' }}>
                  {t('home.challenges.popular.title')}
                </Title>
              </Space>
            </div>
            <SimpleChallengeList 
              challenges={popularChallenges}
              selectedTags={[]}
              pagination={homePagination}
              total={popularChallenges.length}
              onPaginationChange={onPaginationChange}
              onTagClick={onTagClick}
              onDifficultyClick={onDifficultyClick}
              onPlatformClick={onPlatformClick}
              onChallengeClick={(id) => navigate(`/challenge/${id}`)}
              hidePagination={true}
            />
            <div style={viewMoreButtonContainerStyle}>
              <Button 
                type="primary" 
                ghost
                onClick={() => navigate('/challenges')}
                style={{ ...viewMoreButtonStyle, ...(isMobile ? viewMoreButtonMobileStyle : {}) }}
                className="challenge-more-button"
              >
                {t('home.challenges.popular.viewMore')} <ArrowRightOutlined />
              </Button>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ChallengeSection; 