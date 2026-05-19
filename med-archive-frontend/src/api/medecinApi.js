import { api } from "./client";
import { createResourceApi } from "./resourceApi";

export const medecinsApi = createResourceApi("/medecins");

export const getMedecins = medecinsApi.list;
export const createMedecin = medecinsApi.create;
export const getMedecin = medecinsApi.show;
export const updateMedecin = medecinsApi.update;
export const deleteMedecin = medecinsApi.remove;

export function getMedecinPlanning(id) {
  return api.get(`/medecins/${id}/planning`);
}

export function getMedecinPatients(id) {
  return api.get(`/medecins/${id}/patients`);
}
