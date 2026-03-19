import axiosClient from '@api/axiosClient';
import type { Entitlement, ApiResponse } from '@data-types/api';

/** Query params accepted by GET /admin/entitlements */
interface EntitlementListParams {
  per_page?: number;
  page?: number;
  sort?: string;
}

/** Body for creating a new entitlement */
interface CreateEntitlementPayload {
  company_ulid: string;
  feature_key: string;
  type: 'slot' | 'credit' | 'boolean';
  starts_at?: string;
  expires_at?: string;
  slots_total?: number;
  credits_total?: number;
  payment_reference?: string;
  amount_paid?: number;
  currency?: string;
  active: boolean;
}

/** Body for updating an existing entitlement (all fields optional) */
type UpdateEntitlementPayload = Partial<CreateEntitlementPayload>;

/** Wrapper for single-resource responses */
interface SingleResponse<T> {
  data: T;
}

/**
 * Service for managing add-on entitlements (slots, credits, booleans).
 *
 * All endpoints live under `/admin/entitlements`.
 */
export const entitlementService = {
  /**
   * List entitlements with optional pagination and sorting.
   * @param params - Query parameters (per_page, page, sort)
   */
  getEntitlements: async (params?: EntitlementListParams) => {
    const response = await axiosClient.get<ApiResponse<Entitlement>>('/admin/entitlements', { params });
    return response.data;
  },

  /**
   * Retrieve a single entitlement by ID.
   * @param id - Entitlement ULID
   */
  getEntitlement: async (id: string) => {
    const response = await axiosClient.get<SingleResponse<Entitlement>>(`/admin/entitlements/${id}`);
    return response.data;
  },

  /**
   * Create a new entitlement for a company.
   * @param data - Entitlement creation payload
   */
  createEntitlement: async (data: CreateEntitlementPayload) => {
    const response = await axiosClient.post<SingleResponse<Entitlement>>('/admin/entitlements', data);
    return response.data;
  },

  /**
   * Partially update an existing entitlement.
   * @param id - Entitlement ULID
   * @param data - Fields to update
   */
  updateEntitlement: async (id: string, data: UpdateEntitlementPayload) => {
    const response = await axiosClient.patch<SingleResponse<Entitlement>>(`/admin/entitlements/${id}`, data);
    return response.data;
  },

  /**
   * Delete an entitlement.
   * @param id - Entitlement ULID
   */
  deleteEntitlement: async (id: string) => {
    const response = await axiosClient.delete(`/admin/entitlements/${id}`);
    return response.data;
  },
};
