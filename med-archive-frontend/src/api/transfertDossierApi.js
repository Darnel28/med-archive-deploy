import { createResourceApi } from "./resourceApi";

export const transfertDossiersApi = createResourceApi("/transferts-dossiers");

export const getTransfertDossiers = transfertDossiersApi.list;
export const createTransfertDossier = transfertDossiersApi.create;
export const getTransfertDossier = transfertDossiersApi.show;
export const updateTransfertDossier = transfertDossiersApi.update;
export const deleteTransfertDossier = transfertDossiersApi.remove;

export function accepterTransfertDossier(id, approbateurId) {
  return updateTransfertDossier(id, {
    statut: "accepte",
    approbateur_id: approbateurId,
  });
}

export function refuserTransfertDossier(id, approbateurId) {
  return updateTransfertDossier(id, {
    statut: "refuse",
    approbateur_id: approbateurId,
  });
}
