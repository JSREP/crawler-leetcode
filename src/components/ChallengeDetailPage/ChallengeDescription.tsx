import { Typography, Card, Empty } from 'antd';
import { Challenge } from '../../types/challenge';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import '../../styles/markdown.css';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;

interface ChallengeDescriptionProps {
    challenge: Challenge;
}

// 测试图片 - 1x1像素透明PNG
const FALLBACK_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// 图片组件
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
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                borderRadius: '4px',
                margin: '16px 0',
                display: 'block',
                ...props.style
            }}
            onError={(e) => {
                const imgElement = e.currentTarget as HTMLImageElement;
                imgElement.onerror = null; // 防止循环错误
                imgElement.src = FALLBACK_IMAGE;
            }}
        />
    );
};

// 链接组件
const MarkdownLink = (props: any) => {
    return (
        <a
            {...props}
            target="_blank"
            rel="noopener noreferrer"
            style={{
                overflowWrap: 'break-word',
                wordWrap: 'break-word',
                wordBreak: 'break-word',
                maxWidth: '100%',
                display: 'inline-block',
                ...props.style
            }}
        >
            {props.children}
        </a>
    );
};

/**
 * 挑战描述组件，显示问题的Markdown描述
 */
const ChallengeDescription: React.FC<ChallengeDescriptionProps> = ({ challenge }) => {
    const { t, i18n } = useTranslation();
    
    // 根据当前语言选择显示描述
    const displayDescription = i18n.language === 'en' && challenge.descriptionMarkdownEN 
        ? challenge.descriptionMarkdownEN 
        : challenge.descriptionMarkdown;
    
    return (
        <div>
            <Title level={3}>{t('challenge.detail.description')}</Title>
            
            {/* 实际挑战描述 */}
            {displayDescription ? (
                <Card 
                    bordered={false} 
                    style={{ 
                        marginBottom: 24,
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word'
                    }}
                >
                    <div className="markdown-content">
                        <ReactMarkdown 
                            rehypePlugins={[rehypeRaw]}
                            components={{
                                img: MarkdownImage,
                                a: MarkdownLink,
                                pre: (props: any) => (
                                    <pre style={{ 
                                        overflowX: 'auto',
                                        whiteSpace: 'pre-wrap',
                                        wordWrap: 'break-word',
                                        maxWidth: '100%'
                                    }} {...props} />
                                ),
                                code: (props: any) => (
                                    <code style={{ 
                                        overflowWrap: 'break-word',
                                        wordWrap: 'break-word',
                                        wordBreak: 'break-word'
                                    }} {...props} />
                                )
                            }}
                        >
                            {displayDescription}
                        </ReactMarkdown>
                    </div>
                </Card>
            ) : (
                <Empty 
                    description={t('challenge.detail.noDescription', '暂无详细描述')} 
                    style={{ marginTop: 24, marginBottom: 24 }}
                />
            )}
        </div>
    );
};

export default ChallengeDescription; 