import { apiClient } from "./client";
import { createResourceApi } from "./resourceApi";

export const laboratoiresApi = createResourceApi("/laboratoires");

export const getLaboratoires = laboratoiresApi.list;
export const createLaboratoire = laboratoiresApi.create;
export const getLaboratoire = laboratoiresApi.show;
export const updateLaboratoire = laboratoiresApi.update;
export const deleteLaboratoire = laboratoiresApi.remove;

export function getCurrentLaboratoire() {
  return apiClient.get("/me").then((response) => {
    const user = response.data?.data?.user || response.data?.user;
    return user?.laboratoire ? { ...user.laboratoire, user, etablissement: user?.etablissement } : null;
  });
}

export async function updateCurrentLaboratoire(payload) {
  const laboratoire = await getCurrentLaboratoire();

  if (!laboratoire?.id) {
    throw new Error("Laboratoire connecte introuvable.");
  }

  return updateLaboratoire(laboratoire.id, payload);
}

export function getAnalysesEnAttenteLaboratoire(id) {
  return apiClient.get(`/laboratoires/${id}/analyses-en-attente`).then((response) => response.data);
}

export function getLaboratoireStatistiques(id) {
  return apiClient.get(`/laboratoires/${id}/statistiques`).then((response) => response.data);
}
