import * as fs from 'fs';
import * as path from 'path';
import { processMarkdownImages } from '../imageProcessor';
import { Solution } from './types';

/**
 * 处理单个挑战数据
 * @param challenge 原始挑战数据
 * @param rootDir 根目录
 * @param isBuild 是否为构建模式
 * @param yamlPath YAML文件路径
 * @returns 处理后的挑战数据
 */
export function processChallengeData(challenge: any, rootDir: string, isBuild: boolean, yamlPath: string = ''): any {
    // 处理Markdown内容
    let markdownContent = '';
    let markdownContentEN = '';
    
    // 如果有description-markdown-path，读取对应文件内容
    if (challenge['description-markdown-path']) {
        markdownContent = processMarkdownPathContent(
            challenge['description-markdown-path'], 
            rootDir, 
            isBuild
        );
    } 
    // 否则使用内联的description-markdown
    else if (challenge['description-markdown']) {
        markdownContent = challenge['description-markdown'];
    }
    
    // 处理英文Markdown文件
    if (challenge['description-markdown-path_en']) {
        markdownContentEN = processMarkdownPathContent(
            challenge['description-markdown-path_en'], 
            rootDir, 
            isBuild
        );
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
    logChallengeData(challenge);

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
        solutions: processSolutions(challenge.solutions || []),
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

/**
 * 处理Markdown路径内容
 * @param mdPath Markdown文件路径
 * @param rootDir 根目录
 * @param isBuild 是否为构建模式
 * @returns 处理后的Markdown内容
 */
function processMarkdownPathContent(mdPath: string, rootDir: string, isBuild: boolean): string {
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
        return readAndProcessMarkdown(fullMdPath, isBuild, mdPath, '1');
    } 
    // 再检查路径2
    else if (fs.existsSync(fullMdPathWithDocs)) {
        return readAndProcessMarkdown(fullMdPathWithDocs, isBuild, mdPath, '2');
    }
    else {
        console.warn(`所有尝试的路径都不存在Markdown文件，最后尝试路径: ${fullMdPathWithDocs}`);
        return '';
    }
}

/**
 * 读取并处理Markdown文件
 * @param filePath 文件路径
 * @param isBuild 是否为构建模式
 * @param mdPath 原始路径
 * @param pathType 路径类型
 * @returns 处理后的Markdown内容
 */
function readAndProcessMarkdown(filePath: string, isBuild: boolean, mdPath: string, pathType: string): string {
    try {
        // 读取Markdown文件内容
        const rawMd = fs.readFileSync(filePath, 'utf8');
        // 处理Markdown中的图片路径，传入文件所在目录作为基础路径
        const content = processMarkdownImages(rawMd, path.dirname(filePath), isBuild);
        console.log(`成功从路径${pathType}读取Markdown文件: ${mdPath}`);
        return content;
    } catch (err) {
        console.error(`读取路径${pathType} Markdown文件出错: ${mdPath}`, err);
        return '';
    }
}

/**
 * 处理解决方案数组
 * @param solutions 原始解决方案数组
 * @returns 处理后的解决方案数组
 */
function processSolutions(solutions: any[]): Solution[] {
    return (solutions).map((sol: any) => ({
        title: sol.title || '',
        url: sol.url || '',
        source: sol.source || '',
        author: sol.author || ''
    }));
}

/**
 * 记录挑战数据日志
 * @param challenge 挑战数据
 */
function logChallengeData(challenge: any): void {
    console.log('YAML原始数据:', {
        'challenge.id': challenge.id,
        'challenge.name': challenge.name,
        'challenge.name_en': challenge.name_en,
        'challenge["name_en"]': challenge['name_en'],
        'challenge.title': challenge.title
    });
} 