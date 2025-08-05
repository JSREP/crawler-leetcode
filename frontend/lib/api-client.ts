/**
 * Flask后端API客户端
 */

// API配置 - 后端端口：57523 - 禁止修改
const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:57523',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// 错误类型
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// 请求拦截器类型
interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string>;
}

// API客户端类
class APIClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.defaultHeaders = { ...API_CONFIG.headers };
  }

  // 设置认证令牌
  setAuthToken(token: string) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // 移除认证令牌
  removeAuthToken() {
    delete this.defaultHeaders['Authorization'];
  }

  // 构建URL
  private buildURL(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(endpoint, this.baseURL);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    return url.toString();
  }

  // 通用请求方法
  private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      params,
    } = config;

    const url = this.buildURL(endpoint, params);
    const requestHeaders = { ...this.defaultHeaders, ...headers };

    // 处理请求体
    let requestBody: string | FormData | undefined;
    if (body) {
      if (body instanceof FormData) {
        requestBody = body;
        // FormData会自动设置Content-Type，删除手动设置的
        delete requestHeaders['Content-Type'];
      } else {
        requestBody = JSON.stringify(body);
      }
    }

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: requestBody,
      });

      // 处理响应
      const contentType = response.headers.get('content-type');
      let data: any;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new APIError(
          data?.error || data?.message || `HTTP ${response.status}`,
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      
      // 网络错误或其他错误
      throw new APIError(
        error instanceof Error ? error.message : 'Network error',
        0
      );
    }
  }

  // GET请求
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  // POST请求
  async post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  // PUT请求
  async put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  // DELETE请求
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // 文件上传
  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    return this.request<T>(endpoint, { 
      method: 'POST', 
      body: formData 
    });
  }
}

// 创建API客户端实例
export const apiClient = new APIClient();

// 便捷的API方法
export const api = {
  // 数据库API
  db: {
    test: () => apiClient.get('/api/db/test'),
    getChallenges: (params?: Record<string, string>) => 
      apiClient.get('/api/db/challenges', params),
    getChallenge: (alias: string) => 
      apiClient.get(`/api/db/challenges/${alias}`),
    createChallenge: (data: any) => 
      apiClient.post('/api/db/challenges', data),
    updateChallenge: (id: number, data: any) => 
      apiClient.put(`/api/db/challenges/${id}`, data),
    deleteChallenge: (id: number) => 
      apiClient.delete(`/api/db/challenges/${id}`),
    getStats: () => apiClient.get('/api/db/stats'),
  },

  // 认证API
  auth: {
    getGitHubAuthUrl: () => apiClient.get('/auth/github/url'),
    githubLogin: (code: string) => 
      apiClient.post('/auth/github', { code }),
    refreshToken: () => apiClient.post('/auth/refresh'),
    logout: (sessionToken?: string) => 
      apiClient.post('/auth/logout', { session_token: sessionToken }),
    getCurrentUser: () => apiClient.get('/auth/me'),
    updateCurrentUser: (data: any) => 
      apiClient.put('/auth/me', data),
    getSessions: () => apiClient.get('/auth/sessions'),
    deleteSession: (sessionId: number) => 
      apiClient.delete(`/auth/sessions/${sessionId}`),
    verifyToken: () => apiClient.post('/auth/verify'),
  },

  // 存储API
  storage: {
    upload: (formData: FormData) => 
      apiClient.upload('/storage/upload', formData),
    uploadAvatar: (formData: FormData) => 
      apiClient.upload('/storage/upload/avatar', formData),
    getQuota: () => apiClient.get('/storage/quota'),
    getFiles: (params?: Record<string, string>) => 
      apiClient.get('/storage/files', params),
    deleteFile: (fileId: number) => 
      apiClient.delete(`/storage/files/${fileId}`),
    getFileInfo: (fileId: number) => 
      apiClient.get(`/storage/files/${fileId}/info`),
    cleanup: () => apiClient.post('/storage/cleanup'),
    getStats: () => apiClient.get('/storage/quota/stats'),
    getPricing: () => apiClient.get('/storage/quota/pricing'),
    purchaseStorage: (data: any) => 
      apiClient.post('/storage/quota/purchase', data),
  },

  // 论坛API
  forum: {
    getPosts: (params?: Record<string, string>) => 
      apiClient.get('/api/forum/posts', params),
    createPost: (data: any) => 
      apiClient.post('/api/forum/posts', data),
    getPost: (postId: number) => 
      apiClient.get(`/api/forum/posts/${postId}`),
    updatePost: (postId: number, data: any) => 
      apiClient.put(`/api/forum/posts/${postId}`, data),
    deletePost: (postId: number) => 
      apiClient.delete(`/api/forum/posts/${postId}`),
    getReplies: (postId: number, params?: Record<string, string>) => 
      apiClient.get(`/api/forum/posts/${postId}/replies`, params),
    createReply: (postId: number, data: any) => 
      apiClient.post(`/api/forum/posts/${postId}/replies`, data),
  },

  // 评论API
  comments: {
    getChallengeComments: (challengeId: number, params?: Record<string, string>) => 
      apiClient.get(`/api/challenges/${challengeId}/comments`, params),
    createChallengeComment: (challengeId: number, data: any) => 
      apiClient.post(`/api/challenges/${challengeId}/comments`, data),
    updateComment: (commentId: number, data: any) => 
      apiClient.put(`/api/comments/${commentId}`, data),
    deleteComment: (commentId: number) => 
      apiClient.delete(`/api/comments/${commentId}`),
    getCommentReplies: (commentId: number, params?: Record<string, string>) => 
      apiClient.get(`/api/comments/${commentId}/replies`, params),
  },

  // 钱包API
  wallet: {
    getInfo: () => apiClient.get('/api/wallet/info'),
    create: () => apiClient.post('/api/wallet/create'),
    getTransactions: (params?: Record<string, string>) => 
      apiClient.get('/api/wallet/transactions', params),
    transfer: (data: any) => 
      apiClient.post('/api/wallet/transfer', data),
    tip: (data: any) => 
      apiClient.post('/api/wallet/tip', data),
    getReceivedTips: (params?: Record<string, string>) => 
      apiClient.get('/api/wallet/tips/received', params),
  },
};

export default apiClient;
