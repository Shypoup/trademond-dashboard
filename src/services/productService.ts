import apiClient from './api';
import { Product, ApiResponse } from '../types/api';

export const productService = {
  getProducts: async (params?: any) => {
    const response = await apiClient.get<ApiResponse<Product>>('/admin/products', { params });
    return response.data;
  },

  getProduct: async (id: string) => {
    const response = await apiClient.get<Product>(`/admin/products/${id}`);
    return response.data;
  },

  updateProduct: async (id: string, data: any) => {
    const response = await apiClient.patch(`/admin/products/${id}`, data);
    return response.data;
  },

  deleteProduct: async (id: string) => {
    const response = await apiClient.delete(`/admin/products/${id}`);
    return response.data;
  },

  restoreProduct: async (id: string) => {
    const response = await apiClient.post(`/admin/products/${id}/restore`);
    return response.data;
  },

  toggleActive: async (id: string) => {
    const response = await apiClient.post(`/admin/products/${id}/toggle-active`);
    return response.data;
  },

  togglePublished: async (id: string) => {
    const response = await apiClient.post(`/admin/products/${id}/toggle-published`);
    return response.data;
  },

  getProductData: async (id: string) => {
    const response = await apiClient.get(`/admin/products/${id}/data`);
    return response.data;
  },
};
