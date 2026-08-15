export type SavingsStatus =
  | "Completed"
  | "Almost There"
  | "In Progress";

export interface SavingsGoal {
  id: number;
  name: string;
  target_amount: number;
  saved: number;
  remaining: number;
  progress: number;
  status: SavingsStatus;
  target_date: string;
  description?: string | null;
  account?: string | null;
}

export interface SavingsGoalPayload {
  account_id: number;
  name: string;
  target_amount: number;
  target_date: string;
  description?: string;
  is_completed?: boolean;
}

export interface SavingsDepositAccount {
  id: number;
  name: string;
}

export interface SavingsDepositGoal {
  id: number;
  name: string;
}

export interface SavingsDeposit {
  id: number;
  amount: number;
  reference?: string | null;
  description?: string | null;
  deposited_at: string;
  account?: SavingsDepositAccount | null;
  goal?: SavingsDepositGoal | null;
  created_at?: string;
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

export interface SavingsDepositPayload {
  savings_goal_id: number;
  account_id: number;
  amount: number;
  reference?: string;
  description?: string;
  deposited_at: string;
}