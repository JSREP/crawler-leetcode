import { Card, Space, Typography } from 'antd';

const { Text, Title } = Typography;

interface Solution {
    title: string;
    url: string;
    source: string;
}

interface SolutionListProps {
    solutions: Solution[];
}

const SolutionList = ({ solutions }: SolutionListProps) => {
    return (
        <Space direction="vertical" style={{ width: '100%' }}>
            <Title level={4}>题解列表</Title>
            {solutions.map((solution, index) => (
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
    );
};

export default SolutionList;