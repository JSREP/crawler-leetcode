import { Typography, Card } from 'antd';
import { Challenge } from '../../types/challenge';
import ReactMarkdown from 'react-markdown';
import '../../styles/markdown.css';

const { Title, Paragraph, Text } = Typography;

interface ChallengeDescriptionProps {
    challenge: Challenge;
}

/**
 * 挑战描述组件，显示问题描述和详细描述
 */
const ChallengeDescription: React.FC<ChallengeDescriptionProps> = ({ challenge }) => {
    // 优先使用Markdown内容
    if (challenge.descriptionMarkdown) {
        return (
            <div>
                <Title level={3}>问题描述</Title>
                <Card bordered={false} style={{ marginBottom: 24 }}>
                    <div className="markdown-content">
                        <ReactMarkdown>
                            {challenge.descriptionMarkdown}
                        </ReactMarkdown>
                    </div>
                </Card>
            </div>
        );
    }
    
    // 回退到纯文本描述
    return (
        <div>
            <Title level={3}>问题描述</Title>
            <Paragraph style={{ whiteSpace: 'pre-line' }}>
                {challenge.description}
            </Paragraph>
        </div>
    );
};

export default ChallengeDescription; 