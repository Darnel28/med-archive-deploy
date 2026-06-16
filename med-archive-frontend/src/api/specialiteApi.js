import { apiClient } from "./client";

export function getSpecialites(params = {}) {
  return apiClient.get("/specialites", { params }).then((response) => response.data);
}
