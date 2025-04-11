import { Tag, Typography } from 'antd';
import { Challenge } from '../../types/challenge';

const { Text } = Typography;

interface ChallengeTagsProps {
    challenge: Challenge;
}

/**
 * 挑战标签组件，显示所有标签
 */
const ChallengeTags: React.FC<ChallengeTagsProps> = ({ challenge }) => {
    return (
        <div>
            <Text type="secondary">标签:</Text>
            <div style={{ marginTop: '8px' }}>
                {challenge.tags.map((tag, index) => (
                    <Tag key={index} color="green" style={{ marginRight: '8px' }}>
                        {tag}
                    </Tag>
                ))}
            </div>
        </div>
    );
};

export default ChallengeTags; 