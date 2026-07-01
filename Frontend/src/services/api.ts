import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
export const STORAGE_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '/storage') : 'http://localhost:8000/storage';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Interceptor: Add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================
// AUTH SERVICE
// ============================================
export const authService = {
  login: (email: string, password: string) =>
    api.post('/login', { email, password }),
};

// ============================================
// USER SERVICE
// ============================================
export const userService = {
  getUser: () =>
    api.get('/user'),
};

// ============================================
// SETTINGS SERVICE
// ============================================
export const settingsService = {
    getSettings: () => api.get('/settings'),
    updateSettings: (data: FormData) => api.post('/settings', data, {
        headers: { 'Content-Type': undefined }
    }),
};

export default api;