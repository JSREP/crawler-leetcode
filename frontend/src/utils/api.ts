import axios from 'axios';

const baseURL = import.meta.env.MODE === 'production'
  ? 'https://your-production-api.com/api'  // 需要替换为实际的生产环境API地址
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // 处理未授权错误
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 挑战相关API
export const challengesApi = {
  // 获取挑战列表
  getList: (params?: {
    page?: number;
    per_page?: number;
    platform?: string;
    difficulty?: number;
    tag?: string;
  }) => api.get('/challenges', { params }),

  // 获取单个挑战
  getOne: (id: number) => api.get(`/challenges/${id}`),

  // 创建挑战
  create: (data: any) => api.post('/challenges', data),

  // 更新挑战
  update: (id: number, data: any) => api.put(`/challenges/${id}`, data),

  // 删除挑战
  delete: (id: number) => api.delete(`/challenges/${id}`),
};

export default api; 