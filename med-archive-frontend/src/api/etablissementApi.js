import { api } from "./client";

export function getMesDonneesEtablissement() {
  return api.get("/etablissement/mes-donnees");
}

export function getMesMedecinsEtablissement() {
  return api.get("/etablissement/mes-medecins");
}

export function getMesPatientsEtablissement() {
  return api.get("/etablissement/mes-patients");
}

export function getMesConsultationsEtablissement() {
  return api.get("/etablissement/mes-consultations");
}

export function getEtablissementStatistiques() {
  return api.get("/etablissement/statistiques");
}

export function getEtablissementDashboard() {
  return api.get("/etablissement/dashboard");
}

export function updateEtablissementInfo(payload) {
  return api.put("/etablissement/info", payload);
}
