'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, apiClient } from '@/lib/api-client';

// 用户类型定义
export interface User {
  id: number;
  github_id: number;
  username: string;
  email?: string;
  name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  company?: string;
  blog?: string;
  public_repos: number;
  followers: number;
  following: number;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

// 认证状态类型
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  sessionToken: string | null;
}

// 认证上下文类型
interface AuthContextType extends AuthState {
  login: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  getGitHubAuthUrl: () => Promise<string>;
}

// 创建上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 本地存储键名
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  SESSION_TOKEN: 'auth_session_token',
  USER: 'auth_user',
};

// 认证提供者组件
export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    sessionToken: null,
  });

  // 从本地存储加载认证状态
  useEffect(() => {
    loadAuthFromStorage();
  }, []);

  // 从本地存储加载认证信息
  const loadAuthFromStorage = async () => {
    try {
      const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      const sessionToken = localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
      const userStr = localStorage.getItem(STORAGE_KEYS.USER);

      if (accessToken && userStr) {
        const user = JSON.parse(userStr);
        
        // 设置API客户端的认证令牌
        apiClient.setAuthToken(accessToken);
        
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
          accessToken,
          refreshToken,
          sessionToken,
        });

        // 验证令牌是否仍然有效
        try {
          await api.auth.verifyToken();
        } catch (error) {
          // 令牌无效，尝试刷新
          if (refreshToken) {
            await refreshAuth();
          } else {
            await logout();
          }
        }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Failed to load auth from storage:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // 保存认证信息到本地存储
  const saveAuthToStorage = (
    user: User,
    accessToken: string,
    refreshToken?: string,
    sessionToken?: string
  ) => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    
    if (refreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
    
    if (sessionToken) {
      localStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, sessionToken);
    }
  };

  // 清除本地存储的认证信息
  const clearAuthFromStorage = () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  };

  // 获取GitHub认证URL
  const getGitHubAuthUrl = async (): Promise<string> => {
    try {
      const response = await api.auth.getGitHubAuthUrl();
      return (response as any).auth_url;
    } catch (error) {
      throw new Error('Failed to get GitHub auth URL');
    }
  };

  // 登录
  const login = async (code: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const response = await api.auth.githubLogin(code);
      const { user, access_token, refresh_token, session_token } = response as any;
      
      // 设置API客户端的认证令牌
      apiClient.setAuthToken(access_token);
      
      // 保存到本地存储
      saveAuthToStorage(user, access_token, refresh_token, session_token);
      
      // 更新状态
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
        accessToken: access_token,
        refreshToken: refresh_token,
        sessionToken: session_token,
      });
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  // 登出
  const logout = async () => {
    try {
      // 调用后端登出API
      if (authState.sessionToken) {
        await api.auth.logout(authState.sessionToken);
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // 清除本地状态和存储
      apiClient.removeAuthToken();
      clearAuthFromStorage();
      
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        accessToken: null,
        refreshToken: null,
        sessionToken: null,
      });
    }
  };

  // 刷新认证
  const refreshAuth = async () => {
    try {
      if (!authState.refreshToken) {
        throw new Error('No refresh token available');
      }
      
      // 设置刷新令牌
      apiClient.setAuthToken(authState.refreshToken);
      
      const response = await api.auth.refreshToken();
      const { access_token } = response as any;
      
      // 设置新的访问令牌
      apiClient.setAuthToken(access_token);
      
      // 获取最新用户信息
      const userResponse = await api.auth.getCurrentUser();
      const user = (userResponse as any).user;
      
      // 保存到本地存储
      saveAuthToStorage(user, access_token, authState.refreshToken || undefined, authState.sessionToken || undefined);
      
      // 更新状态
      setAuthState(prev => ({
        ...prev,
        user,
        accessToken: access_token,
        isAuthenticated: true,
      }));
    } catch (error) {
      console.error('Failed to refresh auth:', error);
      await logout();
      throw error;
    }
  };

  // 更新用户信息
  const updateUser = async (userData: Partial<User>) => {
    try {
      const response = await api.auth.updateCurrentUser(userData);
      const updatedUser = (response as any).user;
      
      // 更新本地存储
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      
      // 更新状态
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));
    } catch (error) {
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    refreshAuth,
    updateUser,
    getGitHubAuthUrl,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// 使用认证上下文的Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
