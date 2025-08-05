/**
 * GitHub API客户端
 */

import { authConfig } from '@/config/auth';
import { GitHubUser, GitHubTokenResponse } from '@/types/auth';

/**
 * 使用授权码获取访问令牌
 */
export async function getGitHubAccessToken(code: string, state?: string): Promise<string> {
  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: authConfig.github.clientId,
        client_secret: authConfig.github.clientSecret,
        code,
        redirect_uri: authConfig.github.redirectUri,
        ...(state && { state }),
      }),
    });

    if (!response.ok) {
      throw new Error(`GitHub token request failed: ${response.status}`);
    }

    const data: GitHubTokenResponse = await response.json();
    
    if (!data.access_token) {
      throw new Error('No access token received from GitHub');
    }

    return data.access_token;
  } catch (error) {
    console.error('Error getting GitHub access token:', error);
    throw new Error('Failed to get GitHub access token');
  }
}

/**
 * 使用访问令牌获取用户信息
 */
export async function getGitHubUser(accessToken: string): Promise<GitHubUser> {
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'crawler-leetcode-app',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub user request failed: ${response.status}`);
    }

    const userData: GitHubUser = await response.json();
    
    // 如果用户的email是私有的，尝试获取主要邮箱
    if (!userData.email) {
      userData.email = await getGitHubUserEmail(accessToken);
    }

    return userData;
  } catch (error) {
    console.error('Error getting GitHub user:', error);
    throw new Error('Failed to get GitHub user information');
  }
}

/**
 * 获取用户的主要邮箱地址
 */
export async function getGitHubUserEmail(accessToken: string): Promise<string | null> {
  try {
    const response = await fetch('https://api.github.com/user/emails', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'crawler-leetcode-app',
      },
    });

    if (!response.ok) {
      console.warn('Failed to get user emails from GitHub');
      return null;
    }

    const emails: Array<{
      email: string;
      primary: boolean;
      verified: boolean;
      visibility: string | null;
    }> = await response.json();

    // 查找主要且已验证的邮箱
    const primaryEmail = emails.find(email => email.primary && email.verified);
    return primaryEmail?.email || null;
  } catch (error) {
    console.error('Error getting GitHub user email:', error);
    return null;
  }
}

/**
 * 验证GitHub访问令牌是否有效
 */
export async function validateGitHubToken(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'crawler-leetcode-app',
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Error validating GitHub token:', error);
    return false;
  }
}
