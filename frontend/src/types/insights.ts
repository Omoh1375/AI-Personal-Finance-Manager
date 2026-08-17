export type InsightType =
  | "success"
  | "warning"
  | "danger"
  | "info";

export interface FinancialInsight {
  type: InsightType;
  title: string;
  message: string;

  rate?: number;

  target_amount?: number;
  current_amount?: number;
  remaining?: number;
  percentage?: number;
}

export interface FinancialInsightsResponse {
  success: boolean;
  message?: string;
  data: {
    generated_at: string;
    insights: FinancialInsight[];
  };
}

export interface FinancialInsightParams {
  from?: string;
  to?: string;
}