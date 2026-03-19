import axiosClient from '@api/axiosClient';
import { Like, ApiResponse } from '@data-types/api';

/**
 * Admin service for managing user likes on products and services.
 * All endpoints operate under `/admin/likes`.
 */
export const likeService = {
  /**
   * Fetches a paginated list of all likes.
   * @param params - Query parameters (e.g. `per_page`).
   */
  listLikes: async (params?: Record<string, unknown>) => {
    const response = await axiosClient.get<ApiResponse<Like>>('/admin/likes', { params });
    return response.data;
  },

  /**
   * Fetches all likes for a specific product.
   * @param productId - The product ULID.
   */
  getProductLikes: async (productId: string) => {
    const response = await axiosClient.get(`/admin/likes/products/${productId}`);
    return response.data;
  },

  /**
   * Fetches all likes for a specific service.
   * @param serviceId - The service ULID.
   */
  getServiceLikes: async (serviceId: string) => {
    const response = await axiosClient.get(`/admin/likes/services/${serviceId}`);
    return response.data;
  },

  /**
   * Fetches all likes by a specific user.
   * @param userId - The user ULID.
   */
  getUserLikes: async (userId: string) => {
    const response = await axiosClient.get(`/admin/likes/users/${userId}`);
    return response.data;
  },

  /**
   * Deletes a like.
   * @param id - The like ULID.
   */
  deleteLike: async (id: string) => {
    const response = await axiosClient.delete(`/admin/likes/${id}`);
    return response.data;
  },
};
