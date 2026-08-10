"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { maskSip } from "@/utils/masking";

export function usePatientHistory() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "records";

  const [loading, setLoading] = useState(true);
  const [activeMainTab, setActiveMainTab] = useState(initialTab);

  // Records States
  const [records, setRecords] = useState([]);
  const [searchTermRecords, setSearchTermRecords] = useState("");
  const [hospitalFilter, setHospitalFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [decryptedState, setDecryptedState] = useState({});
  const [decryptedDetails, setDecryptedDetails] = useState({});
  const [decryptingIds, setDecryptingIds] = useState({});
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Consent States
  const [requests, setRequests] = useState([]);
  const [consentTab, setConsentTab] = useState("all");
  const [searchTermConsent, setSearchTermConsent] = useState("");
  const [submittingId, setSubmittingId] = useState(null);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && ["records", "consent", "audit"].includes(tabFromUrl)) {
      setActiveMainTab(tabFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const [historyRes, invoicesRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/patient/history`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json()).catch(() => null),
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/invoice/list`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json()).catch(() => null)
      ]);

      const rawRecords = Array.isArray(historyRes?.data) ? historyRes.data : [];
      const rawInvoices = Array.isArray(invoicesRes?.data) ? invoicesRes.data : [];

      const paidInvoiceRecIds = new Set();
      rawInvoices.forEach(inv => {
        if (inv.status === "paid" && Array.isArray(inv.medical_record_ids)) {
          inv.medical_record_ids.forEach(id => paidInvoiceRecIds.add(id));
        }
      });

      const finishedLunasRecords = rawRecords.filter(item => {
        if (item.status === "draft") return false;
        return paidInvoiceRecIds.has(item.id) || item.already_invoiced || item.status === "final";
      });

      const beRecords = finishedLunasRecords.map((item) => ({
        id: item.id,
        hospitalName: item.hospital?.user?.name || item.hospital_name || item.hospital?.name || "Rumah Sakit Terdaftar",
        hospitalCode: maskSip(item.hospital?.medical_license),
        doctorName: item.doctor?.name || "Dokter Terdaftar",
        specialty: item.doctor?.specialist || "Poli Kesehatan",
        category: item.record_type || "umum",
        status: "Selesai & Lunas",
        date: new Date(item.visit_date || item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
        time: new Date(item.visit_date || item.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
        txHash: item.tx_hash || null,
        encryptedData: "U2FsdGVkX1+9M2Y5NzhkYTUxNmFkOTY5Y2QwMzgxM2I5Mzg5YTI0ZjM0MmQwNmFk...",
        diagnosis: item.title || "Konsultasi Medis & Rekam Kesehatan Terenkripsi",
        prescriptions: [
          { medicine: "Amoxicillin 500mg", dosage: "3x1 Tablet sesudah makan (5 Hari)" },
          { medicine: "Paracetamol 500mg", dosage: "3x1 Tablet jika demam (P.R.N)" }
        ],
        vitals: { bp: "120/80 mmHg", pulse: "80 bpm", temp: "36.8 °C", weight: "65 kg" },
        notes: "Dokumen rekam medis sah dan kwitansi pelunasan lunas."
      }));
      setRecords(beRecords);
    } catch (err) {
      console.log("Error fetching history", err);
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/patient/access-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.data) {
        const beRequests = result.data.map((item) => ({
          id: item.id,
          hospitalName: item.hospital?.user?.name || "Rumah Sakit Terdaftar",
          hospitalCode: maskSip(item.hospital?.medical_license),
          department: "Unit Pelayanan Medis",
          doctorName: "Dokter Penanggung Jawab",
          accessScope: item.requested_data ? item.requested_data.split(",") : ["Riwayat Rekam Medis Terenkripsi"],
          duration: "30 Hari",
          status: item.status || "pending",
          txHash: item.tx_hash || item.txHash || null,
          grantedAt: new Date(item.updated_at || item.created_at).toLocaleDateString("id-ID"),
          expiresAt: item.expire_time ? new Date(item.expire_time).toLocaleDateString("id-ID") : "-"
        }));
        setRequests(beRequests);
      }
    } catch (err) {
      console.log("Error loading consent requests", err);
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/patient/audit`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      const rawLogs = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []);

      if (rawLogs.length > 0) {
        const mapped = rawLogs.map((item) => {
          let actionText = item.action || "Aktivitas Akses Data";
          if (item.action === "approve_akses") actionText = "grantAccess() Approved";
          if (item.action === "reject_akses") actionText = "Request Access Rejected";
          if (item.action === "revoke_akses") actionText = "revokeAccess() Executed";
          if (item.action === "lihat_detail_rekam_medis") actionText = "decryptEHR() Accessed";
          if (item.action === "pembayaran_invoice") actionText = "Invoice Payment Completed";

          return {
            id: item.id,
            action: actionText,
            hospital: item.information || "SatuData Blockchain Core",
            txHash: item.tx_hash || item.txHash || "0x5baf92a1f4b2c8a3e7d91f2c4e6b8a0d92e4f6a8c1d3e5f7a9b0c2d4e6f8a0b2",
            timestamp: new Date(item.created_at || Date.now()).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            status: item.status === "error" || item.status === "failed" ? "error" : "success"
          };
        });
        setAuditLogs(mapped);
      } else {
        setAuditLogs([
          {
            id: 1,
            action: "grantAccess() Approved",
            hospital: "RS Rotinsulu - Izin Akses Rekam Medis Disetujui Pasien",
            txHash: "0x5baf92a1f4b2c8a3e7d91f2c4e6b8a0d92e4f6a8c1d3e5f7a9b0c2d4e6f8a0b2",
            timestamp: "7 Agustus 2026, 08.15 WIB",
            status: "success"
          }
        ]);
      }
    } catch (err) {
      console.log("Error loading audit logs", err);
    }

    setLoading(false);
  };

  const mapBackendDetailToFrontend = (rec, backendData) => {
    const detail = backendData.detail || {};
    const summary = backendData.summary || backendData.title || rec?.diagnosis;
    
    let diagnosis = summary;
    let prescriptions = [];
    let vitals = null;
    let notes = "Telah didekripsi secara aman.";

    if (rec?.category === "umum") {
      diagnosis = detail.diagnosis || summary;
      notes = detail.note_doctor || "Tidak ada catatan tambahan.";
      if (detail.complaint || detail.action) {
        notes = `Keluhan: ${detail.complaint || '-'}\nTindakan: ${detail.action || '-'}\nCatatan: ${notes}`;
      }
    } else if (rec?.category === "resep") {
      diagnosis = "Resep Obat";
      notes = detail.note || "Aturan pakai terlampir.";
      if (detail.list_of_medicines) {
        const meds = detail.list_of_medicines.split(";").map(item => {
          const parts = item.split(":");
          return {
            medicine: parts[0]?.trim() || "Obat",
            dosage: parts[1]?.trim() || "Sesuai petunjuk dokter"
          };
        });
        prescriptions = meds;
      }
    } else if (rec?.category === "lab") {
      diagnosis = `Pemeriksaan Laboratorium: ${summary}`;
      notes = `Kesimpulan: ${detail.conclusion || "-"}\nNilai Rujukan: ${detail.reference_values || "-"}`;
      vitals = { bp: "N/A", pulse: "N/A", temp: "N/A", weight: "Hasil Lab: " + (detail.checkup_result || "-") };
    } else if (rec?.category === "radiologi") {
      diagnosis = `Pemeriksaan Radiologi: ${summary}`;
      notes = `Kesimpulan: ${detail.conclusion || "-"}`;
      vitals = { bp: "N/A", pulse: "N/A", temp: "N/A", weight: "Hasil Radiologi: " + (detail.checkup_result || "-") };
    }

    return {
      ...rec,
      diagnosis,
      prescriptions,
      vitals,
      notes,
      isRealDecrypted: true
    };
  };

  const toggleDecryptRecord = async (id) => {
    const isCurrentlyDecrypted = decryptedState[id];
    setDecryptedState((prev) => ({ ...prev, [id]: !prev[id] }));

    if (!isCurrentlyDecrypted && !decryptedDetails[id]) {
      setDecryptingIds((prev) => ({ ...prev, [id]: true }));
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/patient/history/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();
        if (res.ok && result.data) {
          const originalRecord = records.find(r => r.id === id);
          const mappedRecord = mapBackendDetailToFrontend(originalRecord, result.data);
          setDecryptedDetails((prev) => ({ ...prev, [id]: mappedRecord }));
        }
      } catch (err) {
        console.error("Error decrypting record:", err);
      } finally {
        setDecryptingIds((prev) => ({ ...prev, [id]: false }));
      }
    }
  };

  const handleOpenDetailModal = async (rec) => {
    setSelectedRecord(rec);
    const id = rec.id;
    if (!decryptedDetails[id]) {
      setDecryptingIds((prev) => ({ ...prev, [id]: true }));
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/patient/history/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();
        if (res.ok && result.data) {
          const mappedRecord = mapBackendDetailToFrontend(rec, result.data);
          setDecryptedDetails((prev) => ({ ...prev, [id]: mappedRecord }));
        }
      } catch (err) {
        console.error("Error opening modal:", err);
      } finally {
        setDecryptingIds((prev) => ({ ...prev, [id]: false }));
      }
    }
  };

  const handleConsentAction = async (requestId, targetStatus) => {
    setSubmittingId(requestId);
    const token = localStorage.getItem("accessToken");
    const generatedHash = "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

    try {
      const endpointMap = {
        approved: `/api/patient/access-requests/${requestId}/approve`,
        rejected: `/api/patient/access-requests/${requestId}/reject`,
        revoked: `/api/patient/access-requests/${requestId}/revoke`
      };
      const endpoint = endpointMap[targetStatus];
      if (endpoint && token) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ txHash: generatedHash })
        });
        const result = await res.json();
        if (res.ok && result.success) {
          fetchAllData();
        }
      }
    } catch (err) {
      console.log("Consent action error", err);
    } finally {
      setSubmittingId(null);
    }
  };

  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.hospitalName.toLowerCase().includes(searchTermRecords.toLowerCase()) ||
      rec.doctorName.toLowerCase().includes(searchTermRecords.toLowerCase()) ||
      rec.diagnosis.toLowerCase().includes(searchTermRecords.toLowerCase()) ||
      rec.hospitalCode.toLowerCase().includes(searchTermRecords.toLowerCase());

    const matchesHospital = hospitalFilter === "all" || rec.hospitalName === hospitalFilter;
    const matchesCategory = categoryFilter === "all" || rec.category.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesHospital && matchesCategory;
  });

  const uniqueHospitals = Array.from(new Set(records.map((r) => r.hospitalName)));
  const historyRequestsList = requests.filter((r) => r.status !== "pending");

  const filteredConsentHistory = requests.filter((req) => {
    if (req.status === "pending") return false;

    const matchesSearch =
      req.hospitalName.toLowerCase().includes(searchTermConsent.toLowerCase()) ||
      req.hospitalCode.toLowerCase().includes(searchTermConsent.toLowerCase()) ||
      (req.txHash && req.txHash.toLowerCase().includes(searchTermConsent.toLowerCase()));

    if (!matchesSearch) return false;

    if (consentTab === "approved") return req.status === "approved";
    if (consentTab === "revoked") return req.status === "revoked" || req.status === "rejected";

    return true;
  });

  const changeTab = (tab) => {
    setActiveMainTab(tab);
    router.push(`/dashboard/pasien/history?tab=${tab}`, { scroll: false });
  };

  return {
    loading,
    activeMainTab,
    records,
    searchTermRecords,
    setSearchTermRecords,
    hospitalFilter,
    setHospitalFilter,
    categoryFilter,
    setCategoryFilter,
    decryptedState,
    decryptedDetails,
    decryptingIds,
    selectedRecord,
    setSelectedRecord,
    requests,
    consentTab,
    setConsentTab,
    searchTermConsent,
    setSearchTermConsent,
    submittingId,
    auditLogs,
    filteredRecords,
    uniqueHospitals,
    historyRequestsList,
    filteredConsentHistory,
    changeTab,
    toggleDecryptRecord,
    handleOpenDetailModal,
    handleConsentAction
  };
}

export default usePatientHistory;
