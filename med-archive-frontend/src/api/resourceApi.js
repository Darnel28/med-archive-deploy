import { apiClient } from "./client";

export function createResourceApi(resourcePath) {
  return {
    list: (params) => apiClient.get(resourcePath, { params }).then((response) => response.data),
    create: (payload) => apiClient.post(resourcePath, payload).then((response) => response.data),
    show: (id) => apiClient.get(`${resourcePath}/${id}`).then((response) => response.data),
    update: (id, payload) => apiClient.put(`${resourcePath}/${id}`, payload).then((response) => response.data),
    patch: (id, payload) => apiClient.patch(`${resourcePath}/${id}`, payload).then((response) => response.data),
    remove: (id) => apiClient.delete(`${resourcePath}/${id}`).then((response) => response.data),
  };
}
