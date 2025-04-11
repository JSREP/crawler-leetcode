import {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {Challenge, challenges} from "./ChallengePage.tsx";

const ChallengeDetailPage = () => {
    const {id} = useParams<{ id: string }>();
    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            try {
                // 尝试将字符串ID转换为数字
                const numericId = parseInt(id, 10);
                
                if (isNaN(numericId)) {
                    throw new Error('无效的挑战ID');
                }
                
                // 从challenges数组中查找对应ID的挑战
                const foundChallenge = challenges.find(c => c.id === numericId);
                
                if (foundChallenge) {
                    setChallenge(foundChallenge);
                    setError(null);
                } else {
                    throw new Error(`未找到ID为${numericId}的挑战`);
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
        return <div className="text-center py-8">Loading challenge...</div>;
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
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-4">{challenge.title}</h1>

                <div className="flex items-center mb-6">
                    <span className={`badge ${getDifficultyBadgeClass(challenge.difficulty)}`}>
                        {getDifficultyText(challenge.difficulty)}
                    </span>
                    <span className="ml-2 text-gray-500 text-sm">
                        更新时间: {challenge.updateTime.toLocaleDateString()}
                    </span>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">问题描述</h2>
                    <p className="text-gray-700 dark:text-gray-300 mb-6 whitespace-pre-line">
                        {challenge.description}
                    </p>

                    <div className="mb-6">
                        <h3 className="font-medium mb-2">标签</h3>
                        <div className="flex flex-wrap gap-2">
                            {challenge.tags.map((tag, index) => (
                                <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {challenge.solutions && challenge.solutions.length > 0 && (
                        <div className="mt-8">
                            <h2 className="text-xl font-semibold mb-4">参考解答</h2>
                            <div className="space-y-3">
                                {challenge.solutions.map((solution, index) => (
                                    <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                                        <div className="flex justify-between">
                                            <span className="font-medium">{solution.title}</span>
                                            <a 
                                                href={solution.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:underline"
                                            >
                                                查看解答
                                            </a>
                                        </div>
                                        <div className="mt-1 text-sm text-gray-500">
                                            来源: {solution.source}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-8">
                        <a
                            href={challenge.externalLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded inline-block"
                        >
                            在LeetCode上查看
                        </a>
                    </div>
                </div>
            </div>
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