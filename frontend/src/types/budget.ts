export type BudgetStatus =
  | "On Track"
  | "Near Limit"
  | "Exceeded";

export interface Budget {
  id: number;

  category_id: number;

  category: string;

  budget: number;

  spent: number;

  remaining: number;

  progress: number;

  status: BudgetStatus;

  start_date: string;

  end_date: string;

  is_active: boolean;
}

export interface BudgetPayload {
  category_id: number;

  amount: number;

  start_date: string;

  end_date: string;

  is_active?: boolean;
}

export interface BudgetsResponse {
  success: boolean;

  message?: string;

  data: Budget[];
}

export interface BudgetResponse {
  success: boolean;

  message?: string;

  data: Budget;
}