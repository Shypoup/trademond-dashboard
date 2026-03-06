import apiClient from './api';
import { Feature, ApiResponse } from '../types/api';

export const featureService = {
    getFeatures: async (params?: any) => {
        const response = await apiClient.get<ApiResponse<Feature>>('/admin/features', { params });
        return response.data;
    },

    getFeature: async (id: string) => {
        const response = await apiClient.get<Feature>(`/admin/features/${id}`);
        return response.data;
    },

    createFeature: async (data: any) => {
        const response = await apiClient.post('/admin/features', data);
        return response.data;
    },

    updateFeature: async (id: string, data: any) => {
        const response = await apiClient.patch(`/admin/features/${id}`, data);
        return response.data;
    },

    deleteFeature: async (id: string) => {
        const response = await apiClient.delete(`/admin/features/${id}`);
        return response.data;
    },
};
