import api from '.././api';
import type { MemberFilters } from '../../types/Members';

export const memberApi = {
  async getMembers(filters: MemberFilters = {}) {
    const params = new URLSearchParams();
    
    // Search parameter – backend likely uses 'search' to search name/email/contact
    if (filters.search) params.append('search', filters.search);
    
    // Sex filter – backend expects 'sex' with 'male' or 'female'
    if (filters.sex) params.append('sex', filters.sex);
    
    // Membership status filter – backend expects 'membership_status'
    if (filters.membership_status) params.append('membership_status', filters.membership_status);
    
    // Pagination
    if (filters.per_page) params.append('per_page', String(filters.per_page));
    if (filters.page) params.append('page', String(filters.page));
    
    const response = await api.get(`/admin/members?${params.toString()}`);
    return response.data.data; // returns { data: [...], current_page, last_page, ... }
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

  // For MemberSearchSelect (used in contracts)
  async getMembersSimple(filters: { search?: string } = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    params.append('per_page', '20');
    const response = await api.get(`/admin/members?${params.toString()}`);
    return response.data.data;
  },

  async getMemberByQR(qrCode: string) {
    const response = await api.get(`/admin/members/by-qr/${qrCode}`);
    return response.data;
  }
};