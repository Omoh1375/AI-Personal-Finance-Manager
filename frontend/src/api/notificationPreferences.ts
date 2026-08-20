import api from "./axios";

export interface NotificationPreferences {
  id?: number;
  user_id?: number;
  email_notifications: boolean;
  financial_activity: boolean;
  budget_alerts: boolean;
  savings_alerts: boolean;
  security_alerts: boolean;
  created_at?: string;
  updated_at?: string;
}

interface NotificationPreferencesResponse {
  success: boolean;
  message?: string;
  data: NotificationPreferences;
}

export const getNotificationPreferences = async (): Promise<NotificationPreferences> => {
  const response = await api.get<NotificationPreferencesResponse>(
    "/notification-preferences",
  );

  return response.data.data;
};

export const updateNotificationPreferences = async (
  payload: Pick<
    NotificationPreferences,
    | "email_notifications"
    | "financial_activity"
    | "budget_alerts"
    | "savings_alerts"
  >,
): Promise<NotificationPreferences> => {
  const response = await api.put<NotificationPreferencesResponse>(
    "/notification-preferences",
    payload,
  );

  return response.data.data;
};