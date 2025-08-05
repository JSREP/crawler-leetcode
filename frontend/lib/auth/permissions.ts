/**
 * 用户角色权限检查工具
 */

import { User, UserRole, USER_ROLES } from '@/types/auth';

/**
 * 检查用户是否为管理员
 */
export function isAdmin(user: User | null): boolean {
  return user?.role === USER_ROLES.ADMIN;
}

/**
 * 检查用户是否为普通用户
 */
export function isUser(user: User | null): boolean {
  return user?.role === USER_ROLES.USER;
}

/**
 * 检查用户是否有指定角色
 */
export function hasRole(user: User | null, role: UserRole): boolean {
  return user?.role === role;
}

/**
 * 检查用户是否有管理员权限
 */
export function hasAdminPermission(user: User | null): boolean {
  return isAdmin(user);
}

/**
 * 检查用户是否可以访问管理功能
 */
export function canAccessAdmin(user: User | null): boolean {
  return hasAdminPermission(user);
}

/**
 * 检查用户是否可以管理其他用户
 */
export function canManageUsers(user: User | null): boolean {
  return hasAdminPermission(user);
}

/**
 * 检查用户是否可以管理挑战题目
 */
export function canManageChallenges(user: User | null): boolean {
  return hasAdminPermission(user);
}

/**
 * 检查用户是否可以查看系统统计
 */
export function canViewSystemStats(user: User | null): boolean {
  return hasAdminPermission(user);
}

/**
 * 检查用户是否可以修改系统设置
 */
export function canModifySystemSettings(user: User | null): boolean {
  return hasAdminPermission(user);
}

/**
 * 权限检查装饰器（用于API路由）
 */
export function requireAdmin() {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args: any[]) {
      // 这里应该从请求中获取用户信息
      // 实际实现时需要结合具体的认证中间件
      const user = (this as any).user; // 假设用户信息已经注入到this中
      
      if (!hasAdminPermission(user)) {
        throw new Error('Access denied: Admin permission required');
      }
      
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}

/**
 * 权限检查中间件辅助函数
 */
export function checkPermission(user: User | null, permission: string): boolean {
  switch (permission) {
    case 'admin':
      return hasAdminPermission(user);
    case 'manage_users':
      return canManageUsers(user);
    case 'manage_challenges':
      return canManageChallenges(user);
    case 'view_stats':
      return canViewSystemStats(user);
    case 'modify_settings':
      return canModifySystemSettings(user);
    default:
      return false;
  }
}

/**
 * 获取用户权限列表
 */
export function getUserPermissions(user: User | null): string[] {
  const permissions: string[] = [];
  
  if (!user) {
    return permissions;
  }
  
  // 基础权限（所有用户都有）
  permissions.push('view_challenges', 'submit_solutions', 'view_profile');
  
  // 管理员权限
  if (hasAdminPermission(user)) {
    permissions.push(
      'admin',
      'manage_users',
      'manage_challenges',
      'view_stats',
      'modify_settings',
      'access_admin_panel'
    );
  }
  
  return permissions;
}

/**
 * 检查用户是否有特定权限
 */
export function hasPermission(user: User | null, permission: string): boolean {
  const userPermissions = getUserPermissions(user);
  return userPermissions.includes(permission);
}

/**
 * 权限常量定义
 */
export const PERMISSIONS = {
  // 基础权限
  VIEW_CHALLENGES: 'view_challenges',
  SUBMIT_SOLUTIONS: 'submit_solutions',
  VIEW_PROFILE: 'view_profile',
  
  // 管理员权限
  ADMIN: 'admin',
  MANAGE_USERS: 'manage_users',
  MANAGE_CHALLENGES: 'manage_challenges',
  VIEW_STATS: 'view_stats',
  MODIFY_SETTINGS: 'modify_settings',
  ACCESS_ADMIN_PANEL: 'access_admin_panel',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
