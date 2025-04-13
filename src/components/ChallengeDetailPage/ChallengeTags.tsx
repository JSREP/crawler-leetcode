import { Tag, Typography, Space } from 'antd';
import { TagOutlined } from '@ant-design/icons';
import { Challenge } from '../../types/challenge';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;

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
    
    // 如果没有标签，不显示
    if (!challenge.tags || challenge.tags.length === 0) {
        return null;
    }
    
    return (
        <div>
            <Title 
                level={isMobile ? 5 : 4} 
                style={{ 
                    marginBottom: isMobile ? '8px' : '16px',
                    fontSize: isMobile ? '16px' : '18px'
                }}
            >
                <TagOutlined style={{ marginRight: '8px' }} />
                {t('challenge.detail.tags')}
            </Title>
            
            <div>
                {/* 使用Space组件，允许标签换行 */}
                <Space 
                    size={[isMobile ? 4 : 8, isMobile ? 4 : 8]} 
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
                                fontSize: isMobile ? '12px' : '14px',
                                padding: isMobile ? '0 6px' : '0 8px',
                            }}
                        >
                            {tag}
                        </Tag>
                    ))}
                </Space>
            </div>
        </div>
    );
};

export default ChallengeTags; 