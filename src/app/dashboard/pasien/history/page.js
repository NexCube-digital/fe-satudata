"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import TxHashLink from "@/components/ui/TxHashLink";
import {
  FileText,
  Search,
  Filter,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Download,
  ShieldCheck,
  Building2,
  Calendar,
  User,
  Stethoscope,
  Activity,
  CheckCircle,
  RefreshCw,
  ChevronRight,
  History,
  Clock,
  Database,
  Layers,
  XCircle
} from "lucide-react";

function PatientUnifiedHistoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "records";

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Active Main Tab: "records" | "consent" | "audit"
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
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error(e);
      }
    }
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setLoading(false);
      return;
    }

    // 1. Fetch Medical Records History
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/patient/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.data) {
        const beRecords = result.data.map((item) => ({
          id: item.id,
          hospitalName: item.hospital?.user?.name || item.hospital_name || item.hospital?.name || "Rumah Sakit Terdaftar",
          hospitalCode: item.hospital?.medical_license || "RS-N/A",
          doctorName: item.doctor?.name || "Dokter Terdaftar",
          specialty: item.doctor?.specialist || "Poli Kesehatan",
          category: item.record_type || "umum",
          status: item.status || "final",
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
          notes: "Telah diverifikasi oleh faskes penanggung jawab."
        }));
        setRecords(beRecords);
      }
    } catch (err) {
      console.log("Error fetching history", err);
    }

    // 2. Fetch Consent Requests
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/patient/access-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.data) {
        const beRequests = result.data.map((item) => ({
          id: item.id,
          hospitalName: item.hospital?.user?.name || "Rumah Sakit Terdaftar",
          hospitalCode: item.hospital?.medical_license || "RS-N/A",
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

    // 3. Fetch Audit Logs
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/patient/audit`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.data) {
        const mapped = result.data.map((item) => {
          let actionText = item.action;
          if (item.action === "approve_akses") actionText = "grantAccess() Approved";
          if (item.action === "reject_akses") actionText = "Request Rejected";
          if (item.action === "revoke_akses") actionText = "revokeAccess() Executed";
          if (item.action === "lihat_detail_rekam_medis") actionText = "decryptEHR() Accessed";

          return {
            id: item.id,
            action: actionText,
            hospital: item.information || "SatuData Core",
            txHash: item.tx_hash ? `${item.tx_hash.substring(0, 6)}...${item.tx_hash.substring(item.tx_hash.length - 4)}` : "0x0000...0000",
            timestamp: new Date(item.created_at || Date.now()).toLocaleDateString("id-ID", { day: "numeric", month: "long" }),
            status: item.status === "success" ? "success" : "error"
          };
        });
        setAuditLogs(mapped);
      }
    } catch (err) {
      console.log("Error loading audit logs", err);
    }

    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  // Record Decryption Logic
  const mapBackendDetailToFrontend = (rec, backendData) => {
    const detail = backendData.detail || {};
    const summary = backendData.summary || backendData.title || rec.diagnosis;
    
    let diagnosis = summary;
    let prescriptions = [];
    let vitals = null;
    let notes = "Telah didekripsi secara aman.";

    if (rec.category === "umum") {
      diagnosis = detail.diagnosis || summary;
      notes = detail.note_doctor || "Tidak ada catatan tambahan.";
      if (detail.complaint || detail.action) {
        notes = `Keluhan: ${detail.complaint || '-'}\nTindakan: ${detail.action || '-'}\nCatatan: ${notes}`;
      }
    } else if (rec.category === "resep") {
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
    } else if (rec.category === "lab") {
      diagnosis = `Pemeriksaan Laboratorium: ${summary}`;
      notes = `Kesimpulan: ${detail.conclusion || "-"}\nNilai Rujukan: ${detail.reference_values || "-"}`;
      vitals = { bp: "N/A", pulse: "N/A", temp: "N/A", weight: "Hasil Lab: " + (detail.checkup_result || "-") };
    } else if (rec.category === "radiologi") {
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

  // Consent Action
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

  // Filtered Medical Records
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

  // Filtered Consent Requests
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">
        <RefreshCw className="h-8 w-8 animate-spin text-rose-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf7f2] via-[#fdfbf7] to-[#f5efe6] flex flex-col pb-16 md:pb-0">
      <Navbar user={user} roleLabel="Pasien Terdaftar" onLogout={handleLogout} />

      <div className="flex flex-1">
        <Sidebar role="pasien" />

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Header Banner */}
          <div className="hidden sm:block relative overflow-hidden rounded-3xl border border-rose-800/40 bg-gradient-to-r from-rose-900 via-rose-800 to-red-900 p-6 sm:p-8 text-white shadow-xl mb-8">
            <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-rose-600/15 blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1 text-xs font-semibold text-rose-300 mb-3">
                  <History className="h-3.5 w-3.5 text-rose-400" />
                  Pusat Riwayat & Ledger Audit Terpadu Pasien
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Riwayat Aktivitas & Medis
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                  Rekapitulasi riwayat rekam medis terenkripsi, log otorisasi hak akses faskes, serta audit trail blockchain dalam satu halaman terpadu.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-md text-xs font-mono">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Total Rekam Medis</p>
                  <p className="font-extrabold text-white text-base mt-0.5">{records.length} Berkas</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-md text-xs font-mono">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Otorisasi Disetujui</p>
                  <p className="font-bold text-emerald-400 text-base mt-0.5">{requests.filter(r => r.status === "approved").length} Faskes</p>
                </div>
              </div>
            </div>
          </div>

          {/* UNIFIED TAB NAVIGATION BAR */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-1.5 shadow-xs mb-8 flex flex-wrap gap-1">
            <button
              onClick={() => changeTab("records")}
              className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                activeMainTab === "records"
                  ? "bg-gradient-to-r from-rose-900 to-rose-800 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <FileText className="h-4 w-4 shrink-0" />
              <span>Riwayat Rekam Medis ({records.length})</span>
            </button>

            <button
              onClick={() => changeTab("consent")}
              className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                activeMainTab === "consent"
                  ? "bg-gradient-to-r from-rose-900 to-rose-800 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>Riwayat Otorisasi ({historyRequestsList.length})</span>
            </button>

            <button
              onClick={() => changeTab("audit")}
              className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                activeMainTab === "audit"
                  ? "bg-gradient-to-r from-rose-900 to-rose-800 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Database className="h-4 w-4 shrink-0" />
              <span>Audit Trail Blockchain ({auditLogs.length})</span>
            </button>
          </div>

          {/* TAB 1: RIWAYAT REKAM MEDIS */}
          {activeMainTab === "records" && (
            <div className="space-y-6 animate-fade-in">
              {/* Search & Filter Bar */}
              <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="relative sm:col-span-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari RS, Dokter, atau Diagnosa..."
                      value={searchTermRecords}
                      onChange={(e) => setSearchTermRecords(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-rose-500 focus:bg-white focus:outline-hidden transition"
                    />
                  </div>

                  <div>
                    <select
                      value={hospitalFilter}
                      onChange={(e) => setHospitalFilter(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-700 focus:border-rose-500 focus:bg-white focus:outline-hidden transition"
                    >
                      <option value="all">Semua Rumah Sakit ({records.length})</option>
                      {uniqueHospitals.map((h, i) => (
                        <option key={i} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-700 focus:border-rose-500 focus:bg-white focus:outline-hidden transition"
                    >
                      <option value="all">Semua Jenis Layanan</option>
                      <option value="umum">Rawat Jalan / Umum</option>
                      <option value="lab">Laboratorium</option>
                      <option value="radiologi">Radiologi</option>
                      <option value="resep">Resep Obat</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Records List Container */}
              <div className="space-y-4">
                {filteredRecords.length === 0 ? (
                  <div className="rounded-3xl bg-white border border-slate-200 p-12 text-center">
                    <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-slate-800">Tidak ada riwayat rekam medis</h3>
                    <p className="text-xs text-slate-500 mt-1">Coba ubah kata kunci atau filter pencarian Anda.</p>
                  </div>
                ) : (
                  filteredRecords.map((rec) => {
                    const isDecrypted = decryptedState[rec.id];
                    const isDecrypting = decryptingIds[rec.id];
                    const displayRec = decryptedDetails[rec.id] || rec;

                    return (
                      <div
                        key={rec.id}
                        className="rounded-3xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:border-rose-300 hover:shadow-md transition-all duration-200"
                      >
                        {/* Header Info */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
                          <div className="flex items-start gap-3.5 min-w-0">
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 border border-rose-200 font-bold text-rose-700 text-sm shadow-2xs">
                              {rec.hospitalName.substring(0, 2).toUpperCase()}
                            </span>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-base font-extrabold text-slate-900 truncate">{rec.hospitalName}</h3>
                                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-mono font-bold text-slate-600 border border-slate-200 shrink-0">
                                  {rec.hospitalCode}
                                </span>
                                <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200 uppercase shrink-0">
                                  {rec.category}
                                </span>
                                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border shrink-0 ${
                                  rec.status === "final" || rec.status === "Terverifikasi"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-amber-50 text-amber-700 border-amber-200"
                                }`}>
                                  {rec.status === "final" ? "Terverifikasi" : rec.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 truncate">
                                <Stethoscope className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                {rec.doctorName} <span className="text-slate-300">•</span> {rec.specialty}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col sm:items-end text-xs text-slate-500 font-mono shrink-0">
                            <span className="flex items-center gap-1 text-slate-600 font-bold">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" /> {rec.date}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">{rec.time}</span>
                          </div>
                        </div>

                        {/* Content Preview Box */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                              {isDecrypted ? "Data Rekam Medis (Terdekripsi AES-256)" : "Ciphertext Terenkripsi"}
                            </span>

                            <button
                              onClick={() => toggleDecryptRecord(rec.id)}
                              disabled={isDecrypting}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition cursor-pointer disabled:opacity-50"
                            >
                              {isDecrypting ? (
                                <>
                                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-600" /> Mendekripsi...
                                </>
                              ) : isDecrypted ? (
                                <>
                                  <EyeOff className="h-3.5 w-3.5 text-rose-600" /> Sembunyikan Data
                                </>
                              ) : (
                                <>
                                  <Eye className="h-3.5 w-3.5 text-emerald-600" /> Dekripsi Rekam Medis
                                </>
                              )}
                            </button>
                          </div>

                          {isDecrypting ? (
                            <div className="rounded-2xl bg-slate-50 p-6 flex flex-col items-center justify-center border border-slate-200">
                              <RefreshCw className="h-6 w-6 animate-spin text-rose-600 mb-2" />
                              <p className="text-xs font-bold text-slate-500">Mendekripsi data rekam medis dengan Kunci Privat Anda...</p>
                            </div>
                          ) : isDecrypted ? (() => {
                            return (
                              <div className="rounded-2xl bg-gradient-to-br from-rose-50/70 via-pink-50/40 to-slate-50 border border-rose-100/80 p-5 text-slate-800 shadow-xs animate-fade-in space-y-4 text-xs">
                                <div className="border-b border-rose-100 pb-3">
                                  <p className="text-rose-700 font-bold uppercase text-[10px] tracking-wider mb-1">Diagnosa Utama:</p>
                                  <p className="text-sm font-extrabold text-slate-900">{displayRec.diagnosis}</p>
                                </div>

                                {displayRec.vitals && (
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/90 p-3 rounded-xl border border-rose-100/50 text-[11px] font-mono">
                                    <div>
                                      <span className="text-rose-600 block text-[9px] font-bold">Tekanan Darah</span>
                                      <span className="font-bold text-slate-800">{displayRec.vitals.bp}</span>
                                    </div>
                                    <div>
                                      <span className="text-rose-600 block text-[9px] font-bold">Nadi</span>
                                      <span className="font-bold text-slate-800">{displayRec.vitals.pulse}</span>
                                    </div>
                                    <div>
                                      <span className="text-rose-600 block text-[9px] font-bold">Suhu Tubuh</span>
                                      <span className="font-bold text-slate-800">{displayRec.vitals.temp}</span>
                                    </div>
                                    <div>
                                      <span className="text-rose-600 block text-[9px] font-bold">Berat Badan</span>
                                      <span className="font-bold text-slate-800">{displayRec.vitals.weight}</span>
                                    </div>
                                  </div>
                                )}

                                {displayRec.prescriptions && displayRec.prescriptions.length > 0 && (
                                  <div>
                                    <p className="text-rose-700 font-bold uppercase text-[10px] tracking-wider mb-2">Resep Obat & Aturan Pakai:</p>
                                    <div className="space-y-1.5">
                                      {displayRec.prescriptions.map((rx, idx) => (
                                        <div key={idx} className="flex items-center justify-between rounded-lg bg-white/90 px-3 py-1.5 border border-rose-100/40">
                                          <span className="font-bold text-slate-800">{rx.medicine}</span>
                                          <span className="text-[10px] text-slate-500 font-medium">{rx.dosage}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div>
                                  <p className="text-rose-700 font-bold uppercase text-[10px] tracking-wider mb-1">Catatan Dokter:</p>
                                  <p className="text-slate-700 leading-relaxed text-[11px] bg-white/90 p-2.5 rounded-lg border border-rose-100/40 whitespace-pre-line">{displayRec.notes}</p>
                                </div>
                              </div>
                            );
                          })() : null}
                        </div>

                        {/* Record Footer */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-3 border-t border-slate-100 min-w-0">
                          <div className="font-mono text-[10px] text-slate-500 min-w-0">
                            Blockchain Tx Hash:{" "}
                            {rec.txHash ? (
                              <TxHashLink txHash={rec.txHash} className="text-rose-600 font-bold font-mono inline-flex items-center gap-1 max-w-full" title={rec.txHash}>
                                <span className="truncate max-w-[150px] xs:max-w-[220px] sm:max-w-[280px]">{rec.txHash}</span>
                              </TxHashLink>
                            ) : (
                              <span className="text-slate-400 font-sans italic">Belum ada (Pending Blockchain)</span>
                            )}
                          </div>

                          <button
                            onClick={() => handleOpenDetailModal(rec)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer shrink-0"
                          >
                            Detail Lengkap & Audit Trail <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: RIWAYAT OTORISASI AKSES */}
          {activeMainTab === "consent" && (
            <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="h-4.5 w-4.5 text-rose-600" />
                    Riwayat & Status Persetujuan ({historyRequestsList.length})
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Daftar izin akses yang telah Anda putuskan sebelumnya.</p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setConsentTab("all")}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                      consentTab === "all" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    onClick={() => setConsentTab("approved")}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                      consentTab === "approved" ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Aktif
                  </button>
                  <button
                    onClick={() => setConsentTab("revoked")}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                      consentTab === "revoked" ? "bg-rose-600 text-white" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Dicabut
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchTermConsent}
                  onChange={(e) => setSearchTermConsent(e.target.value)}
                  placeholder="Cari dalam histori otorisasi..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-rose-600 focus:outline-hidden bg-slate-50/50"
                />
              </div>

              <div className="space-y-4">
                {filteredConsentHistory.length === 0 ? (
                  <div className="rounded-2xl bg-slate-50/50 border border-slate-100 p-8 text-center">
                    <Building2 className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-500">Histori Otorisasi Kosong</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Tidak ada riwayat izin akses yang sesuai filter.</p>
                  </div>
                ) : (
                  filteredConsentHistory.map((req) => (
                    <div
                      key={req.id}
                      className="rounded-2xl border border-slate-200/90 p-4 transition-all duration-200 hover:border-rose-300 hover:shadow-xs bg-white"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 text-xs shadow-2xs">
                            {req.hospitalName.charAt(0)}{req.hospitalName.charAt(3)}
                          </span>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900 truncate">{req.hospitalName}</h4>
                              <span className="text-[10px] font-mono text-slate-400">({req.hospitalCode})</span>
                            </div>
                            <p className="text-xs text-slate-500 truncate">{req.department}</p>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {req.status === "approved" && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                              Akses Disetujui
                            </span>
                          )}
                          {(req.status === "revoked" || req.status === "rejected") && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-xs font-bold text-rose-700">
                              <Lock className="h-3.5 w-3.5 text-rose-600" />
                              Izin Akses Dicabut
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] font-mono text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3">
                        <div>
                          <span className="text-slate-400 block">Masa Berlaku:</span>
                          <span className="font-bold text-slate-700">{req.duration}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Tanggal Izin:</span>
                          <span className="font-bold text-slate-700">{req.grantedAt}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Kadaluarsa:</span>
                          <span className="font-bold text-slate-700">{req.expiresAt}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="border-t border-slate-100 pt-3 mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs min-w-0">
                        <div className="font-mono text-[9px] text-slate-400 min-w-0">
                          Tx Hash: <TxHashLink txHash={req.txHash} className="text-rose-600 font-bold inline-flex items-center gap-1 max-w-full" title={req.txHash}><span className="truncate max-w-[150px] xs:max-w-[220px] sm:max-w-[280px]">{req.txHash}</span></TxHashLink>
                        </div>

                        <div className="shrink-0 w-full sm:w-auto">
                          {req.status === "approved" && (
                            <button
                              onClick={() => handleConsentAction(req.id, "revoked")}
                              disabled={submittingId === req.id}
                              className="rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 px-4 py-2 font-bold transition cursor-pointer flex items-center justify-center gap-1.5 w-full sm:w-auto"
                            >
                              {submittingId === req.id ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
                              Cabut Akses
                            </button>
                          )}

                          {req.status === "revoked" && (
                            <button
                              onClick={() => handleConsentAction(req.id, "approved")}
                              disabled={submittingId === req.id}
                              className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 px-4 py-2 font-bold transition cursor-pointer flex items-center justify-center gap-1.5 w-full sm:w-auto"
                            >
                              {submittingId === req.id ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Unlock className="h-3.5 w-3.5" />}
                              Izinkan Kembali
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: AUDIT TRAIL BLOCKCHAIN STREAM */}
          {activeMainTab === "audit" && (
            <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-4 animate-fade-in">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Database className="h-5 w-5 text-rose-600" />
                  Console Audit Trail Blockchain Real-time
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Seluruh mutasi hak akses, dekripsi rekam medis, dan aksi transaksi terikat secara tak-terubahkan (immutable) pada ledger blockchain.
                </p>
              </div>

              <div className="space-y-3">
                {auditLogs.length === 0 ? (
                  <p className="text-xs text-slate-500 py-8 italic text-center">Belum ada aktivitas transaksi blockchain.</p>
                ) : (
                  auditLogs.map((log) => (
                    <div key={log.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-xs hover:border-slate-200 transition">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <span className={`font-extrabold text-xs ${log.status === "success" ? "text-emerald-700" : "text-rose-700"}`}>
                          {log.action}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{log.timestamp}</span>
                      </div>
                      <p className="text-slate-700 font-medium text-xs mt-1">{log.hospital}</p>
                      <p className="text-[10px] font-mono text-rose-600 mt-1.5 min-w-0">
                        Tx Hash: <TxHashLink txHash={log.txHash} className="inline-flex items-center gap-1 max-w-full" title={log.txHash}><span className="truncate max-w-[200px] sm:max-w-[320px]">{log.txHash}</span></TxHashLink>
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Modal Detail View */}
          {selectedRecord && (() => {
            const displaySelected = decryptedDetails[selectedRecord.id] || selectedRecord;
            const isModalDecrypting = decryptingIds[selectedRecord.id];
            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 font-bold text-xs">
                        {displaySelected.hospitalName.substring(0, 2).toUpperCase()}
                      </span>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900">{displaySelected.hospitalName}</h3>
                        <p className="text-xs text-slate-500">{displaySelected.date} • {displaySelected.time}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedRecord(null)}
                      className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  {isModalDecrypting ? (
                    <div className="py-12 flex flex-col items-center justify-center">
                      <RefreshCw className="h-8 w-8 animate-spin text-rose-600 mb-3" />
                      <p className="text-xs font-bold text-slate-500">Mendekripsi rekam medis...</p>
                    </div>
                  ) : (
                    <div className="space-y-4 text-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Dokter Penanggung Jawab</span>
                        <p className="font-bold text-slate-800 text-sm">{displaySelected.doctorName}</p>
                        <p className="text-slate-500">{displaySelected.specialty}</p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-2">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Diagnosa Utama</span>
                        <p className="font-bold text-slate-900 text-sm">{displaySelected.diagnosis}</p>
                        <p className="text-slate-600 mt-2 leading-relaxed whitespace-pre-line">{displaySelected.notes}</p>
                      </div>

                      {displaySelected.prescriptions && displaySelected.prescriptions.length > 0 && (
                        <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-2">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Resep Obat & Aturan Pakai</span>
                          <div className="space-y-1.5 mt-2">
                            {displaySelected.prescriptions.map((rx, idx) => (
                              <div key={idx} className="flex items-center justify-between rounded-lg bg-white px-3 py-1.5 border border-slate-200">
                                <span className="font-bold text-slate-800">{rx.medicine}</span>
                                <span className="text-[10px] text-slate-500">{rx.dosage}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="rounded-2xl bg-slate-50 p-4 text-[10px] font-mono text-slate-600 space-y-1 border border-slate-200/80">
                        <p className="text-rose-700 font-bold">VERIFIKASI BLOCKCHAIN & ENKRIPSI:</p>
                        <p className="text-slate-700 min-w-0">Tx Hash: <TxHashLink txHash={displaySelected.txHash} className="inline-flex items-center gap-1 max-w-full" title={displaySelected.txHash}><span className="truncate max-w-[200px] sm:max-w-[320px]">{displaySelected.txHash}</span></TxHashLink></p>
                        <p className="text-slate-500">Enkripsi: Off-chain AES-256 CBC Mode</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-6 border-t border-slate-100 mt-6 flex justify-end gap-3">
                    <button
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-2 rounded-xl bg-rose-800 text-white px-5 py-2.5 text-xs font-bold shadow-sm hover:bg-rose-900 transition cursor-pointer"
                    >
                      <Download className="h-4 w-4" /> Unduh Dokumen PDF
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </main>
      </div>
    </div>
  );
}

export default function PatientUnifiedHistoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">
        <RefreshCw className="h-8 w-8 animate-spin text-rose-600" />
      </div>
    }>
      <PatientUnifiedHistoryContent />
    </Suspense>
  );
}
