import axiosClient, { API_ROOT } from '@api/axiosClient';

/**
 * Import service for bulk-uploading industry and ISIC code data.
 *
 * Uses `API_ROOT` + `/imports/*` (no `/v1` segment). These routes require an admin-scoped token.
 */
export const importService = {
  /**
   * Imports industries from an uploaded spreadsheet file.
   * @param file - The file (CSV/XLSX) containing industry data.
   */
  importIndustries: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosClient.post(`${API_ROOT}/imports/industries`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Imports ISIC codes from an uploaded spreadsheet file.
   * @param file - The file (CSV/XLSX) containing ISIC code data.
   */
  importIsicCodes: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosClient.post(`${API_ROOT}/imports/isic`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
