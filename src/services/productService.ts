import apiClient from './api';
import { Product, ApiResponse } from '../types/api';

export const productService = {
  getProducts: async (params?: any) => {
    const response = await apiClient.get<ApiResponse<Product>>('/product', { params });
    return response.data;
  },

  getProduct: async (id: string | number) => {
    const response = await apiClient.get<Product>(`/product/${id}`);
    return response.data;
  },

  getUserProducts: async (companyId: string | number, params?: any) => {
    const response = await apiClient.get<ApiResponse<Product>>(`/me/companies/${companyId}/products`, { params });
    return response.data;
  },

  createProduct: async (data: any) => {
    const response = await apiClient.post('/product', data);
    return response.data;
  },

  updateProduct: async (id: string | number, data: any) => {
    const response = await apiClient.put(`/product/${id}`, data);
    return response.data;
  },

  updateProductStatus: async (id: string | number, status: string) => {
    const response = await apiClient.patch(`/product/${id}/published`, { status });
    return response.data;
  },

  deleteProduct: async (id: string | number) => {
    const response = await apiClient.delete(`/product/${id}`);
    return response.data;
  }
};
