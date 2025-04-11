import { Typography } from 'antd';
import { Challenge } from '../../types/challenge';

const { Title, Paragraph, Text } = Typography;

interface ChallengeDescriptionProps {
    challenge: Challenge;
}

/**
 * 挑战描述组件，显示问题描述和详细描述
 */
const ChallengeDescription: React.FC<ChallengeDescriptionProps> = ({ challenge }) => {
    return (
        <div>
            <Title level={3}>问题描述</Title>
            <Paragraph style={{ whiteSpace: 'pre-line' }}>
                {challenge.description}
            </Paragraph>
            {challenge.descriptionMarkdown && (
                <div>
                    <Text type="secondary">详细描述 (Markdown):</Text>
                    <Paragraph style={{ marginTop: '8px', backgroundColor: '#f5f5f5', padding: '16px' }}>
                        {challenge.descriptionMarkdown}
                    </Paragraph>
                </div>
            )}
        </div>
    );
};

export default ChallengeDescription; 