import axiosClient from '@api/axiosClient';
import { User, ApiResponse } from '@data-types/api';

export const userService = {
  /**
   * Lists users with optional query params.
   * Supports filter[search], filter[active], filter[role], sort, per_page.
   * @param params - Query parameters forwarded to GET /admin/users.
   */
  getUsers: async (params?: Record<string, unknown>) => {
    const response = await axiosClient.get<ApiResponse<User>>('/admin/users', { params });
    return response.data;
  },

  /**
   * Fetches a single user by ID.
   * @param id - User ULID.
   */
  getUser: async (id: string) => {
    const response = await axiosClient.get<User>(`/admin/users/${id}`);
    return response.data;
  },

  /**
   * Creates a new user.
   * @param data - Payload with name, email, password, password_confirmation, country_id, searchable, active.
   */
  createUser: async (data: Record<string, unknown>) => {
    const response = await axiosClient.post('/admin/users', data);
    return response.data;
  },

  /**
   * Fully updates an existing user.
   * @param id - User ULID.
   * @param data - Payload with name, email, searchable, active.
   */
  updateUser: async (id: string, data: Record<string, unknown>) => {
    const response = await axiosClient.put(`/admin/users/${id}`, data);
    return response.data;
  },

  /**
   * Deletes a user.
   * @param id - User ULID.
   */
  deleteUser: async (id: string) => {
    const response = await axiosClient.delete(`/admin/users/${id}`);
    return response.data;
  },

  /**
   * Updates the role of an existing user.
   * @param id - User ULID.
   * @param data - Payload with the new role.
   */
  updateRole: async (id: string, data: { role: string }) => {
    const response = await axiosClient.patch(`/admin/users/${id}/role`, data);
    return response.data;
  },

  /**
   * Uploads a profile photo for a user.
   * @param id - User ULID.
   * @param file - The image file to upload.
   */
  uploadUserPhoto: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await axiosClient.post(`/admin/users/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
