import axiosClient from '@api/axiosClient';
import { Subscription, ApiResponse } from '@data-types/api';

export const subscriptionService = {
    getSubscriptions: async (params?: any) => {
        const response = await axiosClient.get<ApiResponse<Subscription>>('/admin/subscriptions', { params });
        return response.data;
    },

    getSubscription: async (id: string) => {
        const response = await axiosClient.get<Subscription>(`/admin/subscriptions/${id}`);
        return response.data;
    },

    createSubscription: async (data: any) => {
        const response = await axiosClient.post('/admin/subscriptions', data);
        return response.data;
    },

    updateSubscription: async (id: string, data: any) => {
        const response = await axiosClient.patch(`/admin/subscriptions/${id}`, data);
        return response.data;
    },

    deleteSubscription: async (id: string) => {
        const response = await axiosClient.delete(`/admin/subscriptions/${id}`);
        return response.data;
    },

    cancelSubscription: async (id: string) => {
        const response = await axiosClient.post(`/admin/subscriptions/${id}/cancel`);
        return response.data;
    },

    extendSubscription: async (id: string) => {
        const response = await axiosClient.post(`/admin/subscriptions/${id}/extend`);
        return response.data;
    },

    changePlan: async (id: string, planUlid: string) => {
        const response = await axiosClient.post(`/admin/subscriptions/${id}/change-plan`, {
            plan_ulid: planUlid,
        });
        return response.data;
    },
};
