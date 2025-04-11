import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import virtualFileSystemPlugin from './src/plugins/VirtualFileSystemPlugin'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    virtualFileSystemPlugin({
      directory: path.resolve(__dirname, 'docs/challenges'),
      outputPath: 'virtual-challenges.js'
    })
  ],
})
