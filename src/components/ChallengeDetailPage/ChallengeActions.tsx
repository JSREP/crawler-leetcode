import { Button } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface ChallengeActionsProps {
    challenge: any;
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
    
    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center',
            width: '100%',
            marginTop: isMobile ? '8px' : '16px'
        }}>
            <Button 
                type="primary" 
                icon={<HomeOutlined />} 
                onClick={() => navigate('/challenges')}
                size={isMobile ? "middle" : "large"}
                style={{ 
                    width: isMobile ? '100%' : 'auto',
                    maxWidth: '400px'
                }}
            >
                {t('challenge.detail.backToList')}
            </Button>
        </div>
    );
};

export default ChallengeActions; 