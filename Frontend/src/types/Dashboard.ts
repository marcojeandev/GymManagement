export interface DashboardData {
  members: {
    total: number;
    active: number;
    new_this_month: number;
  };
  contracts: {
    active: number;
    expiring_soon: number;
    revenue_today: number;
    revenue_this_month: number;
    revenue_last_week: number;
  };
  membership_fees: {
    revenue_today: number;
    revenue_this_month: number;
    revenue_last_week: number;
  };
  sales: {
    today: number;
    this_month: number;
    last_week: number;
    total_today: number;
    total_this_month: number;
    total_last_week: number;
  };
  attendance: {
    today: number;
    this_month: number;
  };
  walkins: {
    today: number;
    this_month: number;
  };
  recent_sales: Array<{
    id: number;
    paid_by: string;
    amount: number;
    or_number: string;
    created_at: string;
  }>;
  recent_contracts: Array<{
    id: number;
    member_name: string;
    amount: number;
    or_number: string;
    created_at: string;
  }>;
}

export interface DashboardTrend {
  labels: string[];
  values: number[];
  breakdown?: {
    sales: number[];
    contracts: number[];
    membership_fees: number[];
  };
}