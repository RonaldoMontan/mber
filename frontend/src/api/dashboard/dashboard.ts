import api from '../axios.config';
import type { DashboardStats, UserStats } from './dashboard.types';

export const dashboard = {
  getStats: async (): Promise<DashboardStats> => {
    return await api.get('/api/dashboard/stats/');
  },

  getUserStats: async (): Promise<UserStats> => {
    return await api.get('/api/dashboard/user-stats/');
  },
};
