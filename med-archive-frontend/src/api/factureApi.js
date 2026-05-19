import { api } from "./client";

export function getFactures(query) {
  return api.get("/factures", { query });
}

export function createFacture(payload) {
  return api.post("/factures", payload);
}

export function getFacture(id) {
  return api.get(`/factures/${id}`);
}

export function payerFacture(id, payload) {
  return api.post(`/factures/${id}/paiement`, payload);
}

export function downloadFacturePdf(id) {
  return api.get(`/factures/${id}/pdf`, { responseType: "blob" });
}
