import { List, Typography, Empty, Tag, Card, Space, Button } from 'antd';
import { GithubOutlined, LinkOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Challenge, Solution } from '../../types/challenge';

const { Title, Text } = Typography;

interface ChallengeSolutionsProps {
    challenge: Challenge;
    /**
     * 是否为移动端视图
     */
    isMobile?: boolean;
}

/**
 * 挑战解决方案列表
 */
const ChallengeSolutions: React.FC<ChallengeSolutionsProps> = ({ challenge, isMobile = false }) => {
    const { t } = useTranslation();
    
    // 移动端布局
    if (isMobile) {
        // 如果没有解决方案，显示空状态
        if (!challenge.solutions || challenge.solutions.length === 0) {
            return (
                <div>
                    <Title 
                        level={4}
                        style={{ 
                            marginBottom: '12px',
                            fontSize: '18px'
                        }}
                    >
                        {t('challenge.detail.solutions')}
                    </Title>
                    <Empty description={t('challenge.detail.noSolutions')} />
                </div>
            );
        }
        
        return (
            <div>
                <Title 
                    level={4}
                    style={{ 
                        marginBottom: '12px',
                        fontSize: '18px'
                    }}
                >
                    {t('challenge.detail.solutions')}
                </Title>
                
                <List
                    itemLayout="vertical"
                    dataSource={challenge.solutions}
                    renderItem={(solution: Solution) => (
                        <List.Item>
                            <Card 
                                style={{ width: '100%' }}
                                bodyStyle={{ padding: '12px' }}
                            >
                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                    <Space wrap align="center">
                                        <Title 
                                            level={5} 
                                            style={{ 
                                                margin: 0,
                                                fontSize: '16px' 
                                            }}
                                        >
                                            {solution.title}
                                        </Title>
                                        
                                        <Tag color="blue">
                                            {solution.source}
                                        </Tag>
                                        
                                        {solution.author && (
                                            <Tag>
                                                {solution.author}
                                            </Tag>
                                        )}
                                    </Space>
                                    
                                    <a 
                                        href={solution.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        style={{ 
                                            display: 'flex',
                                            alignItems: 'center',
                                            fontSize: '14px',
                                            wordBreak: 'break-all'
                                        }}
                                    >
                                        {solution.source === 'GitHub' ? (
                                            <GithubOutlined style={{ marginRight: '8px' }} />
                                        ) : (
                                            <LinkOutlined style={{ marginRight: '8px' }} />
                                        )}
                                        {solution.url}
                                    </a>
                                </Space>
                            </Card>
                        </List.Item>
                    )}
                />
            </div>
        );
    }
    
    // PC端布局
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