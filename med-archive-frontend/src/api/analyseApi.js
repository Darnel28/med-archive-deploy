import { api } from "./client";
import { createResourceApi } from "./resourceApi";

export const analysesApi = createResourceApi("/analyses");

export const getAnalyses = analysesApi.list;
export const createAnalyse = analysesApi.create;
export const getAnalyse = analysesApi.show;
export const updateAnalyse = analysesApi.update;
export const deleteAnalyse = analysesApi.remove;

export function updateAnalyseStatut(id, payload) {
  return api.patch(`/analyses/${id}/statut`, payload);
}

export function ajouterResultatsAnalyse(id, payload) {
  return api.post(`/analyses/${id}/resultats`, payload);
}

export function getAnalysesStatistiques() {
  return api.get("/statistiques/analyses");
}
