import api from './api';
import type { Attendance, AttendanceFilters } from '../types/Attendance';

export const attendanceApi = {
    async getAttendances(filters: AttendanceFilters = {}) {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.member_id) params.append('member_id', String(filters.member_id));
        if (filters.date) params.append('date', filters.date);   // <-- add this
        if (filters.per_page) params.append('per_page', String(filters.per_page));
        if (filters.page) params.append('page', String(filters.page));
        const response = await api.get(`/admin/attendance?${params.toString()}`);
        return response.data.data;
        },
  async getAttendance(id: number) {
    const response = await api.get(`/admin/attendance/${id}`);
    return response.data.data;
  },

  async scanQR(qr_code: string) {
    const response = await api.post('/admin/attendance/scan', { qr_code });
    return response.data;
  },

  async createAttendance(data: FormData) {
    const response = await api.post('/admin/attendance', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async updateAttendance(id: number, data: FormData) {
    const response = await api.post(`/admin/attendance/${id}?_method=PUT`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async deleteAttendance(id: number) {
    await api.delete(`/admin/attendance/${id}`);
  },
};