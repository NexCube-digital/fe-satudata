"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import TxHashLink from "@/components/ui/TxHashLink";
import { getDoctors } from "@/services/doctorService";
import ModernDoctorSelect from "@/components/features/faskes/ModernDoctorSelect";
import {
  Stethoscope,
  Send,
  Building2,
  Users,
  Activity,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
  XCircle,
  DollarSign,
  Search,
  Lock,
  Unlock,
  ShieldCheck,
  Eye,
  RefreshCw,
  Receipt,
  Coins,
  UserCheck,
  ArrowRight
} from "lucide-react";

export default function FaskesDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form Minta Akses State (nikInput is the wallet address of the patient in Web3)
  const [nikInput, setNikInput] = useState("");
  const [poliInput, setPoliInput] = useState("");
  const [purposeInput, setPurposeInput] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [doctors, setDoctors] = useState([]);

  // External Requests Table State
  const [requestsList, setRequestsList] = useState([]);
  const [hospitalProfile, setHospitalProfile] = useState(null);

  // Selected Decrypted Record Modal State
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [toast, setToast] = useState({ show: false, type: "success", title: "", message: "" });

  // POS Kasir Simulator State
  const [billItems, setBillItems] = useState([
    { id: 1, name: "Registrasi Pasien Baru", price: 50000 },
    { id: 2, name: "Konsultasi Dokter Spesialis (Sp.PD)", price: 250000 },
    { id: 3, name: "Paket Tes Lab Kolesterol & Gula Darah", price: 175000 }
  ]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [receiptSuccess, setReceiptSuccess] = useState(false);

  // Live dashboard statistics
  const [stats, setStats] = useState({
    kunjungan_hari_ini: 0,
    izin_akses_disetujui: 0,
    request_pending: 0
  });
  const [sessionOmzet, setSessionOmzet] = useState(0);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error(e);
      }
    }
    fetchRequestsList();
    fetchDoctorsList();
    fetchDashboardStats();
    setLoading(false);
  }, []);

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
    } catch (err) {
      console.error("Error loading dashboard stats:", err);
    }
  };

  const fetchDoctorsList = async () => {
    try {
      const res = await getDoctors();
      if (res.success && res.data) {
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
          txHash: null,
          requestedAt: new Date(item.created_at).toLocaleDateString("id-ID")
        }));
        setRequestsList(mapped);
      }
    } catch (err) {
      console.log("Error loading requests list:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  const showToast = (message, type = "success", title = "") => {
    setToast({ show: true, type, title, message });
    window.setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3500);
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!nikInput) return;
    setSubmittingRequest(true);

    const token = localStorage.getItem("accessToken");
    const txHash = "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/hospital/access-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          patientNik: nikInput,
          jenisDataDiminta: poliInput || "Permintaan Akses Rekam Medis",
          txHash
        })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        fetchRequestsList();
        fetchDashboardStats();
        setNikInput("");
        showToast("Permintaan akses rekam medis berhasil dikirim ke portal pasien!", "success", "Berhasil");
      } else {
        showToast(result.message || "Gagal membuat permohonan akses", "error", "Gagal");
      }
    } catch (err) {
      console.error(err);
      showToast("Terjadi kesalahan saat mengirimkan permohonan", "error", "Gagal");
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleViewPatientRecords = async (req) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const signature = "0x" + Array.from({ length: 130 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/hospital/patient/${req.patientId}?signature=${signature}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.data) {
        const recordsStr = result.data.map(r => `• [${r.record_type.toUpperCase()}] ${r.title} (Visit: ${new Date(r.visit_date).toLocaleDateString("id-ID")})`).join("\n") || "Belum ada rekam medis terdaftar untuk pasien ini.";
        setSelectedRecord({
          ...req,
          decryptedData: recordsStr
        });
      } else {
        showToast(result.message || "Gagal memuat rekam medis", "error", "Gagal");
      }
    } catch (err) {
      console.error(err);
      showToast("Terjadi kesalahan saat memproses data medis", "error", "Gagal");
    }
  };

  // Add POS item
  const handleAddBillItem = (e) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice) return;
    setBillItems([
      ...billItems,
      { id: Date.now(), name: newItemName, price: parseFloat(newItemPrice) }
    ]);
    setNewItemName("");
    setNewItemPrice("");
  };

  const handleRemoveBillItem = (id) => {
    setBillItems(billItems.filter((item) => item.id !== id));
  };

  const totalBill = billItems.reduce((acc, curr) => acc + curr.price, 0);

  const handleProcessTransaction = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/dashboard/hospital/pos-transaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ items: billItems })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setSessionOmzet((prev) => prev + totalBill);
        setReceiptSuccess(true);
        setBillItems([]);
        fetchDashboardStats(); // Refresh stats in case visits count changes
        setTimeout(() => setReceiptSuccess(false), 4000);
      }
    } catch (err) {
      console.error(err);
      showToast("Gagal memproses transaksi kasir", "error", "Gagal");
    }
  };

  const maskNik = (nik) => {
    if (!nik) return "";
    const str = String(nik);
    if (str.length < 16) return str;
    return str.slice(0, 6) + "******" + str.slice(12);
  };

  const formatTxHash = (hash) => {
    if (!hash) return "0x7f8a3b21c49e0d15...";
    const str = String(hash);
    if (str.length <= 18) return str;
    return str.slice(0, 18) + "...";
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
          <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Akses Memerlukan Login</h1>
          <p className="text-sm text-slate-500 mb-6">Silakan masuk dengan akun Fasilitas Kesehatan Anda.</p>
          <Link href="/auth/login" className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-md hover:bg-primary-hover transition">
            Kembali ke Halaman Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16 md:pb-0">
      <Navbar user={user} roleLabel="Fasilitas Kesehatan" onLogout={handleLogout} />

      <div className="flex flex-1">
        <Sidebar role="faskes" />

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full">
          {/* 1. Compact Banner Header */}
          <div className="relative overflow-hidden rounded-2xl border border-teal-500/30 bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 px-5 py-4 text-white shadow-md mb-4">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-teal-400/20 blur-2xl" />

            <div className="relative z-10 flex items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-3 py-0.5 text-[10px] font-semibold text-teal-100 mb-1">
                  <Stethoscope className="h-3 w-3 text-teal-200" />
                  Sistem HIS & Integrated Medis POS Active
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {hospitalProfile?.name || user?.name || "RS Cipto Mangunkusumo"}
                </h1>
                <p className="text-xs text-teal-100/90 mt-0.5 max-w-xl">
                  Portal Fasilitas Kesehatan & Dokter Penanggung Jawab. Ajukan permohonan rekam medis eksternal.
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <div className="rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 backdrop-blur-md text-xs font-mono">
                  <p className="text-[9px] text-teal-200 uppercase font-bold flex items-center gap-1"><Coins className="h-3 w-3 text-amber-300" /> Token Akun</p>
                  <p className="font-bold text-amber-300 text-base leading-none mt-0.5">{hospitalProfile?.tokens ?? 0} <span className="text-[9px] text-teal-100 font-normal">token</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Compact Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-4">
            <div className="rounded-2xl bg-white p-3.5 border border-slate-200/80 shadow-2xs hover:shadow-sm transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Kunjungan Hari Ini</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary-tint text-primary">
                  <Users className="h-3.5 w-3.5" />
                </span>
              </div>
              <p className="text-xl font-extrabold text-slate-900 mt-1.5">
                {stats.kunjungan_hari_ini} <span className="text-xs font-normal text-slate-500">Pasien</span>
              </p>
              <p className="text-[9px] font-medium text-primary mt-0.5 flex items-center gap-1">
                <CheckCircle className="h-2.5 w-2.5" /> Antrean Rawat Jalan Operasional
              </p>
            </div>

            <div className="rounded-2xl bg-white p-3.5 border border-slate-200/80 shadow-2xs hover:shadow-sm transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Izin Akses Disetujui</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </span>
              </div>
              <p className="text-xl font-extrabold text-slate-900 mt-1.5">
                {stats.izin_akses_disetujui} <span className="text-xs font-normal text-slate-500">Berkas</span>
              </p>
              <p className="text-[9px] font-medium text-emerald-600 mt-0.5 flex items-center gap-1">
                <Unlock className="h-2.5 w-2.5" /> Dekripsi Diotorisasi Pasien
              </p>
            </div>

            <div className="rounded-2xl bg-white p-3.5 border border-slate-200/80 shadow-2xs hover:shadow-sm transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Request Pending</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Clock className="h-3.5 w-3.5" />
                </span>
              </div>
              <p className="text-xl font-extrabold text-slate-900 mt-1.5">
                {stats.request_pending} <span className="text-xs font-normal text-slate-500">Menunggu</span>
              </p>
              <p className="text-[9px] font-medium text-amber-600 mt-0.5 flex items-center gap-1">
                <Activity className="h-2.5 w-2.5" /> Sent to Patient Wallet
              </p>
            </div>

            <div className="rounded-2xl bg-white p-3.5 border border-slate-200/80 shadow-2xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Dokter & Nakes</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <UserCheck className="h-3.5 w-3.5" />
                </span>
              </div>
              <p className="text-xl font-extrabold text-slate-900 mt-1.5">
                {doctors.length} <span className="text-xs font-normal text-slate-500">Nakes</span>
              </p>
              <p className="text-[9px] font-medium text-indigo-600 mt-0.5 flex items-center gap-1">
                <UserCheck className="h-2.5 w-2.5" /> Dokter Penanggung Jawab
              </p>
            </div>
          </div>

          {/* 3. Main Single Frame Split Grid (Left 5 Cols: Quick Access | Right 7 Cols: Requests Table) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* LEFT PANEL: Quick Access & NIK Request */}
            <div className="lg:col-span-5 space-y-4">
              {/* Form Input NIK */}
              <div className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-2xs">
                <div className="border-b border-slate-100 pb-2 mb-3">
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Send className="h-3.5 w-3.5 text-primary" />
                    Pengajuan Izin Akses Rekam Medis
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Kirim permintaan otorisasi ke wallet pasien via NIK.
                  </p>
                </div>

                <form onSubmit={handleSendRequest} className="space-y-2.5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      NIK Pasien Sasaran
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={16}
                        value={nikInput}
                        onChange={(e) => setNikInput(e.target.value.replace(/\D/g, ""))}
                        placeholder="16 Digit NIK Pasien"
                        className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono focus:border-primary focus:outline-hidden bg-slate-50/50 text-slate-800"
                        required
                      />
                      <button
                        type="submit"
                        disabled={submittingRequest}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary hover:bg-primary-hover px-4 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer disabled:opacity-50 shrink-0"
                      >
                        {submittingRequest ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Send className="h-3.5 w-3.5" />
                        )}
                        Kirim
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Pintasan Rekam Medis & Upload */}
              <div className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-2xs">
                <div className="border-b border-slate-100 pb-2 mb-3">
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    Pintasan Rekam Medis
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Akses cepat berkas EHR & unggah catatan medis baru.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Option 1: Semua Rekam Medis */}
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard/faskes/medical-records")}
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-secondary-tint/50 border border-slate-200/80 transition cursor-pointer text-center group"
                  >
                    <FileText className="h-5 w-5 text-primary mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-800">Semua Rekam Medis</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Lihat Berkas EHR</span>
                  </button>

                  {/* Option 2: Data Pasien */}
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard/faskes/patients")}
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-secondary-tint/50 border border-slate-200/80 transition cursor-pointer text-center group"
                  >
                    <UserCheck className="h-5 w-5 text-primary mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-800">Data Pasien</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Lihat Pasien Aktif</span>
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL: Tabel Status Akses & Dekripsi Data Pasien */}
            <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200/80 p-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-primary" />
                    Permintaan & Dekripsi Rekam Medis
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Daftar permohonan rekam medis eksternal dokter.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/dashboard/faskes/requests/history")}
                  className="inline-flex items-center gap-1 rounded-xl bg-secondary-tint hover:bg-teal-100 text-primary border border-teal-200 px-3 py-1.5 text-xs font-bold transition cursor-pointer shrink-0"
                >
                  Semua Request <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-center text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                      <th className="py-2.5 px-3 text-center rounded-l-lg">Pasien / NIK</th>
                      <th className="py-2.5 px-3 text-center">Tx Hash</th>
                      <th className="py-2.5 px-3 text-center rounded-r-lg">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {requestsList.slice(0, 4).map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-2.5 px-3 text-center">
                          <p className="font-bold text-slate-900 text-xs">{req.patientName}</p>
                          <p className="font-mono text-[10px] text-slate-400">NIK: {maskNik(req.nik)}</p>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-[10px] text-primary font-bold">
                          <TxHashLink txHash={req.txHash} className="inline-flex items-center gap-1 justify-center" title={req.txHash}>
                            <span>{formatTxHash(req.txHash)}</span>
                          </TxHashLink>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {req.status === "Approved" ? (
                            <span className="inline-flex items-center justify-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                              <CheckCircle className="h-2.5 w-2.5" /> Disetujui
                            </span>
                          ) : req.status === "Pending Pasien" || req.status === "Pending" ? (
                            <span className="inline-flex items-center justify-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[9px] font-bold text-amber-700 animate-pulse">
                              <Clock className="h-2.5 w-2.5" /> Pending
                            </span>
                          ) : req.status === "Rejected" || req.status === "Revoked" ? (
                            <span className="inline-flex items-center justify-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-[9px] font-bold text-rose-700">
                              <XCircle className="h-2.5 w-2.5" /> {req.status}
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center gap-1 rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5 text-[9px] font-bold text-slate-700">
                              <AlertCircle className="h-2.5 w-2.5" /> {req.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {requestsList.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-6 text-center text-slate-400 italic text-xs">
                          Belum ada permohonan rekam medis.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Modal View Decrypted Record */}
              {selectedRecord && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
                  <div className="w-full max-w-3xl rounded-[32px] border border-teal-200/80 bg-gradient-to-br from-slate-50 via-teal-50/30 to-white p-6 shadow-2xl shadow-teal-900/10 text-slate-900">
                    <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4 mb-5">
                      <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-secondary-tint border border-teal-200 px-3 py-1 text-sm font-semibold text-primary">
                          <Unlock className="h-4 w-4" />
                          Rekam Medis Terdekripsi
                        </div>
                        <h4 className="mt-3 text-lg font-extrabold text-slate-900">{selectedRecord.patientName}</h4>
                        <p className="text-sm text-slate-500">NIK: <span className="font-mono text-slate-700">{maskNik(selectedRecord.nik)}</span></p>
                      </div>
                      <button
                        onClick={() => setSelectedRecord(null)}
                        className="rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                      >
                        Tutup
                      </button>
                    </div>

                    <div className="space-y-4 text-sm">
                      <div className="rounded-3xl bg-secondary-tint border border-teal-200 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Tx Hash Validasi</p>
                        <TxHashLink txHash={selectedRecord.txHash} className="mt-2 font-mono text-slate-900 break-all inline-flex" title={selectedRecord.txHash}>
                          <span>{selectedRecord.txHash}</span>
                        </TxHashLink>
                      </div>
                      <div className="rounded-[28px] border border-slate-200 bg-white p-4 text-slate-700 shadow-sm">
                        <p className="text-sm font-semibold text-slate-900 mb-3">Ringkasan Rekam Medis</p>
                        <div className="leading-relaxed text-slate-700 whitespace-pre-line">
                          {selectedRecord.decryptedData}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {toast.show && (
            <div className="fixed right-4 bottom-4 z-50 max-w-sm rounded-3xl border border-slate-200/80 bg-white/95 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur-md">
              <div className="flex items-start gap-3">
                <div className={`mt-1 rounded-2xl p-2 ${toast.type === "success" ? "bg-emerald-100 text-emerald-700" : "bg-teal-100 text-primary"}`}>
                  {toast.type === "success" ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  {toast.title && <p className="text-sm font-bold text-slate-900">{toast.title}</p>}
                  <p className="mt-1 text-sm text-slate-700 whitespace-pre-line">{toast.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setToast((prev) => ({ ...prev, show: false }))}
                  className="text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
