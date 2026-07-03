import api from '../api';

export const settingsService = {
  // ✅ Separated GET endpoints
  getMembershipPrice: () =>
    api.get('/admin/membership-price'),

  getContractPrice: () =>
    api.get('/admin/contract-price'),

  getGymSettings: () =>
    api.get('/admin/gym-settings'),

  // 🔄 Update endpoints (keep as before – adjust if needed)
  updateMembershipFee: (data: any) =>
    api.post('/admin/membership-fee', data),

  updateContractPrice: (data: any) =>
    api.post('/admin/contract-price', data),

  updateSystemSettings: (data: any) =>
    api.post('/admin/system-settings', data),
};