import apiClient from './api';
import { FeatureOverride, ApiResponse } from '../types/api';

export const featureOverrideService = {
    getOverrides: async (params?: any) => { const r = await apiClient.get<ApiResponse<FeatureOverride>>('/admin/feature-overrides', { params }); return r.data; },
    getOverride: async (id: string) => { const r = await apiClient.get<FeatureOverride>(`/admin/feature-overrides/${id}`); return r.data; },
    createOverride: async (data: any) => { const r = await apiClient.post('/admin/feature-overrides', data); return r.data; },
    updateOverride: async (id: string, data: any) => { const r = await apiClient.patch(`/admin/feature-overrides/${id}`, data); return r.data; },
    deleteOverride: async (id: string) => { const r = await apiClient.delete(`/admin/feature-overrides/${id}`); return r.data; }
};
