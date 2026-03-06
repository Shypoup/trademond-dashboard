import apiClient, { API_ROOT } from './api';
import { User, ApiResponse } from '../types/api';

/**
 * User Management endpoints use {{auth_url}}/user (i.e., /api/user),
 * NOT the /api/v1/admin/ prefix. We use API_ROOT accordingly.
 */
export const userService = {
  getUsers: async (params?: any) => {
    const response = await apiClient.get<ApiResponse<User>>(`${API_ROOT}/user`, { params });
    return response.data;
  },

  getUser: async (id: string) => {
    const response = await apiClient.get<User>(`${API_ROOT}/user/${id}`);
    return response.data;
  },

  createUser: async (data: any) => {
    const response = await apiClient.post(`${API_ROOT}/user`, data);
    return response.data;
  },

  updateUser: async (id: string, data: any) => {
    const response = await apiClient.put(`${API_ROOT}/user/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await apiClient.delete(`${API_ROOT}/user/${id}`);
    return response.data;
  },

  uploadUserPhoto: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiClient.post(`${API_ROOT}/user/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
