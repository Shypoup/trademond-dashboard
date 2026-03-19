import axiosClient from '@api/axiosClient';
import { Follow, ApiResponse } from '@data-types/api';

export const followService = {
    listFollows: async (params?: any) => {
        const response = await axiosClient.get<ApiResponse<Follow>>('/admin/follows', { params });
        return response.data;
    },

    getCompanyFollowers: async (companyId: string) => {
        const response = await axiosClient.get(`/admin/follows/companies/${companyId}`);
        return response.data;
    },

    getUserFollows: async (userId: string) => {
        const response = await axiosClient.get(`/admin/follows/users/${userId}`);
        return response.data;
    },

    deleteFollow: async (id: string) => {
        const response = await axiosClient.delete(`/admin/follows/${id}`);
        return response.data;
    },
};
