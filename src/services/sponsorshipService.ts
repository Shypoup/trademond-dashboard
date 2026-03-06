import apiClient from './api';
import { Sponsorship, ApiResponse } from '../types/api';

export const sponsorshipService = {
    getSponsorships: async (params?: any) => {
        const response = await apiClient.get<ApiResponse<Sponsorship>>('/admin/sponsorships', { params });
        return response.data;
    },

    getSponsorship: async (id: string) => {
        const response = await apiClient.get<Sponsorship>(`/admin/sponsorships/${id}`);
        return response.data;
    },

    createSponsorship: async (data: any) => {
        const response = await apiClient.post('/admin/sponsorships', data);
        return response.data;
    },

    updateSponsorship: async (id: string, data: any) => {
        const response = await apiClient.patch(`/admin/sponsorships/${id}`, data);
        return response.data;
    },

    deleteSponsorship: async (id: string) => {
        const response = await apiClient.delete(`/admin/sponsorships/${id}`);
        return response.data;
    },

    checkKeywordAvailability: async (keyword: string, entityType: string) => {
        const response = await apiClient.get('/admin/sponsorships/check', {
            params: { keyword, entity_type: entityType },
        });
        return response.data;
    },

    getCompanySponsorships: async (companyId: string) => {
        const response = await apiClient.get(`/admin/sponsorships/companies/${companyId}`);
        return response.data;
    },
};
