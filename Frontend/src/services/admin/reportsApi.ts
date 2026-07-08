import api from '../../services/api';

export const reportsApi = {
  async getOverview() {
    const response = await api.get('/admin/reports/overview');
    return response.data;
  },

  async getMemberGrowth(months: number = 12) {
    const response = await api.get(`/admin/reports/member-growth?months=${months}`);
    return response.data;
  },

  async getSalesTrend(days: number = 30) {
    const response = await api.get(`/admin/reports/sales-trend?days=${days}`);
    return response.data;
  },

  async getTopProducts(limit: number = 5) {
    const response = await api.get(`/admin/reports/top-products?limit=${limit}`);
    return response.data;
  },

  async getAttendanceTrend(days: number = 30) {
    const response = await api.get(`/admin/reports/attendance-trend?days=${days}`);
    return response.data;
  },

  async getSalesByPaymentType() {
    const response = await api.get('/admin/reports/sales-by-payment');
    return response.data;
  },

  async getMembershipDistribution() {
    const response = await api.get('/admin/reports/membership-distribution');
    return response.data;
  },

  async getContractDistribution() {
    const response = await api.get('/admin/reports/contract-distribution');
    return response.data;
  },

  async getAttendanceDistribution(start: string, end: string) {
    const response = await api.get(`/admin/reports/attendance-distribution?start=${start}&end=${end}`);
    return response.data;
  },

  async getRevenue(start: string, end: string) {
    const response = await api.get(`/admin/reports/revenue?start=${start}&end=${end}`);
    return response.data;
  },

  async clearCache() {
    const response = await api.post('/admin/reports/clear-cache');
    return response.data;
  },
};