import apiClient from './api';
import { User, ApiResponse } from '../types/api';

export const userService = {
  getUsers: async (params?: any) => {
    const response = await apiClient.get<ApiResponse<User>>('/user', { params });
    return response.data;
  },

  getUser: async (id: string | number) => {
    const response = await apiClient.get<User>(`/user/${id}`);
    return response.data;
  },

  updateUser: async (id: string | number, data: Partial<User>) => {
    const response = await apiClient.put(`/user/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string | number) => {
    const response = await apiClient.delete(`/user/${id}`);
    return response.data;
  }
};
