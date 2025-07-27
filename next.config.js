/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@vercel/postgres']
  },
  images: {
    domains: ['github.com', 'avatars.githubusercontent.com'],
    unoptimized: true
  },
  // 支持静态导出（如果需要）
  output: 'standalone',
  // 环境变量
  env: {
    CUSTOM_KEY: 'my-value',
  },
  // 重定向配置
  async redirects() {
    return [
      {
        source: '/challenges/:path*',
        destination: '/challenges/:path*',
        permanent: true,
      },
    ]
  },
  // 头部配置
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
