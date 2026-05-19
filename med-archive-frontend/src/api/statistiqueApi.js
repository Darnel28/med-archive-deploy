import { api } from "./client";

export function getDashboardStatistiques() {
  return api.get("/statistiques/dashboard");
}

export function getStatistiquesAvancees() {
  return api.get("/statistiques/avancees");
}
