import axiosClient from '@api/axiosClient';
import { Media, ApiResponse } from '@data-types/api';

/**
 * Admin service for managing uploaded media (images, files).
 * All endpoints operate under `/admin/media`.
 */
export const mediaService = {
  /**
   * Fetches a paginated list of media items.
   * @param params - Query parameters (e.g. `per_page`).
   */
  listMedia: async (params?: Record<string, unknown>) => {
    const response = await axiosClient.get<ApiResponse<Media>>('/admin/media', { params });
    return response.data;
  },

  /**
   * Fetches a single media item by UUID.
   * @param uuid - The media UUID.
   */
  getMedia: async (uuid: string) => {
    const response = await axiosClient.get<{ data: Media }>(`/admin/media/${uuid}`);
    return response.data;
  },

  /**
   * Deletes a media item by UUID.
   * @param uuid - The media UUID.
   */
  deleteMedia: async (uuid: string) => {
    const response = await axiosClient.delete(`/admin/media/${uuid}`);
    return response.data;
  },

  /**
   * Fetches all media attached to a specific entity.
   * @param entityType - The entity type (e.g. `companies`, `products`, `services`).
   * @param entityId   - The entity ULID.
   */
  getMediaByEntity: async (entityType: string, entityId: string) => {
    const response = await axiosClient.get(`/admin/media/by-entity/${entityType}/${entityId}`);
    return response.data;
  },
};
