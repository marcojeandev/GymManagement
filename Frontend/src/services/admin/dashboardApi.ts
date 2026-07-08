import api from '../../services/api';

export const dashboardApi = {
  async getDashboard() {
    const response = await api.get('/admin/dashboard');
    console.log('📡 Dashboard API Response:', response.data);
    
    if (response.data && response.data.status === 1) {
      return response.data.data;
    }
    return response.data;
  },

  async getSalesTrend(days: number = 7) {
    const response = await api.get(`/admin/sales-trend?days=${days}`);
    console.log('📡 Sales Trend API Response:', response.data);
    
    if (response.data && response.data.status === 1) {
      return response.data.data;
    }
    return response.data;
  },
};