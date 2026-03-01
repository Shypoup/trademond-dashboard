import axios from 'axios';

/**
 * Core API utility for Trademond Dashboard using Axios.
 * Configured with no-caching headers as per user requirements.
 */

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://trademond.net/api/v1';
export const API_ROOT = BASE_URL.replace('/v1', '');

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
});

// Response interceptor for consistent error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'API Error';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
