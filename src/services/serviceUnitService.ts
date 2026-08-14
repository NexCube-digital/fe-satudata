import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

export const getServiceUnits = async (params: Record<string, any> = {}) => apiGet('/api/hospital/service-units', params);
export const createServiceUnit = async (payload: any) => apiPost('/api/hospital/service-units', payload);
export const updateServiceUnit = async (id: string | number, payload: any) => apiPut(`/api/hospital/service-units/${id}`, payload);
export const deleteServiceUnit = async (id: string | number) => apiDelete(`/api/hospital/service-units/${id}`);

export default {
  getServiceUnits,
  createServiceUnit,
  updateServiceUnit,
  deleteServiceUnit,
};
