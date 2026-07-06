export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'cashier';
  account_status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface UserFilters {
  search?: string;
  per_page?: number;
  page?: number;
}