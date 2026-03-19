import axiosClient from '@api/axiosClient';
import { Feature, ApiResponse } from '@data-types/api';

export const featureService = {
    getFeatures: async (params?: any) => {
        const response = await axiosClient.get<ApiResponse<Feature>>('/admin/features', { params });
        return response.data;
    },

    getFeature: async (id: string) => {
        const response = await axiosClient.get<Feature>(`/admin/features/${id}`);
        return response.data;
    },

    createFeature: async (data: any) => {
        const response = await axiosClient.post('/admin/features', data);
        return response.data;
    },

    updateFeature: async (id: string, data: any) => {
        const response = await axiosClient.patch(`/admin/features/${id}`, data);
        return response.data;
    },

    deleteFeature: async (id: string) => {
        const response = await axiosClient.delete(`/admin/features/${id}`);
        return response.data;
    },
};
