import axiosClient from '@api/axiosClient';
import { Like, ApiResponse } from '@data-types/api';

export const likeService = {
    listLikes: async (params?: any) => {
        const response = await axiosClient.get<ApiResponse<Like>>('/admin/likes', { params });
        return response.data;
    },

    getProductLikes: async (productId: string) => {
        const response = await axiosClient.get(`/admin/likes/products/${productId}`);
        return response.data;
    },

    getServiceLikes: async (serviceId: string) => {
        const response = await axiosClient.get(`/admin/likes/services/${serviceId}`);
        return response.data;
    },

    getUserLikes: async (userId: string) => {
        const response = await axiosClient.get(`/admin/likes/users/${userId}`);
        return response.data;
    },

    deleteLike: async (id: string) => {
        const response = await axiosClient.delete(`/admin/likes/${id}`);
        return response.data;
    },
};
