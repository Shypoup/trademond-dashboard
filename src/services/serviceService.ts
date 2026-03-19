import axiosClient from '@api/axiosClient';
import { Service, ApiResponse } from '@data-types/api';

export const serviceService = {
  /**
   * Lists services with optional query params (per_page, filters, sort, etc.).
   * @param params - Query parameters forwarded to GET /admin/services.
   */
  getServices: async (params?: Record<string, unknown>) => {
    const response = await axiosClient.get<ApiResponse<Service>>('/admin/services', { params });
    return response.data;
  },

  /**
   * Fetches a single service by ID.
   * @param id - Service ULID.
   */
  getService: async (id: string) => {
    const response = await axiosClient.get<Service>(`/admin/services/${id}`);
    return response.data;
  },

  /**
   * Creates a new service.
   * @param data - Payload including company_id, category_id, name, description, tags, locale, searchable, active, published.
   */
  createService: async (data: Record<string, unknown>) => {
    const response = await axiosClient.post('/admin/services', data);
    return response.data;
  },

  /**
   * Partially updates an existing service.
   * @param id - Service ULID.
   * @param data - Fields to update.
   */
  updateService: async (id: string, data: Record<string, unknown>) => {
    const response = await axiosClient.patch(`/admin/services/${id}`, data);
    return response.data;
  },

  /**
   * Soft-deletes a service.
   * @param id - Service ULID.
   */
  deleteService: async (id: string) => {
    const response = await axiosClient.delete(`/admin/services/${id}`);
    return response.data;
  },

  /**
   * Restores a previously soft-deleted service.
   * @param id - Service ULID.
   */
  restoreService: async (id: string) => {
    const response = await axiosClient.post(`/admin/services/${id}/restore`);
    return response.data;
  },

  /**
   * Toggles the active state of a service.
   * @param id - Service ULID.
   */
  toggleActive: async (id: string) => {
    const response = await axiosClient.post(`/admin/services/${id}/toggle-active`);
    return response.data;
  },

  /**
   * Toggles the published state of a service.
   * @param id - Service ULID.
   */
  togglePublished: async (id: string) => {
    const response = await axiosClient.post(`/admin/services/${id}/toggle-published`);
    return response.data;
  },
};
