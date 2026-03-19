import axiosClient from '@api/axiosClient';
import { Sponsorship, ApiResponse } from '@data-types/api';

/** Request body for creating or updating a sponsorship. */
interface SponsorshipPayload {
  company_id?: string;
  keyword?: string;
  entity_type?: 'company' | 'product' | 'service';
  entity_id?: string;
  position?: number;
  amount_paid?: number;
  starts_at?: string;
  expires_at?: string;
}

/**
 * Admin service for managing keyword sponsorships.
 * All endpoints operate under `/admin/sponsorships`.
 */
export const sponsorshipService = {
  /**
   * Fetches a paginated list of sponsorships.
   * @param params - Query parameters (e.g. `per_page`, `status`).
   */
  getSponsorships: async (params?: Record<string, unknown>) => {
    const response = await axiosClient.get<ApiResponse<Sponsorship>>('/admin/sponsorships', { params });
    return response.data;
  },

  /**
   * Fetches a single sponsorship by ID.
   * @param id - The sponsorship ULID.
   */
  getSponsorship: async (id: string) => {
    const response = await axiosClient.get<{ data: Sponsorship }>(`/admin/sponsorships/${id}`);
    return response.data;
  },

  /**
   * Creates a new sponsorship.
   * @param data - The sponsorship payload.
   */
  createSponsorship: async (data: SponsorshipPayload) => {
    const response = await axiosClient.post('/admin/sponsorships', data);
    return response.data;
  },

  /**
   * Updates an existing sponsorship.
   * @param id   - The sponsorship ULID.
   * @param data - Fields to update.
   */
  updateSponsorship: async (id: string, data: Partial<SponsorshipPayload>) => {
    const response = await axiosClient.patch(`/admin/sponsorships/${id}`, data);
    return response.data;
  },

  /**
   * Deletes a sponsorship.
   * @param id - The sponsorship ULID.
   */
  deleteSponsorship: async (id: string) => {
    const response = await axiosClient.delete(`/admin/sponsorships/${id}`);
    return response.data;
  },

  /**
   * Checks keyword availability for a given entity type.
   * @param keyword    - The keyword to check.
   * @param entityType - The entity type (`company`, `product`, or `service`).
   */
  checkKeywordAvailability: async (keyword: string, entityType: string) => {
    const response = await axiosClient.get('/admin/sponsorships/check', {
      params: { keyword, entity_type: entityType },
    });
    return response.data;
  },

  /**
   * Fetches all sponsorships for a specific company.
   * @param companyId - The company ULID.
   */
  getCompanySponsorships: async (companyId: string) => {
    const response = await axiosClient.get(`/admin/sponsorships/companies/${companyId}`);
    return response.data;
  },
};
