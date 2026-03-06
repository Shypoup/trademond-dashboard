import apiClient from './api';
import { Company, ApiResponse } from '../types/api';

export const companyService = {
  getCompanies: async (params?: any) => {
    const response = await apiClient.get<ApiResponse<Company>>('/admin/companies', { params });
    return response.data;
  },

  getCompany: async (id: string) => {
    const response = await apiClient.get<Company>(`/admin/companies/${id}`);
    return response.data;
  },

  createCompany: async (data: any) => {
    const response = await apiClient.post('/admin/companies', data);
    return response.data;
  },

  updateCompany: async (id: string, data: any) => {
    const response = await apiClient.patch(`/admin/companies/${id}`, data);
    return response.data;
  },

  deleteCompany: async (id: string) => {
    const response = await apiClient.delete(`/admin/companies/${id}`);
    return response.data;
  },

  restoreCompany: async (id: string) => {
    const response = await apiClient.post(`/admin/companies/${id}/restore`);
    return response.data;
  },

  verifyCompany: async (id: string) => {
    const response = await apiClient.post(`/admin/companies/${id}/verify`);
    return response.data;
  },

  unverifyCompany: async (id: string) => {
    const response = await apiClient.post(`/admin/companies/${id}/unverify`);
    return response.data;
  },

  toggleActive: async (id: string) => {
    const response = await apiClient.post(`/admin/companies/${id}/toggle-active`);
    return response.data;
  },

  togglePublished: async (id: string) => {
    const response = await apiClient.post(`/admin/companies/${id}/toggle-published`);
    return response.data;
  },

  // Company Members
  listMembers: async (companyId: string) => {
    const response = await apiClient.get(`/admin/companies/${companyId}/members`);
    return response.data;
  },

  addMember: async (companyId: string, data: { user_id: string; role: string }) => {
    const response = await apiClient.post(`/admin/companies/${companyId}/members`, data);
    return response.data;
  },

  removeMember: async (companyId: string, userId: string) => {
    const response = await apiClient.delete(`/admin/companies/${companyId}/members/${userId}`);
    return response.data;
  },

  updateMemberRole: async (companyId: string, userId: string, data: { role: string }) => {
    const response = await apiClient.patch(`/admin/companies/${companyId}/members/${userId}`, data);
    return response.data;
  },

  // Company Sub-Resources
  listCompanyProducts: async (companyId: string) => {
    const response = await apiClient.get(`/admin/companies/${companyId}/products`);
    return response.data;
  },

  listCompanyServices: async (companyId: string) => {
    const response = await apiClient.get(`/admin/companies/${companyId}/services`);
    return response.data;
  },

  listCompanyReviews: async (companyId: string) => {
    const response = await apiClient.get(`/admin/companies/${companyId}/reviews`);
    return response.data;
  },

  getCompanySubscription: async (companyId: string) => {
    const response = await apiClient.get(`/admin/companies/${companyId}/subscription`);
    return response.data;
  },
};
