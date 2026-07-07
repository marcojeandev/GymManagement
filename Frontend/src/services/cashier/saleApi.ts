import api from '.././api';
import type { Sale, SaleFilters } from '../../types/Sale';

export const saleApi = {
  async getSales(filters: SaleFilters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.per_page) params.append('per_page', String(filters.per_page));
    if (filters.page) params.append('page', String(filters.page));
    const response = await api.get(`/admin/sales?${params.toString()}`);
    return response.data.data;
  },

  async getSale(id: number) {
    const response = await api.get(`/admin/sales/${id}`);
    return response.data.data;
  },

  async createSale(data: FormData) {
    const response = await api.post('/admin/sales', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async updateSale(id: number, data: FormData) {
    const response = await api.post(`/admin/sales/${id}?_method=PUT`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async deleteSale(id: number) {
    await api.delete(`/admin/sales/${id}`);
  },
};