import { Typography, Card } from 'antd';
import { Challenge } from '../../types/challenge';

const { Title, Text } = Typography;

interface ChallengeSolutionsProps {
    challenge: Challenge;
}

/**
 * 挑战解决方案组件，显示解决方案列表
 */
const ChallengeSolutions: React.FC<ChallengeSolutionsProps> = ({ challenge }) => {
    if (!challenge.solutions || challenge.solutions.length === 0) {
        return null;
    }

    return (
        <div>
            <Title level={3}>参考解答</Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {challenge.solutions.map((solution, index) => (
                    <Card key={index} size="small" hoverable>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <Text strong>{solution.title}</Text>
                                <div style={{ marginTop: '4px' }}>
                                    <Text type="secondary">来源: {solution.source}</Text>
                                    {solution.author && (
                                        <Text type="secondary" style={{ marginLeft: '12px' }}>
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
    );
};

export default ChallengeSolutions; 