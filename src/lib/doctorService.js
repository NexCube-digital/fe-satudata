// src/lib/doctorService.js
// Doctor Management API Services for Hospital / Faskes

import { apiGet, apiPost, apiPut, apiDelete } from "./api";

export const getDoctors = async () => {
  return await apiGet("/api/doctor");
};

export const createDoctor = async (doctorData) => {
  return await apiPost("/api/doctor", doctorData);
};

export const updateDoctor = async (doctorData) => {
  return await apiPut(`/api/doctor/${doctorData.id}`, doctorData);
};

export const deleteDoctor = async (doctorId) => {
  return await apiDelete(`/api/doctor/${doctorId}`);
};

export default {
  getDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
};
