export type AccountType =
  | "cash"
  | "bank"
  | "credit_card"
  | "mobile_wallet"
  | "crypto";

export interface Account {
  id: number;
  user_id: number;
  name: string;
  type: AccountType;
  balance: number | string;
  currency: string;
  icon?: string | null;
  color?: string | null;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AccountPayload {
  name: string;
  type: AccountType;
  balance?: number;
  currency: string;
  icon?: string | null;
  color?: string | null;
}

export interface AccountsResponse {
  success: boolean;
  message?: string;
  data: Account[];
}

export interface AccountResponse {
  success: boolean;
  message?: string;
  data: Account;
}