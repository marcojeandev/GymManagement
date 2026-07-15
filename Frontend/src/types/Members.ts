export interface Member {
  id: number;
  firstname: string;
  middlename: string | null;
  lastname: string;
  suffix: string | null;
  email: string;
  contact: string;
  address: string;
  qr_code: string;
  profile: string | null;
  sex: 'male' | 'female';
  membership_status: 'active' | 'expired';
  contract_status: 'active' | 'expired' | 'pending';
  created_at: string;
  updated_at: string;
  membership_fee?: MembershipFee | null;
}

export interface MembershipFee {
  id: number;
  members_id: number;
  membership_id: number;
  payment_type: 'cash' | 'gcash';
  payment_amount: number | null;
  total_amount: number | null;
  or_number: string | null;
  transaction_id: string | null;
  payment_status: 'pending' | 'paid' | 'failed';
  paid_at: string | null;
}

export interface MemberFilters {
  sex?: 'male' | 'female';
  membership_status?: 'active' | 'expired';
  per_page?: number;
  page?: number;
  search?: string;
}

export interface MemberFormData {
  firstname: string;
  middlename: string;
  lastname: string;
  suffix: string;
  email: string;
  contact: string;
  address: string;
  sex: 'male' | 'female';
  membership_status: 'active' | 'expired';
  contract_status: 'active' | 'expired' | 'pending';
  membership_id: number | '';
  payment_type: 'cash' | 'gcash';
  payment_amount: number | '';
  total_amount: number | '';
  or_number: string;
  transaction_id: string;
  payment_status: 'pending' | 'paid' | 'failed';
  paid_at: string;
  profile: File | null;
}
