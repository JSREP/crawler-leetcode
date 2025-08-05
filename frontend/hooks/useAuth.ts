/**
 * 认证相关的自定义Hook
 */

import { useContext } from 'react';
import { AuthContextType } from '@/types/auth';
import { useAuth as useAuthFromProvider } from '@/components/auth/AuthProvider';

// 重新导出AuthProvider中的useAuth hook
export { useAuth } from '@/components/auth/AuthProvider';

// 额外的认证相关hooks可以在这里添加

/**
 * 检查用户是否有特定权限的Hook
 * 目前是简单实现，后续可以扩展为基于角色的权限系统
 */
export function usePermission(permission: string): boolean {
  // 暂时返回true，后续可以根据用户角色和权限进行判断
  return true;
}

/**
 * 检查用户是否为管理员的Hook
 */
export function useIsAdmin(): boolean {
  // 暂时返回false，后续可以根据用户信息判断
  return false;
}

/**
 * 获取用户GitHub信息的Hook
 */
export function useGitHubInfo() {
  const { user, isAuthenticated } = useAuthFromProvider();
  
  if (!isAuthenticated || !user) {
    return null;
  }

  return {
    username: user.username,
    avatarUrl: user.avatar_url,
    profileUrl: `https://github.com/${user.username}`,
    reposUrl: `https://github.com/${user.username}?tab=repositories`,
    publicRepos: user.public_repos,
    followers: user.followers,
    following: user.following,
  };
}
