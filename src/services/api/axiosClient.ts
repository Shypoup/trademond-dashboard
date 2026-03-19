import axios from 'axios';

/**
 * Shared Axios instance for the Trademond Dashboard.
 *
 * - Reads JWT from localStorage and attaches it as a Bearer token.
 * - Adds no-cache headers to prevent stale responses.
 * - Normalizes JSON:API responses (flattens `attributes` / `relationships`).
 * - Provides a response error interceptor for consistent error handling.
 */

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://trademond.net/api/v1';
export const API_ROOT = BASE_URL.replace('/v1', '');

/**
 * Flattens a JSON:API resource object that has `attributes` (and optionally
 * `relationships`) into a single flat object.  Items that are already flat
 * are returned untouched.
 */
function normalizeItem(item: Record<string, unknown>): Record<string, unknown> {
  if (!item || typeof item !== 'object' || !('attributes' in item)) return item;

  const { attributes, relationships, ...rest } = item;
  const flat: Record<string, unknown> = {
    ...rest,
    ...(attributes as Record<string, unknown>),
  };

  if (relationships && typeof relationships === 'object') {
    for (const [key, value] of Object.entries(relationships as Record<string, unknown>)) {
      if (Array.isArray(value)) {
        flat[key] = value.map((v) =>
          v && typeof v === 'object' ? normalizeItem(v as Record<string, unknown>) : v,
        );
      } else if (value && typeof value === 'object') {
        flat[key] = normalizeItem(value as Record<string, unknown>);
      } else {
        flat[key] = value;
      }
    }
  }

  return flat;
}

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('trademond_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body === 'object' && 'data' in body) {
      if (Array.isArray(body.data)) {
        body.data = body.data.map((item: unknown) =>
          item && typeof item === 'object'
            ? normalizeItem(item as Record<string, unknown>)
            : item,
        );
      } else if (
        body.data &&
        typeof body.data === 'object' &&
        'attributes' in (body.data as Record<string, unknown>)
      ) {
        body.data = normalizeItem(body.data as Record<string, unknown>);
      }
    }
    return response;
  },
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'API Error';
    return Promise.reject(new Error(message));
  },
);

export default axiosClient;
