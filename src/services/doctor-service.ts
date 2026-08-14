import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import { ApiResponse } from '@/types/api';
import { Doctor, Specialty } from '@/types/faskes';

export const getDoctors = async (params?: Record<string, any>): Promise<ApiResponse<Doctor[]>> => {
  return await apiGet('/api/doctor', params);
};

export const createDoctor = async (doctorData: any): Promise<ApiResponse<Doctor>> => {
  if (doctorData.imageFile) {
    const formData = new FormData();
    Object.keys(doctorData).forEach((key) => {
      if (key === 'imageFile') {
        formData.append('image', doctorData.imageFile);
      } else {
        formData.append(key, doctorData[key]);
      }
    });
    return await apiPost('/api/doctor', formData);
  }
  return await apiPost('/api/doctor', doctorData);
};

export const updateDoctor = async (doctorData: any): Promise<ApiResponse<Doctor>> => {
  if (doctorData.imageFile) {
    const formData = new FormData();
    Object.keys(doctorData).forEach((key) => {
      if (key === 'imageFile') {
        formData.append('image', doctorData.imageFile);
      } else {
        formData.append(key, doctorData[key]);
      }
    });
    return await apiPut(`/api/doctor/${doctorData.id}`, formData);
  }
  return await apiPut(`/api/doctor/${doctorData.id}`, doctorData);
};

export const deleteDoctor = async (doctorId: string | number): Promise<ApiResponse> => {
  return await apiDelete(`/api/doctor/${doctorId}`);
};

export const getSpecialties = async (): Promise<ApiResponse<Specialty[]>> => {
  return await apiGet('/api/doctor/specialties');
};

export default {
  getDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getSpecialties,
};
