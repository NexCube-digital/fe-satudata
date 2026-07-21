"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../layout/Navbar";
import Sidebar from "../layout/Sidebar";
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

  // Live Consent Manager State
  const [hospitals, setHospitals] = useState([
    {
      id: "rscm",
      name: "RS Cipto Mangunkusumo",
      code: "RSCM-JKT-01",
      dept: "Klinik Penyakit Dalam & Bedah",
      status: "approved",
      txHash: "0x9f12...a3bc",
      grantedAt: "12 Juli 2026",
      accessTypes: ["Diagnosis", "Resep Obat", "Hasil Laboratorium"]
    },
    {
      id: "harapanKita",
      name: "RS Harapan Kita",
      code: "RSHK-JKT-04",
      dept: "Poli Spesialis Jantung",
      status: "approved",
      txHash: "0x5f81...e2c4",
      grantedAt: "28 Juni 2026",
      accessTypes: ["Rekam Medis Jantung", "EKG"]
    },
    {
      id: "pertamina",
      name: "RS Pusat Pertamina",
      code: "RSPP-JKT-09",
      dept: "Instalasi Gawat Darurat (UGD)",
      status: "pending",
      txHash: "Menunggu Approval",
      grantedAt: "Baru saja",
      accessTypes: ["Riwayat Alergi", "Golongan Darah"]
    }
  ]);

  // Decryption state for medical records
  const [decryptedRecords, setDecryptedRecords] = useState({
    rec1: false,
    rec2: false
  });

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, action: "Consent Granted", hospital: "RS Cipto Mangunkusumo", hash: "0x9f12...a3bc", time: "10 menit lalu", type: "success" },
    { id: 2, action: "EHR Encrypted Upload", hospital: "RS Harapan Kita", hash: "0x5f81...e2c4", time: "2 hari lalu", type: "info" }
  ]);

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
          nik: u.nik || currentUser.nik,
          wallet_address: u.wallet_address || currentUser.wallet_address
        };
        setUser(updated);
        localStorage.setItem("user", JSON.stringify(updated));
      }
    } catch (err) {
      console.log("Could not sync profile from BE", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  // Toggle consent (Approve / Revoke / Reject)
  const handleToggleConsent = (id, newStatus) => {
    setHospitals((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          const newHash = "0x" + Array.from({ length: 4 }, () => Math.floor(Math.random() * 16).toString(16)).join("") + "..." + Array.from({ length: 4 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
          
          // Log audit action
          const actionText = newStatus === "approved" ? "Consent Granted" : newStatus === "revoked" ? "Consent Revoked" : "Request Rejected";
          setAuditLogs((logs) => [
            {
              id: Date.now(),
              action: actionText,
              hospital: h.name,
              hash: newHash,
              time: "Baru saja",
              type: newStatus === "approved" ? "success" : "error"
            },
            ...logs
          ]);

          return { ...h, status: newStatus, txHash: newHash };
        }
        return h;
      })
    );
  };

  const toggleDecrypt = (recId) => {
    setDecryptedRecords((prev) => ({ ...prev, [recId]: !prev[recId] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">
        <RefreshCw className="h-8 w-8 animate-spin text-rose-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">
        <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md">
          <ShieldAlert className="h-12 w-12 text-rose-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Akses Memerlukan Login</h1>
          <p className="text-sm text-slate-500 mb-6">Silakan masuk ke akun Anda terlebih dahulu untuk mengakses Portal Pasien.</p>
          <Link href="/auth/login" className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-rose-600 text-white font-bold text-sm shadow-md hover:bg-rose-500 transition">
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
          <div className="relative overflow-hidden rounded-3xl border border-rose-800/40 bg-gradient-to-r from-rose-900 via-rose-800 to-red-900 p-6 sm:p-8 text-white shadow-xl mb-8">
            <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-rose-600/15 blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1 text-xs font-semibold text-rose-300 mb-3">
                  <ShieldCheck className="h-3.5 w-3.5 text-rose-400" />
                  Identitas Digital SATUSEHAT & Web3 Active
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Selamat Datang, {user.name}!
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                  Portal Pasien Terdesentralisasi SatuData. Kedaulatan rekam medis Anda 100% berada di bawah kendali persetujuan digital Anda.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-md text-xs font-mono">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">NIK Pasien</p>
                  <p className="font-bold text-rose-300 mt-0.5">{user.nik || "3171010509840002"}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-md text-xs font-mono">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Wallet Address</p>
                  <p className="font-bold text-emerald-400 mt-0.5">
                    {user.wallet_address 
                      ? `${user.wallet_address.substring(0, 6)}...${user.wallet_address.substring(user.wallet_address.length - 4)}` 
                      : "Belum Ditautkan"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Faskes Terkoneksi</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Building2 className="h-4 w-4" />
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-3">
                {hospitals.filter((h) => h.status === "approved").length} <span className="text-xs font-normal text-slate-500">Rumah Sakit</span>
              </p>
              <p className="text-[10px] font-medium text-emerald-600 mt-1 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Hak Akses Real-time Aktif
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Berkas Medis EHR</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <FileText className="h-4 w-4" />
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-3">
                14 <span className="text-xs font-normal text-slate-500">Dokumen</span>
              </p>
              <p className="text-[10px] font-medium text-rose-600 mt-1 flex items-center gap-1">
                <Lock className="h-3 w-3" /> Terenkripsi Off-chain AES-256
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Permintaan Pending</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Clock className="h-4 w-4" />
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-3">
                {hospitals.filter((h) => h.status === "pending").length} <span className="text-xs font-normal text-slate-500">Permintaan</span>
              </p>
              <p className="text-[10px] font-medium text-amber-600 mt-1 flex items-center gap-1">
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
              <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-rose-600" />
                      Manajemen Persetujuan Akses Faskes (Consent Control)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Berikan, tolak, atau cabut hak baca rekam medis Anda ke rumah sakit secara real-time.
                    </p>
                  </div>
                  <span className="rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-[10px] font-bold text-rose-700">
                    Sovereignty Live
                  </span>
                </div>

                {/* List of Hospitals */}
                <div className="space-y-4">
                  {hospitals.map((h) => (
                    <div
                      key={h.id}
                      className="rounded-2xl border border-slate-200/90 p-4 transition-all duration-200 hover:border-rose-300 hover:shadow-xs bg-slate-50/40"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <div className="flex items-start gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200 shadow-2xs font-bold text-slate-800 text-xs">
                            {h.name.charAt(0)}{h.name.charAt(3)}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900">{h.name}</h4>
                              <span className="text-[10px] font-mono text-slate-400">({h.code})</span>
                            </div>
                            <p className="text-xs text-slate-500">{h.dept}</p>
                          </div>
                        </div>

                        {/* Status Badges */}
                        <div>
                          {h.status === "approved" && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-bold text-emerald-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                              Akses Disetujui
                            </span>
                          )}
                          {h.status === "pending" && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-[11px] font-bold text-amber-700 animate-pulse">
                              <Clock className="h-3 w-3" />
                              Permintaan Baru
                            </span>
                          )}
                          {h.status === "revoked" && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-[11px] font-bold text-rose-700">
                              <Lock className="h-3 w-3" />
                              Akses Dicabut
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Details & Actions */}
                      <div className="border-t border-slate-200/60 pt-3 mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="space-y-1 font-mono text-[10px] text-slate-500">
                          <p>Tipe Izin: <span className="font-semibold text-slate-700">{h.accessTypes.join(", ")}</span></p>
                          <p>Tx Hash: <span className="text-rose-600 font-semibold">{h.txHash}</span></p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          {h.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleToggleConsent(h.id, "approved")}
                                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition shadow-xs cursor-pointer"
                              >
                                Setujui Akses (Approve)
                              </button>
                              <button
                                onClick={() => handleToggleConsent(h.id, "revoked")}
                                className="rounded-xl bg-slate-200 hover:bg-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition cursor-pointer"
                              >
                                Tolak
                              </button>
                            </>
                          )}

                          {h.status === "approved" && (
                            <button
                              onClick={() => handleToggleConsent(h.id, "revoked")}
                              className="rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 px-4 py-2 text-xs font-bold transition cursor-pointer"
                            >
                              Cabut Izin Akses (revokeAccess)
                            </button>
                          )}

                          {h.status === "revoked" && (
                            <button
                              onClick={() => handleToggleConsent(h.id, "approved")}
                              className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 px-4 py-2 text-xs font-bold transition cursor-pointer"
                            >
                              Izinkan Kembali
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* WIDGET 2: ENCRYPTED EHR TIMELINE */}
              <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-rose-600" />
                      Linimasa Medis Terpadu (Encrypted EHR Timeline)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Seluruh riwayat diagnosa dan resep obat antar-rumah sakit tersimpan dalam enkripsi off-chain.
                    </p>
                  </div>
                  <button className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700">
                    <Download className="h-3.5 w-3.5" /> Unduh Resume PDF
                  </button>
                </div>

                <div className="relative border-l-2 border-slate-200 ml-4 space-y-6 pl-6">
                  {/* Record Item 1 */}
                  <div className="relative group">
                    <span className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 ring-4 ring-white" />
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition-all hover:bg-white hover:shadow-xs">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                        <span className="font-bold text-rose-700">RS Cipto Mangunkusumo (Poli Bedah)</span>
                        <span className="font-mono text-[10px]">12 Juli 2026</span>
                      </div>

                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">Diagnosa: Infeksi Saluran Pernapasan (ISPA)</h4>
                          <p className="text-xs text-slate-500 mt-0.5">Dokter Penanggung Jawab: dr. Amanda, Sp.PD</p>
                        </div>
                        <button
                          onClick={() => toggleDecrypt("rec1")}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
                        >
                          {decryptedRecords.rec1 ? <EyeOff className="h-3.5 w-3.5 text-rose-600" /> : <Eye className="h-3.5 w-3.5 text-emerald-600" />}
                          {decryptedRecords.rec1 ? "Sembunyikan" : "Dekripsi Data"}
                        </button>
                      </div>

                      {/* Decrypted / Encrypted Content Preview */}
                      {decryptedRecords.rec1 ? (
                        <div className="mt-3 rounded-xl bg-gradient-to-r from-rose-950/90 to-red-950/90 p-3 text-[11px] font-mono text-rose-100 border border-rose-800/40 shadow-xs animate-fade-in">
                          <p className="font-bold text-rose-200 mb-1">✔ TERDEKRIPSI SECARA LOKAL (AES-256):</p>
                          <p>• Resep: Amoxicillin 500mg (3x1 sesudah makan), Paracetamol 500mg (P.R.N)</p>
                          <p>• Catatan Medis: Pasien mengeluh batuk berdahak 3 hari. Tanda vital stabil.</p>
                        </div>
                      ) : (
                        <div className="mt-3 rounded-xl bg-rose-950/80 p-3 text-[10px] font-mono text-rose-200/90 border border-rose-800/30 truncate">
                          <span className="text-rose-400 font-bold mr-2">[CIPHERTEXT AES-256]:</span>
                          U2FsdGVkX1+9M2Y5NzhkYTUxNmFkOTY5Y2QwMzgxM2I5Mzg5YTI0ZjM0MmQwNm...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Record Item 2 */}
                  <div className="relative group">
                    <span className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-white" />
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition-all hover:bg-white hover:shadow-xs">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                        <span className="font-bold text-rose-700">Laboratorium Kimia Farma</span>
                        <span className="font-mono text-[10px]">28 Juni 2026</span>
                      </div>

                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">Laporan Lab: Tes Kolesterol & Gula Darah Puasa</h4>
                          <p className="text-xs text-slate-500 mt-0.5">Petugas: Analis Kesehatan Lab Utama</p>
                        </div>
                        <button
                          onClick={() => toggleDecrypt("rec2")}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
                        >
                          {decryptedRecords.rec2 ? <EyeOff className="h-3.5 w-3.5 text-rose-600" /> : <Eye className="h-3.5 w-3.5 text-emerald-600" />}
                          {decryptedRecords.rec2 ? "Sembunyikan" : "Dekripsi Data"}
                        </button>
                      </div>

                      {decryptedRecords.rec2 ? (
                        <div className="mt-3 rounded-xl bg-gradient-to-r from-rose-950/90 to-red-950/90 p-3 text-[11px] font-mono text-rose-100 border border-rose-800/40 shadow-xs animate-fade-in">
                          <p className="font-bold text-rose-200 mb-1">✔ TERDEKRIPSI SECARA LOKAL (AES-256):</p>
                          <p>• Hasil Lab: Kolesterol Total 190 mg/dL (Normal), GDP 95 mg/dL (Normal)</p>
                        </div>
                      ) : (
                        <div className="mt-3 rounded-xl bg-rose-950/80 p-3 text-[10px] font-mono text-rose-200/90 border border-rose-800/30 truncate">
                          <span className="text-rose-400 font-bold mr-2">[CIPHERTEXT AES-256]:</span>
                          85MmNlYTkyOQU2FsdGVkX1+9M2Y5NzhkYTUxNmFkOTY5Y2QwMzgxM2I5Mzg5Y...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (1 Col): Real-time Audit Trail & Quick Actions */}
            <div className="space-y-8">
              {/* Audit Trail Stream Widget */}
              <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Database className="h-4 w-4 text-rose-600" />
                  Audit Trail Blockchain Log
                </h3>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-bold ${log.type === "success" ? "text-emerald-700" : "text-rose-700"}`}>
                          {log.action}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">{log.time}</span>
                      </div>
                      <p className="text-slate-600 font-medium text-[11px]">{log.hospital}</p>
                      <p className="text-[9px] font-mono text-rose-600 mt-1">Tx: {log.hash}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="rounded-3xl bg-gradient-to-br from-rose-900 via-rose-800 to-red-900 p-6 text-white shadow-xl">
                <h3 className="text-sm font-extrabold uppercase tracking-wider mb-2 text-rose-200">
                  Bantuan & Simulator
                </h3>
                <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                  Ingin mensimulasikan persetujuan transaksi dari sudut pandang dokter? Buka Live Consent Simulator.
                </p>

                <div className="space-y-2.5">
                  <Link
                    href="/#simulator"
                    className="flex items-center justify-between rounded-2xl bg-rose-600 hover:bg-rose-500 px-4 py-3 text-xs font-bold text-white transition shadow-md"
                  >
                    <span>Buka Consent Simulator</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>

                  <Link
                    href="/dashboard/pasien/settings"
                    className="flex items-center justify-between rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 px-4 py-3 text-xs font-bold text-slate-200 transition"
                  >
                    <span>Pengaturan Akun & Wallet</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
