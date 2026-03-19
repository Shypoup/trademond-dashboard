import axiosClient from '@api/axiosClient';
import { Tag, ApiResponse } from '@data-types/api';

export const tagService = {
  getTags: async (params?: any) => {
    const response = await axiosClient.get<ApiResponse<Tag>>('/tags/index', { params });
    return response.data;
  },

  getTag: async (id: string | number) => {
    const response = await axiosClient.get<Tag>(`/tag/${id}`);
    return response.data;
  },

  createTag: async (data: any) => {
    const response = await axiosClient.post('/tag', data);
    return response.data;
  },

  updateTag: async (id: string | number, data: any) => {
    const response = await axiosClient.patch(`/tag/${id}`, data);
    return response.data;
  },

  deleteTag: async (id: string | number) => {
    const response = await axiosClient.delete(`/tag/${id}`);
    return response.data;
  }
};
