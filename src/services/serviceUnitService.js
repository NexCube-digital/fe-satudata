import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

export const getServiceUnits = async (params = {}) => {
  return await apiGet("/api/service", params);
};

export const getServiceUnitById = async (id) => {
  return await apiGet(`/api/service/${id}`);
};

export const createServiceUnit = async (payload) => {
  return await apiPost(`/api/service`, payload);
};

export const updateServiceUnit = async (id, payload) => {
  return await apiPut(`/api/service/${id}`, payload);
};

export const deleteServiceUnit = async (id) => {
  return await apiDelete(`/api/service/${id}`);
};

export default {
  getServiceUnits,
  getServiceUnitById,
  createServiceUnit,
  updateServiceUnit,
  deleteServiceUnit,
};
