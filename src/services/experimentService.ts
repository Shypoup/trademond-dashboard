import axiosClient from '@api/axiosClient';
import { Experiment, ApiResponse } from '@data-types/api';

export const experimentService = {
    getExperiments: async (params?: any) => {
        const response = await axiosClient.get<ApiResponse<Experiment>>('/admin/experiments', { params });
        return response.data;
    },

    getExperiment: async (id: string) => {
        const response = await axiosClient.get<Experiment>(`/admin/experiments/${id}`);
        return response.data;
    },

    createExperiment: async (data: any) => {
        const response = await axiosClient.post('/admin/experiments', data);
        return response.data;
    },

    updateExperiment: async (id: string, data: any) => {
        const response = await axiosClient.patch(`/admin/experiments/${id}`, data);
        return response.data;
    },

    deleteExperiment: async (id: string) => {
        const response = await axiosClient.delete(`/admin/experiments/${id}`);
        return response.data;
    },

    toggleActive: async (id: string) => {
        const response = await axiosClient.post(`/admin/experiments/${id}/toggle-active`);
        return response.data;
    },
};
