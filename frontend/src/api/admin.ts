import request from '@/utils/request';
import { getToken } from '@/utils/auth';
import type { ImportResult, PageResult, Room, User } from '@/types';

export function getRooms(params: { page?: number; size?: number; keyword?: string }) {
  return request.get<any, PageResult<Room>>('/admin/rooms', { params });
}

export function createRoom(data: Partial<Room>) {
  return request.post<any, Room>('/admin/rooms', data);
}

export function updateRoom(id: number, data: Partial<Room>) {
  return request.put<any, Room>(`/admin/rooms/${id}`, data);
}

export function deleteRoom(id: number) {
  return request.delete(`/admin/rooms/${id}`);
}

export function getUsers(params: {
  page?: number;
  size?: number;
  keyword?: string;
  role?: string;
}) {
  return request.get<any, PageResult<User>>('/admin/users', { params });
}

export function createUser(data: {
  username: string;
  password?: string;
  realName: string;
  role: string;
}) {
  return request.post('/admin/users', data);
}

export function updateUser(id: number, data: Partial<User>) {
  return request.put(`/admin/users/${id}`, data);
}

export function deleteUser(id: number) {
  return request.delete(`/admin/users/${id}`);
}

export function resetPassword(id: number) {
  return request.put(`/admin/users/${id}/reset-password`);
}

export function importUsers(file: File) {
  const form = new FormData();
  form.append('file', file);
  return request.post<any, ImportResult>('/admin/users/import', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

function downloadExcel(url: string, filename: string) {
  fetch(url, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
    .then((res) => res.blob())
    .then((blob) => {
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(objectUrl);
    });
}

export function downloadUserTemplate() {
  downloadExcel('/api/admin/users/import-template', '用户导入模板.xlsx');
}

/** @deprecated use downloadUserTemplate */
export function downloadTemplate() {
  downloadUserTemplate();
}

export function importRooms(file: File) {
  const form = new FormData();
  form.append('file', file);
  return request.post<any, ImportResult>('/admin/rooms/import', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export function downloadRoomTemplate() {
  downloadExcel('/api/admin/rooms/import-template', '会议室导入模板.xlsx');
}
