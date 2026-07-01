import api from './api';

export const adminService = {
  // Members
  getMembers: () => api.get('/admin/members'),
  getMember: (id: number | string) => api.get(`/admin/members/${id}`),
  createMember: (data: any) => api.post('/admin/members', data),
  updateMember: (id: number | string, data: any) => api.put(`/admin/members/${id}`, data),
  deleteMember: (id: number | string) => api.delete(`/admin/members/${id}`),

  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateMembershipFeePrice: (data: any) => api.post('/admin/settings', { ...data, type: 'MembershipFeePrice' }), // Using type field internally if needed, or backend relies on keys
  updateContractPrice: (data: any) => api.post('/admin/settings', { ...data, type: 'ContractPrice' }),
  updateSystemSettings: (data: any) => api.post('/admin/settings', { ...data, type: 'SystemSettings' }),

  // Mocked/Stubs for missing specific API routes but assumed standard resources based on migrations
  getContracts: () => api.get('/admin/contracts'),
  getProducts: () => api.get('/admin/products'),
  getSales: () => api.get('/admin/sales'),
  createSale: (data: any) => api.post('/admin/sales', data),
  getAttendance: () => api.get('/admin/attendance'),
  recordAttendance: (data: any) => api.post('/admin/attendance', data),
  getWalkIns: () => api.get('/admin/walk-ins'),
  getWalkInAttendance: () => api.get('/admin/walk-in-attendance'),
};
