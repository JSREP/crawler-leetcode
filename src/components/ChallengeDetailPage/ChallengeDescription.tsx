import { Typography, Card, Empty } from 'antd';
import { Challenge } from '../../types/challenge';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import '../../styles/markdown.css';

const { Title } = Typography;

interface ChallengeDescriptionProps {
    challenge: Challenge;
}

// 测试图片 - 1x1像素透明PNG
const FALLBACK_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// 简化的图片组件
const MarkdownImage = (props: any) => {
    // 使用传入的src或回退到默认图片
    const imageSrc = props.src || FALLBACK_IMAGE;
    
    return (
        <img
            {...props}
            src={imageSrc}
            alt={props.alt || '图片'}
            style={{
                maxWidth: '100%',
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '4px',
                ...props.style
            }}
            onError={(e) => {
                console.error('图片加载错误:', e);
                const imgElement = e.currentTarget as HTMLImageElement;
                imgElement.onerror = null; // 防止循环错误
                imgElement.src = FALLBACK_IMAGE;
            }}
        />
    );
};

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
                        <ReactMarkdown 
                            rehypePlugins={[rehypeRaw]}
                            components={{
                                img: MarkdownImage
                            }}
                        >
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