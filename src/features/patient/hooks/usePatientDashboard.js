"use client";

import { useState, useEffect } from "react";
import { maskSip } from "@/utils/masking";

export function usePatientDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hospitals, setHospitals] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [decryptedRecords, setDecryptedRecords] = useState({});
  const [actionInProgress, setActionInProgress] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUser(parsed);
        fetchLatestProfile(parsed);
      } catch (e) {
        console.error(e);
      }
    }
    fetchDashboardData();
    setLoading(false);
  }, []);

  const fetchLatestProfile = async (currentUser) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/patient/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.data) {
        const u = result.data;
        const updated = {
          ...currentUser,
          name: u.name || currentUser.name,
          nik: u.profil?.nik || u.nik || currentUser.nik,
          wallet_address: u.wallet_address || currentUser.wallet_address
        };
        setUser(updated);
        localStorage.setItem("user", JSON.stringify(updated));
        window.dispatchEvent(new Event("userUpdated"));
      }
    } catch (err) {
      console.log("Could not sync profile from BE", err);
    }
  };

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/patient/access-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.data) {
        const mapped = result.data.map((item) => ({
          id: item.id,
          name: item.hospital?.user?.name || "Rumah Sakit Terdaftar",
          code: maskSip(item.hospital?.medical_license),
          dept: "Instalasi / Layanan Medis",
          status: item.status,
          txHash: item.tx_hash || item.txHash || null,
          grantedAt: new Date(item.updated_at || item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
          accessTypes: item.requested_data ? item.requested_data.split(",") : ["Diagnosis", "Resep Obat"]
        }));
        setHospitals(mapped);
      }
    } catch (err) {
      console.log("Error fetching access requests", err);
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/patient/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.data) {
        const mapped = result.data.map((item) => ({
          id: item.id,
          hospitalName: item.hospital?.user?.name || item.hospital_name || item.hospital?.name || "Rumah Sakit Terdaftar",
          doctor: item.doctor?.name || "Dokter Terdaftar",
          date: new Date(item.visit_date || item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
          summary: item.title || "Konsultasi & Catatan Medis",
          txHash: item.tx_hash || null,
          status: item.status || "final"
        }));
        setMedicalRecords(mapped);
      }
    } catch (err) {
      console.log("Error fetching medical records", err);
    }
  };

  const handleToggleConsent = async (hospitalId, currentStatus) => {
    setActionInProgress(hospitalId);
    const token = localStorage.getItem("accessToken");
    const targetStatus = currentStatus === "approved" ? "revoked" : "approved";
    const endpoint = currentStatus === "approved"
      ? `/api/patient/access-requests/${hospitalId}/revoke`
      : `/api/patient/access-requests/${hospitalId}/approve`;

    const generatedHash = "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ txHash: generatedHash })
      });
      if (res.ok) {
        setHospitals((prev) =>
          prev.map((h) => (h.id === hospitalId ? { ...h, status: targetStatus, txHash: generatedHash } : h))
        );
      }
    } catch (err) {
      console.log("Error toggling consent", err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDecrypt = async (id) => {
    if (decryptedRecords[id]) {
      setDecryptedRecords((prev) => ({ ...prev, [id]: null }));
      return;
    }

    setActionInProgress(id);
    const token = localStorage.getItem("accessToken");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/patient/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.data) {
        const detail = result.data.detail || {};
        let text = result.data.summary || result.data.title || "Telah didekripsi secara aman.";
        if (detail.diagnosis) text += ` | Diagnosa: ${detail.diagnosis}`;
        if (detail.note_doctor) text += ` | Catatan: ${detail.note_doctor}`;
        setDecryptedRecords((prev) => ({ ...prev, [id]: text }));
      }
    } catch (err) {
      console.log("Error decrypting EHR", err);
    } finally {
      setActionInProgress(null);
    }
  };

  return {
    user,
    loading,
    hospitals,
    medicalRecords,
    decryptedRecords,
    actionInProgress,
    handleToggleConsent,
    handleDecrypt,
    fetchDashboardData
  };
}

export default usePatientDashboard;
