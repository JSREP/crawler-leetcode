import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Challenge } from '../../types/challenge';

interface ChallengeActionsProps {
    challenge: Challenge;
}

/**
 * 挑战操作区组件，包含外部链接和返回按钮
 */
const ChallengeActions: React.FC<ChallengeActionsProps> = ({ challenge }) => {
    const { t } = useTranslation();
    
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <a
                    href={challenge.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        backgroundColor: '#1890ff',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        textDecoration: 'none'
                    }}
                >
                    {t('challenge.detail.startChallenge')} ➔
                </a>
            </div>
            <Link to="/challenges" style={{ color: '#1890ff' }}>
                {t('challenge.actions.backToList')}
            </Link>
        </div>
    );
};

export default ChallengeActions; 