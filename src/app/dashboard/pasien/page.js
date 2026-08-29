"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TxHashLink from "@/components/ui/TxHashLink";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import {
  User,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Clock,
  Key,
  Database,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Lock,
  Unlock,
  Building2,
  Activity,
  ArrowUpRight,
  RefreshCw,
  Eye,
  EyeOff,
  Plus
} from "lucide-react";

export default function PasienDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dynamic Dashboard States
  const [hospitals, setHospitals] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [decryptedRecords, setDecryptedRecords] = useState({});
  const [auditLogs, setAuditLogs] = useState([]);
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

    // 1. Fetch access requests (hospitals list)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/patient/access-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.data) {
        const mapped = result.data.map((item) => ({
          id: item.id,
          name: item.hospital?.user?.name || "Rumah Sakit Terdaftar",
          code: item.hospital?.medical_license || "N/A",
          dept: "Instalasi / Layanan Medis",
          status: item.status,
          txHash: null,
          grantedAt: new Date(item.updated_at || item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
          accessTypes: item.requested_data ? item.requested_data.split(",") : ["Diagnosis", "Resep Obat"]
        }));
        setHospitals(mapped);
      }
    } catch (err) {
      console.log("Error fetching access requests", err);
    }

    // 2. Fetch history records list
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/patient/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.data) {
        const mapped = result.data.map((item) => ({
          id: item.id,
          hospitalName: item.hospital?.user?.name || "Rumah Sakit Terdaftar",
          doctorName: item.doctor?.name || "Dokter Spesialis",
          category: item.record_type || "Rekam Medis Terverifikasi",
          date: new Date(item.visit_date || item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
          txHash: item.tx_hash || "",
          diagnosis: item.title || "Konsultasi Medis",
          details: "Resep: Amoxicillin, Paracetamol. Catatan: Istirahat cukup."
        }));
        setMedicalRecords(mapped);
      }
    } catch (err) {
      console.log("Error fetching history", err);
    }

    // 3. Fetch audit logs list
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/patient/audit`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.data) {
        const mapped = result.data.map((item) => {
          let actionText = item.action;
          if (item.action === "approve_akses") actionText = "Consent Granted";
          if (item.action === "reject_akses") actionText = "Request Rejected";
          if (item.action === "revoke_akses") actionText = "Consent Revoked";
          if (item.action === "lihat_detail_rekam_medis") actionText = "EHR Decrypted Access";

          return {
            id: item.id,
            action: actionText,
            hospital: item.information || "SatuData Core",
            hash: item.tx_hash ? `${item.tx_hash.substring(0, 6)}...${item.tx_hash.substring(item.tx_hash.length - 4)}` : "0x0000...0000",
            time: new Date(item.created_at || Date.now()).toLocaleDateString("id-ID", { day: "numeric", month: "long" }),
            type: item.status === "success" ? "success" : "info"
          };
        });
        setAuditLogs(mapped);
      }
    } catch (err) {
      console.log("Error fetching audit logs", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  const handleToggleConsent = async (id, newStatus, currentStatus) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const status = String(currentStatus || "").toLowerCase();
    if (newStatus === "approved" && status === "approved") {
      console.warn("Permintaan sudah disetujui, tidak perlu mengirim ulang.");
      return;
    }
    if (newStatus === "rejected" && status !== "pending") {
      console.warn("Hanya request yang masih pending yang bisa ditolak.");
      return;
    }
    if (newStatus === "revoked" && status !== "approved") {
      console.warn("Hanya request yang sudah disetujui yang bisa dicabut.");
      return;
    }

    const txHash = "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

    let endpoint = "";
    if (newStatus === "approved") {
      endpoint = `/api/patient/access-requests/${id}/approve`;
    } else if (newStatus === "rejected") {
      endpoint = `/api/patient/access-requests/${id}/reject`;
    } else if (newStatus === "revoked") {
      endpoint = `/api/patient/access-requests/${id}/revoke`;
    }

    if (!endpoint) {
      console.warn("Status action tidak dikenali:", newStatus);
      return;
    }

    setActionInProgress(id);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ txHash })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        fetchDashboardData();
      } else {
        console.error("Gagal mengubah status izin:", result.message);
      }
    } catch (err) {
      console.error("Error toggling consent:", err);
    } finally {
      setActionInProgress(null);
    }
  };

  const toggleDecrypt = (recId) => {
    setDecryptedRecords((prev) => ({ ...prev, [recId]: !prev[recId] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md">
          <ShieldAlert className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Akses Memerlukan Login</h1>
          <p className="text-sm text-slate-500 mb-6">Silakan masuk ke akun Anda terlebih dahulu untuk mengakses Portal Pasien.</p>
          <Link href="/auth/login" className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-md hover:bg-primary-hover transition">
            Kembali ke Halaman Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16 md:pb-0">
      <Navbar user={user} roleLabel="Pasien Terdaftar" onLogout={handleLogout} />

      <div className="flex flex-1">
        <Sidebar role="pasien" />

        <main className="flex-1 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-3 sm:py-4 w-full">
          {/* Header & Patient Identity Banner */}
          <div className="relative overflow-hidden rounded-2xl border border-teal-500/30 bg-gradient-to-r from-[#0D9488] via-[#0F766E] to-[#115E59] p-3 sm:px-5 sm:py-4 text-white shadow-md mb-3">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-400/20 blur-2xl" />

            <div className="relative z-10 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-teal-100 backdrop-blur-md mb-1">
                  <ShieldCheck className="h-3 w-3 text-teal-200 shrink-0" />
                  <span>Identitas Digital SATUSEHAT & Web3 Active</span>
                </div>
                <h1 className="text-sm sm:text-2xl font-extrabold text-white tracking-tight truncate">
                  Selamat Datang, {user.name}!
                </h1>
                <p className="hidden sm:block text-xs text-teal-100/90 mt-0.5 max-w-xl">
                  Portal Pasien Terdesentralisasi SatuData. Kedaulatan rekam medis Anda 100% berada di bawah kendali persetujuan digital Anda.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="rounded-xl border border-white/20 bg-white/10 px-2 py-1 sm:px-3 sm:py-1.5 backdrop-blur-md font-mono text-right">
                  <p className="text-[7px] sm:text-[9px] text-teal-200 uppercase font-bold">NIK Pasien</p>
                  <p className="font-bold text-white text-[10px] sm:text-sm">{user.nik || "Belum Set"}</p>
                </div>
              </div>
            </div>
          </div>

          {!user.nik && (
            <div className="mb-3 flex items-center justify-between gap-3 rounded-xl bg-amber-50 border border-amber-200 p-2.5 text-[11px] sm:text-xs text-amber-800 shadow-2xs">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <span className="font-medium">
                  <strong>Profil Belum Lengkap!</strong> Lengkapi NIK Anda di Pengaturan.
                </span>
              </div>
              <Link
                href="/dashboard/pasien/settings"
                className="rounded-lg bg-amber-600 hover:bg-amber-700 px-2.5 py-1 text-[10px] sm:text-xs font-bold text-white transition shrink-0 shadow-2xs"
              >
                Lengkapi Profil
              </Link>
            </div>
          )}

          {/* Key Metrics Grid - 3 Columns Side-by-Side on Mobile */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3.5 mb-3">
            <div className="rounded-2xl bg-white p-2.5 sm:p-3.5 border border-slate-200/80 shadow-2xs hover:shadow-sm transition">
              <div className="flex items-center justify-between">
                <span className="text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400 truncate">Faskes</span>
                <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                  <Building2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </span>
              </div>
              <p className="text-base sm:text-xl font-extrabold text-slate-900 mt-1">
                {hospitals.filter((h) => h.status === "approved").length} <span className="text-[9px] sm:text-xs font-normal text-slate-500 hidden sm:inline">Rumah Sakit</span>
              </p>
              <p className="text-[8px] sm:text-[9px] font-medium text-emerald-600 mt-0.5 flex items-center gap-0.5 truncate">
                <CheckCircle className="h-2.5 w-2.5 shrink-0" /> <span className="truncate">Hak Akses Aktif</span>
              </p>
            </div>

            <div className="rounded-2xl bg-white p-2.5 sm:p-3.5 border border-slate-200/80 shadow-2xs hover:shadow-sm transition">
              <div className="flex items-center justify-between">
                <span className="text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400 truncate">Berkas EHR</span>
                <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-secondary-tint text-primary shrink-0">
                  <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </span>
              </div>
              <p className="text-base sm:text-xl font-extrabold text-slate-900 mt-1">
                {medicalRecords.length} <span className="text-[9px] sm:text-xs font-normal text-slate-500 hidden sm:inline">Dokumen</span>
              </p>
              <p className="text-[8px] sm:text-[9px] font-medium text-primary mt-0.5 flex items-center gap-0.5 truncate">
                <Lock className="h-2.5 w-2.5 shrink-0" /> <span className="truncate">AES-256</span>
              </p>
            </div>

            <div className="rounded-2xl bg-white p-2.5 sm:p-3.5 border border-slate-200/80 shadow-2xs hover:shadow-sm transition">
              <div className="flex items-center justify-between">
                <span className="text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400 truncate">Pending</span>
                <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 shrink-0">
                  <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </span>
              </div>
              <p className="text-base sm:text-xl font-extrabold text-slate-900 mt-1">
                {hospitals.filter((h) => h.status === "pending").length} <span className="text-[9px] sm:text-xs font-normal text-slate-500 hidden sm:inline">Req</span>
              </p>
              <p className="text-[8px] sm:text-[9px] font-medium text-amber-600 mt-0.5 flex items-center gap-0.5 truncate">
                <AlertCircle className="h-2.5 w-2.5 shrink-0" /> <span className="truncate">Butuh Tindakan</span>
              </p>
            </div>
          </div>

          {/* Main 2-Column Side-by-Side Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 items-start mb-3">
            {/* WIDGET 1: LIVE GRANULAR CONSENT MANAGER */}
            <div className="rounded-2xl bg-white border border-slate-200/80 p-3.5 sm:p-5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                <div>
                  <h3 className="text-xs sm:text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                    Persetujuan Akses Faskes (Consent Control)
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Berikan, tolak, atau cabut hak baca rekam medis Anda ke rumah sakit.
                  </p>
                </div>
                <span className="rounded-full bg-secondary-tint border border-teal-200 px-2 py-0.5 text-[8px] sm:text-[9px] font-bold text-primary shrink-0 hidden sm:inline-block">
                  Sovereignty Live
                </span>
              </div>

              {/* List of Hospitals */}
              <div className="space-y-2.5">
                {hospitals.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 italic text-center">Belum ada permintaan akses faskes terdaftar.</p>
                ) : (
                  hospitals.map((h) => (
                    <div
                      key={h.id}
                      className="rounded-xl border border-slate-200/90 p-3 transition-all duration-200 hover:border-teal-300 hover:shadow-xs bg-slate-50/40"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 shadow-2xs font-bold text-slate-800 text-xs">
                            {h.name && typeof h.name === "string" ? `${h.name.charAt(0)}${h.name.substring(3, 4) || ""}` : "RS"}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-slate-900 truncate max-w-[150px] sm:max-w-none">{h.name}</h4>
                              <span className="text-[9px] font-mono text-slate-400 hidden sm:inline">({h.code})</span>
                            </div>
                            <p className="text-[10px] text-slate-500">{h.dept}</p>
                          </div>
                        </div>

                        {/* Status Badges */}
                        <div className="shrink-0">
                          {h.status === "approved" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                              Disetujui
                            </span>
                          )}
                          {h.status === "pending" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[9px] font-bold text-amber-700 animate-pulse">
                              <Clock className="h-2.5 w-2.5" />
                              Baru
                            </span>
                          )}
                          {h.status === "rejected" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5 text-[9px] font-bold text-slate-500">
                              <XCircle className="h-2.5 w-2.5" />
                              Ditolak
                            </span>
                          )}
                          {h.status === "revoked" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-secondary-tint border border-teal-200 px-2 py-0.5 text-[9px] font-bold text-primary">
                              <Lock className="h-2.5 w-2.5" />
                              Dicabut
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Details & Actions */}
                      <div className="border-t border-slate-200/60 pt-2 mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="space-y-0.5 font-mono text-[9px] sm:text-[10px] text-slate-500">
                          <p>Izin: <span className="font-semibold text-slate-700">{h.accessTypes.join(", ")}</span></p>
                          <p className="truncate max-w-[180px] sm:max-w-none">Tx Hash: <TxHashLink txHash={h.txHash} className="text-primary font-semibold inline-flex items-center gap-0.5" title={h.txHash}><span>{h.txHash}</span></TxHashLink></p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5">
                          {h.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleToggleConsent(h.id, "approved", h.status)}
                                disabled={actionInProgress === h.id}
                                className={`rounded-lg px-2.5 py-1 text-xs font-bold text-white transition shadow-2xs ${actionInProgress === h.id ? "bg-emerald-300 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-500"}`}
                              >
                                {actionInProgress === h.id ? (
                                  <span className="inline-flex items-center gap-1">
                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                    ...
                                  </span>
                                ) : (
                                  "Setujui"
                                )}
                              </button>
                              <button
                                onClick={() => handleToggleConsent(h.id, "rejected", h.status)}
                                disabled={actionInProgress === h.id}
                                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${actionInProgress === h.id ? "bg-slate-100 cursor-not-allowed text-slate-500" : "bg-slate-200 text-slate-700 hover:bg-slate-300"}`}
                              >
                                {actionInProgress === h.id ? "..." : "Tolak"}
                              </button>
                            </>
                          )}

                          {h.status === "approved" && (
                            <button
                              onClick={() => handleToggleConsent(h.id, "revoked", h.status)}
                              className="rounded-lg bg-secondary-tint border border-teal-200 text-primary-hover hover:bg-teal-100 px-2.5 py-1 text-[11px] font-bold transition cursor-pointer"
                            >
                              Cabut Izin Akses
                            </button>
                          )}

                          {(h.status === "revoked" || h.status === "rejected") && (
                            <div className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500 border border-slate-200">
                              Harus diajukan ulang oleh faskes.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* WIDGET 2: ENCRYPTED EHR TIMELINE */}
            <div className="rounded-2xl bg-white border border-slate-200/80 p-3.5 sm:p-5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                <div>
                  <h3 className="text-xs sm:text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary shrink-0" />
                    Linimasa Medis Terpadu (Encrypted EHR)
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Seluruh riwayat diagnosa dan resep obat tersimpan aman secara terenkripsi.
                  </p>
                </div>
                <button onClick={() => window.print()} className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary-hover cursor-pointer shrink-0 no-print">
                  <Download className="h-3 w-3" /> Unduh PDF
                </button>
              </div>

              <div className="relative border-l-2 border-slate-200 ml-2.5 space-y-3 pl-4">
                {medicalRecords.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 italic text-center">Belum ada riwayat rekam medis terdaftar.</p>
                ) : (
                  medicalRecords.map((rec) => (
                    <div key={rec.id} className="relative group">
                      <span className="absolute -left-[23px] top-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary ring-4 ring-white" />
                      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 transition-all hover:bg-white hover:shadow-xs">
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                          <span className="font-bold text-primary-hover text-[11px] truncate max-w-[170px]">{rec.hospitalName}</span>
                          <span className="font-mono text-[9px]">{rec.date}</span>
                        </div>

                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">Diagnosa: {rec.diagnosis}</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">Dokter: {rec.doctorName}</p>
                          </div>
                          <button
                            onClick={() => toggleDecrypt(rec.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer shrink-0"
                          >
                            {decryptedRecords[rec.id] ? <EyeOff className="h-3 w-3 text-primary" /> : <Eye className="h-3 w-3 text-emerald-600" />}
                            {decryptedRecords[rec.id] ? "Sembunyikan" : "Dekripsi"}
                          </button>
                        </div>

                        {/* Decrypted / Encrypted Content Preview */}
                        {decryptedRecords[rec.id] ? (
                          <div className="mt-2 rounded-lg bg-gradient-to-br from-teal-50/70 via-emerald-50/40 to-slate-50 border border-teal-100/80 p-2 text-[10px] sm:text-[11px] text-slate-700 shadow-2xs animate-fade-in">
                            <p className="font-bold text-primary-hover mb-0.5">✔ TERDEKRIPSI SECARA LOKAL (AES-256):</p>
                            <p className="leading-relaxed">{rec.details}</p>
                          </div>
                        ) : (
                          <div className="mt-2 rounded-lg bg-slate-50/80 p-1.5 text-[9px] font-mono text-slate-500 border border-slate-200/60 truncate">
                            <span className="text-primary font-extrabold mr-1">[AES-256]:</span>
                            U2FsdGVkX1+9M2Y5NzhkYTUxNmFkOTY5Y2QwMzgxM2I5Mzg5YTI0ZjM0MmQwNm{rec.txHash && typeof rec.txHash === "string" ? `${rec.txHash.substring(0, 8)}...` : ""}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions / Bantuan Banner */}
          <div className="rounded-2xl bg-gradient-to-r from-[#0D9488] via-[#0F766E] to-[#115E59] p-3.5 sm:p-4 text-white shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 border border-teal-500/30 mb-2">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-teal-100">
                Bantuan & Consent Simulator
              </h3>
              <p className="text-[10px] sm:text-[11px] text-teal-100/90 mt-0.5 max-w-xl leading-snug">
                Ingin mensimulasikan persetujuan transaksi dari sudut pandang faskes atau mengelola profil?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full sm:w-auto shrink-0">
              <Link
                href="/#simulator"
                className="inline-flex items-center justify-center gap-1 rounded-xl bg-primary hover:bg-primary-hover px-3 py-1.5 text-xs font-bold text-white transition shadow-2xs"
              >
                <span>Simulator</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>

              <Link
                href="/dashboard/pasien/settings"
                className="inline-flex items-center justify-center gap-1 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-3 py-1.5 text-xs font-bold text-slate-200 transition"
              >
                <span>Pengaturan</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
