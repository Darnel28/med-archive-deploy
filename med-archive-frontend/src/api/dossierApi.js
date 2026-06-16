import { apiClient } from "./client";
import { createResourceApi } from "./resourceApi";

export const dossiersApi = createResourceApi("/dossiers");

export const getDossiers = dossiersApi.list;
export const createDossier = dossiersApi.create;
export const getDossier = dossiersApi.show;
export const updateDossier = dossiersApi.update;
export const deleteDossier = dossiersApi.remove;

export function getDossierResume(id) {
  return apiClient.get(`/dossiers/${id}/resume`).then((response) => response.data);
}

export function archiverDossier(id) {
  return apiClient.post(`/dossiers/${id}/archiver`).then((response) => response.data);
}

export function transfererDossier(id, payload) {
  return apiClient.patch(`/dossiers/${id}/transferer`, payload).then((response) => response.data);
}

export function transfererDossierPost(id, payload) {
  return apiClient.post(`/dossiers/${id}/transferer`, payload).then((response) => response.data);
}

export function affecterDossierMedecin(id, payload) {
  return apiClient.post(`/dossiers/${id}/affecter-medecin`, payload).then((response) => response.data);
}
