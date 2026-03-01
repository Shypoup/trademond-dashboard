import apiClient from './api';
import { Company, ApiResponse } from '../types/api';

export const companyService = {
  getCompanies: async (params?: any) => {
    const response = await apiClient.get<ApiResponse<Company>>('/company', { params });
    return response.data;
  },

  getCompany: async (id: string | number) => {
    const response = await apiClient.get<Company>(`/company/${id}`);
    return response.data;
  },

  getUserCompanies: async (params?: any) => {
    const response = await apiClient.get<ApiResponse<Company>>('/me/companies', { params });
    return response.data;
  },

  createCompany: async (data: any) => {
    const response = await apiClient.post('/company', data);
    return response.data;
  },

  updateCompany: async (id: string | number, data: any) => {
    const response = await apiClient.put(`/company/${id}`, data);
    return response.data;
  },

  updateCompanyStatus: async (id: string | number, status: string) => {
    const response = await apiClient.patch(`/company/${id}`, { status });
    return response.data;
  },

  deleteCompany: async (id: string | number) => {
    const response = await apiClient.delete(`/company/${id}`);
    return response.data;
  },

  toggleStatus: async (id: string | number) => {
    const response = await apiClient.patch(`/company/${id}/published`);
    return response.data;
  }
};
