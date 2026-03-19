import axiosClient from '@api/axiosClient';
import { Entitlement, ApiResponse } from '@data-types/api';

export const entitlementService = {
    getEntitlements: async (params?: any) => { const r = await axiosClient.get<ApiResponse<Entitlement>>('/admin/entitlements', { params }); return r.data; },
    getEntitlement: async (id: string) => { const r = await axiosClient.get<Entitlement>(`/admin/entitlements/${id}`); return r.data; },
    createEntitlement: async (data: any) => { const r = await axiosClient.post('/admin/entitlements', data); return r.data; },
    updateEntitlement: async (id: string, data: any) => { const r = await axiosClient.patch(`/admin/entitlements/${id}`, data); return r.data; },
    deleteEntitlement: async (id: string) => { const r = await axiosClient.delete(`/admin/entitlements/${id}`); return r.data; }
};
