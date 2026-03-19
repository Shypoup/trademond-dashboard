import axiosClient from '@api/axiosClient';
import { Category, ApiResponse } from '@data-types/api';

export const categoryService = {
  getCategories: async (params?: any) => {
    const response = await axiosClient.get<ApiResponse<Category>>('/categories', { params });
    return response.data;
  },

  getCategory: async (id: string | number) => {
    const response = await axiosClient.get<Category>(`/category/${id}`);
    return response.data;
  },

  createCategory: async (data: any) => {
    const response = await axiosClient.post('/category', data);
    return response.data;
  },

  updateCategory: async (id: string | number, data: any) => {
    const response = await axiosClient.put(`/category/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string | number) => {
    const response = await axiosClient.delete(`/category/${id}`);
    return response.data;
  }
};
