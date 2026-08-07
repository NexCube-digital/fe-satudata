import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

export const getServicePrices = async (params = {}) => {
  return await apiGet("/api/hospital/service-prices", params);
};

export const getServicePriceById = async (id) => {
  return await apiGet(`/api/hospital/service-prices/${id}`);
};

export const createServicePrice = async (payload) => {
  return await apiPost("/api/hospital/service-prices", payload);
};

export const updateServicePrice = async (id, payload) => {
  return await apiPut(`/api/hospital/service-prices/${id}`, payload);
};

export const deleteServicePrice = async (id) => {
  return await apiDelete(`/api/hospital/service-prices/${id}`);
};

export default {
  getServicePrices,
  getServicePriceById,
  createServicePrice,
  updateServicePrice,
  deleteServicePrice,
};
