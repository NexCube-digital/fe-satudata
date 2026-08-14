import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

export const getServicePrices = async (params: Record<string, any> = {}) => apiGet('/api/hospital/finance/service-prices', params);

export const createServicePrice = async (sourceOrPayload: any, payload?: any) => {
  if (typeof sourceOrPayload === 'string' && payload) {
    return await apiPost(`/api/hospital/finance/service-prices/${sourceOrPayload}`, payload);
  }
  return await apiPost('/api/hospital/finance/service-prices', sourceOrPayload);
};

export const updateServicePrice = async (sourceOrId: any, idOrPayload?: any, payload?: any) => {
  if (payload !== undefined) {
    return await apiPut(`/api/hospital/finance/service-prices/${sourceOrId}/${idOrPayload}`, payload);
  }
  return await apiPut(`/api/hospital/finance/service-prices/${sourceOrId}`, idOrPayload);
};

export const deleteServicePrice = async (sourceOrId: any, id?: any) => {
  if (id !== undefined) {
    return await apiDelete(`/api/hospital/finance/service-prices/${sourceOrId}/${id}`);
  }
  return await apiDelete(`/api/hospital/finance/service-prices/${sourceOrId}`);
};

export const getServicePriceMedis = async (params: Record<string, any> = {}) => apiGet('/api/hospital/finance/service-prices/medis', params);
export const createServicePriceMedis = async (payload: any) => apiPost('/api/hospital/finance/service-prices/medis', payload);
export const updateServicePriceMedis = async (id: string | number, payload: any) => apiPut(`/api/hospital/finance/service-prices/medis/${id}`, payload);
export const deleteServicePriceMedis = async (id: string | number) => apiDelete(`/api/hospital/finance/service-prices/medis/${id}`);

export const getServicePriceKlinik = async (params: Record<string, any> = {}) => apiGet('/api/hospital/finance/service-prices/klinik', params);
export const createServicePriceKlinik = async (payload: any) => apiPost('/api/hospital/finance/service-prices/klinik', payload);
export const updateServicePriceKlinik = async (id: string | number, payload: any) => apiPut(`/api/hospital/finance/service-prices/klinik/${id}`, payload);
export const deleteServicePriceKlinik = async (id: string | number) => apiDelete(`/api/hospital/finance/service-prices/klinik/${id}`);

export default {
  getServicePrices,
  createServicePrice,
  updateServicePrice,
  deleteServicePrice,
  getServicePriceMedis,
  createServicePriceMedis,
  updateServicePriceMedis,
  deleteServicePriceMedis,
  getServicePriceKlinik,
  createServicePriceKlinik,
  updateServicePriceKlinik,
  deleteServicePriceKlinik,
};
