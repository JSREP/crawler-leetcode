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
    id: string;
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
}

function collectYAMLChallenges(dirPath: string): Challenge[] {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    let challenges: Challenge[] = [];

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            challenges = challenges.concat(collectYAMLChallenges(fullPath));
        } else if (entry.isFile() && path.extname(entry.name) === '.yml') {
            try {
                const content = fs.readFileSync(fullPath, 'utf8');
                const parsed = YAML.parse(content);

                // 处理挑战数据
                if (parsed.challenges && Array.isArray(parsed.challenges)) {
                    parsed.challenges.forEach((challenge: any) => {
                        const transformed: Challenge = {
                            id: challenge.id || '',
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
                            'id-alias': challenge['id-alias'] || challenge.id || ''
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
            // 在这里添加文件监听，当YAML文件变更时重新构建
            if (fs.existsSync(directory)) {
                const yamlFiles = getAllYamlFiles(directory);
                yamlFiles.forEach(file => {
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

                    const challenges = collectYAMLChallenges(directory);
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