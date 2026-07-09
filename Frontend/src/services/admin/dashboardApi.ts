// services/admin/dashboardApi.ts

import api from '../../services/api';

export const dashboardApi = {
  async getDashboard() {
    const response = await api.get('/admin/dashboard');
    if (response.data && response.data.status === 1) {
      return response.data.data;
    }
    return response.data;
  },

  async getSalesTrend(days: number = 7) {
    const response = await api.get(`/admin/sales-trend?days=${days}`);
    if (response.data && response.data.status === 1) {
      return response.data.data;
    }
    return response.data;
  },
};