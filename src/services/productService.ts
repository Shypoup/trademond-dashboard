import axiosClient from '@api/axiosClient';
import { Product, ApiResponse } from '@data-types/api';

export const productService = {
  /**
   * Lists products with optional query params (per_page, filters, sort, etc.).
   * @param params - Query parameters forwarded to GET /admin/products.
   */
  getProducts: async (params?: Record<string, unknown>) => {
    const response = await axiosClient.get<ApiResponse<Product>>('/admin/products', { params });
    return response.data;
  },

  /**
   * Fetches a single product by ID.
   * @param id - Product ULID.
   */
  getProduct: async (id: string) => {
    const response = await axiosClient.get<Product>(`/admin/products/${id}`);
    return response.data;
  },

  /**
   * Creates a new product.
   * @param data - Payload including company_id, category_id, name, description, tags, etc.
   */
  createProduct: async (data: Record<string, unknown>) => {
    const response = await axiosClient.post('/admin/products', data);
    return response.data;
  },

  /**
   * Partially updates an existing product.
   * @param id - Product ULID.
   * @param data - Fields to update.
   */
  updateProduct: async (id: string, data: Record<string, unknown>) => {
    const response = await axiosClient.patch(`/admin/products/${id}`, data);
    return response.data;
  },

  /**
   * Soft-deletes a product.
   * @param id - Product ULID.
   */
  deleteProduct: async (id: string) => {
    const response = await axiosClient.delete(`/admin/products/${id}`);
    return response.data;
  },

  /**
   * Restores a previously soft-deleted product.
   * @param id - Product ULID.
   */
  restoreProduct: async (id: string) => {
    const response = await axiosClient.post(`/admin/products/${id}/restore`);
    return response.data;
  },

  /**
   * Toggles the active state of a product.
   * @param id - Product ULID.
   */
  toggleActive: async (id: string) => {
    const response = await axiosClient.post(`/admin/products/${id}/toggle-active`);
    return response.data;
  },

  /**
   * Toggles the published state of a product.
   * @param id - Product ULID.
   */
  togglePublished: async (id: string) => {
    const response = await axiosClient.post(`/admin/products/${id}/toggle-published`);
    return response.data;
  },

  // ─── Product Data (extended attributes) ───────────────────

  /**
   * Fetches extended product data (price, SKU, dimensions, warranty, etc.).
   * @param id - Product ULID.
   */
  getProductData: async (id: string) => {
    const response = await axiosClient.get(`/admin/products/${id}/data`);
    return response.data;
  },

  /**
   * Creates or fully replaces the extended product data record.
   * @param id - Product ULID.
   * @param data - Full product data payload (price, currency, condition, sku, brand, origin_country, dimensions, stock, warranty, etc.).
   */
  upsertProductData: async (id: string, data: Record<string, unknown>) => {
    const response = await axiosClient.post(`/admin/products/${id}/data`, data);
    return response.data;
  },

  /**
   * Partially updates the extended product data record.
   * @param id - Product ULID.
   * @param data - Fields to update.
   */
  updateProductData: async (id: string, data: Record<string, unknown>) => {
    const response = await axiosClient.patch(`/admin/products/${id}/data`, data);
    return response.data;
  },

  /**
   * Deletes the extended product data record.
   * @param id - Product ULID.
   */
  deleteProductData: async (id: string) => {
    const response = await axiosClient.delete(`/admin/products/${id}/data`);
    return response.data;
  },
};
