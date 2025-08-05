/** @type {import('next').NextConfig} */
const nextConfig = {
  // 配置为纯前端应用
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,

  // 图片配置
  images: {
    domains: ['github.com', 'avatars.githubusercontent.com', 'localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '57523', // 更新为新的后端端口
        pathname: '/storage/files/**',
      },
      {
        protocol: 'https',
        hostname: '*.herokuapp.com',
        pathname: '/storage/files/**',
      },
    ],
    unoptimized: true
  },

  // 环境变量 - 端口配置：57524 - 禁止修改此端口号
  env: {
    CUSTOM_KEY: 'my-value',
    PORT: process.env.PORT || '57524', // 前端端口：57524 - 禁止修改
  },

  // 重定向配置
  async redirects() {
    return []
  },

  // 禁用API路由相关的头部配置
  async headers() {
    return []
  },
}

module.exports = nextConfig
