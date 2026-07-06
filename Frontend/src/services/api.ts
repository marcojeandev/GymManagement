import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: add token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Check if system is configured (settings exist)
export const checkSystemStatus = async (): Promise<{ configured: boolean }> => {
  try {
    const response = await api.get('/settings');
    const data = response.data?.data;
    // If the gym settings exist and have a gym_name, the system is configured
    if (data && data.gym_name) {
      return { configured: true };
    }
    // Otherwise, treat as unconfigured (data might be null or empty)
    return { configured: false };
  } catch (error: any) {
    // 404 means definitely unconfigured
    if (error.response?.status === 404) {
      return { configured: false };
    }
    // For any other error (network, 500, etc.), treat as unconfigured (safe fallback)
    console.warn('System status check failed:', error);
    return { configured: false };
  }
};

export default api;