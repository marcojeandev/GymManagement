import api from '.././api';

export interface MembershipPrice {
  id: number;
  price: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface ContractPrice {
  id: number;
  price: number;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface GymSetting {
  id: number;
  gym_name: string;
  logo: string | null;
  description: string | null;
  location: string | null;
  email: string | null;
  contact: string | null;
  social_links: any;
  gallery: any;
  features: any;
  pricing: any;
  favicon: string | null;
  primary_color: string;
  secondary_color: string;
  created_at: string;
  updated_at: string;
}

export const systemSettingsApi = {
  // ---------- GYM ----------
 async getGymSettings(): Promise<GymSetting | null> {
  try {
    const response = await api.get('/cashier/gym-settings');
    return response.data.data;
  } catch (error) {
    console.warn('Backend unavailable, using fallback settings');
    return null; // or return default settings
  }
},

  async getPublicSettings(): Promise<GymSetting | null> {
    try {
      const response = await api.get('/settings');
      return response.data.data;
    } catch {
      return null;
    }
  },

  async updateSystemSettings(data: FormData): Promise<GymSetting> {
    const response = await api.post('/cashier/system-settings', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  // ---------- MEMBERSHIP ----------
  async getMembershipPrice(): Promise<MembershipPrice | null> {
    try {
      const response = await api.get('/cashier/membership-price');
      return response.data.data;
    } catch {
      return null;
    }
  },

  async updateMembershipPrice(data: { price: number; description: string }): Promise<MembershipPrice> {
    const response = await api.post('/cashier/membership-fee', data);
    return response.data.data;
  },

  // ---------- CONTRACT PRICES (full CRUD) ----------
  async getContractPrices(): Promise<ContractPrice[]> {
    const response = await api.get('/cashier/contract-prices');
    return response.data.data;
  },

  async createContractPrice(data: { title: string; price: number; description: string }): Promise<ContractPrice> {
    const response = await api.post('/cashier/contract-prices', data);
    return response.data.data;
  },

  async updateContractPrice(id: number, data: Partial<ContractPrice>): Promise<ContractPrice> {
    const response = await api.put(`/cashier/contract-prices/${id}`, data);
    return response.data.data;
  },

  async deleteContractPrice(id: number): Promise<void> {
    await api.delete(`/cashier/contract-prices/${id}`);
  },

  // ---------- DEPRECATED: single contract price (kept for compatibility, but not used) ----------
  async getContractPrice(): Promise<ContractPrice | null> {
    try {
      const response = await api.get('/cashier/contract-prices');
      return response.data.data;
    } catch {
      return null;
    }
  },
};