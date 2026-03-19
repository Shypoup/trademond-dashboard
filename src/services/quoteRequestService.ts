import axiosClient from '@api/axiosClient';
import { QuoteRequest, ApiResponse } from '@data-types/api';

/**
 * Admin service for managing quote requests.
 * All endpoints operate under `/admin/quote-requests`.
 */
export const quoteRequestService = {
  /**
   * Fetches a paginated, filterable list of quote requests.
   * @param params - Query parameters (e.g. `per_page`, `filter[status]`, `filter[lead_status]`,
   *   `filter[company]`, `filter[requester]`, `filter[quotable_type]`, `filter[has_responses]`,
   *   `filter[is_read]`, `filter[trashed]`, `filter[created_after]`, `filter[created_before]`,
   *   `search`, `sort`).
   */
  getQuoteRequests: async (params?: Record<string, unknown>) => {
    const response = await axiosClient.get<ApiResponse<QuoteRequest>>(
      '/admin/quote-requests',
      { params },
    );
    return response.data;
  },

  /**
   * Fetches a single quote request by ID.
   * @param id - The quote request ULID.
   */
  getQuoteRequest: async (id: string) => {
    const response = await axiosClient.get<{ data: QuoteRequest }>(
      `/admin/quote-requests/${id}`,
    );
    return response.data;
  },

  /**
   * Updates a quote request (admin notes only).
   * @param id   - The quote request ULID.
   * @param data - Fields to update.
   */
  updateQuoteRequest: async (id: string, data: { admin_notes?: string }) => {
    const response = await axiosClient.patch(`/admin/quote-requests/${id}`, data);
    return response.data;
  },

  /**
   * Soft-deletes a quote request.
   * @param id - The quote request ULID.
   */
  deleteQuoteRequest: async (id: string) => {
    const response = await axiosClient.delete(`/admin/quote-requests/${id}`);
    return response.data;
  },

  /**
   * Restores a previously soft-deleted quote request.
   * @param id - The quote request ULID.
   */
  restoreQuoteRequest: async (id: string) => {
    const response = await axiosClient.post(`/admin/quote-requests/${id}/restore`);
    return response.data;
  },

  /**
   * Force-closes a quote request regardless of its current status.
   * @param id - The quote request ULID.
   */
  forceCloseQuoteRequest: async (id: string) => {
    const response = await axiosClient.post(`/admin/quote-requests/${id}/force-close`);
    return response.data;
  },

  /**
   * Permanently deletes a quote request (cannot be restored).
   * @param id - The quote request ULID.
   */
  forceDeleteQuoteRequest: async (id: string) => {
    const response = await axiosClient.delete(`/admin/quote-requests/${id}/force`);
    return response.data;
  },

  /**
   * Exports quote requests as a CSV file.
   * Accepts the same filter parameters as `getQuoteRequests`.
   * @param params - Query parameters for filtering the export.
   * @returns Blob response suitable for file download.
   */
  exportQuoteRequests: async (params?: Record<string, unknown>) => {
    const response = await axiosClient.get('/admin/quote-requests/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};
