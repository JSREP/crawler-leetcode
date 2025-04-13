import { List, Typography, Empty, Tag, Card, Space } from 'antd';
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
    
    // 如果没有解决方案，显示空状态
    if (!challenge.solutions || challenge.solutions.length === 0) {
        return (
            <div>
                <Title 
                    level={isMobile ? 4 : 3}
                    style={{ 
                        marginBottom: isMobile ? '12px' : '24px',
                        fontSize: isMobile ? '18px' : '24px'
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
                level={isMobile ? 4 : 3}
                style={{ 
                    marginBottom: isMobile ? '12px' : '24px',
                    fontSize: isMobile ? '18px' : '24px'
                }}
            >
                {t('challenge.detail.solutions')}
            </Title>
            
            <List
                itemLayout={isMobile ? "vertical" : "horizontal"}
                dataSource={challenge.solutions}
                renderItem={(solution: Solution) => (
                    <List.Item>
                        <Card 
                            style={{ width: '100%' }}
                            bodyStyle={{ padding: isMobile ? '12px' : '16px' }}
                        >
                            <Space direction="vertical" size={isMobile ? "small" : "middle"} style={{ width: '100%' }}>
                                <Space wrap align="center">
                                    <Title 
                                        level={5} 
                                        style={{ 
                                            margin: 0,
                                            fontSize: isMobile ? '16px' : '18px' 
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
                                        fontSize: isMobile ? '14px' : '16px',
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
};

export default ChallengeSolutions; 