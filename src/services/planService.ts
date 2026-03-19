import axiosClient from '@api/axiosClient';
import type { Plan, PlanFeature, ApiResponse, BilingualText } from '@data-types/api';

/** Query params accepted by GET /admin/plans */
interface PlanListParams {
  per_page?: number;
  page?: number;
  'filter[slug]'?: string;
  'filter[active]'?: boolean;
  'filter[is_default]'?: boolean;
  sort?: string;
}

/** Body for creating a new plan */
export interface CreatePlanPayload {
  slug: string;
  name: { en: string; ar: string };
  description?: { en: string; ar: string };
  level: number;
  price_monthly?: number | string;
  price_yearly?: number | string;
  active: boolean;
}

/** Body for updating an existing plan (all fields optional) */
type UpdatePlanPayload = Partial<CreatePlanPayload>;

/** Single feature attachment when syncing plan features */
interface SyncPlanFeaturePayload {
  id: string;
  enabled: boolean;
  limit?: number | null;
  tier?: string | null;
  config?: Record<string, unknown> | null;
}

/** Wrapper for single-resource responses */
interface SingleResponse<T> {
  data: T;
}

/**
 * Service for managing subscription plans.
 *
 * All endpoints live under `/admin/plans`.
 */
export const planService = {
  /**
   * List plans with optional filtering, sorting, and pagination.
   * @param params - Query parameters (filter[slug], filter[active], filter[is_default], sort, per_page, page)
   */
  getPlans: async (params?: PlanListParams) => {
    const response = await axiosClient.get<ApiResponse<Plan>>('/admin/plans', { params });
    return response.data;
  },

  /**
   * Retrieve a single plan by ID.
   * @param id - Plan ULID
   */
  getPlan: async (id: string) => {
    const response = await axiosClient.get<SingleResponse<Plan>>(`/admin/plans/${id}`);
    return response.data;
  },

  /**
   * Create a new plan.
   * @param data - Plan creation payload
   */
  createPlan: async (data: CreatePlanPayload) => {
    const response = await axiosClient.post<SingleResponse<Plan>>('/admin/plans', data);
    return response.data;
  },

  /**
   * Partially update an existing plan.
   * @param id - Plan ULID
   * @param data - Fields to update
   */
  updatePlan: async (id: string, data: UpdatePlanPayload) => {
    const response = await axiosClient.patch<SingleResponse<Plan>>(`/admin/plans/${id}`, data);
    return response.data;
  },

  /**
   * Soft-delete a plan. Cannot delete the default plan (returns 422).
   * @param id - Plan ULID
   */
  deletePlan: async (id: string) => {
    const response = await axiosClient.delete(`/admin/plans/${id}`);
    return response.data;
  },

  /**
   * Restore a soft-deleted plan.
   * @param id - Plan ULID
   */
  restorePlan: async (id: string) => {
    const response = await axiosClient.post<SingleResponse<Plan>>(`/admin/plans/${id}/restore`);
    return response.data;
  },

  /**
   * Set a plan as the default. The plan must be active or a 422 is returned.
   * @param id - Plan ULID
   */
  setDefault: async (id: string) => {
    const response = await axiosClient.post<SingleResponse<Plan>>(`/admin/plans/${id}/set-default`);
    return response.data;
  },

  /**
   * Replace the full set of features attached to a plan.
   * @param id - Plan ULID
   * @param features - Array of feature assignments
   */
  syncFeatures: async (id: string, features: SyncPlanFeaturePayload[]) => {
    const response = await axiosClient.put<SingleResponse<Plan>>(`/admin/plans/${id}/features`, { features });
    return response.data;
  },
};
