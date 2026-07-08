import api from '.././api';
import type { WalkinAttendanceFilters } from '../../types/WalkinAttendance';

export const walkinAttendanceApi = {
  async getAttendances(filters: WalkinAttendanceFilters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.per_page) params.append('per_page', String(filters.per_page));
    if (filters.page) params.append('page', String(filters.page));
    const response = await api.get(`/cashier/walkin-attendance?${params.toString()}`);
    return response.data.data;
  },

  async getAttendance(id: number) {
    const response = await api.get(`/cashier/walkin-attendance/${id}`);
    return response.data.data;
  },

  async createAttendance(data: FormData) {
    const response = await api.post('/cashier/walkin-attendance', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async updateAttendance(id: number, data: FormData) {
    const response = await api.post(`/cashier/walkin-attendance/${id}?_method=PUT`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async deleteAttendance(id: number) {
    await api.delete(`/cashier/walkin-attendance/${id}`);
  },
};