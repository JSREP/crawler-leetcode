import { Space, Typography, Badge } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Challenge } from '../../types/challenge';
import IdTag from '../IdTag';

const { Title } = Typography;

interface ChallengeHeaderProps {
    challenge: Challenge;
}

/**
 * 挑战详情页的标题头部组件
 */
const ChallengeHeader: React.FC<ChallengeHeaderProps> = ({ challenge }) => {
    const navigate = useNavigate();
    
    // 处理ID点击，可以跳转到列表页
    const handleIdClick = () => {
        navigate('/challenges');
    };
    
    // 确保id是一个有效值
    const displayId = challenge.id !== undefined ? challenge.id : '?';
    
    return (
        <Space align="center">
            <IdTag 
                id={displayId}
                clickable
                onClick={handleIdClick}
            />
            <Title level={2} style={{ margin: 0 }}>{challenge.title}</Title>
            {challenge.isExpired && (
                <Badge status="error" text="链接已失效" />
            )}
        </Space>
    );
};

export default ChallengeHeader; 