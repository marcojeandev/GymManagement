export interface ProductSold {
  id: number;
  sales_id: number;
  product_id: number;
  quantity: number;
  price_at_sale: number;
  product?: {
    id: number;
    name: string;
  };
}

export interface Sale {
  id: number;
  paid_by: string;
  payment_type: 'cash' | 'gcash';
  or_number: string | null;
  transaction_id: string | null;
  payment_status: 'pending' | 'paid' | 'failed';
  payment_amount: number | null;   // customer tendered
  created_at: string;
  updated_at: string;
  product_sold?: ProductSold[];
  total?: number;    // computed total
  change?: number;   // computed change
}

export interface SaleFilters {
  search?: string;
  per_page?: number;
  page?: number;
}