export interface WalkinInfo {
  id: number;
  firstname: string;
  middlename: string | null;
  lastname: string;
  suffix: string | null;
  email: string | null;
  contact: string;
  total_visits: number;
  created_at: string;
  updated_at: string;
  full_name?: string; // computed on backend
}

export interface WalkinInfoFilters {
  search?: string;
  per_page?: number;
  page?: number;
}