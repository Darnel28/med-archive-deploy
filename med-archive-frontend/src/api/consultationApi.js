import { apiClient } from "./client";
import { createResourceApi } from "./resourceApi";

export const consultationsApi = createResourceApi("/consultations");

export const getConsultations = consultationsApi.list;
export const createConsultation = consultationsApi.create;
export const getConsultation = consultationsApi.show;
export const updateConsultation = consultationsApi.update;
export const deleteConsultation = consultationsApi.remove;

export function ajouterConstantesConsultation(id, payload) {
  return apiClient.post(`/consultations/${id}/constantes`, payload).then((response) => response.data);
}

export function getConsultationsStatistiques() {
  return apiClient.get("/statistiques/consultations").then((response) => response.data);
}
