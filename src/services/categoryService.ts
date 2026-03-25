import axiosClient from '@api/axiosClient';
import { Category, ApiResponse } from '@data-types/api';

/**
 * Admin CRUD for categories (`/api/v1/admin/categories`).
 * Each category belongs to an industry; list filters match the admin Postman collection.
 */
export const categoryService = {
  /**
   * @param params - Query params e.g. `per_page`, `filter[active]`, `filter[industry_id]`, `filter[search]`, `sort`
   */
  getCategories: async (params?: Record<string, unknown>) => {
    const response = await axiosClient.get<ApiResponse<Category>>('/admin/categories', { params });
    return response.data;
  },

  getCategory: async (id: string) => {
    const response = await axiosClient.get<Category>(`/admin/categories/${id}`);
    return response.data;
  },

  createCategory: async (data: Record<string, unknown>) => {
    const response = await axiosClient.post('/admin/categories', data);
    return response.data;
  },

  updateCategory: async (id: string, data: Record<string, unknown>) => {
    const response = await axiosClient.patch(`/admin/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string) => {
    const response = await axiosClient.delete(`/admin/categories/${id}`);
    return response.data;
  },
};
