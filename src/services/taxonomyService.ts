import axiosClient from '@api/axiosClient';
import type { ApiResponse } from '@data-types/api';

/** Minimal industry row for admin lists (bilingual name, slug, active). */
export interface AdminIndustry {
  id: string;
  name: Record<string, string>;
  slug?: string | null;
  active?: boolean;
}

/** Minimal category row including `industry_id` (ULID). */
export interface AdminCategory {
  id: string;
  name: Record<string, string>;
  industry_id: string;
  slug?: string | null;
  active?: boolean;
}

/** Minimal expertise row including `category_id` (ULID). */
export interface AdminExpertise {
  id: string;
  name: Record<string, string>;
  category_id: string;
  isic_code?: string | null;
  slug?: string | null;
  active?: boolean;
}

/**
 * Admin taxonomies: industries, categories, expertises (`/api/v1/admin/industries`, etc.).
 * Matches the Industries / Categories / Expertises folders in the admin Postman collection.
 */
export const taxonomyService = {
  // ─── Industries ─────────────────────────────────────────────

  /** @param params - e.g. `per_page`, `filter[active]`, `filter[search]`, `sort` */
  getIndustries: async (params?: Record<string, unknown>) => {
    const response = await axiosClient.get<ApiResponse<AdminIndustry>>('/admin/industries', { params });
    return response.data;
  },

  getIndustry: async (id: string) => {
    const response = await axiosClient.get<AdminIndustry>(`/admin/industries/${id}`);
    return response.data;
  },

  createIndustry: async (data: Record<string, unknown>) => {
    const response = await axiosClient.post('/admin/industries', data);
    return response.data;
  },

  updateIndustry: async (id: string, data: Record<string, unknown>) => {
    const response = await axiosClient.patch(`/admin/industries/${id}`, data);
    return response.data;
  },

  deleteIndustry: async (id: string) => {
    const response = await axiosClient.delete(`/admin/industries/${id}`);
    return response.data;
  },

  // ─── Expertises ─────────────────────────────────────────────

  /** @param params - e.g. `per_page`, `filter[category_id]`, `filter[industry_id]`, `filter[search]`, `sort` */
  getExpertises: async (params?: Record<string, unknown>) => {
    const response = await axiosClient.get<ApiResponse<AdminExpertise>>('/admin/expertises', { params });
    return response.data;
  },

  getExpertise: async (id: string) => {
    const response = await axiosClient.get<AdminExpertise>(`/admin/expertises/${id}`);
    return response.data;
  },

  createExpertise: async (data: Record<string, unknown>) => {
    const response = await axiosClient.post('/admin/expertises', data);
    return response.data;
  },

  updateExpertise: async (id: string, data: Record<string, unknown>) => {
    const response = await axiosClient.patch(`/admin/expertises/${id}`, data);
    return response.data;
  },

  deleteExpertise: async (id: string) => {
    const response = await axiosClient.delete(`/admin/expertises/${id}`);
    return response.data;
  },
};
