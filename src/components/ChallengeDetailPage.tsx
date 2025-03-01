import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Space, Tag, Typography, message } from 'antd';
import { StarFilled, ShareAltOutlined } from '@ant-design/icons';
import { challenges } from './ChallengePage';

const { Title, Text } = Typography;

const ChallengeDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const challenge = challenges.find(c => c.id === Number(id));

    const handleTagClick = (tag: string) => {
        navigate(`/challenges?tag=${encodeURIComponent(tag)}`);
    };

    const handleShare = () => {
        const shareText = `【${challenge?.title}】\n 🌟学习地址: ${window.location.origin}/challenge/${challenge?.id}`;
        navigator.clipboard
            .writeText(shareText)
            .then(() => {
                message.success('已复制到剪切板');
            })
            .catch(() => {
                message.error('复制失败，请重试');
            });
    };

    if (!challenge) {
        return (
            <div style={{ padding: 24, maxWidth: '60%', margin: '0 auto' }}>
                <Button onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>返回列表</Button>
                <Card>
                    <Title level={4}>题目不存在</Title>
                    <Text>找不到ID为{id}的题目</Text>
                </Card>
            </div>
        );
    }

    return (
        <div style={{ padding: 24, maxWidth: '60%', margin: '0 auto' }}>
            <Button onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>返回列表</Button>
            <Card style={{ position: 'relative' }}>
                <div style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    zIndex: 1000,
                    backgroundColor: 'white',
                    padding: 8,
                    borderRadius: 4,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}>
                    <Button
                        size="small"
                        icon={<ShareAltOutlined />}
                        onClick={handleShare}
                        title="点击复制分享内容"
                    />
                </div>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Space align="baseline">
                        <Tag color="#42b983">{challenge.number}</Tag>
                        <Title level={2}>{challenge.title}</Title>
                    </Space>

                    <Text type="secondary" style={{ fontSize: 16 }}>{challenge.description}</Text>

                    <Space wrap>
                        <Tag icon={<StarFilled />} color="gold">
                            {'★'.repeat(challenge.difficulty)}
                        </Tag>
                        {challenge.tags.map(tag => (
                            <Tag
                                key={tag}
                                color="blue"
                                onClick={() => handleTagClick(tag)}
                                style={{ cursor: 'pointer' }}
                            >
                                {tag}
                            </Tag>
                        ))}
                        <Text type="secondary" style={{ marginLeft: 8 }}>
                            创建时间: {challenge.createTime.toLocaleDateString()}
                        </Text>
                        <Text type="secondary">
                            更新时间: {challenge.updateTime.toLocaleDateString()}
                        </Text>
                    </Space>

                    <div style={{ marginTop: 24 }}>
                        <Title level={4}>题解列表</Title>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            {challenge.solutions.map((solution, index) => (
                                <Card key={solution.url} style={{ width: '100%' }}>
                                    <Text strong>题解 {index + 1}: {solution.title}</Text>
                                    <div>
                                        <Text type="secondary">来源: {solution.source}</Text>
                                        <br />
                                        <a href={solution.url} target="_blank" rel="noopener noreferrer">
                                            查看完整题解
                                        </a>
                                    </div>
                                </Card>
                            ))}
                        </Space>
                    </div>
                </Space>
            </Card>
        </div>
    );
};

export default ChallengeDetailPage;