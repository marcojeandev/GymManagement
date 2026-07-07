import api from '.././api';
import type { Contract, ContractFilters, ContractPricing } from '../../types/Contract';

export const contractApi = {
  async getContracts(filters: ContractFilters = {}) {
    const params = new URLSearchParams();
    if (filters.member_id) params.append('member_id', String(filters.member_id));
    if (filters.payment_status) params.append('payment_status', filters.payment_status);
    if (filters.per_page) params.append('per_page', String(filters.per_page));
    if (filters.page) params.append('page', String(filters.page));
    const response = await api.get(`/cashier/contracts?${params.toString()}`);
    return response.data.data; // returns { data: [...], current_page, last_page, ... }
  },

  async getContract(id: number) {
    const response = await api.get(`/cashier/contracts/${id}`);
    return response.data.data;
  },

  async createContract(data: FormData) {
    const response = await api.post('/cashier/contracts', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async updateContract(id: number, data: FormData) {
    const response = await api.post(`/cashier/contracts/${id}?_method=PUT`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async deleteContract(id: number) {
    await api.delete(`/cashier/contracts/${id}`);
  },

  async getContractPricing(): Promise<ContractPricing[]> {
    const response = await api.get('/cashier/contract-prices');
    return response.data.data;
  },
};