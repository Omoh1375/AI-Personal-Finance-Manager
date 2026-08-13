import api from "./axios";

import type {
  ExpensePayload,
  IncomePayload,
  Transaction,
  TransactionsResponse,
  TransactionResponse,
} from "../types/transaction";

export const getIncomes = async (): Promise<Transaction[]> => {
  const response =
    await api.get<TransactionsResponse>("/incomes");

  return response.data.data;
};

export const getExpenses = async (): Promise<Transaction[]> => {
  const response =
    await api.get<TransactionsResponse>("/expenses");

  return response.data.data;
};

export const createIncome = async (
  payload: IncomePayload,
): Promise<Transaction> => {
  const response =
    await api.post<TransactionResponse>(
      "/incomes",
      payload,
    );

  return response.data.data;
};

export const createExpense = async (
  payload: ExpensePayload,
): Promise<Transaction> => {
  const response =
    await api.post<TransactionResponse>(
      "/expenses",
      payload,
    );

  return response.data.data;
};

export const deleteIncome = async (
  id: number,
): Promise<void> => {
  await api.delete(`/incomes/${id}`);
};

export const deleteExpense = async (
  id: number,
): Promise<void> => {
  await api.delete(`/expenses/${id}`);
};