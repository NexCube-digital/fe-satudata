import { apiGet, apiPost, apiPut } from '@/lib/api-client';
import { ApiResponse } from '@/types/api';
import { MedicalRecord } from '@/types/medical-record';

export const getHospitalMedicalRecords = async (params: Record<string, any> = {}): Promise<ApiResponse<MedicalRecord[]>> => {
  return await apiGet('/api/hospital/medical-record', params);
};

export const getPatientMedicalRecords = async (patientId: string | number, params: Record<string, any> = {}): Promise<ApiResponse<MedicalRecord[]>> => {
  return await apiGet(`/api/hospital/patient/${patientId}`, params);
};

export const getMedicalRecordById = async (recordId: string | number): Promise<ApiResponse<MedicalRecord>> => {
  return await apiGet(`/api/hospital/medical-record/${recordId}`);
};

export const createMedicalRecordDraft = async (payload: any): Promise<ApiResponse<MedicalRecord>> => {
  return await apiPost('/api/hospital/medical-record', payload);
};

export const updateMedicalRecordDraft = async (recordId: string | number, payload: any): Promise<ApiResponse<MedicalRecord>> => {
  return await apiPut(`/api/hospital/medical-record/${recordId}`, payload);
};

export const uploadMedicalRecordAttachment = async (recordId: string | number, file: File): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  return await apiPost(`/api/hospital/medical-record/${recordId}/upload`, formData);
};

export default {
  getHospitalMedicalRecords,
  getPatientMedicalRecords,
  getMedicalRecordById,
  createMedicalRecordDraft,
  updateMedicalRecordDraft,
  uploadMedicalRecordAttachment,
};
