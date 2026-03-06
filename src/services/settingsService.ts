import apiClient from './api';

export const settingsService = {
    getSponsorshipsStatus: async () => {
        const response = await apiClient.get('/admin/settings/sponsorships');
        return response.data;
    },

    enableSponsorships: async () => {
        const response = await apiClient.post('/admin/settings/sponsorships/enable');
        return response.data;
    },

    disableSponsorships: async () => {
        const response = await apiClient.post('/admin/settings/sponsorships/disable');
        return response.data;
    },

    toggleSponsorships: async () => {
        const response = await apiClient.post('/admin/settings/sponsorships/toggle');
        return response.data;
    },
};
