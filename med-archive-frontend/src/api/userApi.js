import { api } from "./client";
import { createResourceApi } from "./resourceApi";

export const usersApi = createResourceApi("/users");

export const getUsers = usersApi.list;
export const createUser = usersApi.create;
export const getUser = usersApi.show;
export const updateUser = usersApi.update;
export const deleteUser = usersApi.remove;

export function desactiverUser(id) {
  return api.post(`/users/${id}/desactiver`);
}

export function activerUser(id) {
  return api.post(`/users/${id}/activer`);
}

export function getUtilisateursStatistiques() {
  return api.get("/statistiques/utilisateurs");
}
