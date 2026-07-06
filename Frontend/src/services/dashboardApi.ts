import api from './api';
import type { DashboardData, DashboardTrend } from '../types/Dashboard';

export const dashboardApi = {
  /**
   * Get main dashboard statistics (overview, members, sales, attendance, etc.)
   */
  async getDashboard(): Promise<DashboardData> {
    const response = await api.get('/admin/dashboard');
    return response.data.data;
  },

  /**
   * Get sales trend data for the last N days (default 7)
   */
  async getSalesTrend(days: number = 7): Promise<DashboardTrend> {
    const response = await api.get(`/admin/reports/sales-trend?days=${days}`);
    return response.data.data;
  },

  /**
   * Get attendance trend for the last N days (default 7)
   */
  async getAttendanceTrend(days: number = 7): Promise<DashboardTrend> {
    const response = await api.get(`/admin/reports/attendance-trend?days=${days}`);
    return response.data.data;
  },
};