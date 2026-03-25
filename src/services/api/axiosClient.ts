import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { parseRefreshResponse } from '@/lib/api-auth-payload';

/**
 * Shared Axios instance for the Trademond Dashboard (versioned admin API under `/api/v1`).
 *
 * - Attaches the access token from {@link ACCESS_TOKEN_KEY} on each request.
 * - Normalizes JSON:API list/detail `data` payloads where applicable.
 * - On `401`, attempts `POST /api/refresh` with the refresh token, then retries once.
 */

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://trademond.net/api/v1';
export const API_ROOT = BASE_URL.replace('/v1', '');

/** localStorage key for the Sanctum access token (sent as Bearer on admin API calls). */
export const ACCESS_TOKEN_KEY = 'trademond_token';

/** localStorage key for the refresh token (sent only to `POST /api/refresh`). */
export const REFRESH_TOKEN_KEY = 'trademond_refresh_token';

/**
 * Bare client for `/api/*` routes without dashboard interceptors (refresh call).
 */
const refreshAxios = axios.create({
  baseURL: API_ROOT,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

/**
 * Flattens a JSON:API resource object that has `attributes` (and optionally
 * `relationships`) into a single flat object. Items that are already flat
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
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Clears auth storage and sends the user to the login page.
 */
function clearSessionAndRedirectToLogin(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  delete axiosClient.defaults.headers.common.Authorization;
  const path = window.location.pathname;
  if (!path.endsWith('/login') && !path.includes('/login')) {
    window.location.href = '/login';
  }
}

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
  async (error: AxiosError) => {
    const originalConfig = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    if (status !== 401 || !originalConfig) {
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ||
        error.message ||
        'API Error';
      return Promise.reject(new Error(message));
    }

    const url = String(originalConfig.url ?? '');
    const base = originalConfig.baseURL ?? '';
    const absolute = url.startsWith('http') ? url : `${base}${url}`;

    if (
      originalConfig._retry ||
      url.includes('/refresh') ||
      absolute.includes('/refresh') ||
      url.includes('/admin/login') ||
      absolute.includes('/admin/login')
    ) {
      clearSessionAndRedirectToLogin();
      return Promise.reject(error);
    }

    const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refresh) {
      clearSessionAndRedirectToLogin();
      return Promise.reject(error);
    }

    try {
      const res = await refreshAxios.post('/refresh', null, {
        headers: { Authorization: `Bearer ${refresh}` },
      });
      const tokens = parseRefreshResponse(res.data);
      if (!tokens?.accessToken) {
        throw new Error('Invalid refresh payload');
      }
      localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
      if (tokens.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
      }
      axiosClient.defaults.headers.common.Authorization = `Bearer ${tokens.accessToken}`;
      originalConfig._retry = true;
      originalConfig.headers.Authorization = `Bearer ${tokens.accessToken}`;
      return axiosClient(originalConfig);
    } catch {
      clearSessionAndRedirectToLogin();
      return Promise.reject(error);
    }
  },
);

export default axiosClient;
