// src/lib/doctorService.js
// Doctor Management API Services for Hospital / Faskes

import { apiGet, apiPost, apiPut, apiDelete } from "./api";

export const getDoctors = async () => {
  return await apiGet("/api/patient/doctor");
};

export const createDoctor = async (doctorData) => {
  return await apiPost("/api/patient/doctor", doctorData);
};

export const updateDoctor = async (doctorData) => {
  return await apiPut("/api/patient/doctor", doctorData);
};

export const deleteDoctor = async (doctorId) => {
  return await apiDelete(`/api/patient/doctor?id=${doctorId}`);
};

export default {
  getDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
};
