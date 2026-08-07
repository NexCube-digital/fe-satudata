import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";

export const getServicePrices = async (params = {}) => apiGet("/api/hospital/service-prices", params);

export const getServicePriceById = async (id) => apiGet(`/api/hospital/service-prices/${id}`);

export const createServicePrice = async (payload) => apiPost("/api/hospital/service-prices", payload);

export const updateServicePrice = async (id, payload) => apiPut(`/api/hospital/service-prices/${id}`, payload);

export const deleteServicePrice = async (id) => apiDelete(`/api/hospital/service-prices/${id}`);

export default {
  getServicePrices,
  getServicePriceById,
  createServicePrice,
  updateServicePrice,
  deleteServicePrice,
};
