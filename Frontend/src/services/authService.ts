import api from './api';

export const authService = {
  login: (email: string, password: string) =>
    api.post('/login', { email, password }),

  logout: () => api.post('/logout'),

  user: () => api.get('/user'),
};