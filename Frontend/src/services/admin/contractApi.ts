import api from '.././api';
import type { ContractFilters, ContractPricing } from '../../types/Contract';

export const contractApi = {
  async getContracts(filters: ContractFilters = {}) {
    const params = new URLSearchParams();
    if (filters.member_id) params.append('member_id', String(filters.member_id));
    if (filters.payment_status) params.append('payment_status', filters.payment_status);
    if (filters.per_page) params.append('per_page', String(filters.per_page));
    if (filters.page) params.append('page', String(filters.page));
    const response = await api.get(`/admin/contracts?${params.toString()}`);
    return response.data.data; // returns { data: [...], current_page, last_page, ... }
  },

  async getContract(id: number) {
    const response = await api.get(`/admin/contracts/${id}`);
    return response.data.data;
  },

  async createContract(data: FormData) {
    const response = await api.post('/admin/contracts', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async updateContract(id: number, data: FormData) {
    const response = await api.post(`/admin/contracts/${id}?_method=PUT`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async deleteContract(id: number) {
    await api.delete(`/admin/contracts/${id}`);
  },

  async getContractPricing(): Promise<ContractPricing[]> {
    const response = await api.get('/admin/contract-prices');
    return response.data.data;
  },
};