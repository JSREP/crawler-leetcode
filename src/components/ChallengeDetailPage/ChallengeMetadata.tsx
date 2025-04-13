import { Descriptions, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { Challenge } from '../../types/challenge';
import StarRating from '../StarRating';
import { formatDateTime } from './utils';

const { Text } = Typography;

interface ChallengeMetadataProps {
    challenge: Challenge;
    /**
     * 是否为移动端视图
     */
    isMobile?: boolean;
}

/**
 * 挑战元数据组件
 * 展示挑战的基本信息，如日期、时间、难度等
 */
const ChallengeMetadata: React.FC<ChallengeMetadataProps> = ({ challenge, isMobile = false }) => {
    const { t } = useTranslation();
    
    return (
        <Descriptions 
            bordered={false} 
            column={isMobile ? 1 : 2} 
            size={isMobile ? "small" : "default"}
            labelStyle={{ 
                fontWeight: 'bold',
                padding: isMobile ? '8px 8px 8px 0' : '8px 16px 8px 0',
                width: isMobile ? '80px' : '120px',
            }}
            contentStyle={{
                padding: isMobile ? '8px 0' : '8px 24px 8px 8px',
            }}
        >
            <Descriptions.Item label={t('challenge.detail.difficulty')}>
                <StarRating 
                    difficulty={challenge.difficulty || 0} 
                    onClick={() => {}} 
                    style={{ cursor: 'default' }}
                />
            </Descriptions.Item>

            <Descriptions.Item label={t('challenge.detail.platform')}>
                {challenge.platform || t('challenge.detail.unspecified')}
            </Descriptions.Item>

            <Descriptions.Item label={t('challenge.detail.created')}>
                <Text style={{ fontSize: isMobile ? '12px' : '14px' }}>
                    {formatDateTime(challenge.createTime)}
                </Text>
            </Descriptions.Item>

            <Descriptions.Item label={t('challenge.detail.updated')}>
                <Text style={{ fontSize: isMobile ? '12px' : '14px' }}>
                    {formatDateTime(challenge.updateTime)}
                </Text>
            </Descriptions.Item>
            
            {challenge.externalLink && (
                <Descriptions.Item 
                    label={t('challenge.detail.originalLink')}
                    span={isMobile ? 1 : 2}
                >
                    <a 
                        href={challenge.externalLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                            wordBreak: 'break-all',
                            fontSize: isMobile ? '12px' : '14px'
                        }}
                    >
                        {challenge.externalLink}
                    </a>
                </Descriptions.Item>
            )}
        </Descriptions>
    );
};

export default ChallengeMetadata; 