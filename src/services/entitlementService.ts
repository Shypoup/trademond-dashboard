import apiClient from './api';
import { Entitlement, ApiResponse } from '../types/api';

export const entitlementService = {
    getEntitlements: async (params?: any) => { const r = await apiClient.get<ApiResponse<Entitlement>>('/admin/entitlements', { params }); return r.data; },
    getEntitlement: async (id: string) => { const r = await apiClient.get<Entitlement>(`/admin/entitlements/${id}`); return r.data; },
    createEntitlement: async (data: any) => { const r = await apiClient.post('/admin/entitlements', data); return r.data; },
    updateEntitlement: async (id: string, data: any) => { const r = await apiClient.patch(`/admin/entitlements/${id}`, data); return r.data; },
    deleteEntitlement: async (id: string) => { const r = await apiClient.delete(`/admin/entitlements/${id}`); return r.data; }
};
