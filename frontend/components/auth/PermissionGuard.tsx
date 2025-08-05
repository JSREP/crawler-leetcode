/**
 * 权限守卫组件
 * 用于根据用户权限条件渲染内容
 */

import React from 'react';
import { usePermissions, usePermissionGuard, useAdminPermission } from '@/hooks/usePermissions';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';
import { Permission } from '@/lib/auth/permissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface PermissionCheckProps extends PermissionGuardProps {
  permission: Permission;
}

interface RoleCheckProps extends PermissionGuardProps {
  role: UserRole;
}

interface AdminOnlyProps extends PermissionGuardProps {}

/**
 * 基于权限的条件渲染组件
 */
export function PermissionCheck({ 
  permission, 
  children, 
  fallback = null 
}: PermissionCheckProps) {
  const hasPermission = usePermissionGuard(permission);
  
  return hasPermission ? <>{children}</> : <>{fallback}</>;
}

/**
 * 基于角色的条件渲染组件
 */
export function RoleCheck({ 
  role, 
  children, 
  fallback = null 
}: RoleCheckProps) {
  const { hasRole } = usePermissions();
  const hasRequiredRole = hasRole(role);
  
  return hasRequiredRole ? <>{children}</> : <>{fallback}</>;
}

/**
 * 仅管理员可见组件
 */
export function AdminOnly({ 
  children, 
  fallback = null 
}: AdminOnlyProps) {
  const isAdmin = useAdminPermission();
  
  return isAdmin ? <>{children}</> : <>{fallback}</>;
}

/**
 * 已认证用户可见组件
 */
export function AuthenticatedOnly({ 
  children, 
  fallback = null 
}: PermissionGuardProps) {
  const { isAuthenticated } = useAuth();
  
  return isAuthenticated ? <>{children}</> : <>{fallback}</>;
}

/**
 * 未认证用户可见组件
 */
export function GuestOnly({ 
  children, 
  fallback = null 
}: PermissionGuardProps) {
  const { isAuthenticated } = useAuth();
  
  return !isAuthenticated ? <>{children}</> : <>{fallback}</>;
}

/**
 * 多权限检查组件（需要所有权限）
 */
interface MultiPermissionCheckProps extends PermissionGuardProps {
  permissions: Permission[];
  requireAll?: boolean; // true: 需要所有权限, false: 需要任一权限
}

export function MultiPermissionCheck({ 
  permissions, 
  requireAll = true,
  children, 
  fallback = null 
}: MultiPermissionCheckProps) {
  const { hasPermission } = usePermissions();
  
  const hasRequiredPermissions = requireAll
    ? permissions.every(permission => hasPermission(permission))
    : permissions.some(permission => hasPermission(permission));
  
  return hasRequiredPermissions ? <>{children}</> : <>{fallback}</>;
}

/**
 * 权限守卫HOC
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  permission: Permission,
  fallback?: React.ComponentType<P>
) {
  return function PermissionWrappedComponent(props: P) {
    const hasPermission = usePermissionGuard(permission);
    
    if (!hasPermission) {
      return fallback ? React.createElement(fallback, props) : null;
    }
    
    return <Component {...props} />;
  };
}

/**
 * 管理员权限HOC
 */
export function withAdminPermission<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<P>
) {
  return function AdminWrappedComponent(props: P) {
    const isAdmin = useAdminPermission();
    
    if (!isAdmin) {
      return fallback ? React.createElement(fallback, props) : null;
    }
    
    return <Component {...props} />;
  };
}

// 导出所有组件
export default {
  PermissionCheck,
  RoleCheck,
  AdminOnly,
  AuthenticatedOnly,
  GuestOnly,
  MultiPermissionCheck,
  withPermission,
  withAdminPermission,
};
