import axiosClient from '@api/axiosClient';
import { PlatformStats } from '@data-types/api';
import { mapAdminDashboardToPlatformStats } from '@services/utils/mapAdminDashboardToPlatformStats';

/**
 * Platform overview metrics (backed by `GET /api/v1/admin/dashboard` per the admin API).
 */
export const platformService = {
  /**
   * Loads the platform-wide admin dashboard summary.
   * Uses `GET /admin/dashboard` (see Postman: Admin Dashboard).
   *
   * @returns Metrics mapped to {@link PlatformStats} for overview pages
   */
  getOverviewStats: async (): Promise<PlatformStats> => {
    const response = await axiosClient.get<unknown>('/admin/dashboard');
    return mapAdminDashboardToPlatformStats(response.data);
  },
};
