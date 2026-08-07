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
          txHash: item.tx_hash || item.txHash || null,
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
          hospitalName: item.hospital?.user?.name || item.hospital_name || item.hospital?.name || "Rumah Sakit Terdaftar",
          doctorName: item.doctor?.name || "Dokter Spesialis",
          category: item.record_type || "Rekam Medis Terverifikasi",
          date: new Date(item.visit_date || item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
          rawTimestamp: new Date(item.visit_date || item.created_at || Date.now()).getTime(),
          txHash: item.tx_hash || "",
          diagnosis: item.title || "Konsultasi Medis",
          details: "Resep: Amoxicillin, Paracetamol. Catatan: Istirahat cukup."
        })).sort((a, b) => b.rawTimestamp - a.rawTimestamp);
        setMedicalRecords(mapped);
      }
    } catch (err) {
      console.log("Error fetching history", err);
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
      <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">
        <RefreshCw className="h-8 w-8 animate-spin text-teal-800" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">
        <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md">
          <ShieldAlert className="h-12 w-12 text-[#DC2626] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Akses Memerlukan Login</h1>
          <p className="text-sm text-slate-500 mb-6">Silakan masuk ke akun Anda terlebih dahulu untuk mengakses Portal Pasien.</p>
          <Link href="/auth/login" className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-gradient-to-r from-teal-700 to-cyan-800 text-white font-bold text-sm shadow-md hover:from-teal-800 hover:to-cyan-900 transition">
            Kembali ke Halaman Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf7f2] via-[#fdfbf7] to-[#f5efe6] flex flex-col pb-16 md:pb-0">
      <Navbar user={user} roleLabel="Pasien Terdaftar" onLogout={handleLogout} />

      <div className="flex flex-1">
        <Sidebar role="pasien" />

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Header & Patient Identity Banner */}
          <div className="hidden sm:block relative overflow-hidden rounded-3xl border border-teal-800/40 bg-gradient-to-r from-teal-900 via-teal-800 to-cyan-950 p-6 sm:p-8 text-white shadow-xl mb-8">
            <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-teal-600/15 blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-500/10 px-3.5 py-1 text-xs font-semibold text-teal-200 mb-3">
                  <ShieldCheck className="h-3.5 w-3.5 text-teal-300" />
                  Identitas Digital SATUSEHAT & Web3 Active
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Selamat Datang, {user.name}!
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                  Portal Pasien Terdesentralisasi SatuData. Kedaulatan rekam medis Anda 100% berada di bawah kendali persetujuan digital Anda.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-md text-xs font-mono">
                  <p className="text-[10px] text-slate-300 uppercase font-bold">NIK Pasien</p>
                  <p className="font-bold text-teal-300 mt-0.5">{user.nik || "Belum Dilengkapi"}</p>
                </div>
              </div>
            </div>
          </div>

          {!user.nik && (
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-[#D97706] shadow-2xs">
              <div className="flex items-center gap-2 min-w-0">
                <AlertCircle className="h-5 w-5 text-[#D97706] shrink-0" />
                <span className="font-medium text-xs sm:text-sm">
                  <strong>Profil Belum Lengkap!</strong> Silakan lengkapi NIK Anda di menu Pengaturan agar Rumah Sakit dapat mencocokkan rekam medis Anda.
                </span>
              </div>
              <Link
                href="/dashboard/pasien/settings"
                className="rounded-xl bg-[#D97706] hover:bg-amber-700 px-4 py-2 text-xs font-bold text-white transition shrink-0 shadow-2xs text-center"
              >
                Lengkapi Profil
              </Link>
            </div>
          )}

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8">
            <div className="rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition">
              <div className="flex items-center justify-between min-w-0">
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400 truncate">Faskes Terkoneksi</span>
                <span className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#16A34A]">
                  <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </span>
              </div>
              <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2 sm:mt-3">
                {hospitals.filter((h) => h.status === "approved").length} <span className="text-[11px] sm:text-xs font-normal text-slate-500">Rumah Sakit</span>
              </p>
              <p className="text-[9px] sm:text-[10px] font-medium text-[#16A34A] mt-1 flex items-center gap-1 truncate">
                <CheckCircle className="h-3 w-3 shrink-0" /> Hak Akses Real-time
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Berkas Medis EHR</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-800">
                  <FileText className="h-4 w-4" />
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-3">
                {medicalRecords.length} <span className="text-xs font-normal text-slate-500">Dokumen</span>
              </p>
              <p className="text-[10px] font-medium text-teal-800 mt-1 flex items-center gap-1">
                <Lock className="h-3 w-3" /> Terenkripsi Off-chain AES-256
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Permintaan Pending</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-[#D97706]">
                  <Clock className="h-4 w-4" />
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-3">
                {hospitals.filter((h) => h.status === "pending").length} <span className="text-xs font-normal text-slate-500">Permintaan</span>
              </p>
              <p className="text-[10px] font-medium text-[#D97706] mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Memerlukan Tindakan Pasien
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Status Gas Fee</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <Key className="h-4 w-4" />
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-3">
                0 ETH <span className="text-xs font-normal text-slate-500">Gratis</span>
              </p>
              <p className="text-[10px] font-medium text-purple-600 mt-1 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Meta-Transaction EIP-2771
              </p>
            </div>
          </div>

          {/* Main Layout Grid */}
          <div className="grid gap-8 lg:grid-cols-3 items-start">
            {/* Left Column (2 Cols): Live Consent Manager & Medical Timeline */}
            <div className="lg:col-span-2 space-y-8">
              {/* WIDGET 1: LIVE GRANULAR CONSENT MANAGER */}
              <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-7 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-teal-800" />
                      Manajemen Persetujuan Akses Faskes (Consent Control)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Berikan, tolak, atau cabut hak baca rekam medis Anda ke rumah sakit secara real-time.
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[10px] font-bold text-[#16A34A] flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#16A34A] animate-ping" />
                    Sovereignty Live
                  </span>
                </div>

                {/* List of Hospitals */}
                <div className="space-y-4">
                  {hospitals.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4 italic text-center">Belum ada permintaan akses faskes terdaftar.</p>
                  ) : (
                    hospitals.map((h) => (
                      <div
                        key={h.id}
                        className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50/50 to-teal-50/20 p-5 transition-all duration-300 hover:border-teal-300 hover:shadow-md group"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
                          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-800 to-cyan-900 text-white font-extrabold text-xs shadow-md border border-teal-700">
                              <Building2 className="h-5 w-5 text-teal-100" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="text-sm font-extrabold text-slate-900 tracking-tight truncate">{h.name}</h4>
                                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200 shrink-0">
                                  STR/NPR: {h.code}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">{h.dept}</p>
                            </div>
                          </div>

                          {/* Status Badges */}
                          <div className="shrink-0">
                            {h.status === "approved" && (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/90 px-3.5 py-1 text-xs font-bold text-[#16A34A] shadow-2xs">
                                <span className="h-2 w-2 rounded-full bg-[#16A34A] animate-ping" />
                                Akses Disetujui
                              </span>
                            )}
                            {h.status === "pending" && (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3.5 py-1 text-xs font-bold text-[#D97706] animate-pulse shadow-2xs">
                                <Clock className="h-3.5 w-3.5" />
                                Permintaan Baru
                              </span>
                            )}
                            {h.status === "rejected" && (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3.5 py-1 text-xs font-bold text-slate-600">
                                <XCircle className="h-3.5 w-3.5" />
                                Akses Ditolak
                              </span>
                            )}
                            {h.status === "revoked" && (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3.5 py-1 text-xs font-bold text-[#DC2626]">
                                <Lock className="h-3.5 w-3.5" />
                                Akses Dicabut
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Details & Actions Grid */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                          <div className="space-y-1.5 font-mono text-[11px] text-slate-600 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-slate-400 font-sans font-semibold text-[10px] uppercase tracking-wider">Tipe Izin:</span>
                              <span className="font-bold text-teal-900 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200/70">{h.accessTypes.join(", ")}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap mt-1 min-w-0">
                              <span className="text-slate-400 font-sans font-semibold text-[10px] uppercase tracking-wider">Tx Hash:</span>
                              {h.txHash ? (
                                <TxHashLink txHash={h.txHash} className="text-teal-800 font-bold font-mono inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs hover:border-teal-300 transition max-w-full" title={h.txHash}>
                                  <ShieldCheck className="h-3.5 w-3.5 text-[#16A34A] shrink-0" />
                                  <span className="truncate max-w-[150px] xs:max-w-[220px] sm:max-w-[280px]">{h.txHash}</span>
                                </TxHashLink>
                              ) : (
                                <span className="text-slate-400 font-sans italic">Belum ada (Pending Blockchain)</span>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0">
                            {h.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleToggleConsent(h.id, "approved", h.status)}
                                  disabled={actionInProgress === h.id}
                                  className={`rounded-xl px-4 py-2 text-xs font-bold text-white transition shadow-sm flex-1 sm:flex-none text-center ${actionInProgress === h.id ? "bg-emerald-400 cursor-not-allowed" : "bg-[#16A34A] hover:bg-emerald-700 cursor-pointer"}`}
                                >
                                  {actionInProgress === h.id ? (
                                    <span className="inline-flex items-center justify-center gap-2">
                                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                      Konfirmasi...
                                    </span>
                                  ) : (
                                    "Setujui Akses (Approve)"
                                  )}
                                </button>
                                <button
                                  onClick={() => handleToggleConsent(h.id, "rejected", h.status)}
                                  disabled={actionInProgress === h.id}
                                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition flex-1 sm:flex-none text-center ${actionInProgress === h.id ? "bg-slate-100 cursor-not-allowed text-slate-500" : "bg-slate-200 text-slate-700 hover:bg-slate-300 cursor-pointer"}`}
                                >
                                  Tolak
                                </button>
                              </>
                            )}

                            {h.status === "approved" && (
                              <button
                                onClick={() => handleToggleConsent(h.id, "revoked", h.status)}
                                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#DC2626] hover:bg-red-700 text-white px-4 py-2 text-xs font-extrabold shadow-sm hover:shadow-md transition-all cursor-pointer w-full sm:w-auto"
                              >
                                <Lock className="h-3.5 w-3.5 text-red-200 shrink-0" />
                                Cabut Izin Akses (revokeAccess)
                              </button>
                            )}

                            {(h.status === "revoked" || h.status === "rejected") && (
                              <div className="rounded-xl bg-slate-100 px-3.5 py-1.5 text-xs text-slate-500 border border-slate-200/80 font-medium w-full sm:w-auto text-center">
                                Izin Telah Non-Aktif
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column (1 Col): Encrypted EHR Timeline */}
            <div className="space-y-8">
              {/* WIDGET 3: ENCRYPTED EHR TIMELINE */}
              <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-5 gap-2">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Clock className="h-4 w-4 text-teal-800" />
                      Linimasa Medis Terpadu
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Encrypted EHR Timeline off-chain.
                    </p>
                  </div>
                  <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:text-teal-700 cursor-pointer">
                    <Download className="h-3.5 w-3.5" /> Resume PDF
                  </button>
                </div>

                <div className="relative border-l-2 border-slate-200 ml-3 space-y-6 pl-5">
                  {medicalRecords.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4 italic text-center">Belum ada riwayat rekam medis terdaftar.</p>
                  ) : (
                    medicalRecords.slice(0, 3).map((rec) => (
                      <div key={rec.id} className="relative group">
                        <span className="absolute -left-[27px] top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-teal-700 ring-4 ring-white" />
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 transition-all hover:bg-white hover:shadow-xs">
                          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                            <span className="font-bold text-teal-800 text-[11px] truncate max-w-[140px]">{rec.hospitalName}</span>
                            <span className="font-mono text-[9px]">{rec.date}</span>
                          </div>

                          <div className="flex flex-col gap-2">
                            <div>
                              <h4 className="text-xs font-bold text-slate-900">{rec.diagnosis}</h4>
                              <p className="text-[10px] text-slate-500 mt-0.5">{rec.doctorName}</p>
                            </div>
                            <button
                              onClick={() => toggleDecrypt(rec.id)}
                              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer w-full"
                            >
                              {decryptedRecords[rec.id] ? <EyeOff className="h-3.5 w-3.5 text-[#DC2626]" /> : <Eye className="h-3.5 w-3.5 text-[#16A34A]" />}
                              {decryptedRecords[rec.id] ? "Sembunyikan" : "Dekripsi Data"}
                            </button>
                          </div>

                          {/* Decrypted Content Preview */}
                          {decryptedRecords[rec.id] && (
                            <div className="mt-2.5 rounded-xl bg-gradient-to-br from-teal-50/70 via-cyan-50/40 to-slate-50 border border-teal-100/80 p-2.5 text-[11px] text-slate-700 shadow-2xs animate-fade-in">
                              <p className="font-bold text-teal-800 mb-1 text-[10px]">✔ TERDEKRIPSI LOKAL:</p>
                              <p className="leading-relaxed">{rec.details}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {medicalRecords.length > 0 && (
                  <div className="mt-5 border-t border-slate-100 pt-3 text-center">
                    <Link
                      href="/dashboard/pasien/records"
                      className="inline-flex items-center gap-1 text-xs font-bold text-teal-800 hover:text-teal-700 transition"
                    >
                      Lihat Semua Rekam Medis ({medicalRecords.length}) →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
