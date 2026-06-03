import { createResourceApi } from "./resourceApi";

export const servicesApi = createResourceApi("/services");

export const getServices = servicesApi.list;
export const createService = servicesApi.create;
export const getService = servicesApi.show;
export const updateService = servicesApi.update;
export const deleteService = servicesApi.remove;
