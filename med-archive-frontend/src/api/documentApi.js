import { api } from "./client";
import { createResourceApi } from "./resourceApi";

export const documentsApi = createResourceApi("/documents");

export const getDocuments = documentsApi.list;
export const getDocument = documentsApi.show;
export const updateDocument = documentsApi.update;
export const deleteDocument = documentsApi.remove;

export function createDocument(payload) {
  return api.post("/documents", payload);
}

export function uploadDocument(formData) {
  return api.post("/documents", formData);
}

export function downloadDocument(id) {
  return api.get(`/documents/${id}/download`, { responseType: "blob" });
}

export function viewDocument(id) {
  return api.get(`/documents/${id}/view`, { responseType: "blob" });
}

export function getDocumentsStatistiques() {
  return api.get("/statistiques/documents");
}
