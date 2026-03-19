import axiosClient from '@api/axiosClient';
import type { FeatureOverride, ApiResponse } from '@data-types/api';

/** Query params accepted by GET /admin/feature-overrides */
interface FeatureOverrideListParams {
  per_page?: number;
  page?: number;
  sort?: string;
}

/** Body for creating a new feature override */
interface CreateFeatureOverridePayload {
  company_ulid: string;
  feature_key: string;
  enabled: boolean;
  limit?: number | null;
  tier?: string | null;
  config?: Record<string, unknown> | null;
  reason?: string;
  expires_at?: string | null;
}

/** Body for updating an existing feature override (all fields optional) */
type UpdateFeatureOverridePayload = Partial<CreateFeatureOverridePayload>;

/** Wrapper for single-resource responses */
interface SingleResponse<T> {
  data: T;
}

/**
 * Service for managing per-company feature overrides.
 *
 * All endpoints live under `/admin/feature-overrides`.
 */
export const featureOverrideService = {
  /**
   * List feature overrides with optional pagination and sorting.
   * @param params - Query parameters (per_page, page, sort)
   */
  getOverrides: async (params?: FeatureOverrideListParams) => {
    const response = await axiosClient.get<ApiResponse<FeatureOverride>>('/admin/feature-overrides', { params });
    return response.data;
  },

  /**
   * Retrieve a single feature override by ID.
   * @param id - Feature override ULID
   */
  getOverride: async (id: string) => {
    const response = await axiosClient.get<SingleResponse<FeatureOverride>>(`/admin/feature-overrides/${id}`);
    return response.data;
  },

  /**
   * Create a new feature override for a company.
   * @param data - Feature override creation payload
   */
  createOverride: async (data: CreateFeatureOverridePayload) => {
    const response = await axiosClient.post<SingleResponse<FeatureOverride>>('/admin/feature-overrides', data);
    return response.data;
  },

  /**
   * Partially update an existing feature override.
   * @param id - Feature override ULID
   * @param data - Fields to update
   */
  updateOverride: async (id: string, data: UpdateFeatureOverridePayload) => {
    const response = await axiosClient.patch<SingleResponse<FeatureOverride>>(`/admin/feature-overrides/${id}`, data);
    return response.data;
  },

  /**
   * Delete a feature override.
   * @param id - Feature override ULID
   */
  deleteOverride: async (id: string) => {
    const response = await axiosClient.delete(`/admin/feature-overrides/${id}`);
    return response.data;
  },
};
