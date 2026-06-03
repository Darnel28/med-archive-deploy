import { apiClient } from "./client";

export function getMesDonneesEtablissement() {
  return apiClient.get("/etablissement/mes-donnees").then((response) => response.data);
}

export function getMesMedecinsEtablissement() {
  return apiClient.get("/etablissement/mes-medecins").then((response) => response.data);
}

export function getMesPatientsEtablissement(params = {}) {
  return apiClient.get("/etablissement/mes-patients", { params }).then((response) => response.data);
}

export function getMesConsultationsEtablissement(params = {}) {
  return apiClient.get("/etablissement/mes-consultations", { params }).then((response) => response.data);
}

export function getEtablissementStatistiques() {
  return apiClient.get("/etablissement/statistiques").then((response) => response.data);
}

export function getEtablissementDashboard() {
  return apiClient.get("/etablissement/dashboard").then((response) => response.data);
}

export function updateEtablissementInfo(payload) {
  return apiClient.put("/etablissement/info", payload).then((response) => response.data);
}
