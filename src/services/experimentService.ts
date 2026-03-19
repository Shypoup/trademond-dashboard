import axiosClient from '@api/axiosClient';
import type { Experiment, ApiResponse } from '@data-types/api';

/** Query params accepted by GET /admin/experiments */
interface ExperimentListParams {
  per_page?: number;
  page?: number;
  sort?: string;
}

/** Body for creating a new experiment */
interface CreateExperimentPayload {
  feature_key: string;
  name: string;
  description?: string;
  targeting_type: 'percentage' | 'rules';
  targeting_rules?: Record<string, unknown> | null;
  rollout_percentage?: number;
  enabled: boolean;
  limit?: number | null;
  tier?: string | null;
  config?: Record<string, unknown> | null;
  active: boolean;
  starts_at?: string;
  ends_at?: string;
}

/** Body for updating an existing experiment (all fields optional) */
type UpdateExperimentPayload = Partial<CreateExperimentPayload>;

/** Wrapper for single-resource responses */
interface SingleResponse<T> {
  data: T;
}

/**
 * Service for managing feature experiments / A-B tests.
 *
 * All endpoints live under `/admin/experiments`.
 */
export const experimentService = {
  /**
   * List experiments with optional pagination and sorting.
   * @param params - Query parameters (per_page, page, sort)
   */
  getExperiments: async (params?: ExperimentListParams) => {
    const response = await axiosClient.get<ApiResponse<Experiment>>('/admin/experiments', { params });
    return response.data;
  },

  /**
   * Retrieve a single experiment by ID.
   * @param id - Experiment ULID
   */
  getExperiment: async (id: string) => {
    const response = await axiosClient.get<SingleResponse<Experiment>>(`/admin/experiments/${id}`);
    return response.data;
  },

  /**
   * Create a new experiment.
   * @param data - Experiment creation payload
   */
  createExperiment: async (data: CreateExperimentPayload) => {
    const response = await axiosClient.post<SingleResponse<Experiment>>('/admin/experiments', data);
    return response.data;
  },

  /**
   * Partially update an existing experiment.
   * @param id - Experiment ULID
   * @param data - Fields to update
   */
  updateExperiment: async (id: string, data: UpdateExperimentPayload) => {
    const response = await axiosClient.patch<SingleResponse<Experiment>>(`/admin/experiments/${id}`, data);
    return response.data;
  },

  /**
   * Delete an experiment.
   * @param id - Experiment ULID
   */
  deleteExperiment: async (id: string) => {
    const response = await axiosClient.delete(`/admin/experiments/${id}`);
    return response.data;
  },

  /**
   * Toggle the active state of an experiment.
   * @param id - Experiment ULID
   */
  toggleActive: async (id: string) => {
    const response = await axiosClient.post<SingleResponse<Experiment>>(`/admin/experiments/${id}/toggle-active`);
    return response.data;
  },
};
