import { apiClient } from "./client";
import { createResourceApi } from "./resourceApi";

export const usersApi = createResourceApi("/users");

export const getUsers = usersApi.list;
export const createUser = usersApi.create;
export const getUser = usersApi.show;
export const updateUser = usersApi.update;
export const deleteUser = usersApi.remove;

export function activerUser(id) {
  return apiClient.post(`/users/${id}/activer`).then((response) => response.data);
}

export function desactiverUser(id) {
  return apiClient.post(`/users/${id}/desactiver`).then((response) => response.data);
}

export function getUtilisateursStatistiques() {
  return apiClient.get("/statistiques/utilisateurs").then((response) => response.data);
}
