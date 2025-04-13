import * as fs from 'fs';
import * as path from 'path';
import * as YAML from 'yaml';
import { Challenge } from '../../types/challenge';
import { processMarkdownImages } from './imageProcessor';

// 收集YAML挑战
export function collectYAMLChallenges(dirPath: string, rootDir: string, isBuild = false): Challenge[] {
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

                // 计算YAML文件相对于根目录的路径
                const yamlRelativePath = path.relative(rootDir, fullPath);
                
                // 处理挑战数据
                if (parsed.challenges && Array.isArray(parsed.challenges)) {
                    // 处理多个挑战的数组格式
                    console.log(`解析包含挑战数组的YAML文件: ${fullPath}`);
                    parsed.challenges.forEach((challenge: any) => {
                        // 跳过标记为ignored的挑战
                        if (challenge.ignored === true) {
                            console.log(`跳过忽略的挑战: ID=${challenge.id || 'unknown'}, 文件: ${yamlRelativePath}`);
                            return;
                        }
                        // 传递YAML文件路径
                        challenges.push(processChallengeData(challenge, rootDir, isBuild, yamlRelativePath));
                    });
                } else if (parsed.id) {
                    // 处理单个挑战格式
                    console.log(`解析单个挑战YAML文件: ${fullPath}`);
                    // 跳过标记为ignored的挑战
                    if (parsed.ignored !== true) {
                        challenges.push(processChallengeData(parsed, rootDir, isBuild, yamlRelativePath));
                    } else {
                        console.log(`跳过忽略的挑战文件: ${yamlRelativePath}`);
                    }
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
export function processChallengeData(challenge: any, rootDir: string, isBuild: boolean, yamlPath: string = ''): any {
    // 处理Markdown内容
    let markdownContent = '';
    let markdownContentEN = '';
    
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
    
    // 处理英文Markdown文件
    if (challenge['description-markdown-path_en']) {
        // 获取原始路径，保持为相对路径
        const mdPathEN = challenge['description-markdown-path_en'];
        console.log(`处理英文Markdown路径: ${mdPathEN}`);
        
        // 尝试多种可能的路径
        // 1. 直接从项目根目录读取
        let fullMdPathEN = path.join(process.cwd(), mdPathEN);
        console.log(`尝试英文路径1(项目根目录): ${fullMdPathEN}`);
        
        // 2. 从docs/challenges目录读取
        let fullMdPathWithDocsEN = path.join(process.cwd(), 'docs/challenges', mdPathEN);
        console.log(`尝试英文路径2(docs/challenges/): ${fullMdPathWithDocsEN}`);
        
        // 先检查路径1
        if (fs.existsSync(fullMdPathEN)) {
            try {
                // 读取Markdown文件内容
                const rawMdEN = fs.readFileSync(fullMdPathEN, 'utf8');
                // 处理Markdown中的图片路径，传入文件所在目录作为基础路径
                markdownContentEN = processMarkdownImages(rawMdEN, path.dirname(fullMdPathEN), isBuild);
                console.log(`成功从路径1读取英文Markdown文件: ${mdPathEN}`);
            } catch (err) {
                console.error(`读取路径1 英文Markdown文件出错: ${mdPathEN}`, err);
            }
        } 
        // 再检查路径2
        else if (fs.existsSync(fullMdPathWithDocsEN)) {
            try {
                // 读取Markdown文件内容
                const rawMdEN = fs.readFileSync(fullMdPathWithDocsEN, 'utf8');
                // 处理Markdown中的图片路径，传入文件所在目录作为基础路径
                markdownContentEN = processMarkdownImages(rawMdEN, path.dirname(fullMdPathWithDocsEN), isBuild);
                console.log(`成功从路径2读取英文Markdown文件: ${mdPathEN}`);
            } catch (err) {
                console.error(`读取路径2 英文Markdown文件出错: ${mdPathEN}`, err);
            }
        }
        else {
            console.warn(`所有尝试的路径都不存在英文Markdown文件，最后尝试路径: ${fullMdPathWithDocsEN}`);
        }
    }
    // 否则使用内联的description-markdown_en
    else if (challenge['description-markdown_en']) {
        markdownContentEN = challenge['description-markdown_en'];
    }

    // 确保id是字符串或数字，并确保title有一个有效值
    const challengeId = challenge.id || challenge.number || '0';
    const challengeTitle = challenge.name || challenge.title || '未命名挑战';
    const challengeTitleEN = challenge.name_en || challenge['name_en'] || '';
    
    console.log(`处理挑战: ID=${challengeId}, Title=${challengeTitle}, EN Title=${challengeTitleEN}`);
    console.log('YAML原始数据:', {
        'challenge.id': challenge.id,
        'challenge.name': challenge.name,
        'challenge.name_en': challenge.name_en,
        'challenge["name_en"]': challenge['name_en'],
        'challenge.title': challenge.title
    });

    // 返回原始挑战数据，不进行类型转换
    // 稍后会在parseChallenges中处理
    return {
        id: challengeId,
        'id-alias': challenge['id-alias'] || challengeId.toString() || '',
        number: challenge.number || '0',
        title: challengeTitle,
        name: challengeTitle,
        name_en: challengeTitleEN,
        titleEN: challengeTitleEN, // 直接添加titleEN字段方便后续处理
        difficulty: parseInt(String(challenge.difficulty || challenge['difficulty-level'] || '1'), 10),
        'difficulty-level': parseInt(String(challenge.difficulty || challenge['difficulty-level'] || '1'), 10),
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
        externalLink: challenge['base64-url'] ? atob(challenge['base64-url']) : challenge['external-link'] || '',
        platform: challenge.platform || 'Web',
        'is-expired': challenge['is-expired'] || false,
        ignored: challenge.ignored || false, // 添加ignored属性
        'description-markdown': challenge['description-markdown'] || '',
        'description-markdown_en': challenge['description-markdown_en'] || '',
        descriptionMarkdown: markdownContent, // 构建时将Markdown内容统一赋值给descriptionMarkdown字段
        descriptionMarkdownEN: markdownContentEN, // 英文Markdown内容
        sourceFile: yamlPath // 添加源文件路径
    };
} 