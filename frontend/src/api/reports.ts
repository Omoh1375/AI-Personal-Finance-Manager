import api from "./axios";

import type {
  Statement,
  SummaryReportResponse,
  CategoryReportResponse,
  ReportCategory,
} from "../types/reports";

export interface StatementParams {
  account_id: number;
  from: string;
  to: string;
}

export interface ReportParams {
  from: string;
  to: string;
}

export const getStatement = async (
  params: StatementParams,
): Promise<Statement> => {
  const response =
    await api.get("/statements", {
      params,
    });

  return response.data.data;
};

export const getFinancialSummary = async (
  params: ReportParams,
) => {
  const response =
    await api.get<SummaryReportResponse>(
      "/reports",
      {
        params: {
          ...params,
          type: "summary",
        },
      },
    );

  return response.data.data;
};

export const getCategorySpending = async (
  params: ReportParams,
): Promise<ReportCategory[]> => {
  const response =
    await api.get<CategoryReportResponse>(
      "/reports",
      {
        params: {
          ...params,
          type: "category",
        },
      },
    );

  return response.data.data;
};