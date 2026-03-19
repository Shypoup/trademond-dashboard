import axiosClient from '@api/axiosClient';
import { SocialPlatform, ApiResponse } from '@data-types/api';

/** Payload for partially updating a social platform. */
interface UpdateSocialPlatformPayload {
  name?: { en: string; ar: string };
  active?: boolean;
  base_url?: string;
  placeholder?: { en: string; ar: string };
}

/**
 * Admin service for managing social platforms.
 * All endpoints operate under `/admin/social-platforms`.
 */
export const socialPlatformService = {
  /**
   * Fetches a paginated list of social platforms.
   * @param params - Query parameters (e.g. `filter[active]`, `filter[input_type]`).
   */
  getSocialPlatforms: async (params?: Record<string, unknown>) => {
    const response = await axiosClient.get<ApiResponse<SocialPlatform>>(
      '/admin/social-platforms',
      { params },
    );
    return response.data;
  },

  /**
   * Creates a new social platform.
   * Accepts a `FormData` body that may include an icon file.
   * @param data - FormData containing name[en], name[ar], input_type, base_url, etc.
   */
  createSocialPlatform: async (data: FormData) => {
    const response = await axiosClient.post('/admin/social-platforms', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Fetches a single social platform by ID.
   * @param id - The platform ULID.
   */
  getSocialPlatform: async (id: string) => {
    const response = await axiosClient.get<{ data: SocialPlatform }>(
      `/admin/social-platforms/${id}`,
    );
    return response.data;
  },

  /**
   * Partially updates a social platform (JSON body).
   * @param id   - The platform ULID.
   * @param data - Fields to update.
   */
  updateSocialPlatform: async (id: string, data: UpdateSocialPlatformPayload) => {
    const response = await axiosClient.patch(`/admin/social-platforms/${id}`, data);
    return response.data;
  },

  /**
   * Deletes a social platform.
   * @param id - The platform ULID.
   */
  deleteSocialPlatform: async (id: string) => {
    const response = await axiosClient.delete(`/admin/social-platforms/${id}`);
    return response.data;
  },

  /**
   * Uploads or replaces the icon for a social platform.
   * @param id   - The platform ULID.
   * @param data - FormData containing the icon file.
   */
  uploadIcon: async (id: string, data: FormData) => {
    const response = await axiosClient.post(
      `/admin/social-platforms/${id}/icon`,
      data,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
  },

  /**
   * Reorders social platforms by providing an ordered array of IDs.
   * @param platformIds - Ordered array of platform ULIDs.
   */
  reorder: async (platformIds: string[]) => {
    const response = await axiosClient.post('/admin/social-platforms/reorder', {
      platform_ids: platformIds,
    });
    return response.data;
  },
};
