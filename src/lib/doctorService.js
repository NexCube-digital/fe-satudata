// src/lib/doctorService.js
// Doctor Management API Services for Hospital / Faskes

import { apiGet, apiPost, apiPut, apiDelete } from "./api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export const getDoctors = async () => {
  return await apiGet("/api/doctor");
};

export const createDoctor = async (doctorData) => {
  const token = localStorage.getItem("accessToken");
  if (doctorData.imageFile) {
    const formData = new FormData();
    Object.keys(doctorData).forEach((key) => {
      if (key === "imageFile") {
        formData.append("image", doctorData.imageFile);
      } else {
        formData.append(key, doctorData[key]);
      }
    });

    const res = await fetch(`${API_BASE_URL}/api/doctor`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });
    return await res.json();
  }
  return await apiPost("/api/doctor", doctorData);
};

export const updateDoctor = async (doctorData) => {
  const token = localStorage.getItem("accessToken");
  if (doctorData.imageFile) {
    const formData = new FormData();
    Object.keys(doctorData).forEach((key) => {
      if (key === "imageFile") {
        formData.append("image", doctorData.imageFile);
      } else {
        formData.append(key, doctorData[key]);
      }
    });

    const res = await fetch(`${API_BASE_URL}/api/doctor/${doctorData.id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });
    return await res.json();
  }
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
