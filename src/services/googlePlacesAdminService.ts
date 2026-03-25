import axiosClient from '@api/axiosClient';

/** Language mode for Google Places search/import. */
export type GooglePlacesLanguage = 'en' | 'ar' | 'both';

/** Single place row in the import request body. */
export interface GooglePlacesImportPlaceRow {
  googlePlaceId: string;
  categoryId?: string | null;
  industryId?: string | null;
  notes?: string | null;
}

/**
 * Admin Google Places search, import, and usage (`/api/v1/admin/google-places/*`).
 * Throttled on search/import per API policy.
 */
export const googlePlacesAdminService = {
  /**
   * Search Google Places for businesses.
   * @param params - `query` (required), optional `region`, `city`, `language`, `page_token`
   */
  search: async (params: {
    query: string;
    region?: string;
    city?: string;
    language?: GooglePlacesLanguage;
    page_token?: string;
  }) => {
    const response = await axiosClient.get('/admin/google-places/search', { params });
    return response.data;
  },

  /**
   * Import one or more places as companies (max 20 per request).
   */
  importPlaces: async (payload: {
    language?: GooglePlacesLanguage;
    places: GooglePlacesImportPlaceRow[];
  }) => {
    const response = await axiosClient.post('/admin/google-places/import', payload);
    return response.data;
  },

  /**
   * Lists import history with pagination and filters.
   */
  listImports: async (params?: Record<string, unknown>) => {
    const response = await axiosClient.get('/admin/google-places/imports', { params });
    return response.data;
  },

  /**
   * Single import record with company and admin user.
   */
  getImport: async (importUlid: string) => {
    const response = await axiosClient.get(`/admin/google-places/imports/${importUlid}`);
    return response.data;
  },

  /**
   * Updates import status and/or notes.
   */
  updateImport: async (
    importUlid: string,
    payload: { status?: string; notes?: string | null },
  ) => {
    const response = await axiosClient.patch(`/admin/google-places/imports/${importUlid}`, payload);
    return response.data;
  },

  /**
   * API usage statistics for a date range.
   */
  getUsage: async (params?: { from?: string; to?: string }) => {
    const response = await axiosClient.get('/admin/google-places/usage', { params });
    return response.data;
  },
};
