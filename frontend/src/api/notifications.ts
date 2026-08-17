import api from "./axios";

import type {
  NotificationsResponse,
} from "../types/notifications";

export const getNotifications =
  async () => {
    const response =
      await api.get<NotificationsResponse>(
        "/notifications",
      );

    return response.data.data;
  };

export const getUnreadNotifications =
  async () => {
    const response =
      await api.get<NotificationsResponse>(
        "/notifications/unread",
      );

    return response.data.data;
  };

export const markNotificationAsRead =
  async (
    id: number,
  ): Promise<void> => {
    await api.patch(
      `/notifications/${id}/read`,
    );
  };