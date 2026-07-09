import axios, { AxiosError } from 'axios';
import { ApiResponse } from '@/types';
import { getToken, removeToken } from './auth';
import { message } from './message';

const request = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

request.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

request.interceptors.response.use(
  (response): any => {
    const res = response.data as ApiResponse;
    if (res.code !== 200) {
      if (res.code === 401) {
        removeToken();
        if (window.location.pathname !== '/login') {
          window.location.replace('/login');
        }
      } else {
        message.error(res.message || '请求失败');
      }
      const err = new Error(res.message || '请求失败') as Error & { code?: number; data?: unknown };
      err.code = res.code;
      err.data = res.data;
      return Promise.reject(err);
    }
    return res.data;
  },
  (error: AxiosError<ApiResponse>) => {
    const data = error.response?.data;
    const status = error.response?.status;
    if (status === 401) {
      removeToken();
      message.error(data?.message || '登录已过期');
      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    } else if (data?.message) {
      const err = new Error(data.message) as Error & { code?: number; data?: unknown };
      err.code = data.code;
      err.data = data.data;
      return Promise.reject(err);
    } else {
      message.error('网络错误');
    }
    return Promise.reject(error);
  }
);

export default request;
