import apiClient from './api';
import { Media, Follow, Like, ApiResponse } from '../types/api';

export const systemService = {
    // Settings
    getSponsorshipsSettings: async () => { const r = await apiClient.get('/admin/settings/sponsorships'); return r.data; },
    toggleSponsorships: async () => { const r = await apiClient.post('/admin/settings/sponsorships/toggle'); return r.data; },

    // Search
    getSearchStatus: async () => { const r = await apiClient.get('/admin/search/status'); return r.data; },
    getSearchIndexes: async () => { const r = await apiClient.get('/admin/search/indexes'); return r.data; },
    reindexAll: async () => { const r = await apiClient.post('/admin/search/reindex-all'); return r.data; },
    reindexByType: async (type: string) => { const r = await apiClient.post(`/admin/search/reindex/${type}`); return r.data; },
    flushByType: async (type: string) => { const r = await apiClient.post(`/admin/search/flush/${type}`); return r.data; },

    // Media
    getMedia: async (params?: any) => { const r = await apiClient.get<ApiResponse<Media>>('/admin/media', { params }); return r.data; },
    deleteMedia: async (id: string) => { const r = await apiClient.delete(`/admin/media/${id}`); return r.data; },

    // Follows
    getFollows: async (params?: any) => { const r = await apiClient.get<ApiResponse<Follow>>('/admin/follows', { params }); return r.data; },
    deleteFollow: async (id: string) => { const r = await apiClient.delete(`/admin/follows/${id}`); return r.data; },

    // Likes
    getLikes: async (params?: any) => { const r = await apiClient.get<ApiResponse<Like>>('/admin/likes', { params }); return r.data; },
    deleteLike: async (id: string) => { const r = await apiClient.delete(`/admin/likes/${id}`); return r.data; },

    // Imports
    importIndustries: async (formData: FormData) => { const r = await apiClient.post('/imports/industries', formData); return r.data; },
    importISIC: async (formData: FormData) => { const r = await apiClient.post('/imports/isic', formData); return r.data; },
};
