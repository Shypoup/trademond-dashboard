import axiosClient from '@api/axiosClient';
import { CuratedList, BilingualText, ApiResponse } from '@data-types/api';

/** Request body for creating or updating a curated list. */
interface CuratedListPayload {
  name?: BilingualText;
  headline?: BilingualText;
  description?: BilingualText;
  type?: 'companies' | 'products' | 'services';
  slug?: string;
  position?: number;
  max_items?: number;
  active?: boolean;
}

/**
 * Admin service for managing curated lists and their items.
 * All endpoints operate under `/admin/curated-lists`.
 */
export const curatedListService = {
  /**
   * Fetches a paginated list of curated lists.
   * @param params - Query params (e.g. `filter[type]`, `filter[published]`, `filter[active]`, `filter[slug]`, `sort`).
   */
  getLists: async (params?: Record<string, unknown>) => {
    const response = await axiosClient.get<ApiResponse<CuratedList>>('/admin/curated-lists', { params });
    return response.data;
  },

  /**
   * Fetches a single curated list by ID.
   * @param id - The curated list ULID.
   */
  getList: async (id: string) => {
    const response = await axiosClient.get<{ data: CuratedList }>(`/admin/curated-lists/${id}`);
    return response.data;
  },

  /**
   * Creates a new curated list.
   * @param data - The curated list payload.
   */
  createList: async (data: CuratedListPayload) => {
    const response = await axiosClient.post('/admin/curated-lists', data);
    return response.data;
  },

  /**
   * Updates an existing curated list.
   * @param id   - The curated list ULID.
   * @param data - Fields to update.
   */
  updateList: async (id: string, data: Partial<CuratedListPayload>) => {
    const response = await axiosClient.patch(`/admin/curated-lists/${id}`, data);
    return response.data;
  },

  /**
   * Soft-deletes a curated list.
   * @param id - The curated list ULID.
   */
  deleteList: async (id: string) => {
    const response = await axiosClient.delete(`/admin/curated-lists/${id}`);
    return response.data;
  },

  /**
   * Restores a previously soft-deleted curated list.
   * @param id - The curated list ULID.
   */
  restoreList: async (id: string) => {
    const response = await axiosClient.post(`/admin/curated-lists/${id}/restore`);
    return response.data;
  },

  /**
   * Reorders all curated lists by the given ULID sequence.
   * @param lists - Ordered array of curated list ULIDs.
   */
  reorderLists: async (lists: string[]) => {
    const response = await axiosClient.patch('/admin/curated-lists/reorder', { lists });
    return response.data;
  },

  /**
   * Sets the published state of a curated list.
   * @param id        - The curated list ULID.
   * @param published - Whether the list should be published.
   */
  setPublished: async (id: string, published: boolean) => {
    const response = await axiosClient.patch(`/admin/curated-lists/${id}/published`, { published });
    return response.data;
  },

  /**
   * Toggles the published state of a curated list.
   * @param id - The curated list ULID.
   */
  togglePublished: async (id: string) => {
    const response = await axiosClient.post(`/admin/curated-lists/${id}/published/toggle`);
    return response.data;
  },

  // ─── List Items ──────────────────────────────────────────

  /**
   * Adds an item to a curated list.
   * @param listId - The curated list ULID.
   * @param data   - Item ID and optional position.
   */
  addItem: async (listId: string, data: { item_id: string; position?: number }) => {
    const response = await axiosClient.post(`/admin/curated-lists/${listId}/items`, data);
    return response.data;
  },

  /**
   * Removes an item from a curated list.
   * @param listId - The curated list ULID.
   * @param itemId - The item ULID to remove.
   */
  removeItem: async (listId: string, itemId: string) => {
    const response = await axiosClient.delete(`/admin/curated-lists/${listId}/items/${itemId}`);
    return response.data;
  },

  /**
   * Reorders items within a curated list.
   * @param listId - The curated list ULID.
   * @param items  - Ordered array of item ULIDs.
   */
  reorderItems: async (listId: string, items: string[]) => {
    const response = await axiosClient.patch(`/admin/curated-lists/${listId}/items/reorder`, { items });
    return response.data;
  },
};
