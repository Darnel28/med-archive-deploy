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
  return apiClient.post(`/analyses/${id}/resultats`, payload).then((response) => response.data);
}

export function getAnalysesStatistiques() {
  return apiClient.get("/statistiques/analyses").then((response) => response.data);
}
