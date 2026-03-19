import axiosClient from '@api/axiosClient';
import { Review, ApiResponse } from '@data-types/api';

/** Request body for updating a review. */
interface UpdateReviewPayload {
  rating?: number;
  comment?: string;
  owner_reply?: string | null;
}

/**
 * Admin service for managing product/service reviews.
 * All endpoints operate under `/admin/reviews`.
 */
export const reviewService = {
  /**
   * Fetches a paginated list of reviews.
   * @param params - Query parameters (e.g. `per_page`, filters).
   */
  getReviews: async (params?: Record<string, unknown>) => {
    const response = await axiosClient.get<ApiResponse<Review>>('/admin/reviews', { params });
    return response.data;
  },

  /**
   * Fetches a single review by ID.
   * @param id - The review ULID.
   */
  getReview: async (id: string) => {
    const response = await axiosClient.get<{ data: Review }>(`/admin/reviews/${id}`);
    return response.data;
  },

  /**
   * Updates an existing review (rating, comment, owner reply).
   * @param id   - The review ULID.
   * @param data - Fields to update.
   */
  updateReview: async (id: string, data: UpdateReviewPayload) => {
    const response = await axiosClient.patch(`/admin/reviews/${id}`, data);
    return response.data;
  },

  /**
   * Soft-deletes a review.
   * @param id - The review ULID.
   */
  deleteReview: async (id: string) => {
    const response = await axiosClient.delete(`/admin/reviews/${id}`);
    return response.data;
  },

  /**
   * Restores a previously soft-deleted review.
   * @param id - The review ULID.
   */
  restoreReview: async (id: string) => {
    const response = await axiosClient.post(`/admin/reviews/${id}/restore`);
    return response.data;
  },

  /**
   * Publishes a review so it becomes visible to the public.
   * @param id - The review ULID.
   */
  publishReview: async (id: string) => {
    const response = await axiosClient.post(`/admin/reviews/${id}/publish`);
    return response.data;
  },

  /**
   * Unpublishes a review, hiding it from public view.
   * @param id - The review ULID.
   */
  unpublishReview: async (id: string) => {
    const response = await axiosClient.post(`/admin/reviews/${id}/unpublish`);
    return response.data;
  },

  /**
   * Permanently deletes a review (cannot be restored).
   * @param id - The review ULID.
   */
  forceDeleteReview: async (id: string) => {
    const response = await axiosClient.delete(`/admin/reviews/${id}/force`);
    return response.data;
  },
};
