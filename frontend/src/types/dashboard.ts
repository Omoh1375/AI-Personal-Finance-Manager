export interface DashboardTransaction {
  id: number;

  type:
    | "income"
    | "expense"
    | "transfer"
    | string;

  title?: string | null;

  account?: string | null;

  amount: number | string;

  date: string;
}

export interface DashboardSpendingCategory {
  category: string;

  amount: number | string;

  percentage: number | string;
}

export interface DashboardMonthlyCashFlow {
  month: string;

  year: number;

  income: number | string;

  expense: number | string;

  net_cash_flow: number | string;
}

export interface DashboardAccount {
  id: number;

  name: string;

  type: string;

  balance: number | string;

  currency?: string | null;

  income?: number | string;

  expenses?: number | string;

  transactions?: number;
}

export interface DashboardData {
  total_balance: number | string;

  total_income: number | string;

  total_expenses: number | string;

  monthly_income: number | string;

  monthly_expenses: number | string;

  savings_rate?: number | string;

  accounts: DashboardAccount[];

  account_analytics?: DashboardAccount[];

  recent_transactions?: DashboardTransaction[];

  expense_breakdown?: DashboardSpendingCategory[];

  monthly_cash_flow?: DashboardMonthlyCashFlow[];

  top_spending_categories?: DashboardSpendingCategory[];
}

export interface DashboardResponse {
  success: boolean;

  message?: string;

  data: DashboardData;
}