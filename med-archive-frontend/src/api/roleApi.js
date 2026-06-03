import { apiClient } from "./client";

export function getRoles() {
  return apiClient.get("/roles").then((response) => response.data);
}
