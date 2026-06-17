import { apiClient } from "./client";

export function getNotifications(params = {}) {
  return apiClient.get("/notifications", { params }).then((response) => response.data);
}

export function markNotificationRead(id) {
  return apiClient.patch(`/notifications/${id}/read`).then((response) => response.data);
}

export function markAllNotificationsRead() {
  return apiClient.patch("/notifications/read-all").then((response) => response.data);
}
