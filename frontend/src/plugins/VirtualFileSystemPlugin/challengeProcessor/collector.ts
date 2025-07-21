import * as fs from 'fs';
import * as path from 'path';
import * as YAML from 'yaml';
import { Challenge } from '../../../types/challenge';
import { processChallengeData } from './processor';

/**
 * 收集目录下所有YAML文件中的挑战数据
 * @param dirPath 目录路径
 * @param rootDir 根目录
 * @param isBuild 是否为构建模式
 * @returns 挑战数据数组
 */
export function collectYAMLChallenges(dirPath: string, rootDir: string, isBuild = false): Challenge[] {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    let challenges: Challenge[] = [];

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            challenges = challenges.concat(collectYAMLChallenges(fullPath, rootDir, isBuild));
        } else if (entry.isFile() && path.extname(entry.name) === '.yml') {
            const yamlChallenges = processYamlFile(fullPath, rootDir, isBuild);
            if (yamlChallenges && yamlChallenges.length > 0) {
                challenges = challenges.concat(yamlChallenges);
            }
        }
    }
    return challenges;
}

/**
 * 处理单个YAML文件
 * @param filePath 文件路径
 * @param rootDir 根目录
 * @param isBuild 是否为构建模式
 * @returns 挑战数据数组
 */
function processYamlFile(filePath: string, rootDir: string, isBuild = false): Challenge[] {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const parsed = YAML.parse(content);
        const challenges: Challenge[] = [];

        // 计算YAML文件相对于根目录的路径
        const yamlRelativePath = path.relative(rootDir, filePath);
        
        // 处理挑战数据
        if (parsed.challenges && Array.isArray(parsed.challenges)) {
            // 处理多个挑战的数组格式
            console.log(`解析包含挑战数组的YAML文件: ${filePath}`);
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
            console.log(`解析单个挑战YAML文件: ${filePath}`);
            // 跳过标记为ignored的挑战
            if (parsed.ignored !== true) {
                challenges.push(processChallengeData(parsed, rootDir, isBuild, yamlRelativePath));
            } else {
                console.log(`跳过忽略的挑战文件: ${yamlRelativePath}`);
            }
        } else {
            console.warn(`无法识别的YAML格式，没有找到challenges数组或id字段: ${filePath}`);
        }
        
        return challenges;
    } catch (e: any) {
        console.error(`Error processing ${filePath}: ${e.message}`);
        return [];
    }
} 