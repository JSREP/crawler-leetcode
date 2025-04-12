import { Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Challenge } from '../../types/challenge';
import TopicTag from '../TopicTag';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

interface ChallengeTagsProps {
    challenge: Challenge;
}

/**
 * 挑战标签组件，显示所有标签
 */
const ChallengeTags: React.FC<ChallengeTagsProps> = ({ challenge }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    
    // 处理标签点击，跳转到列表页并应用过滤
    const handleTagClick = (tag: string) => {
        navigate(`/challenges?tags=${encodeURIComponent(tag)}`);
    };
    
    return (
        <div>
            <Text type="secondary">{t('challenge.detail.tags')}:</Text>
            <div style={{ marginTop: '8px' }}>
                {challenge.tags.map((tag, index) => (
                    <TopicTag
                        key={index}
                        text={tag}
                        clickable
                        onClick={handleTagClick}
                        style={{ marginRight: '8px' }}
                    />
                ))}
            </div>
        </div>
    );
};

export default ChallengeTags; 