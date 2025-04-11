// src/plugins/VirtualFileSystemPlugin.ts
import type { PluginOption } from 'vite';
import * as fs from 'fs';
import * as path from 'path';
import * as YAML from 'yaml';
import { Challenge } from '../types/challenge';
import { parseChallenges } from '../types/challenge';

interface VirtualFileSystemPluginOptions {
    directory: string;
    outputPath?: string;
}

interface Solution {
    title: string;
    url: string;
    source: string;
    author: string;
}

interface ImageProcessResult {
    success: boolean;
    data: string;
    mimeType: string;
    fullPath: string;
}

// 处理相对路径的图片链接，转换为Base64或保持相对路径
function processMarkdownImages(markdown: string, basePath: string, isBuild = false): string {
    // 匹配Markdown和HTML格式的图片链接
    const mdImgRegex = /!\[(.*?)\]\(([^)]+)\)/g;
    const htmlImgRegex = /<img.*?src=["']([^"']+)["'].*?>/g;
    
    console.log(`[DEBUG] 处理Markdown内容: ${markdown.substring(0, 100)}...`);
    
    // 处理图片路径，保持相对路径结构
    const processImgPath = (imgPath: string): string => {
        console.log(`[DEBUG] 处理图片路径: ${imgPath}`);
        return imgPath;
    };
    
    // 处理图片转base64的函数
    const convertImgToBase64 = (imgPath: string): ImageProcessResult => {
        console.log(`[DEBUG] 准备处理图片: ${imgPath}`);
        const result: ImageProcessResult = {
            success: false,
            data: '',
            mimeType: '',
            fullPath: imgPath
        };
        
        // 检查是否已经是Base64格式，如果是则直接返回
        if (imgPath.startsWith('data:image/')) {
            console.log(`[DEBUG] 检测到Base64图片，跳过处理`);
            // 从data:image/png;base64,xxx提取mimeType和data部分
            const matches = imgPath.match(/^data:([^;]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                return {
                    success: true,
                    data: matches[2],
                    mimeType: matches[1],
                    fullPath: imgPath
                };
            }
            return {
                success: true,
                data: '',
                mimeType: '',
                fullPath: imgPath // 保持原始Base64
            };
        }
        
        try {
            // 获取图片的完整路径，用于读取文件
            const fullImgPath = path.isAbsolute(imgPath) 
                ? imgPath 
                : path.join(basePath, imgPath);
            
            console.log(`[DEBUG] 图片完整路径: ${fullImgPath}`);
            
            if (!fs.existsSync(fullImgPath)) {
                console.warn(`[WARN] 图片文件不存在: ${fullImgPath}`);
                return result;
            }
            
            // 获取文件扩展名和MIME类型
            const ext = path.extname(fullImgPath).toLowerCase();
            let mimeType = 'image/png'; // 默认MIME类型
            
            switch (ext) {
                case '.jpg':
                case '.jpeg':
                    mimeType = 'image/jpeg';
                    break;
                case '.png':
                    mimeType = 'image/png';
                    break;
                case '.gif':
                    mimeType = 'image/gif';
                    break;
                case '.svg':
                    mimeType = 'image/svg+xml';
                    break;
                case '.webp':
                    mimeType = 'image/webp';
                    break;
            }
            
            // 如果是构建模式，保持相对路径
            if (isBuild) {
                return {
                    success: true,
                    data: '',
                    mimeType,
                    fullPath: imgPath // 保持原始相对路径
                };
            }
            
            // 开发模式下，读取图片文件并转换为Base64
            try {
                // 读取图片文件并直接转换为Base64字符串
                const imgBuffer = fs.readFileSync(fullImgPath);
                // 使用Buffer.from().toString('base64')方法转换
                const base64Img = imgBuffer.toString('base64');
                
                console.log(`[DEBUG] 成功读取图片，大小: ${imgBuffer.length} 字节`);
                
                return {
                    success: true,
                    data: base64Img,
                    mimeType,
                    fullPath: imgPath // 保持原始相对路径
                };
            } catch (imgError) {
                console.error(`读取图片文件出错: ${fullImgPath}`, imgError);
                return result;
            }
        } catch (error) {
            console.error(`处理图片路径出错:`, error);
            return result;
        }
    };
    
    // 处理Markdown格式的图片
    let processedMd = markdown.replace(mdImgRegex, (match, alt, imgPath) => {
        console.log(`[DEBUG] 处理Markdown图片: ${match}`);
        
        // 如果已经是Base64格式，直接保留
        if (imgPath.startsWith('data:image/')) {
            return match;
        }
        
        const result = convertImgToBase64(imgPath);
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
    
    // 处理HTML格式的图片
    processedMd = processedMd.replace(htmlImgRegex, (match, imgPath) => {
        console.log(`[DEBUG] 处理HTML图片: ${match}`);
        
        // 如果已经是Base64格式，直接保留
        if (imgPath.startsWith('data:image/')) {
            return match;
        }
        
        const result = convertImgToBase64(imgPath);
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
    
    return processedMd;
}

function collectYAMLChallenges(dirPath: string, rootDir: string, isBuild = false): Challenge[] {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    let challenges: Challenge[] = [];

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            challenges = challenges.concat(collectYAMLChallenges(fullPath, rootDir, isBuild));
        } else if (entry.isFile() && path.extname(entry.name) === '.yml') {
            try {
                const content = fs.readFileSync(fullPath, 'utf8');
                const parsed = YAML.parse(content);

                // 处理挑战数据
                if (parsed.challenges && Array.isArray(parsed.challenges)) {
                    // 处理多个挑战的数组格式
                    console.log(`解析包含挑战数组的YAML文件: ${fullPath}`);
                    parsed.challenges.forEach((challenge: any) => {
                        challenges.push(processChallengeData(challenge, rootDir, isBuild));
                    });
                } else if (parsed.id) {
                    // 处理单个挑战格式
                    console.log(`解析单个挑战YAML文件: ${fullPath}`);
                    challenges.push(processChallengeData(parsed, rootDir, isBuild));
                } else {
                    console.warn(`无法识别的YAML格式，没有找到challenges数组或id字段: ${fullPath}`);
                }
            } catch (e: any) {
                console.error(`Error processing ${fullPath}: ${e.message}`);
            }
        }
    }
    return challenges;
}

// 处理单个挑战数据
function processChallengeData(challenge: any, rootDir: string, isBuild: boolean): any {
    // 处理Markdown内容
    let markdownContent = '';
    
    // 如果有description-markdown-path，读取对应文件内容
    if (challenge['description-markdown-path']) {
        // 获取原始路径，保持为相对路径
        const mdPath = challenge['description-markdown-path'];
        console.log(`处理Markdown路径: ${mdPath}`);
        
        // 尝试多种可能的路径
        // 1. 直接从项目根目录读取
        let fullMdPath = path.join(process.cwd(), mdPath);
        console.log(`尝试路径1(项目根目录): ${fullMdPath}`);
        
        // 2. 从docs/challenges目录读取
        let fullMdPathWithDocs = path.join(process.cwd(), 'docs/challenges', mdPath);
        console.log(`尝试路径2(docs/challenges/): ${fullMdPathWithDocs}`);
        
        // 先检查路径1
        if (fs.existsSync(fullMdPath)) {
            try {
                // 读取Markdown文件内容
                const rawMd = fs.readFileSync(fullMdPath, 'utf8');
                // 处理Markdown中的图片路径，传入文件所在目录作为基础路径
                markdownContent = processMarkdownImages(rawMd, path.dirname(fullMdPath), isBuild);
                console.log(`成功从路径1读取Markdown文件: ${mdPath}`);
            } catch (err) {
                console.error(`读取路径1 Markdown文件出错: ${mdPath}`, err);
            }
        } 
        // 再检查路径2
        else if (fs.existsSync(fullMdPathWithDocs)) {
            try {
                // 读取Markdown文件内容
                const rawMd = fs.readFileSync(fullMdPathWithDocs, 'utf8');
                // 处理Markdown中的图片路径，传入文件所在目录作为基础路径
                markdownContent = processMarkdownImages(rawMd, path.dirname(fullMdPathWithDocs), isBuild);
                console.log(`成功从路径2读取Markdown文件: ${mdPath}`);
            } catch (err) {
                console.error(`读取路径2 Markdown文件出错: ${mdPath}`, err);
            }
        }
        else {
            console.warn(`所有尝试的路径都不存在Markdown文件，最后尝试路径: ${fullMdPathWithDocs}`);
        }
    } 
    // 否则使用内联的description-markdown
    else if (challenge['description-markdown']) {
        markdownContent = challenge['description-markdown'];
    }

    // 确保id是字符串或数字，并确保title有一个有效值
    const challengeId = challenge.id || challenge.number || '0';
    const challengeTitle = challenge.name || challenge.title || '未命名挑战';
    
    console.log(`处理挑战: ID=${challengeId}, Title=${challengeTitle}`);

    // 返回原始挑战数据，不进行类型转换
    // 稍后会在parseChallenges中处理
    return {
        id: challengeId,
        'id-alias': challenge['id-alias'] || challengeId.toString() || '',
        number: challenge.number || '0',
        title: challengeTitle,
        name: challengeTitle,
        difficulty: challenge.difficulty || 1,
        'difficulty-level': challenge.difficulty || 1,
        tags: challenge.tags || [],
        solutions: (challenge.solutions || []).map((sol: any) => ({
            title: sol.title || '',
            url: sol.url || '',
            source: sol.source || '',
            author: sol.author || ''
        })),
        'create-time': challenge['create-time'] || new Date().toISOString(),
        'update-time': challenge['update-time'] || new Date().toISOString(),
        'base64-url': challenge['base64-url'] || '',
        externalLink: challenge['external-link'] || '',
        platform: challenge.platform || 'Web',
        'is-expired': challenge['is-expired'] || false,
        'description-markdown': challenge['description-markdown'] || '',
        descriptionMarkdown: markdownContent // 构建时将Markdown内容统一赋值给descriptionMarkdown字段
    };
}

export default function virtualFileSystemPlugin(
    options: VirtualFileSystemPluginOptions
): PluginOption {
    const { directory, outputPath = 'virtual-file-system.js' } = options;

    return {
        name: 'virtual-file-system-plugin',
        buildStart() {
            // 在这里添加文件监听，当YAML文件或Markdown文件变更时重新构建
            if (fs.existsSync(directory)) {
                // 监听YAML文件
                const yamlFiles = getAllYamlFiles(directory);
                yamlFiles.forEach((file: string) => {
                    this.addWatchFile(file);
                });
                
                // 监听Markdown文件
                const mdFiles = getAllMarkdownFiles(directory);
                mdFiles.forEach((file: string) => {
                    this.addWatchFile(file);
                });
            }
        },
        resolveId(id) {
            // 拦截虚拟文件的请求
            if (id === `/${outputPath}` || id === outputPath) {
                return id;
            }
            return null;
        },
        load(id) {
            // 当请求虚拟文件时，生成并返回挑战数据
            if (id === `/${outputPath}` || id === outputPath) {
                try {
                    if (!fs.existsSync(directory)) {
                        console.error(`VirtualFileSystemPlugin: Directory ${directory} does not exist`);
                        return 'export default [];';
                    }

                    // 检测是否在构建模式
                    const isBuild = process.env.NODE_ENV === 'production' || this.meta?.watchMode === false;
                    console.log(`VirtualFileSystemPlugin: Running in ${isBuild ? 'build' : 'development'} mode`);

                    // 收集并处理YAML挑战和Markdown内容
                    const rawChallenges = collectYAMLChallenges(directory, process.cwd(), isBuild);
                    // 使用parseChallenges函数处理成正确的Challenge类型
                    const challenges = parseChallenges(rawChallenges);
                    return `export default ${JSON.stringify(challenges, null, 2)};`;
                } catch (error: any) {
                    console.error('Error generating virtual file:', error);
                    return 'export default [];';
                }
            }
            return null;
        }
    };
}

// 获取目录下所有的YAML文件
function getAllYamlFiles(dir: string): string[] {
    const results: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            results.push(...getAllYamlFiles(fullPath));
        } else if (entry.isFile() && 
                  (path.extname(entry.name) === '.yml' || 
                   path.extname(entry.name) === '.yaml')) {
            results.push(fullPath);
        }
    }
    
    return results;
}

// 获取目录下所有的Markdown文件
function getAllMarkdownFiles(dir: string): string[] {
    const results: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            results.push(...getAllMarkdownFiles(fullPath));
        } else if (entry.isFile() && 
                  (path.extname(entry.name) === '.md' || 
                   path.extname(entry.name) === '.markdown')) {
            results.push(fullPath);
        }
    }
    
    return results;
}