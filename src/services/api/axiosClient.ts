import axios from 'axios';

/**
 * Shared Axios instance for the Trademond Dashboard.
 *
 * - Reads JWT from localStorage and attaches it as a Bearer token.
 * - Adds no-cache headers to prevent stale responses.
 * - Provides a response error interceptor for consistent error handling.
 */

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://trademond.net/api/v1';
export const API_ROOT = BASE_URL.replace('/v1', '');

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
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'API Error';
    return Promise.reject(new Error(message));
  },
);

export default axiosClient;
