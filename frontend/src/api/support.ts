import api from "./axios";

export interface SupportTicket {
  id: number;
  ticket_number: string;
  subject: string;
  category: string;
  priority:
    | "low"
    | "normal"
    | "high"
    | "urgent";
  message: string;
  status:
    | "open"
    | "in_progress"
    | "resolved"
    | "closed";
  admin_response?: string | null;
  responded_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SupportTicketsResponse {
  success: boolean;
  message?: string;
  data: SupportTicket[];
}

export interface SupportTicketResponse {
  success: boolean;
  message?: string;
  data: SupportTicket;
}

export interface CreateSupportTicketPayload {
  subject: string;
  category:
    | "account"
    | "profile"
    | "transactions"
    | "budgets"
    | "savings"
    | "security"
    | "technical"
    | "other";
  priority:
    | "low"
    | "normal"
    | "high"
    | "urgent";
  message: string;
}

export const getSupportTickets =
  async (): Promise<SupportTicket[]> => {
    const response =
      await api.get<SupportTicketsResponse>(
        "/support/tickets",
      );

    return response.data.data;
  };

export const createSupportTicket =
  async (
    payload: CreateSupportTicketPayload,
  ): Promise<SupportTicket> => {
    const response =
      await api.post<SupportTicketResponse>(
        "/support/tickets",
        payload,
      );

    return response.data.data;
  };

export const getSupportTicket =
  async (
    id: number,
  ): Promise<SupportTicket> => {
    const response =
      await api.get<SupportTicketResponse>(
        `/support/tickets/${id}`,
      );

    return response.data.data;
  };