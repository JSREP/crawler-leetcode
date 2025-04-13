import { Button, Space } from 'antd';
import { HomeOutlined, RightOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Challenge } from '../../types/challenge';

interface ChallengeActionsProps {
    challenge: Challenge;
    /**
     * 是否为移动端视图
     */
    isMobile?: boolean;
}

/**
 * 挑战详情页面底部操作按钮组件
 */
const ChallengeActions: React.FC<ChallengeActionsProps> = ({ challenge, isMobile = false }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    
    // 移动端布局
    if (isMobile) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center',
                width: '100%',
                marginTop: '8px'
            }}>
                <Button 
                    type="primary" 
                    icon={<HomeOutlined />} 
                    onClick={() => navigate('/challenges')}
                    size="middle"
                    style={{ 
                        width: '100%',
                        maxWidth: '400px'
                    }}
                >
                    {t('challenge.actions.backToList')}
                </Button>
            </div>
        );
    }
    
    // PC端布局
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                {challenge.externalLink && (
                    <a
                        href={challenge.externalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            backgroundColor: '#1890ff',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center'
                        }}
                    >
                        {t('challenge.detail.startChallenge')} <RightOutlined style={{ marginLeft: '5px' }} />
                    </a>
                )}
            </div>
            <Link to="/challenges" style={{ color: '#1890ff' }}>
                {t('challenge.actions.backToList')}
            </Link>
        </div>
    );
};

export default ChallengeActions; 