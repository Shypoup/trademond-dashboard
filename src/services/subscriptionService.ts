import axiosClient from '@api/axiosClient';
import type { Subscription, ApiResponse } from '@data-types/api';

/** Query params accepted by GET /admin/subscriptions */
interface SubscriptionListParams {
  per_page?: number;
  page?: number;
  'filter[status]'?: 'active' | 'cancelled' | 'expired' | 'trial' | 'pending';
  'filter[billing_cycle]'?: 'monthly' | 'yearly';
  'filter[plan_slug]'?: string;
  sort?: string;
}

/** Body for creating a new subscription */
interface CreateSubscriptionPayload {
  user_ulid: string;
  plan_ulid: string;
  billing_cycle: 'monthly' | 'yearly';
}

/** Body for updating an existing subscription */
interface UpdateSubscriptionPayload {
  status?: string;
  expires_at?: string;
  trial_ends_at?: string | null;
  payment_reference?: string | null;
  amount_paid?: number | null;
  currency?: string | null;
}

/** Body for changing a subscription's plan */
interface ChangePlanPayload {
  plan_ulid: string;
}

/** Wrapper for single-resource responses */
interface SingleResponse<T> {
  data: T;
}

/**
 * Service for managing user/company subscriptions.
 *
 * All endpoints live under `/admin/subscriptions`.
 */
export const subscriptionService = {
  /**
   * List subscriptions with optional filtering, sorting, and pagination.
   * @param params - Query parameters (filter[status], filter[billing_cycle], filter[plan_slug], sort, per_page, page)
   */
  getSubscriptions: async (params?: SubscriptionListParams) => {
    const response = await axiosClient.get<ApiResponse<Subscription>>('/admin/subscriptions', { params });
    return response.data;
  },

  /**
   * Retrieve a single subscription by ID.
   * @param id - Subscription ULID
   */
  getSubscription: async (id: string) => {
    const response = await axiosClient.get<SingleResponse<Subscription>>(`/admin/subscriptions/${id}`);
    return response.data;
  },

  /**
   * Create a new subscription for a user.
   * @param data - Subscription creation payload (user_ulid, plan_ulid, billing_cycle)
   */
  createSubscription: async (data: CreateSubscriptionPayload) => {
    const response = await axiosClient.post<SingleResponse<Subscription>>('/admin/subscriptions', data);
    return response.data;
  },

  /**
   * Partially update an existing subscription (status, dates, payment info).
   * @param id - Subscription ULID
   * @param data - Fields to update
   */
  updateSubscription: async (id: string, data: UpdateSubscriptionPayload) => {
    const response = await axiosClient.patch<SingleResponse<Subscription>>(`/admin/subscriptions/${id}`, data);
    return response.data;
  },

  /**
   * Cancel a subscription.
   * @param id - Subscription ULID
   */
  cancelSubscription: async (id: string) => {
    const response = await axiosClient.post<SingleResponse<Subscription>>(`/admin/subscriptions/${id}/cancel`);
    return response.data;
  },

  /**
   * Extend a subscription by one billing cycle. No body required.
   * @param id - Subscription ULID
   */
  extendSubscription: async (id: string) => {
    const response = await axiosClient.post<SingleResponse<Subscription>>(`/admin/subscriptions/${id}/extend`);
    return response.data;
  },

  /**
   * Delete (cancel + remove) a subscription.
   * @param id - Subscription ULID
   */
  deleteSubscription: async (id: string) => {
    const response = await axiosClient.delete<SingleResponse<Subscription>>(`/admin/subscriptions/${id}`);
    return response.data;
  },

  /**
   * Change the plan attached to a subscription.
   * @param id - Subscription ULID
   * @param planUlid - ULID of the target plan
   */
  changePlan: async (id: string, planUlid: string) => {
    const response = await axiosClient.post<SingleResponse<Subscription>>(
      `/admin/subscriptions/${id}/change-plan`,
      { plan_ulid: planUlid } satisfies ChangePlanPayload,
    );
    return response.data;
  },
};
