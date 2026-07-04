export interface Contract {
  id: number;
  members_id: number;
  contract_id: number;
  contract_from: string | null;   // renamed
  contract_to: string | null;     // renamed
  payment_type: 'cash' | 'gcash';
  payment_amount: number | null;
  or_number: string | null;
  transaction_id: string | null;
  payment_status: 'pending' | 'paid' | 'failed';
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  member?: {
    id: number;
    firstname: string;
    middlename: string | null;
    lastname: string;
    suffix: string | null;
    contract_status: string;
  };
  contract_pricing?: {
    id: number;
    title: string;
    price: number;
    description: string;
    duration_months: number;
  };
  // computed (optional)
  status?: 'active' | 'expired';
}

export interface ContractPricing {
  id: number;
  title: string;
  price: number;
  description: string;
  duration_months: number;
}

export interface ContractFilters {
  member_id?: number;
  payment_status?: string;
  per_page?: number;
  page?: number;
}