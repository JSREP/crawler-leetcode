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
  viewMoreButtonStyle
} from './styles';

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

  return (
    <div style={challengeSectionStyle}>
      <div style={challengeContainerStyle}>
        <Row gutter={[48, 48]}>
          {/* 最新挑战 */}
          <Col xs={24} lg={12}>
            <div style={challengeTitleContainerStyle}>
              <Space align="center">
                <RocketOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                <Title level={3} style={{ margin: 0 }}>{t('home.challenges.recent.title')}</Title>
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
                style={viewMoreButtonStyle}
              >
                {t('home.challenges.recent.viewMore')} <ArrowRightOutlined />
              </Button>
            </div>
          </Col>
          
          {/* 热门挑战 */}
          <Col xs={24} lg={12}>
            <div style={challengeTitleContainerStyle}>
              <Space align="center">
                <FireOutlined style={{ fontSize: '24px', color: '#f5222d' }} />
                <Title level={3} style={{ margin: 0 }}>{t('home.challenges.popular.title')}</Title>
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
                style={viewMoreButtonStyle}
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