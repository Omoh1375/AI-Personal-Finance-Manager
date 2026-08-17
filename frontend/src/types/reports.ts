export interface StatementTransaction {
  id: number;
  user_id: number;
  account_id: number;
  transaction_uuid?: string | null;
  ledgerable_type?: string | null;
  ledgerable_id?: number | null;
  type: string;
  amount: number | string;
  balance_after: number | string;
  reference?: string | null;
  description?: string | null;
  transaction_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface StatementAccount {
  id: number;
  name: string;
  type: string;
  currency: string;
}

export interface StatementPeriod {
  from: string;
  to: string;
}

export interface Statement {
  account: StatementAccount;
  period: StatementPeriod;
  opening_balance: number;
  total_credits: number;
  total_debits: number;
  closing_balance: number;
  transactions: StatementTransaction[];
}

export interface StatementResponse {
  success: boolean;
  message?: string;
  data: Statement;
}

export interface ReportPeriod {
  from: string;
  to: string;
}

export interface ReportSummary {
  income: number;
  expenses: number;
  net_savings: number;
}

export interface ReportAccount {
  id: number;
  name: string;
  balance: number | string;
}

export interface ReportCategory {
  category_id: number;
  category?: string | null;
  amount: number;
  percentage: number;
}

export interface FinancialSummaryReport {
  period: ReportPeriod;

  summary: ReportSummary;

  accounts: ReportAccount[];

  top_categories: Array<{
    category_id: number;
    total: number | string;
    category?: {
      id: number;
      name: string;
    } | null;
  }>;
}

export interface SummaryReportResponse {
  data: FinancialSummaryReport;
}

export interface CategoryReportResponse {
  data: ReportCategory[];
}