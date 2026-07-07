import { apiClient } from "./client";

export function getDashboardStatistiques() {
  return apiClient.get("/statistiques/dashboard").then((response) => response.data);
}

export function getStatistiquesAvancees() {
  return apiClient.get("/statistiques/avancees").then((response) => response.data);
}

export function getRapportsAdmin() {
  return apiClient.get("/statistiques/rapports-admin").then((response) => response.data);
}
