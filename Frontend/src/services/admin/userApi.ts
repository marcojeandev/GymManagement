import api from '.././api';
import type { User, UserFilters } from '../../types/User';

export const userApi = {
  async getUsers(filters: UserFilters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.per_page) params.append('per_page', String(filters.per_page));
    if (filters.page) params.append('page', String(filters.page));
    const response = await api.get(`/cashier/users?${params.toString()}`);
    return response.data.data;
  },

  async getUser(id: number) {
    const response = await api.get(`/cashier/users/${id}`);
    return response.data.data;
  },

  async createUser(data: FormData) {
    const response = await api.post('/cashier/users', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async updateUser(id: number, data: FormData) {
    const response = await api.post(`/cashier/users/${id}?_method=PUT`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async changePassword(id: number, data: { password: string; password_confirmation: string }) {
    const response = await api.put(`/cashier/users/${id}/password`, data);
    return response.data;
  },

  async deleteUser(id: number) {
    await api.delete(`/cashier/users/${id}`);
  },
};