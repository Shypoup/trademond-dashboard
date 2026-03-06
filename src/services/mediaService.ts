import apiClient from './api';
import { Media, ApiResponse } from '../types/api';

export const mediaService = {
    listMedia: async (params?: any) => {
        const response = await apiClient.get<ApiResponse<Media>>('/admin/media', { params });
        return response.data;
    },

    getMedia: async (id: string) => {
        const response = await apiClient.get<Media>(`/admin/media/${id}`);
        return response.data;
    },

    deleteMedia: async (id: string) => {
        const response = await apiClient.delete(`/admin/media/${id}`);
        return response.data;
    },

    getMediaByEntity: async (entityType: string, entityId: string) => {
        const response = await apiClient.get(`/admin/media/by-entity/${entityType}/${entityId}`);
        return response.data;
    },
};
