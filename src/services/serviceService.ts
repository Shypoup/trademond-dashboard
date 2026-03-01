import apiClient from './api';
import { Service, ApiResponse } from '../types/api';

export const serviceService = {
  getServices: async (params?: any) => {
    const response = await apiClient.get<ApiResponse<Service>>('/service', { params });
    return response.data;
  },

  getService: async (id: string | number) => {
    const response = await apiClient.get<Service>(`/service/${id}`);
    return response.data;
  },

  getUserServices: async (companyId: string | number, params?: any) => {
    const response = await apiClient.get<ApiResponse<Service>>(`/me/companies/${companyId}/services`, { params });
    return response.data;
  },

  createService: async (data: any) => {
    const response = await apiClient.post('/service', data);
    return response.data;
  },

  updateService: async (id: string | number, data: any) => {
    const response = await apiClient.put(`/service/${id}`, data);
    return response.data;
  },

  updateServiceStatus: async (id: string | number, status: string) => {
    const response = await apiClient.patch(`/service/${id}/published`, { status });
    return response.data;
  },

  deleteService: async (id: string | number) => {
    const response = await apiClient.delete(`/service/${id}`);
    return response.data;
  }
};
