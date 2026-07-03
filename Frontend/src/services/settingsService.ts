// File: src/services/settingsService.ts
import api from './api';

export const settingsService = {
  // Public endpoint (no auth) – used by Landing & Setup
  getSettings: () => api.get('/settings'),

  // Setup endpoint (no auth) – creates gym settings and admin user
  updateSettings: (data: FormData) =>
    api.post('/settings', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};