import axiosClient from '@api/axiosClient';
import { TagProposal, ApiResponse } from '@data-types/api';

/**
 * Admin service for managing user-submitted tag proposals.
 * All endpoints operate under `/admin/tag-proposals`.
 */
export const tagProposalService = {
  /**
   * Fetches a paginated list of tag proposals.
   * @param params - Query parameters (e.g. `filter[status]`, `per_page`, `sort`).
   */
  getProposals: async (params?: Record<string, unknown>) => {
    const response = await axiosClient.get<ApiResponse<TagProposal>>('/admin/tag-proposals', { params });
    return response.data;
  },

  /**
   * Fetches a single tag proposal by ID.
   * @param id - The tag proposal ULID.
   */
  getProposal: async (id: string) => {
    const response = await axiosClient.get<{ data: TagProposal }>(`/admin/tag-proposals/${id}`);
    return response.data;
  },

  /**
   * Fetches merge/match suggestions for a tag proposal.
   * @param id - The tag proposal ULID.
   */
  getSuggestions: async (id: string) => {
    const response = await axiosClient.get(`/admin/tag-proposals/${id}/suggestions`);
    return response.data;
  },

  /**
   * Accepts a tag proposal, promoting it to a canonical tag.
   * @param id - The tag proposal ULID.
   */
  accept: async (id: string) => {
    const response = await axiosClient.post(`/admin/tag-proposals/${id}/accept`);
    return response.data;
  },

  /**
   * Merges a tag proposal into an existing canonical tag.
   * @param id    - The tag proposal ULID.
   * @param tagId - The canonical tag ULID to merge into.
   */
  merge: async (id: string, tagId: string) => {
    const response = await axiosClient.post(`/admin/tag-proposals/${id}/merge`, { canonical_tag_id: tagId });
    return response.data;
  },

  /**
   * Rejects a tag proposal.
   * @param id - The tag proposal ULID.
   */
  reject: async (id: string) => {
    const response = await axiosClient.post(`/admin/tag-proposals/${id}/reject`);
    return response.data;
  },
};
