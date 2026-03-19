import axiosClient from '@api/axiosClient';
import { QuoteResponse } from '@data-types/api';

/**
 * Admin service for managing quote responses.
 * All endpoints operate under `/admin/quote-responses`.
 */
export const quoteResponseService = {
  /**
   * Fetches a single quote response by ID.
   * @param id - The quote response ULID.
   */
  getQuoteResponse: async (id: string) => {
    const response = await axiosClient.get<{ data: QuoteResponse }>(
      `/admin/quote-responses/${id}`,
    );
    return response.data;
  },

  /**
   * Updates a quote response (admin notes only).
   * @param id   - The quote response ULID.
   * @param data - Fields to update.
   */
  updateQuoteResponse: async (id: string, data: { admin_notes?: string }) => {
    const response = await axiosClient.patch(`/admin/quote-responses/${id}`, data);
    return response.data;
  },

  /**
   * Soft-deletes a quote response.
   * @param id - The quote response ULID.
   */
  deleteQuoteResponse: async (id: string) => {
    const response = await axiosClient.delete(`/admin/quote-responses/${id}`);
    return response.data;
  },

  /**
   * Restores a previously soft-deleted quote response.
   * @param id - The quote response ULID.
   */
  restoreQuoteResponse: async (id: string) => {
    const response = await axiosClient.post(`/admin/quote-responses/${id}/restore`);
    return response.data;
  },

  /**
   * Permanently deletes a quote response (cannot be restored).
   * @param id - The quote response ULID.
   */
  forceDeleteQuoteResponse: async (id: string) => {
    const response = await axiosClient.delete(`/admin/quote-responses/${id}/force`);
    return response.data;
  },
};
