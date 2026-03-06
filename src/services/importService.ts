import apiClient, { API_ROOT } from './api';

/**
 * Import endpoints use {{auth_url}}/imports (i.e., /api/imports),
 * NOT the /api/v1/admin/ prefix. We use API_ROOT accordingly.
 */
export const importService = {
    importIndustries: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post(`${API_ROOT}/imports/industries`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    importIsicCodes: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post(`${API_ROOT}/imports/isic`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
};
