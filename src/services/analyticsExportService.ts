import axiosClient from '@api/axiosClient';

/** Export format for analytics bulk downloads. */
export type AnalyticsExportFormat = 'csv' | 'json';

/** Entity filter for visit exports. */
export type AnalyticsVisitEntityType = 'company' | 'product' | 'service' | 'all';

/** Body for `POST /admin/analytics/export/visits`. */
export interface ExportVisitsPayload {
  format: AnalyticsExportFormat;
  date_from: string;
  date_to: string;
  entity_type: AnalyticsVisitEntityType;
}

/** Body for `POST /admin/analytics/export/searches`. */
export interface ExportSearchesPayload {
  format: AnalyticsExportFormat;
  date_from: string;
  date_to: string;
}

/**
 * Async analytics exports (`/api/v1/admin/analytics/export/*`).
 * Requires `analytics.export` permission. Responses often return `202` with a `pollUrl` / export id.
 */
export const analyticsExportService = {
  /**
   * Starts a visit data export job.
   */
  exportVisits: async (payload: ExportVisitsPayload) => {
    const response = await axiosClient.post('/admin/analytics/export/visits', payload);
    return response.data;
  },

  /**
   * Starts a search data export job.
   */
  exportSearches: async (payload: ExportSearchesPayload) => {
    const response = await axiosClient.post('/admin/analytics/export/searches', payload);
    return response.data;
  },

  /**
   * Polls export job status by ULID (`processing` | `completed` | `failed`).
   * @param exportId - Export job ULID
   */
  getExportStatus: async (exportId: string) => {
    const response = await axiosClient.get(`/admin/analytics/exports/${exportId}`);
    return response.data;
  },
};
