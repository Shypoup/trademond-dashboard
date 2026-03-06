import apiClient from './api';
import { Tag, ApiResponse } from '../types/api';

export const tagService = {
  getTags: async (params?: any) => {
    const response = await apiClient.get<ApiResponse<Tag>>('/tag', { params });
    return response.data;
  },

  getTag: async (id: string | number) => {
    const response = await apiClient.get<Tag>(`/tag/${id}`);
    return response.data;
  },

  createTag: async (data: any) => {
    const response = await apiClient.post('/tag', data);
    return response.data;
  },

  updateTag: async (id: string | number, data: any) => {
    const response = await apiClient.patch(`/tag/${id}`, data);
    return response.data;
  },

  deleteTag: async (id: string | number) => {
    const response = await apiClient.delete(`/tag/${id}`);
    return response.data;
  }
};
