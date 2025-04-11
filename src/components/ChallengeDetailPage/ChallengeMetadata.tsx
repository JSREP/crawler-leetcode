import { Typography } from 'antd';
import { Challenge } from '../../types/challenge';
import StarRating from '../StarRating';
import { useNavigate } from 'react-router-dom';
import PlatformTag from '../PlatformTag';

const { Text } = Typography;

interface ChallengeMetadataProps {
    challenge: Challenge;
}

/**
 * 挑战元数据组件，展示难度、平台、创建时间等信息
 */
const ChallengeMetadata: React.FC<ChallengeMetadataProps> = ({ challenge }) => {
    const navigate = useNavigate();
    
    // 点击难度星级时跳转到列表页并按难度筛选
    const handleDifficultyClick = (difficulty: number) => {
        navigate(`/challenges?difficulty=${difficulty}`);
    };
    
    // 点击平台标签时跳转到列表页并按平台筛选
    const handlePlatformClick = (platform: string) => {
        navigate(`/challenges?platform=${platform || 'all'}`);
    };
    
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <div>
                <Text type="secondary">难度级别:</Text>
                <span style={{ marginLeft: '8px', display: 'inline-flex', alignItems: 'center' }}>
                    <StarRating 
                        difficulty={challenge.difficulty} 
                        onClick={handleDifficultyClick}
                    />
                </span>
            </div>

            <div>
                <Text type="secondary">适用平台:</Text>
                <span style={{ marginLeft: '8px' }}>
                    <PlatformTag 
                        platform={challenge.platform || ''} 
                        clickable 
                        onClick={handlePlatformClick}
                    />
                </span>
            </div>

            <div>
                <Text type="secondary">创建时间:</Text>
                <Text style={{ marginLeft: '8px' }}>{challenge.createTime.toLocaleString()}</Text>
            </div>

            <div>
                <Text type="secondary">更新时间:</Text>
                <Text style={{ marginLeft: '8px' }}>{challenge.updateTime.toLocaleString()}</Text>
            </div>
        </div>
    );
};

export default ChallengeMetadata; 