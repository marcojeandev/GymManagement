import api from './api';
import type { Member, MemberFilters } from '../types/Members';

export const memberApi = {
  async getMembers(filters: MemberFilters = {}) {
    const params = new URLSearchParams();
    if (filters.sex) params.append('sex', filters.sex);
    if (filters.membership_status) params.append('membership_status', filters.membership_status);
    if (filters.per_page) params.append('per_page', String(filters.per_page));
    if (filters.page) params.append('page', String(filters.page));
    if (filters.search) params.append('search', filters.search);
    const response = await api.get(`/admin/members?${params.toString()}`);
    return response.data.data;
  },

  async getMember(id: number) {
    const response = await api.get(`/admin/members/${id}`);
    return response.data.data;
  },

  async createMember(data: FormData) {
    const response = await api.post('/admin/members', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async updateMember(id: number, data: FormData) {
    const response = await api.post(`/admin/members/${id}?_method=PUT`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async deleteMember(id: number) {
    await api.delete(`/admin/members/${id}`);
  },
};