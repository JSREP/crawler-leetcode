/**
 * 认证配置文件
 * 统一管理认证相关的配置
 */

import { GitHubOAuthConfig } from '@/types/auth';

export const authConfig = {
  // JWT配置
  jwt: {
    secret: process.env.NEXTAUTH_SECRET || 'your-jwt-secret-key',
    expiresIn: '7d', // 7天过期
    algorithm: 'HS256' as const,
  },

  // Session配置
  session: {
    maxAge: 7 * 24 * 60 * 60, // 7天（秒）
    cookieName: 'auth-token',
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    },
  },

  // GitHub OAuth配置
  github: {
    clientId: process.env.GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:61395'}/api/auth/github/callback`,
    scope: 'user:email',
    authorizeUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userApiUrl: 'https://api.github.com/user',
  } as GitHubOAuthConfig,

  // 页面路由
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/auth/error',
  },

  // 回调URL
  callbacks: {
    success: '/',
    error: '/auth/error',
  },
} as const;

export type AuthConfig = typeof authConfig;

// 验证必需的环境变量
export function validateAuthConfig(): { isValid: boolean; missingVars: string[] } {
  const requiredVars = [
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',
    'NEXTAUTH_SECRET',
  ];

  const missingVars = requiredVars.filter(varName => {
    const value = process.env[varName];
    return !value || value.startsWith('your-') || value === '';
  });

  return {
    isValid: missingVars.length === 0,
    missingVars,
  };
}

// 获取GitHub OAuth授权URL
export function getGitHubAuthUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: authConfig.github.clientId,
    redirect_uri: authConfig.github.redirectUri,
    scope: authConfig.github.scope,
    state: state || generateRandomState(),
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

// 生成随机状态字符串
export function generateRandomState(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}
