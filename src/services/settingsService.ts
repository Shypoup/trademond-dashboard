import axiosClient from '@api/axiosClient';

/**
 * Admin service for managing platform-wide settings.
 * All endpoints operate under `/admin/settings`.
 */
export const settingsService = {
  /**
   * Fetches the current sponsorship feature status.
   */
  getSponsorshipsStatus: async () => {
    const response = await axiosClient.get('/admin/settings/sponsorships');
    return response.data;
  },

  /**
   * Enables the sponsorship feature platform-wide.
   */
  enableSponsorships: async () => {
    const response = await axiosClient.post('/admin/settings/sponsorships/enable');
    return response.data;
  },

  /**
   * Disables the sponsorship feature platform-wide.
   */
  disableSponsorships: async () => {
    const response = await axiosClient.post('/admin/settings/sponsorships/disable');
    return response.data;
  },

  /**
   * Toggles the sponsorship feature on or off.
   */
  toggleSponsorships: async () => {
    const response = await axiosClient.post('/admin/settings/sponsorships/toggle');
    return response.data;
  },
};
