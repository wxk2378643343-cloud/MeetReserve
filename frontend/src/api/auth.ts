import request from '@/utils/request';
import type { User } from '@/types';

export interface LoginResult {
  token: string;
  user: User;
}

export function login(data: { username: string; password: string }) {
  return request.post<any, LoginResult>('/auth/login', data);
}

export function getMe() {
  return request.get<any, User>('/auth/me');
}
