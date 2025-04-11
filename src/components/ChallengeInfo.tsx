import { Button, Space, Tag, Typography } from 'antd';
import StarRating from './StarRating';
import Tags from './Tags';

const { Text, Title } = Typography;

interface ChallengeInfoProps {
    challenge: {
        number: number;
        title: string;
        description: string;
        difficulty: number;
        tags: string[];
        externalLink?: string;
        createTime: Date;
        updateTime: Date;
    };
    onTagClick?: (tag: string) => void;
    onDifficultyClick?: (difficulty: number) => void;
    selectedTags?: string[];
}

const ChallengeInfo = ({
                           challenge,
                           onTagClick,
                           onDifficultyClick,
                           selectedTags
                       }: ChallengeInfoProps) => {
    return (
        <Space direction="vertical" style={{ width: '100%' }}>
            <Space align="baseline">
                <Tag color="#42b983">{challenge.number}</Tag>
                <Title level={2}>{challenge.title}</Title>
            </Space>

            <Text type="secondary" style={{ fontSize: 16 }}>{challenge.description}</Text>

            <Space wrap>
                <StarRating
                    difficulty={challenge.difficulty}
                    onClick={onDifficultyClick}
                />
                <Tags
                    tags={challenge.tags}
                    selectedTags={selectedTags}
                    onTagClick={onTagClick}
                />
                <Text type="secondary" style={{ marginLeft: 8 }}>
                    创建时间: {challenge.createTime.toLocaleDateString()}
                </Text>
                <Text type="secondary">
                    更新时间: {challenge.updateTime.toLocaleDateString()}
                </Text>
            </Space>

            {challenge.externalLink && (
                <div style={{ marginTop: 16 }}>
                    <Button
                        type="primary"
                        href={challenge.externalLink}
                        target="_blank"
                    >
                        去试试
                    </Button>
                </div>
            )}
        </Space>
    );
};

export default ChallengeInfo;