import apiClient from './api';
import { CuratedList, ApiResponse } from '../types/api';

export const curatedListService = {
    getLists: async (params?: any) => {
        const response = await apiClient.get<ApiResponse<CuratedList>>('/admin/curated-lists', { params });
        return response.data;
    },

    getList: async (id: string) => {
        const response = await apiClient.get<CuratedList>(`/admin/curated-lists/${id}`);
        return response.data;
    },

    createList: async (data: any) => {
        const response = await apiClient.post('/admin/curated-lists', data);
        return response.data;
    },

    updateList: async (id: string, data: any) => {
        const response = await apiClient.patch(`/admin/curated-lists/${id}`, data);
        return response.data;
    },

    deleteList: async (id: string) => {
        const response = await apiClient.delete(`/admin/curated-lists/${id}`);
        return response.data;
    },

    restoreList: async (id: string) => {
        const response = await apiClient.post(`/admin/curated-lists/${id}/restore`);
        return response.data;
    },

    reorderLists: async (lists: string[]) => {
        const response = await apiClient.patch('/admin/curated-lists/reorder', { lists });
        return response.data;
    },

    setPublished: async (id: string, published: boolean) => {
        const response = await apiClient.patch(`/admin/curated-lists/${id}/published`, { published });
        return response.data;
    },

    togglePublished: async (id: string) => {
        const response = await apiClient.post(`/admin/curated-lists/${id}/published/toggle`);
        return response.data;
    },

    // List Items
    addItem: async (listId: string, data: { item_id: string; position?: number }) => {
        const response = await apiClient.post(`/admin/curated-lists/${listId}/items`, data);
        return response.data;
    },

    removeItem: async (listId: string, itemId: string) => {
        const response = await apiClient.delete(`/admin/curated-lists/${listId}/items/${itemId}`);
        return response.data;
    },

    reorderItems: async (listId: string, items: string[]) => {
        const response = await apiClient.patch(`/admin/curated-lists/${listId}/items/reorder`, { items });
        return response.data;
    },
};
