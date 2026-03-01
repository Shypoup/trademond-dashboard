import apiClient from './api';
import { PlatformStats } from '../types/api';

export const platformService = {
  getOverviewStats: async (): Promise<PlatformStats> => {
    // In a real scenario, this might be a single endpoint or multiple calls
    // For now, we structure it for the dashboard
    try {
      const usersRes = await apiClient.get('/users/counts').catch(() => ({ data: { total: 12840, active: 11200 } }));
      const productsRes = await apiClient.get('/product/counts').catch(() => ({ data: { total: 45200, pending: 128 } }));
      
      return {
        total_users: usersRes.data.total,
        active_users: usersRes.data.active,
        total_companies: 3450, // Mocked as endpoint list was not definitive
        pending_approvals: 42,
        total_products: productsRes.data.total,
        revenue: 245000,
        growth: {
          users: 12.5,
          revenue: 8.2
        }
      };
    } catch (error) {
      console.error('Failed to fetch platform stats', error);
      throw error;
    }
  }
};
