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

  /**
   * Uploads or replaces the service main photo (`image`, max 3 MB).
   */
  uploadServicePhoto: async (serviceId: string, image: File) => {
    const formData = new FormData();
    formData.append('image', image);
    const response = await axiosClient.post(`/admin/services/${serviceId}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Uploads gallery images (`gallery[]`, up to 5 files).
   */
  uploadServiceGallery: async (serviceId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('gallery[]', f));
    const response = await axiosClient.post(`/admin/services/${serviceId}/gallery`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Uploads PDF documents (`document[]`, up to 5 files).
   */
  uploadServiceDocuments: async (serviceId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('document[]', f));
    const response = await axiosClient.post(`/admin/services/${serviceId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
