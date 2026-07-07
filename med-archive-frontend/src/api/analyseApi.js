import { apiClient } from "./client";
import { createResourceApi } from "./resourceApi";

export const analysesApi = createResourceApi("/analyses");

export const getAnalyses = analysesApi.list;
export const createAnalyse = analysesApi.create;
export const getAnalyse = analysesApi.show;
export const updateAnalyse = analysesApi.update;
export const deleteAnalyse = analysesApi.remove;

export function updateAnalyseStatut(id, payload) {
  return apiClient.patch(`/analyses/${id}/statut`, payload).then((response) => response.data);
}

export function ajouterResultatsAnalyse(id, payload) {
  return apiClient.post(`/analyses/${id}/resultats`, payload, {
    headers: payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined,
  }).then((response) => response.data);
}

export function getAnalyseResultatFichier(id) {
  return apiClient.get(`/analyses/${id}/resultat-fichier`, { responseType: "blob" });
}

export function getAnalysesStatistiques() {
  return apiClient.get("/statistiques/analyses").then((response) => response.data);
}
