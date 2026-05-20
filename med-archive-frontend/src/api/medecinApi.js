import { apiClient } from "./client";
import { createResourceApi } from "./resourceApi";

export const medecinsApi = createResourceApi("/medecins");

export const getMedecins = medecinsApi.list;
export const createMedecin = medecinsApi.create;
export const getMedecin = medecinsApi.show;
export const updateMedecin = medecinsApi.update;
export const deleteMedecin = medecinsApi.remove;

export function getMedecinPlanning(id) {
  return apiClient.get(`/medecins/${id}/planning`).then((response) => response.data);
}

export function getMedecinPatients(id) {
  return apiClient.get(`/medecins/${id}/patients`).then((response) => response.data);
}
