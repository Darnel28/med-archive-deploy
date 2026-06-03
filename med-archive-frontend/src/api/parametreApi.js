import { createResourceApi } from "./resourceApi";

export const parametresApi = createResourceApi("/parametres");

export const getParametres = parametresApi.list;
export const createParametre = parametresApi.create;
export const getParametre = parametresApi.show;
export const updateParametre = parametresApi.update;
export const deleteParametre = parametresApi.remove;
