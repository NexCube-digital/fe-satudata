// src/lib/hospitalService.js
// Hospital / Faskes Dashboard API Services for SatuData

import { apiGet, apiPut } from "./api";

export const getHospitalProfile = async () => {
  return await apiGet("/api/hospital/profile");
};

export const updateHospitalProfile = async (hospitalData) => {
  return await apiPut("/api/hospital/profile", hospitalData);
};

export const getPatientMedicalRecords = async (patientId) => {
  return await apiGet(`/api/hospital/patient/${patientId}`);
};

export const getHospitalAuditLogs = async () => {
  return await apiGet("/api/hospital/audit");
};

export default {
  getHospitalProfile,
  updateHospitalProfile,
  getPatientMedicalRecords,
  getHospitalAuditLogs,
};
