import axiosClient, { API_ROOT } from '@api/axiosClient';
import { LoginResponse, UserProfileResponse } from '@data-types/api';

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

export const authService = {
  /**
   * Authenticates a user with email and password.
   * Stores the JWT token in localStorage on success.
   * @param credentials - The user's email and password.
   */
  login: async (credentials: LoginCredentials) => {
    const response = await axiosClient.post<LoginResponse>(`${API_ROOT}/login`, {
      ...credentials,
      platform: 'web',
    });

    if (response.data.status === 'success' && response.data.data?.token) {
      const token = response.data.data.token;
      localStorage.setItem('trademond_token', token);
      axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    return response.data;
  },

  /**
   * Registers a new user account.
   * @param data - Registration payload including name, email, password, country, etc.
   */
  register: async (data: RegisterPayload) => {
    const response = await axiosClient.post(`${API_ROOT}/register`, {
      ...data,
      platform: data.platform ?? 'web',
    });
    return response.data;
  },

  /**
   * Logs the current user out by calling the server and clearing the local token.
   */
  logout: async () => {
    try {
      await axiosClient.post(`${API_ROOT}/logout`);
    } finally {
      localStorage.removeItem('trademond_token');
      delete axiosClient.defaults.headers.common['Authorization'];
    }
  },

  /**
   * Fetches the authenticated user's profile via GET /me.
   * @returns Normalised user profile object.
   */
  getProfile: async () => {
    const response = await axiosClient.get<UserProfileResponse>('/me');
    const userData = response.data.data;

    return {
      id: userData.id,
      name: userData.attributes.name,
      email: userData.attributes.email,
      avatar: userData.attributes.profilePhoto,
      role: userData.attributes.role || 'Admin',
      phone: userData.attributes.phone,
      jobTitle: userData.attributes.jobTitle,
    };
  },

  /**
   * Updates the authenticated user's profile.
   * @param id - The user ID.
   * @param data - Fields to update (name, email, etc.).
   */
  updateProfile: async (id: string | number, data: Record<string, unknown> | object) => {
    const response = await axiosClient.put(`/user/${id}`, data);
    return response.data;
  },

  /**
   * Uploads a new profile photo for the authenticated user.
   * @param id - The user ID.
   * @param file - The image file to upload.
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

const token = localStorage.getItem('trademond_token');
if (token) {
  axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}
