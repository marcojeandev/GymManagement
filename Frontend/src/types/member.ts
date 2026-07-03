export interface Member {
  id: number;
  firstname: string;
  middlename?: string;
  lastname: string;
  suffix?: string;
  email: string;
  contact: string;
  address: string;
  sex: 'male' | 'female';
  profile?: string;
  qr_code?: string;
  membership_status?: boolean;
  contract_status?: boolean;
  created_at: string;
  membership_fee?: {
    id: number;
    membership_id: number;
    payment_type: 'cash' | 'gcash';
    payment_amount: number;
    payment_status: 'pending' | 'paid' | 'failed';
    or_number?: string;
    transaction_id?: string;
    paid_at?: string;
  };
}

export interface MembershipPricing {
  id: number;
  name: string;
  price: number;
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
  membership_id: string;
  payment_type: 'cash' | 'gcash';
  payment_amount: string;
  or_number: string;
  transaction_id: string;
  payment_status: 'pending' | 'paid' | 'failed';
  paid_at: string;
  password: string;
  profile: File | null;
}