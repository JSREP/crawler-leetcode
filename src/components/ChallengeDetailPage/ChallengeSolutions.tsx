import { Typography, Card, Empty, Button } from 'antd';
import { Challenge } from '../../types/challenge';
import { useTranslation } from 'react-i18next';
import { GithubOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface ChallengeSolutionsProps {
    challenge: Challenge;
}

/**
 * 挑战解决方案组件，显示解决方案列表
 */
const ChallengeSolutions: React.FC<ChallengeSolutionsProps> = ({ challenge }) => {
    const { t } = useTranslation();
    
    return (
        <div>
            <Title level={3}>{t('challenge.detail.solutions')}</Title>
            
            {(!challenge.solutions || challenge.solutions.length === 0) ? (
                <Card>
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <span>
                                {t('challenge.detail.noSolutions', '暂无解决方案')}
                            </span>
                        }
                    >
                        <Button 
                            type="primary" 
                            icon={<GithubOutlined />}
                            onClick={() => window.open('https://github.com/JSREP/crawler-leetcode/issues/new?template=solution.md&title=解决方案：' + challenge.name, '_blank')}
                        >
                            {t('challenge.detail.contributeSolution', '贡献你的解决方案')}
                        </Button>
                        <div style={{ marginTop: '12px', fontSize: '14px', color: 'rgba(0, 0, 0, 0.45)' }}>
                            {t('challenge.detail.contributeTip', '欢迎分享你的解决方案，帮助更多的人！')}
                        </div>
                    </Empty>
                </Card>
            ) : (
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
            )}
        </div>
    );
};

export default ChallengeSolutions; 