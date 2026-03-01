import apiClient, { API_ROOT } from './api';
import { LoginResponse, UserProfileResponse } from '../types/api';

export const authService = {
  login: async (credentials: any) => {
    // Main project uses /api/login without v1
    const response = await apiClient.post<LoginResponse>(`${API_ROOT}/login`, {
      ...credentials,
      platform: 'web'
    });
    
    if (response.data.status === 'success' && response.data.data?.token) {
      const token = response.data.data.token;
      localStorage.setItem('trademond_token', token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get<UserProfileResponse>('/me');
    const userData = response.data.data;
    
    return {
      id: userData.id,
      name: userData.attributes.name,
      email: userData.attributes.email,
      avatar: userData.attributes.profilePhoto,
      role: userData.attributes.role || 'Admin',
      phone: userData.attributes.phone,
      jobTitle: userData.attributes.jobTitle
    };
  },

  updateProfile: async (id: string | number, data: any) => {
    // Uses API_ROOT since /user update might be outside /v1 or consistent with main app
    // Actually, userService uses /user (under /v1). Let's stay consistent.
    const response = await apiClient.put(`/user/${id}`, data);
    return response.data;
  },

  uploadAvatar: async (id: string | number, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiClient.post(`/user/${id}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('trademond_token');
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// Initialize token if exists
const token = localStorage.getItem('trademond_token');
if (token) {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}
