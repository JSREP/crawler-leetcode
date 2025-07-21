import type { PluginOption } from 'vite';

export interface VirtualFileSystemPluginOptions {
    directory: string;
    outputPath?: string;
}

export interface Solution {
    title: string;
    url: string;
    source: string;
    author: string;
}

export interface ImageProcessResult {
    success: boolean;
    data: string;
    mimeType: string;
    fullPath: string;
} 