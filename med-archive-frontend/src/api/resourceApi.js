import { api } from "./client";

export function createResourceApi(resourcePath) {
  return {
    list: (query) => api.get(resourcePath, { query }),
    create: (payload) => api.post(resourcePath, payload),
    show: (id) => api.get(`${resourcePath}/${id}`),
    update: (id, payload) => api.put(`${resourcePath}/${id}`, payload),
    patch: (id, payload) => api.patch(`${resourcePath}/${id}`, payload),
    remove: (id) => api.delete(`${resourcePath}/${id}`),
  };
}
