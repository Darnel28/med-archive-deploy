import { apiClient } from "./client";
import { createResourceApi } from "./resourceApi";

export const documentsApi = createResourceApi("/documents");

export const getDocuments = documentsApi.list;
export const getDocument = documentsApi.show;
export const updateDocument = documentsApi.update;
export const deleteDocument = documentsApi.remove;

export function createDocument(payload) {
  return apiClient.post("/documents", payload).then((response) => response.data);
}

export function uploadDocument(formData) {
  return apiClient.post("/documents", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((response) => response.data);
}

export function downloadDocument(id) {
  return apiClient.get(`/documents/${id}/download`, { responseType: "blob" }).then((response) => response.data);
}

export function viewDocument(id) {
  return apiClient.get(`/documents/${id}/view`, { responseType: "blob" }).then((response) => response.data);
}

export function getDocumentsStatistiques() {
  return apiClient.get("/statistiques/documents").then((response) => response.data);
}
