/**
 * API工具函数
 */

import { appConfig } from '@/config/app';
import { ERROR_MESSAGES } from '@/constants';

/**
 * API响应类型
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * HTTP错误类
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public response?: Response
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * 创建API请求配置
 */
function createRequestConfig(options: RequestInit = {}): RequestInit {
  return {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };
}

/**
 * 处理API响应
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = ERROR_MESSAGES.SERVER_ERROR;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // 如果无法解析错误响应，使用默认错误消息
    }
    
    throw new ApiError(response.status, errorMessage, response);
  }

  try {
    return await response.json();
  } catch {
    throw new ApiError(response.status, '响应数据格式错误', response);
  }
}

/**
 * GET请求
 */
export async function apiGet<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const config = createRequestConfig({
    method: 'GET',
    ...options,
  });

  try {
    const response = await fetch(url, config);
    return await handleResponse<T>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, ERROR_MESSAGES.NETWORK_ERROR);
  }
}

/**
 * POST请求
 */
export async function apiPost<T>(
  url: string,
  data?: unknown,
  options: RequestInit = {}
): Promise<T> {
  const config = createRequestConfig({
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });

  try {
    const response = await fetch(url, config);
    return await handleResponse<T>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, ERROR_MESSAGES.NETWORK_ERROR);
  }
}

/**
 * PUT请求
 */
export async function apiPut<T>(
  url: string,
  data?: unknown,
  options: RequestInit = {}
): Promise<T> {
  const config = createRequestConfig({
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });

  try {
    const response = await fetch(url, config);
    return await handleResponse<T>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, ERROR_MESSAGES.NETWORK_ERROR);
  }
}

/**
 * DELETE请求
 */
export async function apiDelete<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const config = createRequestConfig({
    method: 'DELETE',
    ...options,
  });

  try {
    const response = await fetch(url, config);
    return await handleResponse<T>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, ERROR_MESSAGES.NETWORK_ERROR);
  }
}

/**
 * 构建查询字符串
 */
export function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, String(item)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  return searchParams.toString();
}
