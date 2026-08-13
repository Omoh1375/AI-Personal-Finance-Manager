import api from "./axios";

import type {
  Transfer,
  TransferPayload,
  TransfersResponse,
  TransferResponse,
} from "../types/transfer";

export const getTransfers = async (): Promise<Transfer[]> => {
  const response =
    await api.get<TransfersResponse>("/transfers");

  return response.data.data;
};

export const createTransfer = async (
  payload: TransferPayload,
): Promise<Transfer> => {
  const response =
    await api.post<TransferResponse>(
      "/transfers",
      payload,
    );

  return response.data.data;
};

export const deleteTransfer = async (
  id: number,
): Promise<void> => {
  await api.delete(`/transfers/${id}`);
};