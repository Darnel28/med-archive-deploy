import { apiClient } from "./client";

export function getPaiements(params) {
  return apiClient.get("/paiements", { params }).then((response) => response.data);
}

export function getPaiement(id) {
  return apiClient.get(`/paiements/${id}`).then((response) => response.data);
}
