import { Tag, Typography, Space } from 'antd';
import { TagOutlined } from '@ant-design/icons';
import { Challenge } from '../../types/challenge';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import TopicTag from '../TopicTag';

const { Title, Text } = Typography;

interface ChallengeTagsProps {
    challenge: Challenge;
    /**
     * 是否为移动端视图
     */
    isMobile?: boolean;
}

/**
 * 挑战的标签组件
 */
const ChallengeTags: React.FC<ChallengeTagsProps> = ({ challenge, isMobile = false }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    
    // 如果没有标签，不显示
    if (!challenge.tags || challenge.tags.length === 0) {
        return null;
    }
    
    // 处理标签点击，跳转到列表页并应用过滤
    const handleTagClick = (tag: string) => {
        navigate(`/challenges?tags=${encodeURIComponent(tag)}`);
    };
    
    // 移动端布局
    if (isMobile) {
        return (
            <div>
                <Title 
                    level={5}
                    style={{ 
                        marginBottom: '8px',
                        fontSize: '16px'
                    }}
                >
                    <TagOutlined style={{ marginRight: '8px' }} />
                    {t('challenge.detail.tags')}
                </Title>
                
                <div>
                    <Space 
                        size={[4, 4]} 
                        wrap
                        style={{ 
                            display: 'flex', 
                            flexWrap: 'wrap',
                        }}
                    >
                        {challenge.tags.map((tag, index) => (
                            <Tag
                                key={index}
                                style={{ 
                                    margin: '0',
                                    fontSize: '12px',
                                    padding: '0 6px',
                                }}
                            >
                                {tag}
                            </Tag>
                        ))}
                    </Space>
                </div>
            </div>
        );
    }
    
    // PC端布局
    return (
        <div>
            <Text type="secondary">{t('challenge.detail.tags')}:</Text>
            <div style={{ marginTop: '8px' }}>
                {challenge.tags.map((tag, index) => (
                    <TopicTag
                        key={index}
                        text={tag}
                        clickable
                        onClick={() => handleTagClick(tag)}
                        style={{ marginRight: '8px' }}
                    />
                ))}
            </div>
        </div>
    );
};

export default ChallengeTags; 