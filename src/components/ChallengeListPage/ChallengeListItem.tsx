import { Button, Card, Space, Typography } from 'antd';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Challenge } from '../../types/challenge';
import StarRating from '../StarRating';
import IdTag from '../IdTag';
import PlatformTag from '../PlatformTag';
import TopicTag from '../TopicTag';
import { useMediaQuery } from 'react-responsive';

const { Text } = Typography;

interface ChallengeListItemProps {
    /**
     * 挑战数据
     */
    challenge: Challenge;
    
    /**
     * 当前选中的标签
     */
    selectedTags: string[];
    
    /**
     * 点击挑战项回调
     */
    onClick: () => void;
    
    /**
     * 点击标签回调
     */
    onTagClick: (tag: string) => void;
    
    /**
     * 点击难度回调
     */
    onDifficultyClick: (difficulty: number) => void;
    
    /**
     * 点击平台回调
     */
    onPlatformClick?: (platform: string) => void;
}

/**
 * 单个挑战列表项组件
 */
const ChallengeListItem: React.FC<ChallengeListItemProps> = ({
    challenge,
    selectedTags,
    onClick,
    onTagClick,
    onDifficultyClick,
    onPlatformClick
}) => {
    const { t, i18n } = useTranslation();
    const isMobile = useMediaQuery({ maxWidth: 768 });
    
    // 确保id是一个有效值
    const displayId = challenge.id !== undefined ? challenge.id : '?';
    
    // 根据当前语言选择显示标题
    const displayTitle = i18n.language === 'en' && challenge.titleEN ? challenge.titleEN : challenge.title;
    
    return (
        <Card
            hoverable
            onClick={onClick}
            style={{ 
                cursor: 'pointer',
                borderRadius: '8px'
            }}
            bodyStyle={{ 
                padding: isMobile ? '12px' : '24px'
            }}
        >
            <Space direction="vertical" style={{ width: '100%' }} size={isMobile ? 'small' : 'middle'}>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    flexDirection: isMobile ? 'column' : 'row', 
                    gap: isMobile ? '8px' : '0'
                }}>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        marginRight: isMobile ? '0' : '12px'
                    }}>
                        <IdTag id={displayId} />
                        <StarRating
                            difficulty={challenge.difficulty}
                            onClick={onDifficultyClick}
                            stopPropagation={true}
                        />
                    </div>
                    <Text 
                        strong 
                        style={{ 
                            fontSize: isMobile ? 14 : 16,
                            lineHeight: 1.4,
                            flex: 1,
                            marginBottom: isMobile ? '4px' : '0'
                        }}
                    >
                        {displayTitle}
                    </Text>
                </div>

                <Space wrap size={isMobile ? 4 : 'small'} style={{ marginTop: isMobile ? '4px' : '8px' }}>
                    {/* 添加平台标签 */}
                    {challenge.platform && onPlatformClick && (
                        <PlatformTag 
                            platform={challenge.platform}
                            clickable
                            onClick={onPlatformClick}
                            stopPropagation={true}
                        />
                    )}
                    
                    {/* 限制在移动设备上显示的标签数量 */}
                    {(isMobile ? challenge.tags.slice(0, 2) : challenge.tags).map(tag => (
                        <TopicTag
                            key={tag}
                            text={tag}
                            selected={selectedTags.includes(tag)}
                            clickable
                            onClick={onTagClick}
                            stopPropagation={true}
                        />
                    ))}
                    
                    {isMobile && challenge.tags.length > 2 && (
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            +{challenge.tags.length - 2}
                        </Text>
                    )}
                </Space>

                <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    fontSize: isMobile ? '12px' : '14px',
                    marginTop: isMobile ? '4px' : '8px'
                }}>
                    <Space size={isMobile ? 4 : 8} wrap>
                        <Text type="secondary" style={{ fontSize: isMobile ? '12px' : '14px' }}>
                            {isMobile ? t('challenges.dates.createdShort') : t('challenges.dates.created')}: {challenge.createTime.toLocaleDateString()}
                        </Text>
                        <Text type="secondary" style={{ fontSize: isMobile ? '12px' : '14px' }}>
                            {isMobile ? t('challenges.dates.updatedShort') : t('challenges.dates.updated')}: {challenge.updateTime.toLocaleDateString()}
                        </Text>
                    </Space>

                    <Button
                        type="link"
                        href={challenge.externalLink}
                        target="_blank"
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        style={{ 
                            padding: isMobile ? '0 4px' : '0 8px',
                            height: 'auto',
                            fontSize: isMobile ? '12px' : '14px'
                        }}
                    >
                        {isMobile ? t('challenge.detail.startChallengeShort') : t('challenge.detail.startChallenge')} ➔
                    </Button>
                </div>
            </Space>
        </Card>
    );
};

export default ChallengeListItem; 