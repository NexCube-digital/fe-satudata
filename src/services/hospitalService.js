import { apiGet, apiPost, apiPut } from "@/lib/api";

export const getHospitalProfile = async () => {
  return await apiGet("/api/hospital/profile");
};

export const updateHospitalProfile = async (hospitalData) => {
  return await apiPut("/api/hospital/profile", hospitalData);
};

export const getPatientMedicalRecords = async (patientId, params = {}) => {
  return await apiGet(`/api/hospital/patient/${patientId}`, params);
};

export const getHospitalMedicalRecords = async (params = {}) => {
  return await apiGet("/api/hospital/medical-record", params);
};

export const createMedicalRecordDraft = async (payload) => {
  return await apiPost("/api/hospital/medical-record", payload);
};

export const updateMedicalRecordDraft = async (recordId, payload) => {
  return await apiPut(`/api/hospital/medical-record/${recordId}`, payload);
};

export const getMedicalRecordById = async (recordId) => {
  return await apiGet(`/api/hospital/medical-record/${recordId}`);
};

export const getHospitalAuditLogs = async (params = {}) => {
  return await apiGet("/api/hospital/audit", params);
};

export const createPatientByHospital = async (patientData) => {
  return await apiPost("/api/hospital/create-patient-account", patientData);
};

export const searchPatientByNik = async (nik) => {
  return await apiGet("/api/hospital/search-patient", { nik });
};

export default {
  getHospitalProfile,
  updateHospitalProfile,
  getPatientMedicalRecords,
  getHospitalMedicalRecords,
  createMedicalRecordDraft,
  updateMedicalRecordDraft,
  getMedicalRecordById,
  getHospitalAuditLogs,
  createPatientByHospital,
  searchPatientByNik,
};