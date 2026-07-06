import api from './api';
import type { WalkinInfo, WalkinInfoFilters } from '../types/WalkinInfo';

export const walkinApi = {
  async getWalkins(filters: WalkinInfoFilters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.per_page) params.append('per_page', String(filters.per_page));
    if (filters.page) params.append('page', String(filters.page));
    const response = await api.get(`/admin/walkin-info?${params.toString()}`);
    return response.data.data;
  },

  async getWalkin(id: number) {
    const response = await api.get(`/admin/walkin-info/${id}`);
    return response.data.data;
  },

  async createWalkin(data: FormData) {
    const response = await api.post('/admin/walkin-info', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async updateWalkin(id: number, data: FormData) {
    const response = await api.post(`/admin/walkin-info/${id}?_method=PUT`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async deleteWalkin(id: number) {
    await api.delete(`/admin/walkin-info/${id}`);
  },
};