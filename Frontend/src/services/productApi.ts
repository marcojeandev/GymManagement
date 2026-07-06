import api from './api';
import type { Product, ProductFilters } from '../types/Product';

export const productApi = {
  async getProducts(filters: ProductFilters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.per_page) params.append('per_page', String(filters.per_page));
    if (filters.page) params.append('page', String(filters.page));
    const response = await api.get(`/admin/products?${params.toString()}`);
    return response.data.data;
  },

  async getProduct(id: number) {
    const response = await api.get(`/admin/products/${id}`);
    return response.data.data;
  },

  async createProduct(data: FormData) {
    const response = await api.post('/admin/products', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async updateProduct(id: number, data: FormData) {
    const response = await api.post(`/admin/products/${id}?_method=PUT`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async deleteProduct(id: number) {
    await api.delete(`/admin/products/${id}`);
  },
};