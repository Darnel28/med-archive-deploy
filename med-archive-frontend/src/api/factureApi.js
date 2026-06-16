import { apiClient } from "./client";

export function getFactures(params) {
  return apiClient.get("/factures", { params }).then((response) => response.data);
}

export function createFacture(payload) {
  return apiClient.post("/factures", payload).then((response) => response.data);
}

export function getFacture(id) {
  return apiClient.get(`/factures/${id}`).then((response) => response.data);
}

export function payerFacture(id, payload) {
  return apiClient.post(`/factures/${id}/paiement`, payload).then((response) => response.data);
}

export function creerPaiementStripe(id) {
  return apiClient.post(`/factures/${id}/stripe-intent`).then((response) => response.data);
}

export function creerPaiementFedapay(id) {
  return apiClient.post(`/factures/${id}/fedapay`).then((response) => response.data);
}

export function downloadFacturePdf(id) {
  return apiClient.get(`/factures/${id}/pdf`, { responseType: "blob" }).then((response) => response.data);
}

