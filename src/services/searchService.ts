import axiosClient from '@api/axiosClient';

/** Indexable entity types for search operations. */
type SearchIndexType = 'companies' | 'products' | 'services';

/**
 * Admin service for managing the search engine (Meilisearch / Scout).
 * All endpoints operate under `/admin/search`.
 */
export const searchService = {
  /**
   * Fetches the current status of the search engine.
   */
  getStatus: async () => {
    const response = await axiosClient.get('/admin/search/status');
    return response.data;
  },

  /**
   * Fetches information about all search indexes.
   */
  listIndexes: async () => {
    const response = await axiosClient.get('/admin/search/indexes');
    return response.data;
  },

  /**
   * Triggers a full reindex of all entity types.
   */
  reindexAll: async () => {
    const response = await axiosClient.post('/admin/search/reindex-all');
    return response.data;
  },

  /**
   * Triggers a reindex for a specific entity type.
   * @param type - The entity type to reindex.
   */
  reindexByType: async (type: SearchIndexType) => {
    const response = await axiosClient.post(`/admin/search/reindex/${type}`);
    return response.data;
  },

  /**
   * Flushes (clears) the search index for a specific entity type.
   * @param type - The entity type to flush.
   */
  flushByType: async (type: SearchIndexType) => {
    const response = await axiosClient.post(`/admin/search/flush/${type}`);
    return response.data;
  },
};
