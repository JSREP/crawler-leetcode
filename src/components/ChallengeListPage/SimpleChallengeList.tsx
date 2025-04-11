import { Card, Space, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { Challenge } from '../../types/challenge';
import StarRating from '../StarRating';

const { Text, Title } = Typography;

interface SimpleChallengeListProps {
    /**
     * 要显示的挑战数组
     */
    challenges: Challenge[];
    
    /**
     * 列表标题
     */
    title?: string;
}

/**
 * 简单挑战列表组件
 * 用于在首页等地方显示简略版挑战列表
 */
const SimpleChallengeList: React.FC<SimpleChallengeListProps> = ({ 
    challenges, 
    title = "挑战列表" 
}) => {
    return (
        <Space direction="vertical" style={{ width: '100%' }}>
            <Title level={4}>{title}</Title>
            {challenges.map((challenge) => (
                <Card 
                    key={challenge.id} 
                    style={{ width: '100%' }}
                    hoverable
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <Text strong>{challenge.number}. {challenge.title}</Text>
                            <div style={{ marginTop: 4 }}>
                                <StarRating difficulty={challenge.difficulty} />
                                <Text type="secondary" style={{ marginLeft: 8 }}>
                                    {challenge.tags.join(', ')}
                                </Text>
                            </div>
                        </div>
                        <Link to={`/challenge/${challenge.id}`}>
                            查看详情
                        </Link>
                    </div>
                </Card>
            ))}
        </Space>
    );
};

export default SimpleChallengeList; 