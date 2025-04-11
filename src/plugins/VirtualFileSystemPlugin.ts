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
    description: string;
    difficulty: string;
    tags: string[];
    solutions: Solution[];
    createTime: string;
    updateTime: string;
    externalLink: string;
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

                if (!parsed.challenges || !Array.isArray(parsed.challenges)) {
                    throw new Error(`Invalid challenges format in ${fullPath}`);
                }

                parsed.challenges.forEach((challenge: any) => {
                    const transformed: Challenge = {
                        id: challenge.id,
                        number: challenge.number, // 修正字段映射
                        title: challenge.name,
                        description: challenge['description-markdown'] || challenge.description || '',
                        difficulty: challenge['difficulty-level'].toString(),
                        tags: challenge.tags || [],
                        solutions: (challenge.solutions || []).map((sol: any) => ({
                            title: sol.title,
                            url: sol.url,
                            source: sol.source,
                            author: sol.author
                        })),
                        createTime: new Date(challenge['create-time']).toISOString(),
                        updateTime: new Date(challenge['update-time']).toISOString(),
                        externalLink: Buffer.from(challenge['base64-url'], 'base64').toString('utf-8')
                    };
                    challenges.push(transformed);
                });
            } catch (e: any) {
                throw new Error(`Error processing ${fullPath}: ${e.message}`);
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
        generateBundle() {
            if (!fs.existsSync(directory)) {
                this.error(`VirtualFileSystemPlugin: Directory ${directory} does not exist`);
                return;
            }

            try {
                const challenges = collectYAMLChallenges(directory);
                const source = `export default ${JSON.stringify(challenges, null, 2)};`;

                this.emitFile({
                    type: 'asset',
                    fileName: outputPath,
                    source: source
                });
            } catch (error: any) {
                this.error(error);
            }
        }
    };
}