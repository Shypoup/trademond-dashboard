import axios from 'axios';
import axiosClient, { API_ROOT, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@api/axiosClient';
import {
  parseLoginOrRegisterResponse,
  parseMeResponse,
} from '@/lib/api-auth-payload';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  country_id: string | number;
  platform?: string;
}

export type LoginResult =
  | { success: true }
  | { success: false; message: string };

/**
 * Public (non-admin) registration — uses `POST /api/register` without the dashboard Axios stack
 * so a stale access token cannot interfere.
 */
export const authService = {
  /**
   * Authenticates a staff admin via `POST /api/admin/login`.
   * Persists access and refresh tokens; non-admin users receive 403 from the API.
   *
   * @param credentials - Email and password
   */
  login: async (credentials: LoginCredentials): Promise<LoginResult> => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    delete axiosClient.defaults.headers.common.Authorization;

    try {
      const { data } = await axios.post<unknown>(
        `${API_ROOT}/admin/login`,
        { ...credentials, platform: 'web' },
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );

      const parsed = parseLoginOrRegisterResponse(data);
      if (!parsed) {
        return { success: false, message: 'Invalid response from server' };
      }

      localStorage.setItem(ACCESS_TOKEN_KEY, parsed.accessToken);
      if (parsed.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, parsed.refreshToken);
      }
      axiosClient.defaults.headers.common.Authorization = `Bearer ${parsed.accessToken}`;
      return { success: true };
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const status = e.response?.status;
        const msg = (e.response?.data as { message?: string } | undefined)?.message;
        if (status === 403) {
          return {
            success: false,
            message: msg || 'Unauthorized — admin access only.',
          };
        }
        return {
          success: false,
          message: msg || e.message || 'Authentication failed',
        };
      }
      return { success: false, message: 'Network error' };
    }
  },

  /**
   * Registers a new user (public API). Not used by the admin login UI by default.
   *
   * @param data - Registration payload
   */
  register: async (data: RegisterPayload) => {
    const response = await axios.post(`${API_ROOT}/register`, {
      ...data,
      platform: data.platform ?? 'web',
    });
    return response.data;
  },

  /**
   * Revokes the token family via `POST /api/admin/logout` and clears local tokens.
   */
  logout: async () => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    try {
      if (token) {
        await axios.post(
          `${API_ROOT}/admin/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          },
        );
      }
    } catch {
      /* still clear client session */
    } finally {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      delete axiosClient.defaults.headers.common.Authorization;
    }
  },

  /**
   * Fetches the authenticated user from `GET /api/me`.
   *
   * @returns Normalized profile for sidebar / profile pages
   */
  getProfile: async () => {
    const response = await axiosClient.get<unknown>(`${API_ROOT}/me`);
    const me = parseMeResponse(response.data);
    if (!me) {
      throw new Error('Invalid profile response');
    }

    return {
      id: me.id,
      name: me.name ?? '',
      email: me.email ?? '',
      avatar: me.profilePhoto ?? null,
      role: me.roleLabel ?? 'Admin',
      phone: me.phone,
      jobTitle: me.jobTitle,
    };
  },

  /**
   * Updates the authenticated user's profile (legacy route under `/api/v1`).
   *
   * @param id - User id
   * @param data - Fields to update
   */
  updateProfile: async (id: string | number, data: Record<string, unknown> | object) => {
    const response = await axiosClient.put(`/user/${id}`, data);
    return response.data;
  },

  /**
   * Uploads a profile photo for the user.
   *
   * @param id - User id
   * @param file - Image file
   */
  uploadAvatar: async (id: string | number, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await axiosClient.post(`/user/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

const existingAccess = localStorage.getItem(ACCESS_TOKEN_KEY);
if (existingAccess) {
  axiosClient.defaults.headers.common.Authorization = `Bearer ${existingAccess}`;
}
