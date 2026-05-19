import { api } from "./client";
import { createResourceApi } from "./resourceApi";

export const dossiersApi = createResourceApi("/dossiers");

export const getDossiers = dossiersApi.list;
export const createDossier = dossiersApi.create;
export const getDossier = dossiersApi.show;
export const updateDossier = dossiersApi.update;
export const deleteDossier = dossiersApi.remove;

export function getDossierResume(id) {
  return api.get(`/dossiers/${id}/resume`);
}

export function archiverDossier(id) {
  return api.post(`/dossiers/${id}/archiver`);
}

export function transfererDossier(id, payload) {
  return api.patch(`/dossiers/${id}/transferer`, payload);
}

export function transfererDossierPost(id, payload) {
  return api.post(`/dossiers/${id}/transferer`, payload);
}
