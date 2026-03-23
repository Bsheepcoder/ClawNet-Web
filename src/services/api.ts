import axios from 'axios';

// 开发环境使用代理，生产环境使用实际地址
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const DEFAULT_TOKEN = 'clawnet-secret-token'; // 默认 Token

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加 Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('clawnet_token') || DEFAULT_TOKEN;
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token 过期，跳转到登录页
      localStorage.removeItem('clawnet_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
