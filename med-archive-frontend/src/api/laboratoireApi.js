import { apiClient } from "./client";
import { createResourceApi } from "./resourceApi";

export const laboratoiresApi = createResourceApi("/laboratoires");

export const getLaboratoires = laboratoiresApi.list;
export const createLaboratoire = laboratoiresApi.create;
export const getLaboratoire = laboratoiresApi.show;
export const updateLaboratoire = laboratoiresApi.update;
export const deleteLaboratoire = laboratoiresApi.remove;

export function getAnalysesEnAttenteLaboratoire(id) {
  return apiClient.get(`/laboratoires/${id}/analyses-en-attente`).then((response) => response.data);
}

export function getLaboratoireStatistiques(id) {
  return apiClient.get(`/laboratoires/${id}/statistiques`).then((response) => response.data);
}
