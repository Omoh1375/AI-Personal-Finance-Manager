export interface SavingsGoal {
  id: number;

  user_id?: number;

  account_id: number;

  name: string;

  target_amount: number | string;

  saved: number | string;

  remaining: number | string;

  progress: number | string;

  status:
    | "Completed"
    | "Almost There"
    | "In Progress"
    | string;

  target_date: string;

  description?: string | null;

  account?: string | null;

  account_currency?: string | null;

  is_completed?: boolean;

  created_at?: string;

  updated_at?: string;
}

export interface SavingsDeposit {
  id: number;

  user_id?: number;

  savings_goal_id: number;

  account_id: number;

  amount: number | string;

  reference?: string | null;

  description?: string | null;

  deposited_at: string;

  account?: {
    id: number;

    name: string;

    balance?: number | string;

    currency?: string;

  } | null;

  goal?: {
    id: number;

    name: string;

    target_amount?: number | string;

  } | null;

  savingsGoal?: {
    id: number;

    name: string;

    target_amount?: number | string;

  } | null;

  created_at?: string;

  updated_at?: string;
}

export interface SavingsGoalPayload {
  account_id: number;

  name: string;

  target_amount: number;

  target_date: string;

  description?: string;

  is_completed?: boolean;
}

export interface SavingsDepositPayload {
  savings_goal_id: number;

  account_id: number;

  amount: number;

  reference?: string;

  description?: string;

  deposited_at: string;
}

export interface SavingsGoalsResponse {
  success: boolean;

  message?: string;

  data: SavingsGoal[];
}

export interface SavingsGoalResponse {
  success: boolean;

  message?: string;

  data: SavingsGoal;
}

export interface SavingsDepositsResponse {
  success: boolean;

  message?: string;

  data: SavingsDeposit[];
}

export interface SavingsDepositResponse {
  success: boolean;

  message?: string;

  data: SavingsDeposit;
}