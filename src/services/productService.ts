import axiosClient from '@api/axiosClient';
import { Product, ApiResponse } from '@data-types/api';

export const productService = {
  getProducts: async (params?: any) => {
    const response = await axiosClient.get<ApiResponse<Product>>('/admin/products', { params });
    return response.data;
  },

  getProduct: async (id: string) => {
    const response = await axiosClient.get<Product>(`/admin/products/${id}`);
    return response.data;
  },

  /**
   * Creates a new product using the admin products endpoint.
   *
   * The payload should follow the admin API contract from the Postman collection,
   * for example including fields such as:
   * - company_id: ULID of the owning company
   * - category_id: ULID/ID of the category
   * - name: { en: string; ar?: string }
   * - description?: { en?: string; ar?: string }
   * - tags?: string[]
   * - locale?: string
   * - searchable?: boolean
   * - active?: boolean
   * - published?: boolean
   */
  createProduct: async (data: any) => {
    const response = await axiosClient.post('/admin/products', data);
    return response.data;
  },

  updateProduct: async (id: string, data: any) => {
    const response = await axiosClient.patch(`/admin/products/${id}`, data);
    return response.data;
  },

  deleteProduct: async (id: string) => {
    const response = await axiosClient.delete(`/admin/products/${id}`);
    return response.data;
  },

  restoreProduct: async (id: string) => {
    const response = await axiosClient.post(`/admin/products/${id}/restore`);
    return response.data;
  },

  toggleActive: async (id: string) => {
    const response = await axiosClient.post(`/admin/products/${id}/toggle-active`);
    return response.data;
  },

  togglePublished: async (id: string) => {
    const response = await axiosClient.post(`/admin/products/${id}/toggle-published`);
    return response.data;
  },

  getProductData: async (id: string) => {
    const response = await axiosClient.get(`/admin/products/${id}/data`);
    return response.data;
  },
};
