import apiClient from './api';
import { Experiment, ApiResponse } from '../types/api';

export const experimentService = {
    getExperiments: async (params?: any) => {
        const response = await apiClient.get<ApiResponse<Experiment>>('/admin/experiments', { params });
        return response.data;
    },

    getExperiment: async (id: string) => {
        const response = await apiClient.get<Experiment>(`/admin/experiments/${id}`);
        return response.data;
    },

    createExperiment: async (data: any) => {
        const response = await apiClient.post('/admin/experiments', data);
        return response.data;
    },

    updateExperiment: async (id: string, data: any) => {
        const response = await apiClient.patch(`/admin/experiments/${id}`, data);
        return response.data;
    },

    deleteExperiment: async (id: string) => {
        const response = await apiClient.delete(`/admin/experiments/${id}`);
        return response.data;
    },

    toggleActive: async (id: string) => {
        const response = await apiClient.post(`/admin/experiments/${id}/toggle-active`);
        return response.data;
    },
};
