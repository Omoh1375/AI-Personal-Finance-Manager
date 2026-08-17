export type NotificationType =
  | "success"
  | "warning"
  | "danger"
  | "info";

export interface UserNotification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationsResponse {
  success: boolean;
  message?: string;
  data: UserNotification[];
}

export interface UnreadNotificationsResponse {
  success: boolean;
  message?: string;
  data: UserNotification[];
}