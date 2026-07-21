// src/lib/patientService.js
// Patient Dashboard API Services for SatuData

import { apiGet, apiPut } from "./api";

export const getPatientProfile = async () => {
  return await apiGet("/api/patient/profile");
};

export const updatePatientProfile = async (profileData) => {
  return await apiPut("/api/patient/profile", profileData);
};

export const getPatientMedicalHistory = async () => {
  return await apiGet("/api/patient/history");
};

export const getPatientMedicalRecordDetail = async (id) => {
  return await apiGet(`/api/patient/history/${id}`);
};

export const getPatientAuditLogs = async () => {
  return await apiGet("/api/patient/audit");
};

export default {
  getPatientProfile,
  updatePatientProfile,
  getPatientMedicalHistory,
  getPatientMedicalRecordDetail,
  getPatientAuditLogs,
};
