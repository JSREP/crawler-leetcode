import { Typography, Tag } from 'antd';
import { Challenge } from '../../types/challenge';
import { getDifficultyBadgeClass, getDifficultyText } from './utils';

const { Text } = Typography;

interface ChallengeMetadataProps {
    challenge: Challenge;
}

/**
 * 挑战元数据组件，展示难度、平台、创建时间等信息
 */
const ChallengeMetadata: React.FC<ChallengeMetadataProps> = ({ challenge }) => {
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <div>
                <Text type="secondary">难度级别:</Text>
                <span className={`badge ${getDifficultyBadgeClass(challenge.difficulty)}`} style={{ marginLeft: '8px' }}>
                    {getDifficultyText(challenge.difficulty)}
                </span>
            </div>

            <div>
                <Text type="secondary">适用平台:</Text>
                <Tag color="blue" style={{ marginLeft: '8px' }}>{challenge.platform || '未指定'}</Tag>
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