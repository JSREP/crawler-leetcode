// 导入虚拟文件系统生成的数据
// @ts-ignore - 虚拟文件在构建时生成
import rawChallenges from '/virtual-challenges.js';
// 导入类型和解析函数
import { Challenge, parseChallenges } from '../../types/challenge';

// 使用虚拟文件系统数据
export const challenges: Challenge[] = parseChallenges(Array.isArray(rawChallenges) ? rawChallenges : []);

export type Solution = {
    title: string;
    url: string;
    source: string;
}; 