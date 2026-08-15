import api from "./axios";

import type {
  SavingsGoal,
  SavingsGoalPayload,
  SavingsGoalsResponse,
  SavingsGoalResponse,
  SavingsDeposit,
  SavingsDepositPayload,
  SavingsDepositsResponse,
  SavingsDepositResponse,
} from "../types/savings";

export const getSavingsGoals = async (): Promise<
  SavingsGoal[]
> => {
  const response =
    await api.get<SavingsGoalsResponse>(
      "/savings-goals",
    );

  return response.data.data;
};

export const createSavingsGoal = async (
  payload: SavingsGoalPayload,
): Promise<SavingsGoal> => {
  const response =
    await api.post<SavingsGoalResponse>(
      "/savings-goals",
      payload,
    );

  return response.data.data;
};

export const deleteSavingsGoal = async (
  id: number,
): Promise<void> => {
  await api.delete(`/savings-goals/${id}`);
};

export const getSavingsDeposits =
  async (): Promise<SavingsDeposit[]> => {
    const response =
      await api.get<SavingsDepositsResponse>(
        "/savings-deposits",
      );

    return response.data.data;
  };

export const createSavingsDeposit = async (
  payload: SavingsDepositPayload,
): Promise<SavingsDeposit> => {
  const response =
    await api.post<SavingsDepositResponse>(
      "/savings-deposits",
      payload,
    );

  return response.data.data;
};

export const deleteSavingsDeposit = async (
  id: number,
): Promise<void> => {
  await api.delete(`/savings-deposits/${id}`);
};