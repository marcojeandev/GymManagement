import api from './api';

export interface MembershipPrice {
  id: number;
  description: string;
  price: number;
  duration_months: number;
  created_at: string;
  updated_at: string;
}

export interface ContractPrice {
  id: number;
  title: string;
  price: number;
  description: string;
  duration_months: number;
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
  async getMembershipPrice(): Promise<MembershipPrice | null> {
    try {
      const response = await api.get('/admin/membership-price');
      return response.data.data;
    } catch {
      return null;
    }
  },

  async getContractPrice(): Promise<ContractPrice | null> {
    try {
      const response = await api.get('/admin/contract-price');
      return response.data.data;
    } catch {
      return null;
    }
  },

  async getGymSettings(): Promise<GymSetting | null> {
    try {
      const response = await api.get('/admin/gym-settings');
      return response.data.data;
    } catch {
      return null;
    }
  },

  async updateMembershipPrice(data: Partial<MembershipPrice>): Promise<MembershipPrice> {
    const response = await api.post('/admin/membership-fee', data);
    return response.data.data;
  },

  async updateContractPrice(data: Partial<ContractPrice>): Promise<ContractPrice> {
    const response = await api.post('/admin/contract-price', data);
    return response.data.data;
  },

  async updateSystemSettings(data: FormData): Promise<GymSetting> {
    const response = await api.post('/admin/system-settings', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },
};