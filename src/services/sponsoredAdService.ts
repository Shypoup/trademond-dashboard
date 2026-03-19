import axiosClient from '@api/axiosClient';
import { SponsoredAd, ApiResponse } from '@data-types/api';
import type { BilingualText } from '@data-types/api';

/** Payload for creating or fully updating a sponsored ad. */
interface CreateSponsoredAdPayload {
  placement: string;
  headline?: BilingualText;
  description?: BilingualText;
  cta_label?: BilingualText;
  cta_url?: string;
  company_id?: string;
  external_brand?: string;
  priority?: number;
  is_active?: boolean;
  starts_at?: string;
  ends_at?: string;
  stats?: Array<{ value: string; label: BilingualText }>;
}

/** Media collection names accepted by the sponsored-ads media endpoint. */
type AdMediaCollection =
  | 'ad_image'
  | 'ad_carousel'
  | 'ad_video'
  | 'ad_video_thumb'
  | 'ad_external_logo';

/**
 * Admin service for managing sponsored ads.
 * All endpoints operate under `/admin/sponsored-ads`.
 */
export const sponsoredAdService = {
  /**
   * Fetches a paginated list of sponsored ads.
   * @param params - Query parameters (e.g. `filter[placement]`, `filter[is_active]`, `sort`, `per_page`).
   */
  getSponsoredAds: async (params?: Record<string, unknown>) => {
    const response = await axiosClient.get<ApiResponse<SponsoredAd>>(
      '/admin/sponsored-ads',
      { params },
    );
    return response.data;
  },

  /**
   * Creates a new sponsored ad.
   * @param data - Ad creation payload.
   */
  createSponsoredAd: async (data: CreateSponsoredAdPayload) => {
    const response = await axiosClient.post('/admin/sponsored-ads', data);
    return response.data;
  },

  /**
   * Fetches a single sponsored ad by ID.
   * @param id - The ad ULID.
   */
  getSponsoredAd: async (id: string) => {
    const response = await axiosClient.get<{ data: SponsoredAd }>(
      `/admin/sponsored-ads/${id}`,
    );
    return response.data;
  },

  /**
   * Partially updates a sponsored ad.
   * @param id   - The ad ULID.
   * @param data - Fields to update (same shape as create payload).
   */
  updateSponsoredAd: async (id: string, data: Partial<CreateSponsoredAdPayload>) => {
    const response = await axiosClient.patch(`/admin/sponsored-ads/${id}`, data);
    return response.data;
  },

  /**
   * Deletes a sponsored ad.
   * @param id - The ad ULID.
   */
  deleteSponsoredAd: async (id: string) => {
    const response = await axiosClient.delete(`/admin/sponsored-ads/${id}`);
    return response.data;
  },

  /**
   * Toggles the active state of a sponsored ad.
   * @param id - The ad ULID.
   */
  toggleActive: async (id: string) => {
    const response = await axiosClient.post(`/admin/sponsored-ads/${id}/toggle-active`);
    return response.data;
  },

  /**
   * Uploads media files for a sponsored ad.
   * @param id         - The ad ULID.
   * @param collection - The media collection name.
   * @param files      - Files to upload.
   */
  uploadMedia: async (id: string, collection: AdMediaCollection, files: File[]) => {
    const formData = new FormData();
    formData.append('collection', collection);
    files.forEach((file) => formData.append('files[]', file));

    const response = await axiosClient.post(
      `/admin/sponsored-ads/${id}/media`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
  },

  /**
   * Deletes a specific media item from a sponsored ad.
   * @param id        - The ad ULID.
   * @param mediaUuid - The UUID of the media to remove.
   */
  deleteMedia: async (id: string, mediaUuid: string) => {
    const response = await axiosClient.delete(
      `/admin/sponsored-ads/${id}/media/${mediaUuid}`,
    );
    return response.data;
  },

  /**
   * Reorders media items within a sponsored ad.
   * @param id    - The ad ULID.
   * @param order - Ordered array of media UUIDs.
   */
  reorderMedia: async (id: string, order: string[]) => {
    const response = await axiosClient.patch(
      `/admin/sponsored-ads/${id}/media/reorder`,
      { order },
    );
    return response.data;
  },
};
