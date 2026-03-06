import apiClient from './api';
import { Follow, ApiResponse } from '../types/api';

export const followService = {
    listFollows: async (params?: any) => {
        const response = await apiClient.get<ApiResponse<Follow>>('/admin/follows', { params });
        return response.data;
    },

    getCompanyFollowers: async (companyId: string) => {
        const response = await apiClient.get(`/admin/follows/companies/${companyId}`);
        return response.data;
    },

    getUserFollows: async (userId: string) => {
        const response = await apiClient.get(`/admin/follows/users/${userId}`);
        return response.data;
    },

    deleteFollow: async (id: string) => {
        const response = await apiClient.delete(`/admin/follows/${id}`);
        return response.data;
    },
};
