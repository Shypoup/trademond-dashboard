import axiosClient from '@api/axiosClient';
import { Follow, ApiResponse } from '@data-types/api';

/**
 * Admin service for managing user-follows-company relationships.
 * All endpoints operate under `/admin/follows`.
 */
export const followService = {
  /**
   * Fetches a paginated list of all follows.
   * @param params - Query parameters (e.g. `per_page`).
   */
  listFollows: async (params?: Record<string, unknown>) => {
    const response = await axiosClient.get<ApiResponse<Follow>>('/admin/follows', { params });
    return response.data;
  },

  /**
   * Fetches all followers for a specific company.
   * @param companyId - The company ULID.
   */
  getCompanyFollowers: async (companyId: string) => {
    const response = await axiosClient.get(`/admin/follows/companies/${companyId}`);
    return response.data;
  },

  /**
   * Fetches all follows initiated by a specific user.
   * @param userId - The user ULID.
   */
  getUserFollows: async (userId: string) => {
    const response = await axiosClient.get(`/admin/follows/users/${userId}`);
    return response.data;
  },

  /**
   * Deletes a follow relationship.
   * @param id - The follow ULID.
   */
  deleteFollow: async (id: string) => {
    const response = await axiosClient.delete(`/admin/follows/${id}`);
    return response.data;
  },
};
