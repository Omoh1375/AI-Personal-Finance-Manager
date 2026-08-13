export interface TransferAccount {
  id: number;
  name: string;
  balance: number | string;
  currency?: string;
}

export interface Transfer {
  id: number;
  user_id: number;
  from_account_id: number;
  to_account_id: number;
  amount: number | string;
  reference?: string | null;
  description?: string | null;
  transferred_at: string;
  from_account?: TransferAccount | null;
  to_account?: TransferAccount | null;
}

export interface TransferPayload {
  from_account_id: number;
  to_account_id: number;
  amount: number;
  reference?: string;
  description?: string;
  transferred_at: string;
}

export interface TransfersResponse {
  success: boolean;
  message?: string;
  data: Transfer[];
}

export interface TransferResponse {
  success: boolean;
  message?: string;
  data: Transfer;
}