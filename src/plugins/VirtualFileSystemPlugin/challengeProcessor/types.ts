// src/plugins/VirtualFileSystemPlugin/challengeProcessor/types.ts
export interface Solution {
    title: string;
    url: string;
    source: string;
    author: string;
}

/**
 * 挑战数据基本结构
 */
export interface ChallengeBase {
    id: string | number;
    title: string;
    name: string;
    name_en?: string;
    titleEN?: string;
    difficulty: number;
    tags: string[];
    solutions: Solution[];
    sourceFile?: string;
    [key: string]: any; // 允许其他属性
} 