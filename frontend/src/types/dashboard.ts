export interface DashboardAccount {
  id: number;
  name: string;
  type: string;
  balance: number | string;
  currency: string;
  icon?: string | null;
  color?: string | null;
  is_default?: boolean;
}

export interface DashboardData {
  total_balance: number;
  total_income: number;
  total_expenses: number;
  monthly_income: number;
  monthly_expenses: number;
  accounts: DashboardAccount[];
}

export interface DashboardResponse {
  success: boolean;
  message?: string;
  data: DashboardData;
}