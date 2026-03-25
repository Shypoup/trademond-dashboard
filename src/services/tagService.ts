import axiosClient from '@api/axiosClient';
import { Tag, ApiResponse } from '@data-types/api';

/**
 * Admin tag CRUD under `/api/v1/admin/tags` (REST shape aligned with other admin resources).
 * Tag *proposals* use {@link tagProposalService} (`/admin/tag-proposals`).
 */
export const tagService = {
  /**
   * @param params - e.g. `per_page`, `filter[search]`, `sort`
   */
  getTags: async (params?: Record<string, unknown>) => {
    const response = await axiosClient.get<ApiResponse<Tag>>('/admin/tags', { params });
    return response.data;
  },

  getTag: async (id: string) => {
    const response = await axiosClient.get<Tag>(`/admin/tags/${id}`);
    return response.data;
  },

  createTag: async (data: Record<string, unknown>) => {
    const response = await axiosClient.post('/admin/tags', data);
    return response.data;
  },

  updateTag: async (id: string, data: Record<string, unknown>) => {
    const response = await axiosClient.patch(`/admin/tags/${id}`, data);
    return response.data;
  },

  deleteTag: async (id: string) => {
    const response = await axiosClient.delete(`/admin/tags/${id}`);
    return response.data;
  },
};
