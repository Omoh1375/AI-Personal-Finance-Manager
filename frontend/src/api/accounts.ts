import api from "./axios";
import type {
  Account,
  AccountPayload,
  AccountsResponse,
  AccountResponse,
} from "../types/account";

export const getAccounts = async (): Promise<Account[]> => {
  const response = await api.get<AccountsResponse>("/accounts");

  return response.data.data;
};

export const createAccount = async (
  payload: AccountPayload,
): Promise<Account> => {
  const response = await api.post<AccountResponse>(
    "/accounts",
    payload,
  );

  return response.data.data;
};

export const updateAccount = async ({
  id,
  payload,
}: {
  id: number;
  payload: AccountPayload;
}): Promise<Account> => {
  const response = await api.put<AccountResponse>(
    `/accounts/${id}`,
    payload,
  );

  return response.data.data;
};

export const deleteAccount = async (
  id: number,
): Promise<void> => {
  await api.delete(`/accounts/${id}`);
};