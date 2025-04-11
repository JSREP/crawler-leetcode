import { Typography, Card, Empty } from 'antd';
import { Challenge } from '../../types/challenge';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import '../../styles/markdown.css';

const { Title } = Typography;

interface ChallengeDescriptionProps {
    challenge: Challenge;
}

/**
 * 挑战描述组件，显示问题的Markdown描述
 */
const ChallengeDescription: React.FC<ChallengeDescriptionProps> = ({ challenge }) => {
    return (
        <div>
            <Title level={3}>问题描述</Title>
            {challenge.descriptionMarkdown ? (
                <Card bordered={false} style={{ marginBottom: 24 }}>
                    <div className="markdown-content">
                        <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                            {challenge.descriptionMarkdown}
                        </ReactMarkdown>
                    </div>
                </Card>
            ) : (
                <Empty 
                    description="暂无详细描述" 
                    style={{ marginTop: 24, marginBottom: 24 }}
                />
            )}
        </div>
    );
};

export default ChallengeDescription; 