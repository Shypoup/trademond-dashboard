import apiClient from './api';
import { TagProposal, ApiResponse } from '../types/api';

export const tagProposalService = {
    getProposals: async (params?: any) => { const r = await apiClient.get<ApiResponse<TagProposal>>('/admin/tag-proposals', { params }); return r.data; },
    getProposal: async (id: string) => { const r = await apiClient.get<TagProposal>(`/admin/tag-proposals/${id}`); return r.data; },
    getSuggestions: async (id: string) => { const r = await apiClient.get(`/admin/tag-proposals/${id}/suggestions`); return r.data; },
    accept: async (id: string) => { const r = await apiClient.post(`/admin/tag-proposals/${id}/accept`); return r.data; },
    reject: async (id: string) => { const r = await apiClient.post(`/admin/tag-proposals/${id}/reject`); return r.data; },
    merge: async (id: string, tagId: string) => { const r = await apiClient.post(`/admin/tag-proposals/${id}/merge`, { canonical_tag_id: tagId }); return r.data; }
};
