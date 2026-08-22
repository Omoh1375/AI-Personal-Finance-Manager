export type TransactionKind =
  | "income"
  | "expense";

export interface TransactionAccount {
  id: number;
  name: string;
}

export interface TransactionCategory {
  id: number;
  name: string;
  type?: "income" | "expense";
}

export interface Transaction {
  id: number;
  user_id: number;

  account_id: number;
  category_id: number;

  amount: number | string;

  reference?: string | null;
  description?: string | null;
  merchant?: string | null;

  received_at?: string | null;
  spent_at?: string | null;

  created_at?: string;

  account?: TransactionAccount | null;
  category?: TransactionCategory | null;
}

export interface IncomePayload {
  account_id: number;
  category_id: number;
  amount: number;
  reference?: string;
  description?: string;
  received_at: string;
}

export interface ExpensePayload {
  account_id: number;
  category_id: number;
  amount: number;
  reference?: string;
  merchant?: string;
  description?: string;
  spent_at: string;
}

export interface TransactionsResponse {
  success: boolean;
  message?: string;
  data: Transaction[];
}

export interface TransactionResponse {
  success: boolean;
  message?: string;
  data: Transaction;
}