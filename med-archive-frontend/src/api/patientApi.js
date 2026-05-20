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

export function getPatientByImu(imu) {
  return apiClient.get(`/patients/imu/${imu}`).then((response) => response.data);
}

export function getPatientQrCode(id) {
  return apiClient.get(`/patients/${id}/qrcode`).then((response) => response.data);
}

export function getPatientsStatistiques() {
  return apiClient.get("/statistiques/patients").then((response) => response.data);
}
