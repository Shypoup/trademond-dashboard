import axiosClient from '@api/axiosClient';

/** Period query accepted by several `GET /admin/analytics/*` routes. */
export type AnalyticsPeriod = '7d' | '30d' | '90d' | '1y';

/**
 * Platform-wide analytics (`/api/v1/admin/analytics/*`).
 * Requires `analytics.view` permission per the admin API.
 */
export const analyticsService = {
  /**
   * Platform overview aggregates (companies, products, services, search stats).
   * @param period - Time window (default API: `30d`)
   */
  getOverview: async (period: AnalyticsPeriod = '30d') => {
    const response = await axiosClient.get('/admin/analytics/overview', {
      params: { period },
    });
    return response.data;
  },

  /**
   * Visit time series with device breakdown and top countries.
   */
  getVisits: async (period: AnalyticsPeriod = '30d') => {
    const response = await axiosClient.get('/admin/analytics/visits', {
      params: { period },
    });
    return response.data;
  },

  /**
   * Search volume, unique terms, zero-result count, daily trend.
   */
  getSearches: async (period: AnalyticsPeriod = '30d') => {
    const response = await axiosClient.get('/admin/analytics/searches', {
      params: { period },
    });
    return response.data;
  },

  /**
   * Top search terms with counts and average results.
   * @param period - Time window
   * @param limit - Max rows (1–100, API default often 20)
   */
  getTopSearchTerms: async (period: AnalyticsPeriod = '30d', limit = 20) => {
    const response = await axiosClient.get('/admin/analytics/top-search-terms', {
      params: { period, limit },
    });
    return response.data;
  },

  /**
   * Queries that returned zero results (gap analysis).
   */
  getZeroResultQueries: async (period: AnalyticsPeriod = '30d', limit = 20) => {
    const response = await axiosClient.get('/admin/analytics/zero-result-queries', {
      params: { period, limit },
    });
    return response.data;
  },

  /**
   * Queue health for analytics jobs (pending/failed, status).
   */
  getQueueHealth: async () => {
    const response = await axiosClient.get('/admin/analytics/queue-health');
    return response.data;
  },
};
