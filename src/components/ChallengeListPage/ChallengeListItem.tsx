import { Button, Card, Space, Tag, Typography } from 'antd';
import * as React from 'react';
import { Challenge } from '../../types/challenge';
import StarRating from '../StarRating';

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
    return (
        <Card
            hoverable
            onClick={onClick}
            style={{ cursor: 'pointer' }}
        >
            <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                    <Tag color="#42b983">#{challenge.id}</Tag>
                    <Text strong style={{ fontSize: 16 }}>{challenge.title}</Text>
                </Space>

                <Text type="secondary">{challenge.description}</Text>

                <Space wrap>
                    <StarRating
                        difficulty={challenge.difficulty}
                        onClick={(difficulty) => {
                            onDifficultyClick(difficulty);
                        }}
                    />
                    
                    {/* 添加平台标签 */}
                    {challenge.platform && (
                        <Tag 
                            color={challenge.platform === 'LeetCode' ? 'orange' : 'purple'}
                            style={{ cursor: 'pointer' }}
                            onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                if (challenge.platform && onPlatformClick) {
                                    onPlatformClick(challenge.platform);
                                }
                            }}
                        >
                            {challenge.platform}
                        </Tag>
                    )}
                    
                    {challenge.tags.map(tag => (
                        <Tag
                            key={tag}
                            color={selectedTags.includes(tag) ? 'geekblue' : 'blue'}
                            onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                onTagClick(tag);
                            }}
                            style={{ cursor: 'pointer' }}
                        >
                            {tag}
                        </Tag>
                    ))}
                    <Text type="secondary">
                        创建时间: {challenge.createTime.toLocaleDateString()}
                    </Text>
                    <Text type="secondary">
                        更新时间: {challenge.updateTime.toLocaleDateString()}
                    </Text>
                </Space>

                <div style={{ marginTop: 12 }}>
                    <Button
                        type="link"
                        href={challenge.externalLink}
                        target="_blank"
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    >
                        去试试 ➔
                    </Button>
                </div>
            </Space>
        </Card>
    );
};

export default ChallengeListItem; 