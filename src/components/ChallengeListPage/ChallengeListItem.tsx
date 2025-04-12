import { Button, Card, Space, Typography } from 'antd';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Challenge } from '../../types/challenge';
import StarRating from '../StarRating';
import IdTag from '../IdTag';
import PlatformTag from '../PlatformTag';
import TopicTag from '../TopicTag';

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
    const { t } = useTranslation();
    
    // 确保id是一个有效值
    const displayId = challenge.id !== undefined ? challenge.id : '?';
    
    return (
        <Card
            hoverable
            onClick={onClick}
            style={{ cursor: 'pointer' }}
        >
            <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                    <IdTag id={displayId} />
                    <Text strong style={{ fontSize: 16 }}>{challenge.title}</Text>
                </Space>

                <Text type="secondary">{challenge.description}</Text>

                <Space wrap>
                    <StarRating
                        difficulty={challenge.difficulty}
                        onClick={onDifficultyClick}
                        stopPropagation={true}
                    />
                    
                    {/* 添加平台标签 */}
                    {challenge.platform && onPlatformClick && (
                        <PlatformTag 
                            platform={challenge.platform}
                            clickable
                            onClick={onPlatformClick}
                            stopPropagation={true}
                        />
                    )}
                    
                    {challenge.tags.map(tag => (
                        <TopicTag
                            key={tag}
                            text={tag}
                            selected={selectedTags.includes(tag)}
                            clickable
                            onClick={onTagClick}
                            stopPropagation={true}
                        />
                    ))}
                    <Text type="secondary">
                        {t('challenges.dates.created')}: {challenge.createTime.toLocaleDateString()}
                    </Text>
                    <Text type="secondary">
                        {t('challenges.dates.updated')}: {challenge.updateTime.toLocaleDateString()}
                    </Text>
                </Space>

                <div style={{ marginTop: 12 }}>
                    <Button
                        type="link"
                        href={challenge.externalLink}
                        target="_blank"
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    >
                        {t('challenge.detail.startChallenge')} ➔
                    </Button>
                </div>
            </Space>
        </Card>
    );
};

export default ChallengeListItem; 