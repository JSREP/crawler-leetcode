/**
 * 认证中间件
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT } from './jwt';
// import { findUserById, findSessionByToken } from './database'; // 前端不使用数据库
import { authConfig } from '@/config/auth';
import { User, JWTPayload, AUTH_ERROR_CODES } from '@/types/auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: User;
  session?: JWTPayload;
}

/**
 * 从请求中获取认证token
 */
export function getAuthToken(request: NextRequest): string | null {
  // 首先尝试从cookie中获取
  const cookieStore = cookies();
  const tokenFromCookie = cookieStore.get(authConfig.session.cookieName)?.value;
  
  if (tokenFromCookie) {
    return tokenFromCookie;
  }

  // 然后尝试从Authorization header中获取
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

/**
 * 验证用户认证状态
 */
export async function authenticateUser(request: NextRequest): Promise<{
  user: User | null;
  session: JWTPayload | null;
  error: string | null;
}> {
  try {
    const token = getAuthToken(request);
    
    if (!token) {
      return { user: null, session: null, error: 'No authentication token provided' };
    }

    // 验证JWT token
    const session = verifyJWT(token);
    if (!session) {
      return { user: null, session: null, error: 'Invalid authentication token' };
    }

    // 验证会话是否存在且未过期
    // const userSession = await findSessionByToken(session.sessionToken);
    // if (!userSession) {
    //   return { user: null, session: null, error: 'Session not found or expired' };
    // }

    // 获取用户信息
    // const user = await findUserById(session.userId);
    // if (!user) {
    //   return { user: null, session: null, error: 'User not found' };
    // }

    // 前端不直接访问数据库，返回session中的用户信息
    return { user: session as any, session, error: null };
  } catch (error) {
    console.error('Authentication error:', error);
    return { user: null, session: null, error: 'Authentication failed' };
  }
}

/**
 * 认证中间件 - 要求用户必须登录
 */
export async function requireAuth(
  request: NextRequest,
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const { user, session, error } = await authenticateUser(request);

  if (!user || !session) {
    return NextResponse.json(
      { 
        error: 'Authentication required',
        code: AUTH_ERROR_CODES.UNAUTHORIZED,
        message: error || 'Please log in to access this resource'
      },
      { status: 401 }
    );
  }

  // 将用户信息添加到请求对象
  const authenticatedRequest = request as AuthenticatedRequest;
  authenticatedRequest.user = user;
  authenticatedRequest.session = session;

  return handler(authenticatedRequest);
}

/**
 * 可选认证中间件 - 用户可以登录也可以不登录
 */
export async function optionalAuth(
  request: NextRequest,
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const { user, session } = await authenticateUser(request);

  // 将用户信息添加到请求对象（可能为null）
  const authenticatedRequest = request as AuthenticatedRequest;
  authenticatedRequest.user = user || undefined;
  authenticatedRequest.session = session || undefined;

  return handler(authenticatedRequest);
}

/**
 * 设置认证cookie
 */
export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(authConfig.session.cookieName, token, {
    ...authConfig.session.cookieOptions,
    maxAge: authConfig.session.maxAge,
  });
}

/**
 * 清除认证cookie
 */
export function clearAuthCookie(response: NextResponse): void {
  response.cookies.delete(authConfig.session.cookieName);
}

/**
 * 创建认证错误响应
 */
export function createAuthErrorResponse(
  code: string,
  message: string,
  status: number = 401
): NextResponse {
  return NextResponse.json(
    {
      error: 'Authentication error',
      code,
      message,
    },
    { status }
  );
}

/**
 * 简化的认证验证函数 - 用于API路由
 */
export async function verifyAuth(request: NextRequest): Promise<{
  success: boolean;
  user?: User;
  error?: string;
}> {
  const { user, error } = await authenticateUser(request);

  return {
    success: !!user,
    user: user || undefined,
    error: error || undefined
  };
}
