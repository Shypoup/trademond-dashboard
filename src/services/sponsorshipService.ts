import axiosClient from '@api/axiosClient';
import { Sponsorship, ApiResponse } from '@data-types/api';

export const sponsorshipService = {
    getSponsorships: async (params?: any) => {
        const response = await axiosClient.get<ApiResponse<Sponsorship>>('/admin/sponsorships', { params });
        return response.data;
    },

    getSponsorship: async (id: string) => {
        const response = await axiosClient.get<Sponsorship>(`/admin/sponsorships/${id}`);
        return response.data;
    },

    createSponsorship: async (data: any) => {
        const response = await axiosClient.post('/admin/sponsorships', data);
        return response.data;
    },

    updateSponsorship: async (id: string, data: any) => {
        const response = await axiosClient.patch(`/admin/sponsorships/${id}`, data);
        return response.data;
    },

    deleteSponsorship: async (id: string) => {
        const response = await axiosClient.delete(`/admin/sponsorships/${id}`);
        return response.data;
    },

    checkKeywordAvailability: async (keyword: string, entityType: string) => {
        const response = await axiosClient.get('/admin/sponsorships/check', {
            params: { keyword, entity_type: entityType },
        });
        return response.data;
    },

    getCompanySponsorships: async (companyId: string) => {
        const response = await axiosClient.get(`/admin/sponsorships/companies/${companyId}`);
        return response.data;
    },
};
