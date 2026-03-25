import axiosClient from '@api/axiosClient';

/** Language for Places autocomplete/details. */
export type PlacesLanguage = 'en' | 'ar';

/**
 * Google Places autocomplete / details proxy (`/api/v1/admin/places/*`).
 * Used for address selection in admin flows; throttled per API.
 */
export const placesProxyService = {
  /**
   * Address autocomplete predictions.
   * @param input - Search string (min 3, max 200 chars)
   * @param sessionToken - UUID grouping autocomplete + details for billing
   * @param language - `en` or `ar`
   */
  autocomplete: async (input: string, sessionToken: string, language: PlacesLanguage = 'en') => {
    const response = await axiosClient.get('/admin/places/autocomplete', {
      params: { input, session_token: sessionToken, language },
    });
    return response.data;
  },

  /**
   * Full place details for a Google Place ID.
   * @param placeId - Google Place ID (URL-encoded automatically)
   */
  getDetails: async (placeId: string) => {
    const encoded = encodeURIComponent(placeId);
    const response = await axiosClient.get(`/admin/places/${encoded}/details`);
    return response.data;
  },
};
