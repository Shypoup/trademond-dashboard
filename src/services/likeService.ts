import apiClient from './api';
import { Like, ApiResponse } from '../types/api';

export const likeService = {
    listLikes: async (params?: any) => {
        const response = await apiClient.get<ApiResponse<Like>>('/admin/likes', { params });
        return response.data;
    },

    getProductLikes: async (productId: string) => {
        const response = await apiClient.get(`/admin/likes/products/${productId}`);
        return response.data;
    },

    getServiceLikes: async (serviceId: string) => {
        const response = await apiClient.get(`/admin/likes/services/${serviceId}`);
        return response.data;
    },

    getUserLikes: async (userId: string) => {
        const response = await apiClient.get(`/admin/likes/users/${userId}`);
        return response.data;
    },

    deleteLike: async (id: string) => {
        const response = await apiClient.delete(`/admin/likes/${id}`);
        return response.data;
    },
};
