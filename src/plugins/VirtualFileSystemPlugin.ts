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
    description: string;
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
function processMarkdownImages(markdown: string, basePath: string): string {
    // 匹配Markdown图片链接: ![alt](path)
    const imgRegex = /!\[(.*?)\]\((\.\/.*?)\)/g;
    
    return markdown.replace(imgRegex, (match, alt, imgPath) => {
        const fullImgPath = path.resolve(basePath, imgPath);
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
                
                // 读取图片文件并转换为Base64
                const imgBuffer = fs.readFileSync(fullImgPath);
                const base64Img = imgBuffer.toString('base64');
                
                // 返回转换后的图片链接
                return `![${alt}](data:${mimeType};base64,${base64Img})`;
            } catch (error) {
                console.error(`Error processing image ${fullImgPath}:`, error);
                return match; // 出错时保留原始链接
            }
        } else {
            console.warn(`Image file not found: ${fullImgPath}`);
            return match; // 文件不存在时保留原始链接
        }
    });
}

function collectYAMLChallenges(dirPath: string, rootDir: string): Challenge[] {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    let challenges: Challenge[] = [];

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            challenges = challenges.concat(collectYAMLChallenges(fullPath, rootDir));
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
                            
                            if (fs.existsSync(mdPath)) {
                                try {
                                    // 读取Markdown文件内容
                                    const rawMd = fs.readFileSync(mdPath, 'utf8');
                                    // 处理Markdown中的图片路径
                                    markdownContent = processMarkdownImages(rawMd, path.dirname(mdPath));
                                } catch (err) {
                                    console.error(`Error reading Markdown file ${mdPath}:`, err);
                                }
                            } else {
                                console.warn(`Markdown file not found: ${mdPath}`);
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
                            description: challenge.description || '',
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
                            descriptionMarkdown: markdownContent // 添加统一的Markdown内容字段
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

                    // 收集并处理YAML挑战和Markdown内容
                    const challenges = collectYAMLChallenges(directory, process.cwd());
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