import apiClient from './api';
import { Category, ApiResponse } from '../types/api';

export const categoryService = {
  getCategories: async (params?: any) => {
    const response = await apiClient.get<ApiResponse<Category>>('/categories', { params });
    return response.data;
  },

  getCategory: async (id: string | number) => {
    const response = await apiClient.get<Category>(`/category/${id}`);
    return response.data;
  },

  createCategory: async (data: any) => {
    const response = await apiClient.post('/category', data);
    return response.data;
  },

  updateCategory: async (id: string | number, data: any) => {
    const response = await apiClient.put(`/category/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string | number) => {
    const response = await apiClient.delete(`/category/${id}`);
    return response.data;
  }
};
