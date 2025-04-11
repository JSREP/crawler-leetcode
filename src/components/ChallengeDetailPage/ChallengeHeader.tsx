import { Space, Tag, Typography, Badge } from 'antd';
import { Challenge } from '../../types/challenge';

const { Title } = Typography;

interface ChallengeHeaderProps {
    challenge: Challenge;
}

/**
 * 挑战详情页的标题头部组件
 */
const ChallengeHeader: React.FC<ChallengeHeaderProps> = ({ challenge }) => {
    return (
        <Space align="center">
            <Tag color="#108ee9">#{challenge.id}</Tag>
            <Title level={2} style={{ margin: 0 }}>{challenge.title}</Title>
            {challenge.isExpired && (
                <Badge status="error" text="链接已失效" />
            )}
        </Space>
    );
};

export default ChallengeHeader; 