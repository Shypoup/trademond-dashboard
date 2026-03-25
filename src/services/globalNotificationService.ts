import axiosClient from '@api/axiosClient';
import type { ApiResponse } from '@data-types/api';
import type { BilingualText } from '@data-types/api';

/** Global banner / maintenance notification (admin). */
export interface GlobalNotification {
  id: string;
  title: BilingualText;
  body: BilingualText;
  link_url?: string | null;
  link_label?: BilingualText;
  type: string;
  active: boolean;
  starts_at?: string;
  ends_at?: string;
}

/**
 * Admin CRUD for global notifications (`/api/v1/admin/global-notifications`).
 */
export const globalNotificationService = {
  /** @param params - e.g. `per_page`, `filter[active]`, `filter[type]`, `filter[search]`, `sort` */
  list: async (params?: Record<string, unknown>) => {
    const response = await axiosClient.get<ApiResponse<GlobalNotification>>(
      '/admin/global-notifications',
      { params },
    );
    return response.data;
  },

  get: async (id: string) => {
    const response = await axiosClient.get<{ data: GlobalNotification }>(
      `/admin/global-notifications/${id}`,
    );
    return response.data;
  },

  create: async (data: Record<string, unknown>) => {
    const response = await axiosClient.post('/admin/global-notifications', data);
    return response.data;
  },

  update: async (id: string, data: Record<string, unknown>) => {
    const response = await axiosClient.patch(`/admin/global-notifications/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosClient.delete(`/admin/global-notifications/${id}`);
    return response.data;
  },
};
