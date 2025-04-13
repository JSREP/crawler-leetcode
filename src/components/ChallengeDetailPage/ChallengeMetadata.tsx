import { Descriptions, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { Challenge } from '../../types/challenge';
import StarRating from '../StarRating';
import { formatDateTime } from './utils';
import PlatformTag from '../PlatformTag';
import { useNavigate } from 'react-router-dom';

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
    const navigate = useNavigate();
    
    // 点击难度星级时跳转到列表页并按难度筛选
    const handleDifficultyClick = (difficulty: number) => {
        navigate(`/challenges?difficulty=${difficulty}`);
    };
     
    // 点击平台标签时跳转到列表页并按平台筛选
    const handlePlatformClick = (platform: string) => {
        navigate(`/challenges?platform=${platform || 'all'}`);
    };
    
    if (isMobile) {
        return (
            <Descriptions 
                bordered={false} 
                column={1}
                size="small"
                labelStyle={{ 
                    fontWeight: 'bold',
                    padding: '8px 8px 8px 0',
                    width: '80px',
                }}
                contentStyle={{
                    padding: '8px 0',
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
                    <Text style={{ fontSize: '12px' }}>
                        {formatDateTime(challenge.createTime)}
                    </Text>
                </Descriptions.Item>

                <Descriptions.Item label={t('challenge.detail.updated')}>
                    <Text style={{ fontSize: '12px' }}>
                        {formatDateTime(challenge.updateTime)}
                    </Text>
                </Descriptions.Item>
                
                {challenge.externalLink && (
                    <Descriptions.Item 
                        label={t('challenge.detail.originalLink')}
                        span={1}
                    >
                        <a 
                            href={challenge.externalLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ 
                                wordBreak: 'break-all',
                                fontSize: '12px'
                            }}
                        >
                            {challenge.externalLink}
                        </a>
                    </Descriptions.Item>
                )}
            </Descriptions>
        );
    }
    
    // PC端布局
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <div>
                <Text type="secondary">{t('challenge.detail.difficulty')}:</Text>
                <span style={{ marginLeft: '8px', display: 'inline-flex', alignItems: 'center' }}>
                    <StarRating 
                        difficulty={challenge.difficulty} 
                        onClick={handleDifficultyClick}
                    />
                </span>
            </div>

            <div>
                <Text type="secondary">{t('challenge.detail.platform')}:</Text>
                <span style={{ marginLeft: '8px' }}>
                    <PlatformTag 
                        platform={challenge.platform || ''} 
                        clickable 
                        onClick={handlePlatformClick}
                    />
                </span>
            </div>

            <div>
                <Text type="secondary">{t('challenge.detail.created')}:</Text>
                <Text style={{ marginLeft: '8px' }}>{formatDateTime(challenge.createTime)}</Text>
            </div>

            <div>
                <Text type="secondary">{t('challenge.detail.updated')}:</Text>
                <Text style={{ marginLeft: '8px' }}>{formatDateTime(challenge.updateTime)}</Text>
            </div>
            
            {challenge.externalLink && (
                <div style={{ width: '100%' }}>
                    <Text type="secondary">{t('challenge.detail.originalLink')}:</Text>
                    <a 
                        href={challenge.externalLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                            marginLeft: '8px',
                            wordBreak: 'break-all'
                        }}
                    >
                        {challenge.externalLink}
                    </a>
                </div>
            )}
        </div>
    );
};

export default ChallengeMetadata; 