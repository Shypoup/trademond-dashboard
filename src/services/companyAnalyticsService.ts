import axiosClient from '@api/axiosClient';
import type { AnalyticsPeriod } from '@services/analyticsService';

/**
 * Per-company analytics for admin staff (`/api/v1/admin/companies/:companyUlid/analytics/*`).
 * Requires `analytics.view` permission.
 */
export const companyAnalyticsService = {
  /**
   * Overview for a single company (owner metadata, item counts).
   * @param companyUlid - Company ULID
   */
  getOverview: async (companyUlid: string) => {
    const response = await axiosClient.get(`/admin/companies/${companyUlid}/analytics/overview`);
    return response.data;
  },

  /**
   * Visit time series for a company.
   */
  getVisits: async (companyUlid: string, period: AnalyticsPeriod = '30d') => {
    const response = await axiosClient.get(`/admin/companies/${companyUlid}/analytics/visits`, {
      params: { period },
    });
    return response.data;
  },

  /**
   * Per-product analytics rows for the company.
   */
  getProducts: async (companyUlid: string) => {
    const response = await axiosClient.get(`/admin/companies/${companyUlid}/analytics/products`);
    return response.data;
  },

  /**
   * Per-service analytics rows for the company.
   */
  getServices: async (companyUlid: string) => {
    const response = await axiosClient.get(`/admin/companies/${companyUlid}/analytics/services`);
    return response.data;
  },

  /**
   * Top search terms that surfaced this company.
   * @param limit - Max rows (1–100)
   */
  getSearchTerms: async (
    companyUlid: string,
    period: AnalyticsPeriod = '30d',
    limit = 20,
  ) => {
    const response = await axiosClient.get(
      `/admin/companies/${companyUlid}/analytics/search-terms`,
      { params: { period, limit } },
    );
    return response.data;
  },
};
