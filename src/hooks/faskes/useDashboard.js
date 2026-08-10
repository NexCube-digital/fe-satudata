"use client";

import { useState, useEffect } from "react";
import { getDoctors } from "@/services/doctorService";
import { apiGet } from "@/lib/api";
import { maskNik } from "@/utils/masking";

export function useFaskesDashboard() {
  const [nikInput, setNikInput] = useState("");
  const [poliInput, setPoliInput] = useState("");
  const [purposeInput, setPurposeInput] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [doctors, setDoctors] = useState([]);

  const [requestsList, setRequestsList] = useState([]);
  const [hospitalProfile, setHospitalProfile] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [toast, setToast] = useState({ show: false, type: "success", title: "", message: "" });
  const [syncingReqId, setSyncingReqId] = useState(null);

  const [stats, setStats] = useState({
    kunjungan_hari_ini: 0,
    izin_akses_disetujui: 0,
    request_pending: 0
  });
  const [pharmacyStats, setPharmacyStats] = useState({
    total_obat: 0,
    stok_hampir_habis: 0,
    today_sales: 0,
    today_transactions: 0
  });
  const [sessionOmzet, setSessionOmzet] = useState(0);

  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  const fetchRecentInvoices = async () => {
    setLoadingInvoices(true);
    try {
      const res = await apiGet("/api/invoice/list");
      const list = Array.isArray(res?.data) ? res.data : [];
      setRecentInvoices(list);
    } catch (err) {
      console.error("Error loading recent invoices:", err);
    } finally {
      setLoadingInvoices(false);
    }
  };

  const fetchDashboardStats = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/dashboard/hospital`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.success && result.data) {
        const { stats: backendStats, profile: backendProfile } = result.data;
        setStats({
          kunjungan_hari_ini: backendStats?.kunjungan_hari_ini || 0,
          izin_akses_disetujui: backendStats?.izin_akses_disetujui || 0,
          request_pending: backendStats?.request_pending || 0
        });
        if (backendProfile) {
          setHospitalProfile(backendProfile);
        }
      }

      const pharmRes = await apiGet("/api/hospital/pharmacy/stats");
      if (pharmRes?.success && pharmRes?.data) {
        setPharmacyStats(pharmRes.data);
        if (pharmRes.data.today_sales) {
          setSessionOmzet(pharmRes.data.today_sales);
        }
      }
    } catch (err) {
      console.error("Error loading dashboard stats:", err);
    }
  };

  const fetchDoctorsList = async () => {
    try {
      const res = await getDoctors();
      if (res?.success && res?.data) {
        setDoctors(res.data);
      }
    } catch (err) {
      console.error("Error fetching doctors:", err);
    }
  };

  const fetchRequestsList = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/hospital/access-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.data) {
        const mapped = result.data.map((item) => ({
          id: item.id,
          patientId: item.patient_id,
          patientName: item.patient_name || item.Patient?.name || item.patient?.name || "Pasien Terdaftar",
          nik: item.patient_nik || item.Patient?.profil?.nik || item.patient?.profil?.nik || "-",
          poli: item.requested_data || "Instalasi Medis",
          status: item.status === "approved" ? "Approved" : item.status === "pending" ? "Pending Pasien" : item.status === "rejected" ? "Rejected" : "Revoked",
          txHash: item.tx_hash || item.txHash || null,
          requestedAt: new Date(item.created_at).toLocaleDateString("id-ID")
        }));
        setRequestsList(mapped);
      }
    } catch (err) {
      console.log("Error loading requests list:", err);
    }
  };

  useEffect(() => {
    fetchRequestsList();
    fetchDoctorsList();
    fetchDashboardStats();
    fetchRecentInvoices();
  }, []);

  const showToast = (type, title, message) => {
    setToast({ show: true, type, title, message });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 4000);
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!nikInput) {
      showToast("error", "Data Belum Lengkap", "Silakan masukkan NIK atau Alamat Wallet Pasien.");
      return;
    }

    setSubmittingRequest(true);
    const token = localStorage.getItem("accessToken");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/hospital/access-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          patientNik: nikInput,
          requestedData: poliInput || "Umum"
        })
      });

      const result = await res.json();
      if (res.ok && result.success) {
        showToast(
          "success",
          "Permintaan Izin Berhasil Dikirim!",
          `Notifikasi otorisasi telah dikirimkan ke aplikasi Pasien (NIK: ${maskNik(nikInput)}). Menunggu persetujuan pasien.`
        );
        setNikInput("");
        setPoliInput("");
        setPurposeInput("");
        fetchRequestsList();
        fetchDashboardStats();
      } else {
        showToast("error", "Gagal Mengirim Permintaan", result.message || "Pasien tidak ditemukan atau terjadi kesalahan server.");
      }
    } catch (err) {
      showToast("error", "Koneksi Bermasalah", "Gagal menghubungi server API. Coba beberapa saat lagi.");
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleSyncBlockchain = async (requestId) => {
    setSyncingReqId(requestId);
    const token = localStorage.getItem("accessToken");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/hospital/access-requests/${requestId}/sync-blockchain`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.success) {
        showToast("success", "Sync Blockchain Berhasil", "Permintaan berhasil ditambang ke ledger blockchain!");
        fetchRequestsList();
      } else {
        showToast("error", "Sync Blockchain Gagal", result.message || "Terjadi kesalahan saat memproses transaksi.");
      }
    } catch (err) {
      showToast("error", "Gagal Koneksi", "Terjadi kesalahan jaringan.");
    } finally {
      setSyncingReqId(null);
    }
  };

  return {
    nikInput,
    setNikInput,
    poliInput,
    setPoliInput,
    purposeInput,
    setPurposeInput,
    submittingRequest,
    doctors,
    requestsList,
    hospitalProfile,
    selectedRecord,
    setSelectedRecord,
    toast,
    setToast,
    syncingReqId,
    stats,
    pharmacyStats,
    sessionOmzet,
    recentInvoices,
    loadingInvoices,
    handleCreateRequest,
    handleSyncBlockchain,
    fetchRequestsList,
    fetchDashboardStats,
    fetchRecentInvoices
  };
}

export { useFaskesDashboard as useDashboard };
export default useFaskesDashboard;
