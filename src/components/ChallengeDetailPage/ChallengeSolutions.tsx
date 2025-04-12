import { Typography, Card } from 'antd';
import { Challenge } from '../../types/challenge';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

interface ChallengeSolutionsProps {
    challenge: Challenge;
}

/**
 * 挑战解决方案组件，显示解决方案列表
 */
const ChallengeSolutions: React.FC<ChallengeSolutionsProps> = ({ challenge }) => {
    const { t } = useTranslation();
    
    if (!challenge.solutions || challenge.solutions.length === 0) {
        return null;
    }

    return (
        <div>
            <Title level={3}>{t('challenge.detail.solutions')}</Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {challenge.solutions.map((solution, index) => (
                    <Card key={index} size="small" hoverable>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <Text strong>{solution.title}</Text>
                                <div style={{ marginTop: '4px' }}>
                                    <Text type="secondary">{t('challenge.detail.source')}: {solution.source}</Text>
                                    {solution.author && (
                                        <Text type="secondary" style={{ marginLeft: '12px' }}>
                                            {t('challenge.detail.author')}: {solution.author}
                                        </Text>
                                    )}
                                </div>
                            </div>
                            <a 
                                href={solution.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                            >
                                {t('challenge.detail.viewSolutionLink')}
                            </a>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ChallengeSolutions; 