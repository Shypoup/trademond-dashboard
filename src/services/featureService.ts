import axiosClient from '@api/axiosClient';
import type { Feature, ApiResponse, BilingualText } from '@data-types/api';

/** Query params accepted by GET /admin/features */
interface FeatureListParams {
  per_page?: number;
  page?: number;
  'filter[category]'?: string;
  'filter[type]'?: 'boolean' | 'limit' | 'tier' | 'config';
  'filter[active]'?: boolean;
  sort?: string;
}

/** Body for creating a new feature */
interface CreateFeaturePayload {
  key: string;
  type: 'boolean' | 'limit' | 'tier' | 'config';
  name: { en: string; ar: string };
  description?: { en: string; ar: string };
  category: string;
  active: boolean;
  depends_on?: string | null;
  metadata?: Record<string, unknown> | null;
}

/** Body for updating an existing feature (all fields optional) */
type UpdateFeaturePayload = Partial<CreateFeaturePayload>;

/** Wrapper for single-resource responses */
interface SingleResponse<T> {
  data: T;
}

/**
 * Service for managing platform features.
 *
 * All endpoints live under `/admin/features`.
 */
export const featureService = {
  /**
   * List features with optional filtering, sorting, and pagination.
   * @param params - Query parameters (filter[category], filter[type], filter[active], sort, per_page, page)
   */
  getFeatures: async (params?: FeatureListParams) => {
    const response = await axiosClient.get<ApiResponse<Feature>>('/admin/features', { params });
    return response.data;
  },

  /**
   * Retrieve a single feature by ID.
   * @param id - Feature ULID
   */
  getFeature: async (id: string) => {
    const response = await axiosClient.get<SingleResponse<Feature>>(`/admin/features/${id}`);
    return response.data;
  },

  /**
   * Create a new feature.
   * @param data - Feature creation payload
   */
  createFeature: async (data: CreateFeaturePayload) => {
    const response = await axiosClient.post<SingleResponse<Feature>>('/admin/features', data);
    return response.data;
  },

  /**
   * Partially update an existing feature.
   * @param id - Feature ULID
   * @param data - Fields to update
   */
  updateFeature: async (id: string, data: UpdateFeaturePayload) => {
    const response = await axiosClient.patch<SingleResponse<Feature>>(`/admin/features/${id}`, data);
    return response.data;
  },

  /**
   * Delete a feature.
   * @param id - Feature ULID
   */
  deleteFeature: async (id: string) => {
    const response = await axiosClient.delete(`/admin/features/${id}`);
    return response.data;
  },
};
