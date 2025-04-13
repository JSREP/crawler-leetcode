import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Space, Divider, Alert } from 'antd';
import { useTranslation } from 'react-i18next';
import { Challenge } from '../../types/challenge';
import { challenges } from '../ChallengeListPage/exports';

// 导入各个子组件
import ChallengeHeader from './ChallengeHeader';
import ChallengeMetadata from './ChallengeMetadata';
import ChallengeTags from './ChallengeTags';
import ChallengeDescription from './ChallengeDescription';
import ChallengeSolutions from './ChallengeSolutions';
import ChallengeActions from './ChallengeActions';
import ChallengePagination from './ChallengePagination';
import ChallengeExpiredAlert from './ChallengeExpiredAlert';

/**
 * 挑战详情页主组件
 * 负责数据获取和组织布局
 */
const ChallengeDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [prevChallenge, setPrevChallenge] = useState<Challenge | null>(null);
    const [nextChallenge, setNextChallenge] = useState<Challenge | null>(null);

    // 查找当前挑战以及前后挑战
    useEffect(() => {
        if (id) {
            try {
                // 尝试将id解析为数字，以支持通过id查找
                const numericId = parseInt(id, 10);
                const isNumericId = !isNaN(numericId);

                // 获取所有挑战的索引，支持通过数字id或字符串idAlias查找
                const currentIndex = challenges.findIndex(c => 
                    (isNumericId && c.id === numericId) || c.idAlias === id
                );
                
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
                    throw new Error(t('challenge.error.notFound', { id }));
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : t('challenge.error.loadFailed'));
                setChallenge(null);
                setPrevChallenge(null);
                setNextChallenge(null);
            } finally {
                setLoading(false);
            }
        }
    }, [id, t]);

    // 处理键盘事件
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // 左方向键 - 上一个挑战
            if (e.key === 'ArrowLeft' && prevChallenge) {
                navigate(`/challenge/${prevChallenge.idAlias || prevChallenge.id.toString()}`);
            }
            // 右方向键 - 下一个挑战
            else if (e.key === 'ArrowRight' && nextChallenge) {
                navigate(`/challenge/${nextChallenge.idAlias || nextChallenge.id.toString()}`);
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
            navigate(`/challenge/${prevChallenge.idAlias || prevChallenge.id.toString()}`);
        }
    };

    // 导航到后一个挑战
    const goToNextChallenge = () => {
        if (nextChallenge) {
            navigate(`/challenge/${nextChallenge.idAlias || nextChallenge.id.toString()}`);
        }
    };

    if (loading) {
        return <div className="text-center py-8">{t('common.loading')}</div>;
    }

    if (error) {
        return (
            <div className="text-red-500 text-center py-8">
                {error}
            </div>
        );
    }

    if (!challenge) {
        return <div className="text-center py-8">{t('challenge.error.notFound')}</div>;
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            {/* 使用提取出的失效警告组件 */}
            <ChallengeExpiredAlert isExpired={challenge.isExpired} />
            
            {/* 顶部翻页按钮 */}
            <ChallengePagination 
                prevChallenge={prevChallenge}
                nextChallenge={nextChallenge}
                onPrevClick={goToPrevChallenge}
                onNextClick={goToNextChallenge}
            />
            
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
                    <ChallengeSolutions challenge={challenge} />
                    <Divider />
                    
                    {/* 外部链接和返回 */}
                    <ChallengeActions challenge={challenge} />
                </Space>
            </Card>
            
            {/* 底部翻页按钮 */}
            <ChallengePagination 
                prevChallenge={prevChallenge}
                nextChallenge={nextChallenge}
                onPrevClick={goToPrevChallenge}
                onNextClick={goToNextChallenge}
            />
        </div>
    );
};

export default ChallengeDetailPage; 