// File: src/services/admin/memberService.ts
import api from '../api';

export const memberService = {
  // ✅ Returns the members array directly (handles pagination)
  getMembers: async (params?: { sex?: string; membership_status?: boolean; per_page?: number }) => {
    try {
      const res = await api.get('/admin/members', { params });
      // Laravel pagination returns { data: [...], ... } inside the main data key.
      // So res.data.data is the pagination object; res.data.data.data is the members array.
      const membersArray = res.data.data?.data || [];
      return Array.isArray(membersArray) ? membersArray : [];
    } catch {
      return []; // ✅ Always returns an array, never null/undefined
    }
  },

  // Single member (returns full response – keep as is)
  getMember: (id: number | string) =>
    api.get(`/admin/members/${id}`),

  // Create
  createMember: (data: FormData) =>
    api.post('/admin/members', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Update
  updateMember: (id: number | string, data: FormData) =>
    api.post(`/admin/members/${id}?_method=PUT`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Delete
  deleteMember: (id: number | string) =>
    api.delete(`/admin/members/${id}`),
};