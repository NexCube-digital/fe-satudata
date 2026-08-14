import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

export const getSpecialties = async () => apiGet('/api/doctor/specialties');
export const createSpecialty = async (payload: any) => apiPost('/api/doctor/specialties', payload);
export const updateSpecialty = async (id: string | number, payload: any) => apiPut(`/api/doctor/specialties/${id}`, payload);
export const deleteSpecialty = async (id: string | number) => apiDelete(`/api/doctor/specialties/${id}`);

export default {
  getSpecialties,
  createSpecialty,
  updateSpecialty,
  deleteSpecialty,
};
