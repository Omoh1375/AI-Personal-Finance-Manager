import api from "./axios";

import type {
  Budget,
  BudgetPayload,
  BudgetsResponse,
  BudgetResponse,
} from "../types/budget";

export const getBudgets = async (): Promise<Budget[]> => {
  const response =
    await api.get<BudgetsResponse>("/budgets");

  return response.data.data;
};

export const createBudget = async (
  payload: BudgetPayload,
): Promise<Budget> => {
  const response =
    await api.post<BudgetResponse>(
      "/budgets",
      payload,
    );

  return response.data.data;
};

export const deleteBudget = async (
  id: number,
): Promise<void> => {
  await api.delete(`/budgets/${id}`);
};