import api from "./axios";

import type {
  FinancialInsightParams,
  FinancialInsightsResponse,
} from "../types/insights";

export const getFinancialInsights =
  async (
    params?: FinancialInsightParams,
  ) => {
    const response =
      await api.get<FinancialInsightsResponse>(
        "/financial-insights",
        {
          params,
        },
      );

    return response.data.data;
  };