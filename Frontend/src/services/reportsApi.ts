import api from './api';

export const reportsApi = {
  async getOverview() {
    const response = await api.get('/admin/reports/overview');
    return response.data.data;
  },

  async getMemberGrowth(months: number = 12) {
    const response = await api.get(`/admin/reports/member-growth?months=${months}`);
    return response.data.data;
  },

  async getSalesTrend(days: number = 30) {
    const response = await api.get(`/admin/reports/sales-trend?days=${days}`);
    return response.data.data;
  },

  async getTopProducts(limit: number = 5) {
    const response = await api.get(`/admin/reports/top-products?limit=${limit}`);
    return response.data.data;
  },

  async getAttendanceTrend(days: number = 30) {
    const response = await api.get(`/admin/reports/attendance-trend?days=${days}`);
    return response.data.data;
  },

  async getSalesByPaymentType() {
    const response = await api.get('/admin/reports/sales-by-payment');
    return response.data.data;
  },

  async getMembershipDistribution() {
    const response = await api.get('/admin/reports/membership-distribution');
    return response.data.data;
  },

  async getContractDistribution() {
    const response = await api.get('/admin/reports/contract-distribution');
    return response.data.data;
  },

  // ✅ FIXED: correctly handles date parameters
  async getAttendanceDistribution(start?: string, end?: string) {
    const params = new URLSearchParams();
    if (start) params.append('start', start);
    if (end) params.append('end', end);
    const response = await api.get(`/admin/reports/attendance-distribution?${params.toString()}`);
    return response.data.data;
  },

  // ✅ FIXED: correctly handles date parameters
  async getRevenue(start?: string, end?: string) {
    const params = new URLSearchParams();
    if (start) params.append('start', start);
    if (end) params.append('end', end);
    const response = await api.get(`/admin/reports/revenue?${params.toString()}`);
    return response.data.data;
  },
};