import axiosClient from '@api/axiosClient';

export const searchService = {
    getStatus: async () => {
        const response = await axiosClient.get('/admin/search/status');
        return response.data;
    },

    listIndexes: async () => {
        const response = await axiosClient.get('/admin/search/indexes');
        return response.data;
    },

    reindexAll: async () => {
        const response = await axiosClient.post('/admin/search/reindex-all');
        return response.data;
    },

    reindexByType: async (type: 'companies' | 'products' | 'services') => {
        const response = await axiosClient.post(`/admin/search/reindex/${type}`);
        return response.data;
    },

    flushByType: async (type: 'companies' | 'products' | 'services') => {
        const response = await axiosClient.post(`/admin/search/flush/${type}`);
        return response.data;
    },
};
