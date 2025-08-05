/**
 * 权限检查React Hook
 */

import { useMemo } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  isAdmin,
  isUser,
  hasRole,
  hasAdminPermission,
  canAccessAdmin,
  canManageUsers,
  canManageChallenges,
  canViewSystemStats,
  canModifySystemSettings,
  getUserPermissions,
  hasPermission,
  PERMISSIONS,
  type Permission
} from '@/lib/auth/permissions';
import { UserRole } from '@/types/auth';

/**
 * 权限检查Hook
 */
export function usePermissions() {
  const { user, isAuthenticated } = useAuth();

  const permissions = useMemo(() => {
    if (!isAuthenticated || !user) {
      return {
        // 基础检查
        isAdmin: false,
        isUser: false,
        hasRole: (role: UserRole) => false,
        
        // 权限检查
        hasAdminPermission: false,
        canAccessAdmin: false,
        canManageUsers: false,
        canManageChallenges: false,
        canViewSystemStats: false,
        canModifySystemSettings: false,
        
        // 通用权限检查
        hasPermission: (permission: Permission) => false,
        getUserPermissions: () => [],
        
        // 权限列表
        permissions: [],
      };
    }

    return {
      // 基础检查
      isAdmin: isAdmin(user),
      isUser: isUser(user),
      hasRole: (role: UserRole) => hasRole(user, role),
      
      // 权限检查
      hasAdminPermission: hasAdminPermission(user),
      canAccessAdmin: canAccessAdmin(user),
      canManageUsers: canManageUsers(user),
      canManageChallenges: canManageChallenges(user),
      canViewSystemStats: canViewSystemStats(user),
      canModifySystemSettings: canModifySystemSettings(user),
      
      // 通用权限检查
      hasPermission: (permission: Permission) => hasPermission(user, permission),
      getUserPermissions: () => getUserPermissions(user),
      
      // 权限列表
      permissions: getUserPermissions(user),
    };
  }, [user, isAuthenticated]);

  return permissions;
}

/**
 * 权限守卫Hook - 用于条件渲染
 */
export function usePermissionGuard(permission: Permission) {
  const { hasPermission } = usePermissions();
  return hasPermission(permission);
}

/**
 * 管理员权限Hook
 */
export function useAdminPermission() {
  const { hasAdminPermission } = usePermissions();
  return hasAdminPermission;
}

/**
 * 角色检查Hook
 */
export function useRoleCheck(role: UserRole) {
  const { hasRole } = usePermissions();
  return hasRole(role);
}
