import { apiClient } from "./client";

export function getDashboardStatistiques() {
  return apiClient.get("/statistiques/dashboard").then((response) => response.data);
}

export function getStatistiquesAvancees() {
  return apiClient.get("/statistiques/avancees").then((response) => response.data);
}
