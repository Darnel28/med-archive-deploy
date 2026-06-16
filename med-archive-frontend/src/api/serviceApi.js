import { createResourceApi } from "./resourceApi";
import { apiClient } from "./client";

export const servicesApi = createResourceApi("/services");

export const getServices = servicesApi.list;
export const createService = servicesApi.create;
export const getService = servicesApi.show;
export const updateService = servicesApi.update;
export const deleteService = servicesApi.remove;

export function getMesPatientsService(params = {}) {
  return apiClient.get("/services/mes-patients", { params }).then((response) => response.data);
}

export function getCurrentService() {
  return apiClient.get("/services/me").then((response) => response.data);
}

export function updateCurrentService(payload) {
  return apiClient.put("/services/me", payload).then((response) => response.data);
}
