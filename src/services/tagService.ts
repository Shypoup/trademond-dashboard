import axiosClient from '@api/axiosClient';
import type { ApiResponse } from '@data-types/api';

/**
 * Canonical admin tag row (`GET/PATCH /admin/tags`). Flattened JSON:API resource after axios normalization.
 */
export interface AdminTag {
  id: string;
  type?: string;
  /** Resolved label for the current locale (also see {@link AdminTag.translations}). */
  name: string;
  slug: string;
  status: 'active' | 'hidden';
  /** Laravel emits camelCase on attributes. */
  needsReview?: boolean;
  normalized?: string;
  translations?: {
    name?: { en?: string; ar?: string };
  };
  productsCount?: number;
  servicesCount?: number;
  synonymsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Synonym row under a tag (`GET/POST/DELETE .../synonyms`).
 */
export interface AdminTagSynonym {
  id: number;
  type?: string;
  value: string;
  locale: 'en' | 'ar' | null | string;
  normalized?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Meta returned by `GET /admin/tags/{ulid}/synonyms` when the list hits the cap.
 */
export interface TagSynonymsListMeta {
  limit: number;
  truncated: boolean;
}

export interface TagSynonymsListResponse {
  data: AdminTagSynonym[];
  meta: TagSynonymsListMeta;
}

/**
 * Query params for `GET /admin/tags` (Spatie QueryBuilder).
 */
export interface AdminTagsListParams extends Record<string, unknown> {
  page?: number;
  per_page?: number;
  sort?: string;
  'filter[status]'?: 'active' | 'hidden';
  'filter[needs_review]'?: boolean | '0' | '1' | 'true' | 'false';
  'filter[search]'?: string;
}

/** Payload for creating or patching a tag (`name` locales optional individually; API requires ≥ one non-empty overall). */
export interface AdminTagWritePayload {
  name?: { en?: string; ar?: string };
  slug?: string | null;
  status?: 'active' | 'hidden';
  needs_review?: boolean;
}

export interface CreateSynonymPayload {
  value: string;
  locale?: 'en' | 'ar' | null;
}

/**
 * Unwraps `{ data: T }` list/detail envelopes after JSON:API normalization.
 */
function unwrapResource<T>(body: unknown): T {
  if (body && typeof body === 'object' && 'data' in body) {
    const d = (body as { data: unknown }).data;
    if (d && typeof d === 'object' && !Array.isArray(d)) {
      return d as T;
    }
  }
  return body as T;
}

/**
 * Admin tag CRUD and synonyms under `/api/v1/admin/tags`.
 * Tag *proposals* use {@link tagProposalService} (`/admin/tag-proposals`).
 */
export const tagService = {
  /**
   * Paginated tag index with optional filters and sort.
   *
   * @param params - `per_page`, `filter[status]`, `filter[needs_review]`, `filter[search]`, `sort`, `page`
   */
  getTags: async (params?: AdminTagsListParams) => {
    const response = await axiosClient.get<ApiResponse<AdminTag>>('/admin/tags', { params });
    return response.data;
  },

  /**
   * Single tag with synonyms relation and usage counts (canonical shape from `show`).
   */
  getTag: async (tagUlid: string): Promise<AdminTag> => {
    const response = await axiosClient.get<{ data: AdminTag }>(`/admin/tags/${tagUlid}`);
    return unwrapResource<AdminTag>(response.data);
  },

  createTag: async (data: AdminTagWritePayload): Promise<AdminTag> => {
    const response = await axiosClient.post<{ data: AdminTag }>('/admin/tags', data);
    return unwrapResource<AdminTag>(response.data);
  },

  updateTag: async (tagUlid: string, data: AdminTagWritePayload): Promise<AdminTag> => {
    const response = await axiosClient.patch<{ data: AdminTag }>(`/admin/tags/${tagUlid}`, data);
    return unwrapResource<AdminTag>(response.data);
  },

  deleteTag: async (tagUlid: string): Promise<void> => {
    await axiosClient.delete(`/admin/tags/${tagUlid}`);
  },

  /**
   * Up to 200 synonyms; check {@link TagSynonymsListResponse.meta.truncated}.
   */
  listSynonyms: async (tagUlid: string): Promise<TagSynonymsListResponse> => {
    const response = await axiosClient.get<TagSynonymsListResponse>(`/admin/tags/${tagUlid}/synonyms`);
    return response.data;
  },

  createSynonym: async (tagUlid: string, data: CreateSynonymPayload): Promise<AdminTagSynonym> => {
    const response = await axiosClient.post<{ data: AdminTagSynonym }>(
      `/admin/tags/${tagUlid}/synonyms`,
      data,
    );
    return unwrapResource<AdminTagSynonym>(response.data);
  },

  deleteSynonym: async (tagUlid: string, synonymId: number): Promise<void> => {
    await axiosClient.delete(`/admin/tags/${tagUlid}/synonyms/${synonymId}`);
  },
};
