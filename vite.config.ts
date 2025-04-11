import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import virtualFileSystemPlugin from './src/plugins/VirtualFileSystemPlugin'
import path from 'path'
import fs from 'fs'

// 自定义插件：复制Markdown相关的资源文件到dist目录
function copyMarkdownAssetsPlugin() {
  const assetsSourceDir = path.resolve(__dirname, 'docs/challenges/contents');
  const assetsTargetDir = path.resolve(__dirname, 'dist/md-assets');
  
  return {
    name: 'copy-markdown-assets',
    closeBundle() {
      // 确保目标目录存在
      if (!fs.existsSync(assetsTargetDir)) {
        fs.mkdirSync(assetsTargetDir, { recursive: true });
      }
      
      // 递归复制函数
      function copyDir(src: string, dest: string) {
        if (!fs.existsSync(src)) return;
        
        // 如果源是目录，则创建目标目录并递归复制
        if (fs.statSync(src).isDirectory()) {
          if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
          }
          
          // 获取目录内容并递归处理
          const entries = fs.readdirSync(src, { withFileTypes: true });
          for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);
            
            if (entry.isDirectory()) {
              copyDir(srcPath, destPath);
            } else if (entry.isFile()) {
              // 只复制图片文件
              const ext = path.extname(entry.name).toLowerCase();
              if (['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'].includes(ext)) {
                fs.copyFileSync(srcPath, destPath);
                console.log(`Copied: ${srcPath} -> ${destPath}`);
              }
            }
          }
        }
      }
      
      // 开始复制
      copyDir(assetsSourceDir, assetsTargetDir);
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    virtualFileSystemPlugin({
      directory: path.resolve(__dirname, 'docs/challenges'),
      outputPath: 'virtual-challenges.js'
    }),
    copyMarkdownAssetsPlugin()
  ],
})
