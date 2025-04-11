import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Space, Divider, Alert, Button } from 'antd';
import { Challenge } from '../../types/challenge';
import { challenges } from '../ChallengeListPage/exports';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

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
    const navigate = useNavigate();
    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [prevChallenge, setPrevChallenge] = useState<Challenge | null>(null);
    const [nextChallenge, setNextChallenge] = useState<Challenge | null>(null);

    // 查找当前挑战以及前后挑战
    useEffect(() => {
        if (id) {
            try {
                // 获取所有挑战的索引
                const currentIndex = challenges.findIndex(c => c.id === id);
                
                if (currentIndex !== -1) {
                    // 设置当前挑战
                    setChallenge(challenges[currentIndex]);
                    setError(null);
                    
                    // 设置前一个挑战（如果存在）
                    if (currentIndex > 0) {
                        setPrevChallenge(challenges[currentIndex - 1]);
                    } else {
                        setPrevChallenge(null);
                    }
                    
                    // 设置后一个挑战（如果存在）
                    if (currentIndex < challenges.length - 1) {
                        setNextChallenge(challenges[currentIndex + 1]);
                    } else {
                        setNextChallenge(null);
                    }
                } else {
                    throw new Error(`未找到ID为${id}的挑战`);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : '加载挑战失败');
                setChallenge(null);
                setPrevChallenge(null);
                setNextChallenge(null);
            } finally {
                setLoading(false);
            }
        }
    }, [id]);

    // 处理键盘事件
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // 左方向键 - 上一个挑战
            if (e.key === 'ArrowLeft' && prevChallenge) {
                navigate(`/challenge/${prevChallenge.id}`);
            }
            // 右方向键 - 下一个挑战
            else if (e.key === 'ArrowRight' && nextChallenge) {
                navigate(`/challenge/${nextChallenge.id}`);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        
        // 清理事件监听器
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [prevChallenge, nextChallenge, navigate]);

    // 导航到前一个挑战
    const goToPrevChallenge = () => {
        if (prevChallenge) {
            navigate(`/challenge/${prevChallenge.id}`);
        }
    };

    // 导航到后一个挑战
    const goToNextChallenge = () => {
        if (nextChallenge) {
            navigate(`/challenge/${nextChallenge.id}`);
        }
    };

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
            {/* 如果链接已失效，显示顶部警告 */}
            {challenge.isExpired && (
                <Alert
                    message="警告：此挑战题目链接已失效"
                    description="该链接可能已经被移除或已更改。请尝试搜索最新版本或联系管理员更新此题目。"
                    type="error"
                    showIcon
                    banner
                    style={{ marginBottom: '20px' }}
                />
            )}
            
            {/* 添加翻页按钮 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <Button 
                    type="default" 
                    icon={<LeftOutlined />} 
                    onClick={goToPrevChallenge} 
                    disabled={!prevChallenge}
                >
                    上一题
                </Button>
                <Button 
                    type="default" 
                    icon={<RightOutlined />} 
                    onClick={goToNextChallenge} 
                    disabled={!nextChallenge}
                >
                    下一题
                </Button>
            </div>
            
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
            
            {/* 底部翻页按钮 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                <Button 
                    type="default" 
                    icon={<LeftOutlined />} 
                    onClick={goToPrevChallenge} 
                    disabled={!prevChallenge}
                >
                    上一题
                </Button>
                <Button 
                    type="default" 
                    icon={<RightOutlined />} 
                    onClick={goToNextChallenge} 
                    disabled={!nextChallenge}
                >
                    下一题
                </Button>
            </div>
        </div>
    );
};

export default ChallengeDetailPage; 