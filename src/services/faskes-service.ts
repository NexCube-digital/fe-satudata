import { apiGet, apiPost, apiPut } from '@/lib/api-client';
import { ApiResponse } from '@/types/api';
import { Faskes, ServiceUnit, Staff } from '@/types/faskes';

export const getHospitalProfile = async (): Promise<ApiResponse<Faskes>> => {
  return await apiGet('/api/hospital/profile');
};

export const updateHospitalProfile = async (hospitalData: Partial<Faskes>): Promise<ApiResponse<Faskes>> => {
  return await apiPut('/api/hospital/profile', hospitalData);
};

export const getServiceUnits = async (): Promise<ApiResponse<ServiceUnit[]>> => {
  return await apiGet('/api/hospital/service-units');
};

export const getHospitalStaffs = async (): Promise<ApiResponse<Staff[]>> => {
  return await apiGet('/api/hospital/staffs');
};

export const getHospitalAuditLogs = async (params: Record<string, any> = {}): Promise<ApiResponse> => {
  return await apiGet('/api/hospital/audit', params);
};

export const createPatientByHospital = async (patientData: any): Promise<ApiResponse> => {
  return await apiPost('/api/hospital/create-patient-account', patientData);
};

export const searchPatientByNik = async (nik: string): Promise<ApiResponse> => {
  return await apiGet('/api/hospital/search-patient', { nik });
};

export const getPatientMedicalRecords = async (patientId: any, params: Record<string, any> = {}) => {
  return await apiGet(`/api/hospital/patient/${patientId}`, params);
};

export const getHospitalMedicalRecords = async (params: Record<string, any> = {}) => {
  return await apiGet('/api/hospital/medical-record', params);
};

export const createMedicalRecordDraft = async (payload: any) => {
  return await apiPost('/api/hospital/medical-record', payload);
};

export const updateMedicalRecordDraft = async (recordId: any, payload: any) => {
  return await apiPut(`/api/hospital/medical-record/${recordId}`, payload);
};

export const getMedicalRecordById = async (recordId: any) => {
  return await apiGet(`/api/hospital/medical-record/${recordId}`);
};

export default {
  getHospitalProfile,
  updateHospitalProfile,
  getServiceUnits,
  getHospitalStaffs,
  getHospitalAuditLogs,
  createPatientByHospital,
  searchPatientByNik,
  getPatientMedicalRecords,
  getHospitalMedicalRecords,
  createMedicalRecordDraft,
  updateMedicalRecordDraft,
  getMedicalRecordById,
};
