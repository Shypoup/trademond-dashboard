import axiosClient from '@api/axiosClient';
import { Service, ApiResponse } from '@data-types/api';

export const serviceService = {
  getServices: async (params?: any) => {
    const response = await axiosClient.get<ApiResponse<Service>>('/admin/services', { params });
    return response.data;
  },

  getService: async (id: string) => {
    const response = await axiosClient.get<Service>(`/admin/services/${id}`);
    return response.data;
  },

  updateService: async (id: string, data: any) => {
    const response = await axiosClient.patch(`/admin/services/${id}`, data);
    return response.data;
  },

  deleteService: async (id: string) => {
    const response = await axiosClient.delete(`/admin/services/${id}`);
    return response.data;
  },

  restoreService: async (id: string) => {
    const response = await axiosClient.post(`/admin/services/${id}/restore`);
    return response.data;
  },

  toggleActive: async (id: string) => {
    const response = await axiosClient.post(`/admin/services/${id}/toggle-active`);
    return response.data;
  },

  togglePublished: async (id: string) => {
    const response = await axiosClient.post(`/admin/services/${id}/toggle-published`);
    return response.data;
  },
};
