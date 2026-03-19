import axiosClient from '@api/axiosClient';
import { FeatureOverride, ApiResponse } from '@data-types/api';

export const featureOverrideService = {
    getOverrides: async (params?: any) => { const r = await axiosClient.get<ApiResponse<FeatureOverride>>('/admin/feature-overrides', { params }); return r.data; },
    getOverride: async (id: string) => { const r = await axiosClient.get<FeatureOverride>(`/admin/feature-overrides/${id}`); return r.data; },
    createOverride: async (data: any) => { const r = await axiosClient.post('/admin/feature-overrides', data); return r.data; },
    updateOverride: async (id: string, data: any) => { const r = await axiosClient.patch(`/admin/feature-overrides/${id}`, data); return r.data; },
    deleteOverride: async (id: string) => { const r = await axiosClient.delete(`/admin/feature-overrides/${id}`); return r.data; }
};
