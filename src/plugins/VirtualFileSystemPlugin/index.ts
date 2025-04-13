import type { PluginOption } from 'vite';
import * as fs from 'fs';
import * as path from 'path';
import { VirtualFileSystemPluginOptions } from './types';
import { getAllYamlFiles, getAllMarkdownFiles } from './fileUtils';
import { collectYAMLChallenges } from './challengeProcessor';
import { parseChallenges } from '../../types/challenge';

export default function virtualFileSystemPlugin(
    options: VirtualFileSystemPluginOptions
): PluginOption {
    const { directory, outputPath = 'virtual-file-system.js' } = options;
    // 用于缓存已加载的YAML文件列表
    let cachedYamlFiles: string[] = [];

    // 打印启动时的监控目录信息
    console.log(`[VirtualFileSystemPlugin] 监控目录: ${directory}`);
    console.log(`[VirtualFileSystemPlugin] 输出文件: ${outputPath}`);

    return {
        name: 'virtual-file-system-plugin',
        buildStart() {
            // 在这里添加文件监听，当YAML文件或Markdown文件变更时重新构建
            if (fs.existsSync(directory)) {
                console.log(`[VirtualFileSystemPlugin] 开始监控目录: ${directory}`);
                
                // 监听整个目录，而不是单独的文件，这样能监控到新增文件
                this.addWatchFile(directory);
                
                // 初始化时扫描一次所有YAML文件
                cachedYamlFiles = getAllYamlFiles(directory);
                console.log(`[VirtualFileSystemPlugin] 找到 ${cachedYamlFiles.length} 个YAML文件`);
                
                // 监听所有YAML文件
                cachedYamlFiles.forEach((file: string) => {
                    console.log(`[VirtualFileSystemPlugin] 添加监控: ${file}`);
                    this.addWatchFile(file);
                });
                
                // 监听Markdown文件
                const mdFiles = getAllMarkdownFiles(directory);
                mdFiles.forEach((file: string) => {
                    this.addWatchFile(file);
                });
            } else {
                console.warn(`[VirtualFileSystemPlugin] 警告: 目录 ${directory} 不存在`);
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

                    // 检测是否在构建模式
                    const isBuild = process.env.NODE_ENV === 'production' || this.meta?.watchMode === false;
                    console.log(`VirtualFileSystemPlugin: Running in ${isBuild ? 'build' : 'development'} mode`);

                    // 每次加载时重新扫描所有YAML文件，确保能捕获到新增文件
                    const currentYamlFiles = getAllYamlFiles(directory);
                    const newFiles = currentYamlFiles.filter(file => !cachedYamlFiles.includes(file));
                    
                    if (newFiles.length > 0) {
                        console.log(`[VirtualFileSystemPlugin] 检测到 ${newFiles.length} 个新YAML文件`);
                        // 将新文件添加到缓存
                        cachedYamlFiles = [...cachedYamlFiles, ...newFiles];
                    }

                    // 收集并处理YAML挑战和Markdown内容
                    const rawChallenges = collectYAMLChallenges(directory, process.cwd(), isBuild);
                    // 使用parseChallenges函数处理成正确的Challenge类型
                    const challenges = parseChallenges(rawChallenges);
                    return `export default ${JSON.stringify(challenges, null, 2)};`;
                } catch (error: any) {
                    console.error('Error generating virtual file:', error);
                    return 'export default [];';
                }
            }
            return null;
        },
        handleHotUpdate(ctx) {
            // 检测热更新触发
            const { file, server } = ctx;
            
            // 检查是否是docs/challenges目录下的YAML文件变更，或者是目录变更
            if (file.includes('docs/challenges')) {
                // 如果是YAML文件变更或目录变更，触发重新加载
                const isYamlFile = file.endsWith('.yml') || file.endsWith('.yaml');
                const isDirectory = fs.existsSync(file) && fs.statSync(file).isDirectory();
                
                if (isYamlFile || isDirectory) {
                    console.log(`[VirtualFileSystemPlugin] 热更新触发: ${file}`);
                    
                    // 如果是文件变更，检查是否是新文件
                    if (isYamlFile && !cachedYamlFiles.includes(file)) {
                        console.log(`[VirtualFileSystemPlugin] 检测到新YAML文件: ${file}`);
                        cachedYamlFiles.push(file);
                    }
                    
                    // 如果是目录变更，重新扫描目录以查找新文件
                    if (isDirectory) {
                        const currentYamlFiles = getAllYamlFiles(directory);
                        const newFiles = currentYamlFiles.filter(f => !cachedYamlFiles.includes(f));
                        
                        if (newFiles.length > 0) {
                            console.log(`[VirtualFileSystemPlugin] 目录变更，检测到 ${newFiles.length} 个新YAML文件`);
                            newFiles.forEach(newFile => {
                                console.log(`[VirtualFileSystemPlugin] 添加新文件到缓存: ${newFile}`);
                                cachedYamlFiles.push(newFile);
                            });
                        }
                    }
                    
                    // 强制模块失效，触发重新加载
                    const mod = server.moduleGraph.getModuleById(`/${outputPath}`);
                    if (mod) {
                        server.moduleGraph.invalidateModule(mod);
                    }
                    
                    // 告知客户端刷新页面
                    return ctx.modules;
                }
            }
            return;
        }
    };
} 