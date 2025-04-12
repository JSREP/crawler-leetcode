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

// 开发环境下处理静态资源的中间件
function serveMarkdownAssetsPlugin() {
  const challengesDir = path.resolve(__dirname, 'docs/challenges');
  
  return {
    name: 'serve-markdown-assets',
    configureServer(server: any) {
      // 添加中间件来处理assets路径请求
      server.middlewares.use((req: any, res: any, next: any) => {
        // 检查URL是否是请求assets目录下的文件
        if (req.url && req.url.includes('/assets/')) {
          // 从URL中提取相对路径部分
          const urlParts = req.url.split('/assets/');
          if (urlParts.length > 1) {
            const assetPath = urlParts[1];
            
            // 构建文件的完整路径（优先检查example目录，因为我们的示例在这里）
            const exampleAssetPath = path.resolve(challengesDir, 'contents/example/assets', assetPath);
            
            // 检查文件是否存在
            if (fs.existsSync(exampleAssetPath)) {
              const contentType = getContentType(assetPath);
              res.setHeader('Content-Type', contentType);
              
              // 返回文件内容
              fs.createReadStream(exampleAssetPath).pipe(res);
              return;
            }
            
            // 如果example目录中不存在，尝试在整个contents目录中查找
            const allContentsPath = path.resolve(challengesDir, 'contents');
            
            // 递归查找文件
            const foundPath = findFileRecursively(allContentsPath, assetPath);
            if (foundPath) {
              const contentType = getContentType(assetPath);
              res.setHeader('Content-Type', contentType);
              fs.createReadStream(foundPath).pipe(res);
              return;
            }
          }
        }
        next();
      });
    }
  };
}

// 递归查找文件
function findFileRecursively(dir: string, fileName: string): string | null {
  if (!fs.existsSync(dir)) return null;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // 如果是assets目录，直接在其中查找
      if (entry.name === 'assets') {
        const filePath = path.join(fullPath, fileName);
        if (fs.existsSync(filePath)) {
          return filePath;
        }
      }
      
      // 递归搜索子目录
      const found: string | null = findFileRecursively(fullPath, fileName);
      if (found) return found;
    }
  }
  
  return null;
}

// 根据文件扩展名获取MIME类型
function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.gif':
      return 'image/gif';
    case '.svg':
      return 'image/svg+xml';
    case '.webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/crawler-leetcode/',
  plugins: [
    react(),
    virtualFileSystemPlugin({
      directory: path.resolve(__dirname, 'docs/challenges'),
      outputPath: 'virtual-challenges.js'
    }),
    copyMarkdownAssetsPlugin(),
    serveMarkdownAssetsPlugin()
  ],
})
