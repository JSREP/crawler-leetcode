// src/types/vfs.ts
export interface Solution {
    title: string;
    url: string;
    source: string;
    author: string;
}

export interface Challenge {
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