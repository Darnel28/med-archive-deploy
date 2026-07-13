import { apiClient } from "./client";
import { createResourceApi } from "./resourceApi";

export const patientsApi = createResourceApi("/patients");

export const getPatients = patientsApi.list;
export const createPatient = patientsApi.create;
export const getPatient = patientsApi.show;
export const updatePatient = patientsApi.update;
export const deletePatient = patientsApi.remove;

export function getPatientDossierComplet(id) {
  return apiClient.get(`/patients/${id}/dossier-complet`).then((response) => response.data);
}

export function getMonDossierComplet() {
  return apiClient.get("/patients/me/dossier-complet").then((response) => response.data);
}

export function getPatientByImu(imu) {
  return apiClient.get(`/patients/imu/${imu}`).then((response) => response.data);
}

export function getPatientQrCode(id) {
  return apiClient.get(`/patients/${id}/qrcode`, { responseType: "blob" });
}

export function getEmergencyCardByImu(imu) {
  return apiClient.get(`/patients/imu/${encodeURIComponent(imu)}/urgence`).then((response) => response.data);
}

export function getMesConsultations(params) {
  return apiClient.get("/patients/me/consultations", { params }).then((response) => response.data);
}

export function getMesAnalyses(params) {
  return apiClient.get("/patients/me/analyses", { params }).then((response) => response.data);
}

export function getAnalyseResultatFichier(id) {
  return apiClient.get(`/analyses/${id}/resultat-fichier`, { responseType: "blob" });
}

export function getMesFactures(params) {
  return apiClient.get("/patients/me/factures", { params }).then((response) => response.data);
}

export function getPatientsStatistiques() {
  return apiClient.get("/statistiques/patients").then((response) => response.data);
}
