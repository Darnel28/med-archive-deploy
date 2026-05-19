import { api } from "./client";
import { createResourceApi } from "./resourceApi";

export const patientsApi = createResourceApi("/patients");

export const getPatients = patientsApi.list;
export const createPatient = patientsApi.create;
export const getPatient = patientsApi.show;
export const updatePatient = patientsApi.update;
export const deletePatient = patientsApi.remove;

export function getPatientDossierComplet(id) {
  return api.get(`/patients/${id}/dossier-complet`);
}

export function getPatientByImu(imu) {
  return api.get(`/patients/imu/${imu}`);
}

export function getPatientQrCode(id) {
  return api.get(`/patients/${id}/qrcode`);
}

export function getPatientsStatistiques() {
  return api.get("/statistiques/patients");
}
