export interface DashboardData {
  members: {
    total: number;
    active: number;
    new_this_month: number;
  };
  contracts: {
    active: number;
    expiring_soon: number;
  };
  sales: {
    today: number;
    this_month: number;
    last_week: number;
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
}

export interface DashboardTrend {
  labels: string[];
  values: number[];
}