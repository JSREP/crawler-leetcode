// src/plugins/VirtualFileSystemPlugin.ts
import type { PluginOption } from 'vite';
import * as fs from 'fs';
import * as path from 'path';
import * as YAML from 'yaml';

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

interface Challenge {
    id: number;
    number: string;
    title: string;
    name: string;
    'description-markdown': string;
    difficulty: string;
    'difficulty-level': string;
    tags: string[];
    solutions: Solution[];
    'create-time': string;
    'update-time': string;
    'base64-url': string;
    externalLink: string;
    platform: string;
    'is-expired': boolean;
    'id-alias': string;
    descriptionMarkdown: string; // 统一的Markdown内容字段
}

// 处理相对路径的图片链接，转换为绝对路径或Base64
function processMarkdownImages(markdown: string, basePath: string, isBuild = false): string {
    // 匹配Markdown图片链接: ![alt](path) 和 <img src="path"> 两种格式
    // 支持./开头的相对路径、../开头的上级目录路径以及/开头的根路径
    const mdImgRegex = /!\[(.*?)\]\(((?:\.\/|\.\.|\/)[^)]+)\)/g;
    const htmlImgRegex = /<img.*?src=["']((?:\.\/|\.\.|\/)[^"']+)["'].*?>/g;
    
    // 解析图片路径，转换为绝对路径
    const resolveImgPath = (imgPath: string): string => {
        // 如果是绝对路径（以/开头）
        if (imgPath.startsWith('/')) {
            return path.join(process.cwd(), imgPath);
        }
        // 否则作为相对路径处理
        return path.resolve(basePath, imgPath);
    };
    
    // 获取图片在md-assets目录下的路径（用于生产环境）
    const getMdAssetsPath = (imgPath: string): string => {
        // 如果是assets目录下的文件
        if (imgPath.includes('/assets/')) {
            // 提取相对于contents目录的路径
            const contentsDirIndex = imgPath.indexOf('/contents/');
            if (contentsDirIndex !== -1) {
                // 从/contents/后面开始截取
                const relativePath = imgPath.substring(contentsDirIndex + 10); // +10是跳过'/contents/'
                return `/md-assets${relativePath}`;
            }
        }
        return imgPath; // 默认返回原路径
    };
    
    // 处理图片转base64的函数
    const convertImgToBase64 = (imgPath: string): { success: boolean; data: string; mimeType: string; fullPath: string } => {
        const fullImgPath = resolveImgPath(imgPath);
        
        if (fs.existsSync(fullImgPath)) {
            try {
                // 获取文件扩展名和MIME类型
                const ext = path.extname(fullImgPath).toLowerCase();
                let mimeType = 'image/png'; // 默认MIME类型
                
                // 根据扩展名设置MIME类型
                if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
                else if (ext === '.png') mimeType = 'image/png';
                else if (ext === '.gif') mimeType = 'image/gif';
                else if (ext === '.svg') mimeType = 'image/svg+xml';
                else if (ext === '.webp') mimeType = 'image/webp';
                
                // 如果是构建模式，不转换为Base64，而是使用相对路径
                if (isBuild) {
                    return { 
                        success: true, 
                        data: '', // 在构建模式下不使用Base64数据
                        mimeType,
                        fullPath: fullImgPath
                    };
                }
                
                // 开发模式下，读取图片文件并转换为Base64
                const imgBuffer = fs.readFileSync(fullImgPath);
                const base64Img = imgBuffer.toString('base64');
                
                return { 
                    success: true, 
                    data: base64Img,
                    mimeType,
                    fullPath: fullImgPath
                };
            } catch (error) {
                console.error(`Error processing image ${fullImgPath}:`, error);
                return { success: false, data: '', mimeType: '', fullPath: fullImgPath };
            }
        } else {
            console.warn(`Image file not found: ${fullImgPath}`);
            return { success: false, data: '', mimeType: '', fullPath: fullImgPath };
        }
    };
    
    // 处理Markdown格式的图片
    let processedMd = markdown.replace(mdImgRegex, (match, alt, imgPath) => {
        const result = convertImgToBase64(imgPath);
        if (result.success) {
            if (isBuild) {
                // 构建模式下使用相对路径
                const buildPath = getMdAssetsPath(result.fullPath);
                return `![${alt}](${buildPath})`;
            }
            // 开发模式下使用Base64
            return `![${alt}](data:${result.mimeType};base64,${result.data})`;
        }
        return match; // 出错时保留原始链接
    });
    
    // 处理HTML格式的图片
    processedMd = processedMd.replace(htmlImgRegex, (match, imgPath) => {
        const result = convertImgToBase64(imgPath);
        if (result.success) {
            // 从原始标签中提取属性
            const altMatch = match.match(/alt=["'](.*?)["']/);
            const alt = altMatch ? altMatch[1] : '';
            
            if (isBuild) {
                // 构建模式下使用相对路径
                const buildPath = getMdAssetsPath(result.fullPath);
                return `<img src="${buildPath}" alt="${alt}" />`;
            }
            // 开发模式下使用Base64
            return `<img src="data:${result.mimeType};base64,${result.data}" alt="${alt}" />`;
        }
        return match; // 出错时保留原始链接
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
                    parsed.challenges.forEach((challenge: any) => {
                        // 处理Markdown内容
                        let markdownContent = '';
                        
                        // 如果有description-markdown-path，读取对应文件内容
                        if (challenge['description-markdown-path']) {
                            const mdPath = path.resolve(rootDir, challenge['description-markdown-path']);
                            console.log(`解析Markdown路径: ${challenge['description-markdown-path']} -> ${mdPath}`);
                            
                            if (fs.existsSync(mdPath)) {
                                try {
                                    // 读取Markdown文件内容
                                    const rawMd = fs.readFileSync(mdPath, 'utf8');
                                    // 处理Markdown中的图片路径，根据环境决定如何处理图片
                                    markdownContent = processMarkdownImages(rawMd, path.dirname(mdPath), isBuild);
                                } catch (err) {
                                    console.error(`Error reading Markdown file ${mdPath}:`, err);
                                }
                            } else {
                                console.warn(`Markdown file not found: ${mdPath}`);
                                // 尝试在docs目录查找
                                const altPath = path.resolve(rootDir, 'docs/challenges', challenge['description-markdown-path']);
                                console.log(`尝试替代路径: ${altPath}`);
                                if (fs.existsSync(altPath)) {
                                    try {
                                        const rawMd = fs.readFileSync(altPath, 'utf8');
                                        markdownContent = processMarkdownImages(rawMd, path.dirname(altPath), isBuild);
                                        console.log(`成功使用替代路径读取Markdown: ${altPath}`);
                                    } catch (err) {
                                        console.error(`Error reading alternate Markdown file ${altPath}:`, err);
                                    }
                                } else {
                                    console.warn(`Alternate Markdown file not found: ${altPath}`);
                                }
                            }
                        } 
                        // 否则使用内联的description-markdown
                        else if (challenge['description-markdown']) {
                            markdownContent = challenge['description-markdown'];
                        }

                        const transformed: Challenge = {
                            id: parseInt(challenge.id || '0', 10),
                            number: challenge.number || '0',
                            title: challenge.name || '',
                            name: challenge.name || '',
                            'description-markdown': challenge['description-markdown'] || '',
                            difficulty: challenge.difficulty || '1',
                            'difficulty-level': challenge['difficulty-level'] || '1',
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
                            // 从base64-url解码得到外部链接
                            externalLink: challenge['base64-url'] 
                                ? Buffer.from(challenge['base64-url'], 'base64').toString('utf-8')
                                : '',
                            platform: challenge.platform || 'Web',
                            'is-expired': challenge['is-expired'] || false,
                            'id-alias': challenge['id-alias'] || challenge.id?.toString() || '',
                            descriptionMarkdown: markdownContent // 构建时将Markdown内容统一赋值给descriptionMarkdown字段
                        };
                        challenges.push(transformed);
                    });
                } else {
                    console.warn(`No challenges array found in ${fullPath}`);
                }
            } catch (e: any) {
                console.error(`Error processing ${fullPath}: ${e.message}`);
            }
        }
    }
    return challenges;
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
                yamlFiles.forEach(file => {
                    this.addWatchFile(file);
                });
                
                // 监听Markdown文件
                const mdFiles = getAllMarkdownFiles(directory);
                mdFiles.forEach(file => {
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
                    const challenges = collectYAMLChallenges(directory, process.cwd(), isBuild);
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