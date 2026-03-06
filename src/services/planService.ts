import apiClient from './api';
import { Plan, PlanFeature, ApiResponse } from '../types/api';

export const planService = {
    getPlans: async (params?: any) => {
        const response = await apiClient.get<ApiResponse<Plan>>('/admin/plans', { params });
        return response.data;
    },

    getPlan: async (id: string) => {
        const response = await apiClient.get<Plan>(`/admin/plans/${id}`);
        return response.data;
    },

    createPlan: async (data: any) => {
        const response = await apiClient.post('/admin/plans', data);
        return response.data;
    },

    updatePlan: async (id: string, data: any) => {
        const response = await apiClient.patch(`/admin/plans/${id}`, data);
        return response.data;
    },

    deletePlan: async (id: string) => {
        const response = await apiClient.delete(`/admin/plans/${id}`);
        return response.data;
    },

    restorePlan: async (id: string) => {
        const response = await apiClient.post(`/admin/plans/${id}/restore`);
        return response.data;
    },

    setDefault: async (id: string) => {
        const response = await apiClient.post(`/admin/plans/${id}/set-default`);
        return response.data;
    },

    syncFeatures: async (id: string, features: PlanFeature[]) => {
        const response = await apiClient.put(`/admin/plans/${id}/features`, { features });
        return response.data;
    },
};
