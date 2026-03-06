import apiClient from './api';
import { Service, ApiResponse } from '../types/api';

export const serviceService = {
  getServices: async (params?: any) => {
    const response = await apiClient.get<ApiResponse<Service>>('/admin/services', { params });
    return response.data;
  },

  getService: async (id: string) => {
    const response = await apiClient.get<Service>(`/admin/services/${id}`);
    return response.data;
  },

  updateService: async (id: string, data: any) => {
    const response = await apiClient.patch(`/admin/services/${id}`, data);
    return response.data;
  },

  deleteService: async (id: string) => {
    const response = await apiClient.delete(`/admin/services/${id}`);
    return response.data;
  },

  restoreService: async (id: string) => {
    const response = await apiClient.post(`/admin/services/${id}/restore`);
    return response.data;
  },

  toggleActive: async (id: string) => {
    const response = await apiClient.post(`/admin/services/${id}/toggle-active`);
    return response.data;
  },

  togglePublished: async (id: string) => {
    const response = await apiClient.post(`/admin/services/${id}/toggle-published`);
    return response.data;
  },
};
