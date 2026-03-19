import axiosClient from '@api/axiosClient';
import { Media, ApiResponse } from '@data-types/api';

export const mediaService = {
    listMedia: async (params?: any) => {
        const response = await axiosClient.get<ApiResponse<Media>>('/admin/media', { params });
        return response.data;
    },

    getMedia: async (id: string) => {
        const response = await axiosClient.get<Media>(`/admin/media/${id}`);
        return response.data;
    },

    deleteMedia: async (id: string) => {
        const response = await axiosClient.delete(`/admin/media/${id}`);
        return response.data;
    },

    getMediaByEntity: async (entityType: string, entityId: string) => {
        const response = await axiosClient.get(`/admin/media/by-entity/${entityType}/${entityId}`);
        return response.data;
    },
};
