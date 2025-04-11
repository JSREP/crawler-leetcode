import { Link } from 'react-router-dom';
import { Challenge } from '../../types/challenge';

interface ChallengeActionsProps {
    challenge: Challenge;
}

/**
 * 挑战操作区组件，包含外部链接和返回按钮
 */
const ChallengeActions: React.FC<ChallengeActionsProps> = ({ challenge }) => {
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
                    去试试 ➔
                </a>
            </div>
            <Link to="/challenges" style={{ color: '#1890ff' }}>
                返回挑战列表
            </Link>
        </div>
    );
};

export default ChallengeActions; 