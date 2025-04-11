import {useEffect, useState} from 'react';
import {useParams, Link} from 'react-router-dom';
import { Challenge } from '../types/challenge';
import { challenges } from './ChallengeList';
import {Tag, Typography, Badge, Divider, Alert, Card, Space} from 'antd';

const {Text, Title, Paragraph} = Typography;

const ChallengeDetailPage = () => {
    const {id} = useParams<{ id: string }>();
    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            try {
                // 直接使用字符串ID查找挑战
                const foundChallenge = challenges.find(c => c.id === id);
                
                if (foundChallenge) {
                    setChallenge(foundChallenge);
                    setError(null);
                } else {
                    throw new Error(`未找到ID为${id}的挑战`);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : '加载挑战失败');
                setChallenge(null);
            } finally {
                setLoading(false);
            }
        }
    }, [id]);

    if (loading) {
        return <div className="text-center py-8">加载中...</div>;
    }

    if (error) {
        return (
            <div className="text-red-500 text-center py-8">
                {error}
            </div>
        );
    }

    if (!challenge) {
        return <div className="text-center py-8">未找到挑战</div>;
    }

    return (
        <div style={{padding: '20px', maxWidth: '1000px', margin: '0 auto'}}>
            <Card bordered={false} style={{marginBottom: '20px'}}>
                <Space direction="vertical" size="large" style={{width: '100%'}}>
                    {/* 标题区域 */}
                    <div>
                        <Space align="center">
                            <Tag color="#108ee9">#{challenge.number}</Tag>
                            <Title level={2} style={{margin: 0}}>{challenge.title}</Title>
                            {challenge.isExpired && (
                                <Badge status="error" text="链接已失效" />
                            )}
                        </Space>
                    </div>

                    {/* 元数据信息 */}
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '16px'}}>
                        <div>
                            <Text type="secondary">难度级别:</Text>
                            <span className={`badge ${getDifficultyBadgeClass(challenge.difficulty)}`} style={{marginLeft: '8px'}}>
                                {getDifficultyText(challenge.difficulty)}
                            </span>
                        </div>

                        <div>
                            <Text type="secondary">适用平台:</Text>
                            <Tag color="blue" style={{marginLeft: '8px'}}>{challenge.platform || '未指定'}</Tag>
                        </div>

                        <div>
                            <Text type="secondary">创建时间:</Text>
                            <Text style={{marginLeft: '8px'}}>{challenge.createTime.toLocaleString()}</Text>
                        </div>

                        <div>
                            <Text type="secondary">更新时间:</Text>
                            <Text style={{marginLeft: '8px'}}>{challenge.updateTime.toLocaleString()}</Text>
                        </div>
                    </div>

                    {/* 标签 */}
                    <div>
                        <Text type="secondary">标签:</Text>
                        <div style={{marginTop: '8px'}}>
                            {challenge.tags.map((tag, index) => (
                                <Tag key={index} color="green" style={{marginRight: '8px'}}>
                                    {tag}
                                </Tag>
                            ))}
                        </div>
                    </div>

                    {/* 问题描述 */}
                    <div>
                        <Title level={3}>问题描述</Title>
                        <Paragraph style={{whiteSpace: 'pre-line'}}>
                            {challenge.description}
                        </Paragraph>
                        {challenge.descriptionMarkdown && (
                            <div>
                                <Text type="secondary">详细描述 (Markdown):</Text>
                                <Paragraph style={{marginTop: '8px', backgroundColor: '#f5f5f5', padding: '16px'}}>
                                    {challenge.descriptionMarkdown}
                                </Paragraph>
                            </div>
                        )}
                    </div>

                    <Divider />

                    {/* 解决方案 */}
                    {challenge.solutions && challenge.solutions.length > 0 && (
                        <div>
                            <Title level={3}>参考解答</Title>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                                {challenge.solutions.map((solution, index) => (
                                    <Card key={index} size="small" hoverable>
                                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                            <div>
                                                <Text strong>{solution.title}</Text>
                                                <div style={{marginTop: '4px'}}>
                                                    <Text type="secondary">来源: {solution.source}</Text>
                                                    {solution.author && (
                                                        <Text type="secondary" style={{marginLeft: '12px'}}>
                                                            作者: {solution.author}
                                                        </Text>
                                                    )}
                                                </div>
                                            </div>
                                            <a 
                                                href={solution.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                            >
                                                查看解答
                                            </a>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    <Divider />
                    
                    {/* 外部链接 */}
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <div>
                            {challenge.isExpired && (
                                <Alert 
                                    message="此题目链接可能已失效" 
                                    type="warning" 
                                    showIcon 
                                    style={{marginBottom: '16px'}}
                                />
                            )}
                            <a
                                href={challenge.externalLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded inline-block"
                                style={{
                                    backgroundColor: '#1890ff',
                                    color: 'white',
                                    padding: '8px 16px',
                                    borderRadius: '4px',
                                    textDecoration: 'none'
                                }}
                            >
                                在LeetCode上查看
                            </a>
                        </div>
                        <Link to="/challenges" style={{color: '#1890ff'}}>
                            返回挑战列表
                        </Link>
                    </div>
                </Space>
            </Card>
        </div>
    );
};

const getDifficultyBadgeClass = (difficulty: number): string => {
    switch (difficulty) {
        case 1:
            return 'bg-green-100 text-green-800';
        case 2:
        case 3:
            return 'bg-yellow-100 text-yellow-800';
        case 4:
        case 5:
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const getDifficultyText = (difficulty: number): string => {
    switch (difficulty) {
        case 1:
            return '简单';
        case 2:
        case 3:
            return '中等';
        case 4:
        case 5:
            return '困难';
        default:
            return '未知';
    }
};

export default ChallengeDetailPage;