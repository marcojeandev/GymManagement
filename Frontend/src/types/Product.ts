export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  quantity: number;
  sold: number;
  image: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductFilters {
  search?: string;
  per_page?: number;
  page?: number;
}

export interface ProductFormData{
    
}