import { Typography, Card, Empty, Image } from 'antd';
import { Challenge } from '../../types/challenge';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import '../../styles/markdown.css';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

const { Title } = Typography;

interface ChallengeDescriptionProps {
    challenge: Challenge;
    /**
     * 是否为移动端视图
     */
    isMobile?: boolean;
}

// 测试图片 - 1x1像素透明PNG
const FALLBACK_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// 图片组件 - 修复props类型问题
const MarkdownImage = (props: any) => {
    const { src, alt } = props;
    // 使用传入的src或回退到默认图片
    const imageSrc = src || FALLBACK_IMAGE;
    
    // 使用Ant Design的Image组件，支持点击预览但无蒙版和提示文本
    return (
        <Image
            src={imageSrc}
            alt={alt || '图片'}
            style={{
                maxWidth: '100%',
                borderRadius: '4px',
                margin: '16px 0',
                display: 'block',
            }}
            preview={{
                mask: false,
                rootClassName: "custom-image-preview"
            }}
            fallback={FALLBACK_IMAGE}
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
const ChallengeDescription: React.FC<ChallengeDescriptionProps> = ({ challenge, isMobile = false }) => {
    const { t, i18n } = useTranslation();
    
    // 根据当前语言选择显示描述
    const displayDescription = i18n.language === 'en' && challenge.descriptionMarkdownEN 
        ? challenge.descriptionMarkdownEN 
        : challenge.descriptionMarkdown;
    
    // 检查Markdown中是否包含base64图片
    const hasBase64Image = displayDescription.includes('data:image/') || displayDescription.includes('![image');
    
    // 专门处理base64图片的情况
    if (hasBase64Image) {
        // 尝试提取整个Markdown中的base64图像
        let content = displayDescription;
        let htmlContent = '';
        let extractedImageUrl = '';
        
        // 查找并处理console日志中显示的原始YAML数据
        // 从控制台界面看，原始的图片数据在YAML中存在，但渲染时被截断了
        // 让我们直接从YAML原始内容中提取
        if (challenge.sourceFile) {
            // 从挑战源文件中查找对应的描述
            // YAML中可能的格式: description-markdown: |
            //                    爱给网站音频播放链接加密
            //                    ![image.png](data:image/png;base64,DATA)

            // 直接尝试通过正则表达式提取文本中的图片
            try {
                // 检查是否包含完整的图片标记
                const firstTextPart = content.split('![')[0] || '';
                // 获取描述-markdown字段后的内容
                const markdownRegex = /description(-|\s)markdown:[\s]*\|([\s\S]*?)(\n\s*\w+:|$)/i;
                const markdownMatch = challenge.descriptionMarkdown.match(markdownRegex);
                
                if (markdownMatch && markdownMatch[2]) {
                    const fullMarkdown = markdownMatch[2].trim();
                    
                    // 尝试匹配图片标记
                    const imgRegex = /!\[(.+?)\]\((data:image\/[^)]+)\)/;
                    const imgMatch = fullMarkdown.match(imgRegex);
                    
                    if (imgMatch && imgMatch[2]) {
                        // 提取图片URL以供Image组件使用
                        extractedImageUrl = imgMatch[2];
                        
                        // 构建HTML
                        htmlContent = `
                            <div>
                                <p>${firstTextPart}</p>
                            </div>
                        `;
                    }
                }
            } catch (error) {
                console.error('处理Markdown图片时出错:', error);
            }
        }
        
        // 如果上面的方法没有找到图片，尝试直接解析Markdown
        if (!extractedImageUrl) {
            // 尝试从文本中提取完整的base64图片
            // 模式1: ![alt](data:image/png;base64,DATA)
            const imgMatches = content.match(/!\[(.+?)\]\((data:image\/.+?base64,)([^)]+)\)/);
            
            if (imgMatches) {
                const [fullMatch, alt, prefix, base64Data] = imgMatches;
                extractedImageUrl = prefix + base64Data;
                
                htmlContent = `
                    <div>
                        <p>${content.split(fullMatch)[0]}</p>
                        <p>${content.split(fullMatch)[1] || ''}</p>
                    </div>
                `;
            } else {
                // 模式2: 尝试直接匹配被截断的base64链接
                const truncatedMatch = content.match(/!\[(.+?)\]\((data:image\/[^)]*)\)/);
                
                if (truncatedMatch) {
                    const [fullMatch, alt] = truncatedMatch;
                    
                    // 从YAML源中查找描述字段中的base64编码
                    const rawYaml = challenge.descriptionMarkdown;
                    const base64Match = rawYaml.match(/data:image\/[^)]+/);
                    
                    if (base64Match) {
                        extractedImageUrl = base64Match[0];
                        
                        htmlContent = `
                            <div>
                                <p>${content.split(fullMatch)[0]}</p>
                                <p>${content.split(fullMatch)[1] || ''}</p>
                            </div>
                        `;
                    }
                }
            }
        }
        
        // 最终处理方案：直接提取并创建图片元素
        if (!extractedImageUrl && challenge.descriptionMarkdown) {
            // 从截图看，图片的base64数据被错误地当作文本显示
            // 直接使用这些文本内容作为图片源
            const text = challenge.descriptionMarkdown;
            const textParts = displayDescription.split('\n');
            
            // 找出包含爱给网站音频播放链接加密的那一行，作为第一部分
            const firstPart = textParts[0] || '';
            
            // 检查原始文本是否包含data:image部分
            if (text.includes('data:image/png;base64,')) {
                // 截取data:image开始的部分直到结束
                const dataImageIndex = text.indexOf('data:image/png;base64,');
                if (dataImageIndex !== -1) {
                    let endIndex = text.indexOf('"', dataImageIndex);
                    if (endIndex === -1) endIndex = text.indexOf("'", dataImageIndex);
                    if (endIndex === -1) endIndex = text.indexOf(')', dataImageIndex);
                    if (endIndex === -1) endIndex = text.length;
                    
                    extractedImageUrl = text.substring(dataImageIndex, endIndex);
                    
                    htmlContent = `
                        <div>
                            <p>${firstPart}</p>
                        </div>
                    `;
                }
            }
        }
        
        // 如果成功提取了图片URL，使用Ant Design的Image组件显示
        if (extractedImageUrl) {
            if (isMobile) {
                return (
                    <div>
                        <Title 
                            level={4}
                            style={{ 
                                marginBottom: '12px',
                                fontSize: '18px'
                            }}
                        >
                            {t('challenge.detail.description')}
                        </Title>
                        
                        <Card 
                            bordered={false} 
                            style={{ 
                                marginBottom: 16,
                                wordWrap: 'break-word',
                                overflowWrap: 'break-word'
                            }}
                            bodyStyle={{ 
                                padding: '12px'
                            }}
                        >
                            <div className="markdown-content">
                                {htmlContent && (
                                    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                                )}
                                <Image
                                    src={extractedImageUrl}
                                    alt="挑战图片"
                                    style={{
                                        maxWidth: '100%',
                                        borderRadius: '4px',
                                        margin: '8px 0',
                                        display: 'block'
                                    }}
                                    preview={{
                                        mask: false,
                                        rootClassName: "custom-image-preview"
                                    }}
                                    fallback={FALLBACK_IMAGE}
                                />
                            </div>
                        </Card>
                    </div>
                );
            }
            
            // PC端布局
            return (
                <div>
                    <Title level={3}>{t('challenge.detail.description')}</Title>
                    
                    <Card 
                        bordered={false} 
                        style={{ 
                            marginBottom: 24,
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word'
                        }}
                    >
                        <div className="markdown-content">
                            {htmlContent && (
                                <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                            )}
                            <Image
                                src={extractedImageUrl}
                                alt="挑战图片"
                                style={{
                                    maxWidth: '100%',
                                    borderRadius: '4px',
                                    margin: '16px 0',
                                    display: 'block'
                                }}
                                preview={{
                                    mask: false,
                                    rootClassName: "custom-image-preview"
                                }}
                                fallback={FALLBACK_IMAGE}
                            />
                        </div>
                    </Card>
                </div>
            );
        }
    }
    
    // 针对移动端的Markdown内容处理
    if (isMobile) {
        return (
            <div>
                <Title 
                    level={4}
                    style={{ 
                        marginBottom: '12px',
                        fontSize: '18px'
                    }}
                >
                    {t('challenge.detail.description')}
                </Title>
                
                <Card 
                    bordered={false} 
                    style={{ 
                        marginBottom: 16,
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word'
                    }}
                    bodyStyle={{ 
                        padding: '12px'
                    }}
                >
                    {displayDescription ? (
                        <div className="markdown-content" style={{ fontSize: '14px' }}>
                            <ReactMarkdown
                                rehypePlugins={[rehypeRaw]}
                                components={{
                                    a: MarkdownLink,
                                    img: MarkdownImage,
                                }}
                            >
                                {displayDescription}
                            </ReactMarkdown>
                        </div>
                    ) : (
                        <Empty description={t('challenge.detail.noDescription')} />
                    )}
                </Card>
            </div>
        );
    }

    // PC端默认渲染方式 - 使用ReactMarkdown
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