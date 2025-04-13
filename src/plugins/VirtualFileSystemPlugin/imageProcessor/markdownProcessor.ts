import { processImgPath, convertImgToBase64 } from './utils';

/**
 * 处理 Markdown 中的图片链接，转换为 Base64 或保持相对路径
 * @param markdown Markdown 内容
 * @param basePath 基础路径
 * @param isBuild 是否为构建模式
 * @returns 处理后的 Markdown 内容
 */
export function processMarkdownImages(markdown: string, basePath: string, isBuild = false): string {
    // 匹配Markdown和HTML格式的图片链接
    const mdImgRegex = /!\[(.*?)\]\(([^)]+)\)/g;
    const htmlImgRegex = /<img.*?src=["']([^"']+)["'].*?>/g;
    
    console.log(`[DEBUG] 处理Markdown内容: ${markdown.substring(0, 100)}...`);
    
    // 处理Markdown格式的图片
    let processedMd = processMdFormatImages(markdown, mdImgRegex, basePath, isBuild);
    
    // 处理HTML格式的图片
    processedMd = processHtmlFormatImages(processedMd, htmlImgRegex, basePath, isBuild);
    
    return processedMd;
}

/**
 * 处理 Markdown 格式的图片链接
 * @param markdown Markdown 内容
 * @param regex 正则表达式
 * @param basePath 基础路径
 * @param isBuild 是否为构建模式
 * @returns 处理后的 Markdown 内容
 */
function processMdFormatImages(markdown: string, regex: RegExp, basePath: string, isBuild: boolean): string {
    return markdown.replace(regex, (match, alt, imgPath) => {
        console.log(`[DEBUG] 处理Markdown图片: ${match}`);
        
        // 如果已经是Base64格式，直接保留
        if (imgPath.startsWith('data:image/')) {
            return match;
        }
        
        // 如果是assets路径，保持不变
        if (imgPath.startsWith('assets/')) {
            console.log(`[DEBUG] 保持assets路径不变: ${imgPath}`);
            return `![${alt}](${imgPath})`;
        }
        
        const result = convertImgToBase64(imgPath, basePath, isBuild);
        if (result.success) {
            if (isBuild) {
                // 构建模式下使用相对路径
                const buildPath = processImgPath(result.fullPath);
                return `![${alt}](${buildPath})`;
            }
            
            // 开发模式下如果有Base64数据，使用它
            if (result.data) {
                // 开发模式下使用Base64
                const base64Url = `data:${result.mimeType};base64,${result.data}`;
                console.log(`[DEBUG] 生成Base64 URL`);
                return `![${alt}](${base64Url})`;
            }
        }
        
        return match; // 出错或无数据时保留原始链接
    });
}

/**
 * 处理 HTML 格式的图片链接
 * @param markdown Markdown 内容
 * @param regex 正则表达式
 * @param basePath 基础路径
 * @param isBuild 是否为构建模式
 * @returns 处理后的 Markdown 内容
 */
function processHtmlFormatImages(markdown: string, regex: RegExp, basePath: string, isBuild: boolean): string {
    return markdown.replace(regex, (match, imgPath) => {
        console.log(`[DEBUG] 处理HTML图片: ${match}`);
        
        // 如果已经是Base64格式，直接保留
        if (imgPath.startsWith('data:image/')) {
            return match;
        }
        
        // 如果是assets路径，保持不变
        if (imgPath.startsWith('assets/')) {
            console.log(`[DEBUG] 保持assets路径不变: ${imgPath}`);
            // 从原始标签中提取属性
            const altMatch = match.match(/alt=["'](.*?)["']/);
            const alt = altMatch ? altMatch[1] : '';
            return `<img src="${imgPath}" alt="${alt}" />`;
        }
        
        const result = convertImgToBase64(imgPath, basePath, isBuild);
        if (result.success) {
            // 从原始标签中提取属性
            const altMatch = match.match(/alt=["'](.*?)["']/);
            const alt = altMatch ? altMatch[1] : '';
            
            if (isBuild) {
                // 构建模式下使用相对路径
                const buildPath = processImgPath(result.fullPath);
                return `<img src="${buildPath}" alt="${alt}" />`;
            }
            
            // 开发模式下如果有Base64数据，使用它
            if (result.data) {
                const base64Url = `data:${result.mimeType};base64,${result.data}`;
                console.log(`[DEBUG] 生成Base64 URL`);
                return `<img src="${base64Url}" alt="${alt}" />`;
            }
        }
        
        return match; // 出错或无数据时保留原始链接
    });
} 