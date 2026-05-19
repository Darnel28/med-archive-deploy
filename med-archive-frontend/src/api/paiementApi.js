import { api } from "./client";

export function getPaiements(query) {
  return api.get("/paiements", { query });
}

export function getPaiement(id) {
  return api.get(`/paiements/${id}`);
}
