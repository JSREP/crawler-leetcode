import { Typography, Card, Empty } from 'antd';
import { Challenge } from '../../types/challenge';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import '../../styles/markdown.css';

const { Title } = Typography;

interface ChallengeDescriptionProps {
    challenge: Challenge;
}

// 自定义图片组件，确保正确处理Base64图片
const MarkdownImage = ({ 
    src, 
    alt, 
    ...props 
}: React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>) => {
    // 调试输出
    console.log(`处理图片: alt=${alt}, src=${src?.slice(0, 100)}...`);
    
    // 如果src未定义或为空，使用空图片
    if (!src) {
        console.error('图片src为空');
        return <span style={{color: 'red'}}>[图片加载错误: 无src]</span>;
    }

    // 处理相对路径或不完整的Base64链接
    let imageSrc = src;
    
    // 使用测试图片作为备用
    const emptyImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    
    // 如果包含URL编码字符，进行修复
    if (src.includes('%')) {
        try {
            imageSrc = decodeURIComponent(src);
            console.log('修复URL编码的图片链接');
        } catch (e) {
            console.error('URL解码失败:', e);
            imageSrc = emptyImageBase64;
        }
    }
    
    // 如果是相对路径，使用空白图片
    if (src.startsWith('./') || src.startsWith('../')) {
        imageSrc = emptyImageBase64;
        console.log('转换相对路径为空白图片');
    }
    
    // 返回具有错误处理的图片
    return (
        <img 
            src={imageSrc}
            alt={alt || '图片'} 
            {...props} 
            style={{border: '1px solid #ddd', maxWidth: '100%', ...props.style}}
            onError={(e) => {
                console.error('图片加载错误:', e);
                // 如果加载失败，替换为空白图片
                (e.target as HTMLImageElement).onerror = null;
                (e.target as HTMLImageElement).src = emptyImageBase64;
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
                                // 自定义图片渲染
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