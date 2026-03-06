import apiClient from './api';
import { Review, ApiResponse } from '../types/api';

export const reviewService = {
    getReviews: async (params?: any) => {
        const response = await apiClient.get<ApiResponse<Review>>('/admin/reviews', { params });
        return response.data;
    },

    getReview: async (id: string) => {
        const response = await apiClient.get<Review>(`/admin/reviews/${id}`);
        return response.data;
    },

    updateReview: async (id: string, data: any) => {
        const response = await apiClient.patch(`/admin/reviews/${id}`, data);
        return response.data;
    },

    deleteReview: async (id: string) => {
        const response = await apiClient.delete(`/admin/reviews/${id}`);
        return response.data;
    },

    restoreReview: async (id: string) => {
        const response = await apiClient.post(`/admin/reviews/${id}/restore`);
        return response.data;
    },

    publishReview: async (id: string) => {
        const response = await apiClient.post(`/admin/reviews/${id}/publish`);
        return response.data;
    },

    unpublishReview: async (id: string) => {
        const response = await apiClient.post(`/admin/reviews/${id}/unpublish`);
        return response.data;
    },

    forceDeleteReview: async (id: string) => {
        const response = await apiClient.delete(`/admin/reviews/${id}/force`);
        return response.data;
    },
};
