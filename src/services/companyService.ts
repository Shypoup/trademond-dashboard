import axiosClient from '@api/axiosClient';
import { Company, ApiResponse } from '@data-types/api';

export const companyService = {
  /**
   * Lists companies with optional query params (per_page, filters, sort, etc.).
   * @param params - Query parameters forwarded to GET /admin/companies.
   */
  getCompanies: async (params?: Record<string, unknown>) => {
    const response = await axiosClient.get<ApiResponse<Company>>('/admin/companies', { params });
    return response.data;
  },

  /**
   * Fetches a single company by ID.
   * @param id - Company ULID.
   */
  getCompany: async (id: string) => {
    const response = await axiosClient.get<Company>(`/admin/companies/${id}`);
    return response.data;
  },

  /**
   * Creates a new company.
   * @param data - Payload including owner_id, name, slogan, acronym, handle, etc.
   */
  createCompany: async (data: Record<string, unknown>) => {
    const response = await axiosClient.post('/admin/companies', data);
    return response.data;
  },

  /**
   * Partially updates an existing company.
   * @param id - Company ULID.
   * @param data - Fields to update.
   */
  updateCompany: async (id: string, data: Record<string, unknown>) => {
    const response = await axiosClient.patch(`/admin/companies/${id}`, data);
    return response.data;
  },

  /**
   * Soft-deletes a company.
   * @param id - Company ULID.
   */
  deleteCompany: async (id: string) => {
    const response = await axiosClient.delete(`/admin/companies/${id}`);
    return response.data;
  },

  /**
   * Restores a previously soft-deleted company.
   * @param id - Company ULID.
   */
  restoreCompany: async (id: string) => {
    const response = await axiosClient.post(`/admin/companies/${id}/restore`);
    return response.data;
  },

  /**
   * Marks a company as verified.
   * @param id - Company ULID.
   */
  verifyCompany: async (id: string) => {
    const response = await axiosClient.post(`/admin/companies/${id}/verify`);
    return response.data;
  },

  /**
   * Removes the verified status from a company.
   * @param id - Company ULID.
   */
  unverifyCompany: async (id: string) => {
    const response = await axiosClient.post(`/admin/companies/${id}/unverify`);
    return response.data;
  },

  /**
   * Toggles the active state of a company.
   * @param id - Company ULID.
   */
  toggleActive: async (id: string) => {
    const response = await axiosClient.post(`/admin/companies/${id}/toggle-active`);
    return response.data;
  },

  /**
   * Toggles the published state of a company.
   * @param id - Company ULID.
   */
  togglePublished: async (id: string) => {
    const response = await axiosClient.post(`/admin/companies/${id}/toggle-published`);
    return response.data;
  },

  // ─── Company Members ──────────────────────────────────────

  /**
   * Lists all members of a company.
   * @param companyId - Company ULID.
   */
  listMembers: async (companyId: string) => {
    const response = await axiosClient.get(`/admin/companies/${companyId}/members`);
    return response.data;
  },

  /**
   * Adds a user as a member to a company.
   * @param companyId - Company ULID.
   * @param data - Payload with user_id and role.
   */
  addMember: async (companyId: string, data: { user_id: string; role: string }) => {
    const response = await axiosClient.post(`/admin/companies/${companyId}/members`, data);
    return response.data;
  },

  /**
   * Removes a member from a company.
   * @param companyId - Company ULID.
   * @param userId - The user ULID to remove.
   */
  removeMember: async (companyId: string, userId: string) => {
    const response = await axiosClient.delete(`/admin/companies/${companyId}/members/${userId}`);
    return response.data;
  },

  /**
   * Updates the role of an existing company member.
   * @param companyId - Company ULID.
   * @param userId - The member's user ULID.
   * @param data - Payload with the new role.
   */
  updateMemberRole: async (companyId: string, userId: string, data: { role: string }) => {
    const response = await axiosClient.patch(
      `/admin/companies/${companyId}/members/${userId}`,
      data,
    );
    return response.data;
  },

  // ─── Company Sub-Resources ────────────────────────────────

  /**
   * Lists products belonging to a company.
   * @param companyId - Company ULID.
   */
  listCompanyProducts: async (companyId: string) => {
    const response = await axiosClient.get(`/admin/companies/${companyId}/products`);
    return response.data;
  },

  /**
   * Lists services belonging to a company.
   * @param companyId - Company ULID.
   */
  listCompanyServices: async (companyId: string) => {
    const response = await axiosClient.get(`/admin/companies/${companyId}/services`);
    return response.data;
  },

  /**
   * Lists reviews for a company.
   * @param companyId - Company ULID.
   */
  listCompanyReviews: async (companyId: string) => {
    const response = await axiosClient.get(`/admin/companies/${companyId}/reviews`);
    return response.data;
  },

  /**
   * Fetches the subscription details for a company.
   * @param companyId - Company ULID.
   */
  getCompanySubscription: async (companyId: string) => {
    const response = await axiosClient.get(`/admin/companies/${companyId}/subscription`);
    return response.data;
  },

  // ─── Media uploads (Postman: Upload Company Photo / Cover) ───

  /**
   * Uploads or replaces the company logo (`image` field, max 3 MB).
   * @param companyId - Company ULID
   * @param image - Image file (jpeg, png, webp)
   */
  uploadCompanyPhoto: async (companyId: string, image: File) => {
    const formData = new FormData();
    formData.append('image', image);
    const response = await axiosClient.post(`/admin/companies/${companyId}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Uploads or replaces the company cover image (`image` field, max 4 MB).
   * @param companyId - Company ULID
   * @param image - Image file
   */
  uploadCompanyCover: async (companyId: string, image: File) => {
    const formData = new FormData();
    formData.append('image', image);
    const response = await axiosClient.post(`/admin/companies/${companyId}/cover`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
