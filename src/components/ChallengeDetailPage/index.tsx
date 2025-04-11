import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Space, Divider } from 'antd';
import { Challenge } from '../../types/challenge';
import { challenges } from '../ChallengeListPage/exports';

// 导入各个子组件
import ChallengeHeader from './ChallengeHeader';
import ChallengeMetadata from './ChallengeMetadata';
import ChallengeTags from './ChallengeTags';
import ChallengeDescription from './ChallengeDescription';
import ChallengeSolutions from './ChallengeSolutions';
import ChallengeActions from './ChallengeActions';

/**
 * 挑战详情页主组件
 * 负责数据获取和组织布局
 */
const ChallengeDetailPage = () => {
    const { id } = useParams<{ id: string }>();
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
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <Card bordered={false} style={{ marginBottom: '20px' }}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    {/* 标题区域 */}
                    <ChallengeHeader challenge={challenge} />

                    {/* 元数据信息 */}
                    <ChallengeMetadata challenge={challenge} />

                    {/* 标签 */}
                    <ChallengeTags challenge={challenge} />

                    {/* 问题描述 */}
                    <ChallengeDescription challenge={challenge} />

                    <Divider />

                    {/* 解决方案 */}
                    {challenge.solutions && challenge.solutions.length > 0 && (
                        <>
                            <ChallengeSolutions challenge={challenge} />
                            <Divider />
                        </>
                    )}
                    
                    {/* 外部链接和返回 */}
                    <ChallengeActions challenge={challenge} />
                </Space>
            </Card>
        </div>
    );
};

export default ChallengeDetailPage; 