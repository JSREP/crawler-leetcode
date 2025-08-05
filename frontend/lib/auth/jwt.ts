/**
 * JWT工具函数
 */

import jwt from 'jsonwebtoken';
import { authConfig } from '@/config/auth';
import { JWTPayload } from '@/types/auth';

/**
 * 生成JWT token
 */
export function generateJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, authConfig.jwt.secret, {
    expiresIn: authConfig.jwt.expiresIn,
    algorithm: authConfig.jwt.algorithm,
  });
}

/**
 * 验证JWT token
 */
export function verifyJWT(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, authConfig.jwt.secret, {
      algorithms: [authConfig.jwt.algorithm],
    }) as JWTPayload;
    
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * 解码JWT token（不验证签名）
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('JWT decode failed:', error);
    return null;
  }
}

/**
 * 检查JWT token是否过期
 */
export function isJWTExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return true;
  }
  
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}

/**
 * 获取JWT token的剩余有效时间（秒）
 */
export function getJWTRemainingTime(token: string): number {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return 0;
  }
  
  const currentTime = Math.floor(Date.now() / 1000);
  return Math.max(0, decoded.exp - currentTime);
}
