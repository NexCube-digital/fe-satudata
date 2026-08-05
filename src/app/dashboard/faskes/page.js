"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import TxHashLink from "@/components/ui/TxHashLink";
import { getDoctors } from "@/services/doctorService";
import ModernDoctorSelect from "@/components/features/faskes/ModernDoctorSelect";
import { apiGet, apiPost } from "@/lib/api";
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
  DollarSign,
  Search,
  Lock,
  Unlock,
  ShieldCheck,
  Eye,
  RefreshCw,
  Receipt,
  Coins,
  ArrowRight,
  ShoppingCart,
  Pill,
  Package,
  History
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
  const [billItems, setBillItems] = useState([]);
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
  const [pharmacyStats, setPharmacyStats] = useState({
    total_medicines: 0,
    low_stock_count: 0,
    today_sales: 0,
    pending_prescriptions: 0
  });

  const isStaff = user?.role === "staf_rs";
  const userPerms = user?.staff_profile?.permissions || user?.permissions || null;

  const hasPermission = (code) => {
    if (!isStaff) return true;
    if (!Array.isArray(userPerms)) return false;
    return userPerms.includes(code);
  };

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

      // Ambil statistik Apoteker & POS
      const pharmRes = await apiGet("/api/hospital/pharmacy/stats");
      if (pharmRes.success && pharmRes.data) {
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
          txHash: item.tx_hash || item.txHash || null,
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
          jenisDataDiminta: poliInput,
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

  const [syncingReqId, setSyncingReqId] = useState(null);

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
        showToast("Data otorisasi NIK berhasil di-upload ulang ke blockchain (bc-satudata)!", "success", "Sync Berhasil");
        fetchRequestsList();
      } else {
        showToast(result.message || "Gagal meng-upload ulang data ke blockchain", "error", "Gagal Sync");
      }
    } catch (err) {
      console.error(err);
      showToast("Terjadi kesalahan koneksi saat sync ke blockchain", "error", "Gagal Sync");
    } finally {
      setSyncingReqId(null);
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
    if (billItems.length === 0) return;

    try {
      const payload = {
        patient_name: "Pasien Walk-in / Billing Medis",
        items: billItems.map((item, idx) => ({
          medicine_id: idx + 1,
          name: item.name,
          qty: 1,
          price: item.price
        })),
        payment_method: "cash",
        amount_paid: totalBill
      };

      const res = await apiPost("/api/hospital/pharmacy/pos/checkout", payload);
      if (res.success) {
        setSessionOmzet((prev) => prev + totalBill);
        setReceiptSuccess(true);
        setBillItems([]);
        fetchDashboardStats();
        setTimeout(() => setReceiptSuccess(false), 5000);
      } else {
        showToast(res.message || "Gagal memproses transaksi kasir", "error", "Gagal");
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">
        <RefreshCw className="h-8 w-8 animate-spin text-rose-800" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">
        <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md">
          <Building2 className="h-12 w-12 text-rose-800 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Akses Memerlukan Login</h1>
          <p className="text-sm text-slate-500 mb-6">Silakan masuk dengan akun Fasilitas Kesehatan Anda.</p>
          <Link href="/auth/login" className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-rose-800 text-white font-bold text-sm shadow-md hover:bg-rose-700 transition">
            Kembali ke Halaman Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf7f2] via-[#fdfbf7] to-[#f5efe6] flex flex-col pb-16 md:pb-0">
      <Navbar user={user} roleLabel="Fasilitas Kesehatan" onLogout={handleLogout} />

      <div className="flex flex-1">
        <Sidebar role="faskes" />

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Faskes Banner Header */}
          <div className="relative overflow-hidden rounded-3xl border border-rose-500/30 bg-linear-to-r from-rose-600 via-rose-700 to-rose-800 p-6 sm:p-8 text-white shadow-lg shadow-rose-900/10 mb-8">
            <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3.5 py-1 text-xs font-extrabold text-white backdrop-blur-md mb-3 shadow-xs">
                  <Stethoscope className="h-3.5 w-3.5 text-rose-200" />
                  {isStaff ? `Akses Staf: ${user?.staff_profile?.role_name || "Staf RS"}` : "Sistem HIS & Integrated Medis POS Active"}
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {hospitalProfile?.name || user?.name || "RS Cipto Mangunkusumo"}
                </h1>
                <p className="text-xs sm:text-sm text-rose-100 mt-1 max-w-xl font-medium leading-relaxed">
                  {isStaff
                    ? `Selamat Datang ${user?.name || ""}. Tampilan modul dan fitur di halaman ini disesuaikan dengan wewenang hak akses aktif Anda.`
                    : "Portal Fasilitas Kesehatan & Dokter Penanggung Jawab. Ajukan permohonan rekam medis eksternal secara terlisensi dan cetak billing kasir."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <div className="rounded-2xl border border-white/25 bg-white/15 p-3 text-xs font-mono backdrop-blur-md shadow-xs">
                  <p className="text-[10px] text-rose-100 uppercase font-extrabold flex items-center gap-1"><Coins className="h-3 w-3" /> Token Akun</p>
                  <p className="font-black text-amber-300 mt-0.5 text-lg">{hospitalProfile?.tokens ?? 0} <span className="text-[10px] text-rose-100 font-bold">token</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics Grid (Hanya untuk Admin RS agar tidak duplikasi data pada akun Staf) */}
          {!isStaff && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Kunjungan Hari Ini</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-800">
                    <Users className="h-4 w-4" />
                  </span>
                </div>
                <p className="text-2xl font-extrabold text-slate-900 mt-3">
                  {stats.kunjungan_hari_ini} <span className="text-xs font-normal text-slate-500">Pasien</span>
                </p>
                <p className="text-[10px] font-medium text-rose-800 mt-1 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Antrean Rawat Jalan Operasional
                </p>
              </div>

              {hasPermission("access_request:read") && (
                <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Izin Akses Disetujui</span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-800">
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 mt-3">
                    {stats.izin_akses_disetujui} <span className="text-xs font-normal text-slate-500">Berkas Medis</span>
                  </p>
                  <p className="text-[10px] font-medium text-rose-800 mt-1 flex items-center gap-1">
                    <Unlock className="h-3 w-3" /> Dekripsi Diotorisasi Pasien
                  </p>
                </div>
              )}

              {(hasPermission("access_request:read") || hasPermission("access_request:create")) && (
                <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Request Pending</span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <Clock className="h-4 w-4" />
                    </span>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 mt-3">
                    {stats.request_pending} <span className="text-xs font-normal text-slate-500">Menunggu</span>
                  </p>
                  <p className="text-[10px] font-medium text-amber-600 mt-1 flex items-center gap-1">
                    <Activity className="h-3 w-3" /> Notifikasi Dikirim ke Patient Wallet
                  </p>
                </div>
              )}

              {(hasPermission("pharmacy:pos") || hasPermission("pharmacy:manage")) && (
                <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Omzet POS Kasir</span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                      <DollarSign className="h-4 w-4" />
                    </span>
                  </div>
                  <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-3">
                    Rp {sessionOmzet.toLocaleString("id-ID")}
                  </p>
                  <p className="text-[10px] font-medium text-purple-600 mt-1 flex items-center gap-1">
                    <Receipt className="h-3 w-3" /> Kasir Pendaftaran Harian
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Main Layout Grid */}
          <div className="grid gap-8 lg:grid-cols-3 items-start">
            {/* Left Column (2 Cols): Form Request Access & Patients Table */}
            <div className="lg:col-span-2 space-y-8">
              {/* WIDGET 1: FORM MINTA AKSES REKAM MEDIS (requestAccess) */}
              {hasPermission("access_request:create") && (
                <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <Send className="h-5 w-5 text-rose-800" />
                        Pengajuan Izin Akses Rekam Medis (requestAccess)
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Kirim permintaan otorisasi ke wallet pasien untuk membuka dekripsi rekam medis eksternal.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSendRequest} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                          NIK Pasien Sasaran
                        </label>
                        <input
                          type="text"
                          maxLength={16}
                          value={nikInput}
                          onChange={(e) => setNikInput(e.target.value)}
                          placeholder="Masukkan NIK Pasien"
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-mono focus:border-rose-800 focus:outline-hidden"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                          Pilih Dokter / Poli
                        </label>
                        <ModernDoctorSelect
                          doctors={doctors}
                          value={poliInput}
                          onChange={(val) => setPoliInput(val)}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Tujuan Pemeriksaan
                      </label>
                      <input
                        type="text"
                        required
                        value={purposeInput}
                        onChange={(e) => setPurposeInput(e.target.value)}
                        placeholder="Masukkan Tujuan Pemeriksaan (Contoh: Pemeriksaan Rutin & Resep Obat)"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-rose-800 focus:outline-hidden"
                      />
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={submittingRequest}
                        className="inline-flex items-center gap-2 rounded-xl bg-rose-800 hover:bg-rose-700 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition cursor-pointer disabled:opacity-50"
                      >
                        {submittingRequest ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        Kirim Permintaan Ke Pasien (requestAccess)
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* WIDGET 2: REKAM MEDIS & UPLOAD BARU */}
              {(hasPermission("medical_record:read") || hasPermission("medical_record:upload")) && (
                <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs mb-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-rose-800" />
                        Rekam Medis & Upload Baru
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Akses daftar rekam medis yang Anda unggah sendiri, atau buat berkas baru untuk pasien terotorisasi.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2 mb-4">
                    {hasPermission("medical_record:read") && (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <h4 className="text-sm font-bold text-slate-900 mb-2">Semua Rekam Medis</h4>
                        <p className="text-xs text-slate-500 mb-4">Lihat berkas EHR, transaksi Blockchain, dan status upload pasien Anda.</p>
                        <button
                          type="button"
                          onClick={() => router.push("/dashboard/faskes/medical-records")}
                          className="inline-flex items-center gap-2 rounded-xl bg-rose-800 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition"
                        >
                          <FileText className="h-4 w-4" /> Buka Semua Rekam Medis
                        </button>
                      </div>
                    )}
                    {hasPermission("medical_record:upload") && (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <h4 className="text-sm font-bold text-slate-900 mb-2">Upload Baru</h4>
                        <p className="text-xs text-slate-500 mb-4">Unggah catatan medis baru untuk pasien dengan akses aktif.</p>
                        <button
                          type="button"
                          onClick={() => router.push("/dashboard/faskes/medical-records/upload")}
                          className="inline-flex items-center gap-2 rounded-xl border border-rose-800 bg-white px-4 py-2 text-xs font-bold text-rose-800 hover:bg-rose-50 transition"
                        >
                          <Plus className="h-4 w-4" /> Upload Rekam Medis Baru
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* WIDGET 3: TABEL PERMINTAAN REKAM MEDIS */}
              {hasPermission("access_request:read") && (
                <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-rose-800" />
                        Tabel Permintaan Rekam Medis
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Daftar permohonan rekam medis eksternal yang diajukan oleh dokter rumah sakit.
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                          <th className="py-3 px-4 rounded-l-xl">Pasien / NIK</th>
                          <th className="py-3 px-4">Poli Dokter</th>
                          <th className="py-3 px-4">Status Consent</th>
                          <th className="py-3 px-4 rounded-r-xl">Tx Hash</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {requestsList.map((req) => (
                          <tr key={req.id} className="hover:bg-slate-50/50 transition">
                            <td className="py-3.5 px-4">
                              <p className="font-bold text-slate-900">{req.patientName}</p>
                              <p className="font-mono text-[10px] text-slate-400">NIK: {maskNik(req.nik)}</p>
                            </td>
                            <td className="py-3.5 px-4 font-medium text-slate-700">{req.poli}</td>
                            <td className="py-3.5 px-4">
                              {req.status === "Approved" ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[10px] font-bold text-rose-900">
                                  <CheckCircle className="h-3 w-3" /> Disetujui
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 animate-pulse">
                                  <Clock className="h-3 w-3" /> Pending Pasien
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-[10px] text-rose-900">
                              {req.txHash ? (
                                <TxHashLink txHash={req.txHash} className="inline-flex items-center gap-1 font-bold text-rose-900" title={req.txHash}>
                                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                  <span className="truncate max-w-[150px]">{req.txHash}</span>
                                </TxHashLink>
                              ) : req.status === "Approved" ? (
                                <button
                                  type="button"
                                  onClick={() => handleSyncBlockchain(req.id)}
                                  disabled={syncingReqId === req.id}
                                  className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-900 px-2 py-1 text-[10px] font-bold transition cursor-pointer"
                                  title="Upload Ulang ke Blockchain (bc-satudata)"
                                >
                                  <RefreshCw className={`h-3 w-3 text-amber-700 ${syncingReqId === req.id ? "animate-spin" : ""}`} />
                                  <span>{syncingReqId === req.id ? "Syncing..." : "Upload Ulang (Sync)"}</span>
                                </button>
                              ) : (
                                <span className="text-slate-400 font-sans italic text-[11px]">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Modal View Decrypted Record */}
                  {selectedRecord && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-sky-950/40 p-4 backdrop-blur-sm">
                      <div className="w-full max-w-3xl rounded-[32px] border border-sky-200/80 bg-gradient-to-br from-slate-50 via-sky-50 to-white p-6 shadow-2xl shadow-sky-400/20 text-slate-900">
                        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4 mb-5">
                          <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-800">
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
                          <div className="rounded-3xl bg-sky-50 border border-sky-200 p-4">
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
              )}

              {/* WIDGET UTAMA STAF APOTEKER & POS (Tampil jika staf memiliki izin pharmacy) */}
              {isStaff && (hasPermission("pharmacy:pos") || hasPermission("pharmacy:manage")) && (
                <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <Pill className="h-5 w-5 text-rose-700" />
                        Workspace Staf Apoteker & Kasir POS
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Pusat kendali transaksi kasir, penyerahan resep dokter, dan inventaris obat fasilitas kesehatan.
                      </p>
                    </div>
                    <span className="text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 px-3 py-1 rounded-full">
                      {user?.staff_profile?.role_name || "Staf Apoteker"}
                    </span>
                  </div>

                  {/* Grid 4 Kartu Fitur Utama */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Kartu 1: Kasir POS Obat */}
                    {hasPermission("pharmacy:pos") && (
                      <div className="rounded-2xl border border-rose-100 bg-linear-to-br from-rose-50/60 via-white to-slate-50 p-4 hover:shadow-md transition group">
                        <div className="flex items-center justify-between mb-3">
                          <span className="p-2.5 rounded-xl bg-rose-700 text-white shadow-xs group-hover:scale-105 transition-transform">
                            <ShoppingCart className="h-5 w-5" />
                          </span>
                          <span className="text-xs font-mono font-bold text-rose-900 bg-white border border-rose-200 px-2.5 py-0.5 rounded-full">
                            Rp {sessionOmzet.toLocaleString("id-ID")}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">Kasir POS Obat</h4>
                        <p className="text-xs text-slate-500 mt-1 mb-4">Transaksi penjualan obat dan cetak struk billing kasir.</p>
                        <Link
                          href="/dashboard/faskes/pharmacy/pos"
                          className="inline-flex items-center gap-1.5 w-full justify-center rounded-xl bg-rose-700 hover:bg-rose-800 py-2 text-xs font-bold text-white transition shadow-xs"
                        >
                          <ShoppingCart className="h-3.5 w-3.5" /> Buka Kasir POS
                        </Link>
                      </div>
                    )}

                    {/* Kartu 2: Antrean Resep */}
                    {hasPermission("pharmacy:manage") && (
                      <div className="rounded-2xl border border-rose-100 bg-linear-to-br from-rose-50/60 via-white to-slate-50 p-4 hover:shadow-md transition group">
                        <div className="flex items-center justify-between mb-3">
                          <span className="p-2.5 rounded-xl bg-rose-700 text-white shadow-xs group-hover:scale-105 transition-transform">
                            <FileText className="h-5 w-5" />
                          </span>
                          <span className="text-xs font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                            {pharmacyStats.pending_prescriptions || 0} Menunggu
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">Antrean Resep Dokter</h4>
                        <p className="text-xs text-slate-500 mt-1 mb-4">Verifikasi dan penyerahan resep obat dari rekam medis.</p>
                        <Link
                          href="/dashboard/faskes/pharmacy/prescriptions"
                          className="inline-flex items-center gap-1.5 w-full justify-center rounded-xl bg-slate-800 hover:bg-slate-900 py-2 text-xs font-bold text-white transition shadow-xs"
                        >
                          <FileText className="h-3.5 w-3.5" /> Antrean Resep
                        </Link>
                      </div>
                    )}

                    {/* Kartu 3: Katalog & Stok Obat */}
                    {hasPermission("pharmacy:manage") && (
                      <div className="rounded-2xl border border-rose-100 bg-linear-to-br from-rose-50/60 via-white to-slate-50 p-4 hover:shadow-md transition group">
                        <div className="flex items-center justify-between mb-3">
                          <span className="p-2.5 rounded-xl bg-rose-700 text-white shadow-xs group-hover:scale-105 transition-transform">
                            <Package className="h-5 w-5" />
                          </span>
                          <span className="text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                            {pharmacyStats.total_medicines || 0} Jenis Obat
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">Katalog & Stok Obat</h4>
                        <p className="text-xs text-slate-500 mt-1 mb-4">Kelola data obat, harga, dan peringatan sisa stok.</p>
                        <Link
                          href="/dashboard/faskes/pharmacy/inventory"
                          className="inline-flex items-center gap-1.5 w-full justify-center rounded-xl bg-white border border-rose-200 text-rose-800 hover:bg-rose-50 py-2 text-xs font-bold transition shadow-2xs"
                        >
                          <Package className="h-3.5 w-3.5" /> Kelola Stok Obat
                        </Link>
                      </div>
                    )}

                    {/* Kartu 4: Riwayat POS */}
                    {hasPermission("pharmacy:pos") && (
                      <div className="rounded-2xl border border-rose-100 bg-linear-to-br from-rose-50/60 via-white to-slate-50 p-4 hover:shadow-md transition group">
                        <div className="flex items-center justify-between mb-3">
                          <span className="p-2.5 rounded-xl bg-rose-700 text-white shadow-xs group-hover:scale-105 transition-transform">
                            <History className="h-5 w-5" />
                          </span>
                          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                            Audit POS
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">Riwayat Transaksi POS</h4>
                        <p className="text-xs text-slate-500 mt-1 mb-4">Laporan audit transaksi penjualan dan cetak ulang struk.</p>
                        <Link
                          href="/dashboard/faskes/pharmacy/sales-history"
                          className="inline-flex items-center gap-1.5 w-full justify-center rounded-xl bg-white border border-rose-200 text-rose-800 hover:bg-rose-50 py-2 text-xs font-bold transition shadow-2xs"
                        >
                          <History className="h-3.5 w-3.5" /> Riwayat Transaksi
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notice for Staff RS with NO medical or pharmacy permissions */}
              {isStaff && !hasPermission("access_request:create") && !hasPermission("access_request:read") && !hasPermission("medical_record:read") && !hasPermission("medical_record:upload") && !hasPermission("pharmacy:pos") && !hasPermission("pharmacy:manage") && (
                <div className="rounded-3xl bg-white border border-slate-200/80 p-8 text-center shadow-xs">
                  <ShieldCheck className="h-12 w-12 text-rose-800 mx-auto mb-3" />
                  <h3 className="text-base font-extrabold text-slate-900">Hak Akses Modul Utama Terbatas</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Role staf Anda ({user?.staff_profile?.role_name || "Staf RS"}) belum memiliki wewenang aktif. Silakan hubungi Admin RS jika memerlukan akses.
                  </p>
                </div>
              )}
            </div>

            {/* Right Column (1 Col): POS Billing Kasir Simulator */}
            <div className="space-y-8">
              {(hasPermission("pharmacy:pos") || hasPermission("pharmacy:manage")) ? (
                <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Receipt className="h-4.5 w-4.5 text-rose-800" />
                      Kasir & POS Billing Medis
                    </h3>
                    <div className="flex items-center gap-2">
                      <Link
                        href="/dashboard/faskes/pharmacy/pos"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-linear-to-r from-rose-800 via-rose-900 to-red-950 text-white text-[11px] font-extrabold shadow-md shadow-rose-950/20 hover:shadow-lg hover:from-rose-700 hover:to-rose-900 hover:scale-[1.02] transition-all duration-200 group cursor-pointer border border-rose-700/30"
                      >
                        <ShoppingCart className="h-3.5 w-3.5 text-rose-200 group-hover:scale-110 transition-transform" />
                        <span>Apoteker POS</span>
                        <ArrowRight className="h-3 w-3 text-rose-200 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>

                  {/* Bill items list */}
                  <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-1">
                    {billItems.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4 text-center italic border border-dashed border-slate-200 rounded-xl">
                        Belum ada item tagihan. Tambahkan layanan medis di bawah.
                      </p>
                    ) : (
                      billItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs border border-slate-100">
                          <span className="font-semibold text-slate-800">{item.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-rose-800 font-bold">Rp {item.price.toLocaleString("id-ID")}</span>
                            <button
                              onClick={() => handleRemoveBillItem(item.id)}
                              className="text-slate-400 hover:text-red-500 transition cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Custom Item Form */}
                  <form onSubmit={handleAddBillItem} className="space-y-2 mb-4">
                    <input
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="Nama Layanan Medis"
                      className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs focus:border-rose-800 focus:outline-hidden"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(e.target.value)}
                        placeholder="Harga (Rp)"
                        className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-mono focus:border-rose-800 focus:outline-hidden"
                      />
                      <button
                        type="submit"
                        className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-1.5 text-xs font-bold text-white transition flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" /> Tambah
                      </button>
                    </div>
                  </form>

                  {/* Total & Checkout */}
                  <div className="border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between text-sm font-bold mb-3">
                      <span className="text-slate-700">Total Tagihan:</span>
                      <span className="text-rose-800 font-mono text-base">Rp {totalBill.toLocaleString("id-ID")}</span>
                    </div>

                    {receiptSuccess && (
                      <div className="mb-3 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900 font-medium space-y-1">
                        <div className="flex items-center gap-2 font-bold">
                          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span>Transaksi kasir sukses & tercatat di Apoteker/POS!</span>
                        </div>
                        <Link href="/dashboard/faskes/pharmacy/sales-history" className="text-[11px] font-bold text-emerald-700 underline block pt-0.5">
                          → Lihat Struk & Riwayat Penjualan Kasir
                        </Link>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleProcessTransaction}
                      className="w-full rounded-xl bg-rose-800 hover:bg-rose-700 py-3 text-center text-xs font-bold text-white transition shadow-md shadow-rose-950/10 cursor-pointer"
                    >
                      Proses Transaksi Kasir
                    </button>
                  </div>
                </div>
              ) : null}

              {/* WIDGET 4: RINGKASAN APOTEKER & STOK FARMASI */}
              {(hasPermission("pharmacy:pos") || hasPermission("pharmacy:manage")) && (
                <div className="rounded-3xl bg-linear-to-br from-rose-600 via-rose-700 to-rose-800 border border-rose-500/30 p-6 text-white shadow-lg shadow-rose-900/10 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/20 pb-3">
                    <div className="flex items-center gap-2">
                      <Pill className="h-5 w-5 text-rose-100" />
                      <h3 className="font-black text-sm uppercase tracking-wider text-white">Apoteker & Stok Obat</h3>
                    </div>
                    <span className="text-[10px] font-extrabold bg-white/20 border border-white/30 px-2.5 py-0.5 rounded-full text-white backdrop-blur-md">Farmasi Integrated</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-white/15 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
                      <span className="text-[10px] text-rose-100 uppercase font-extrabold block">Antrean Resep</span>
                      <p className="text-xl font-black text-white mt-0.5">{pharmacyStats.pending_prescriptions || 0}</p>
                      <span className="text-[10px] text-rose-100 font-medium">Perlu Penyerahan</span>
                    </div>

                    <div className="bg-white/15 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
                      <span className="text-[10px] text-rose-100 uppercase font-extrabold block">Peringatan Stok</span>
                      <p className="text-xl font-black text-amber-300 mt-0.5">{pharmacyStats.low_stock_count || 0}</p>
                      <span className="text-[10px] text-rose-100 font-medium">Stok Menipis</span>
                    </div>
                  </div>

                  <div className="pt-1 flex flex-col gap-2">
                    <Link
                      href="/dashboard/faskes/pharmacy/prescriptions"
                      className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white text-rose-800 text-xs font-black shadow-md hover:bg-rose-50 transition cursor-pointer"
                    >
                      <FileText className="h-3.5 w-3.5 text-rose-700" /> Antrean Resep Doctor
                    </Link>
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/dashboard/faskes/pharmacy/inventory"
                        className="inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-800/80 border border-white/25 text-white text-xs font-extrabold hover:bg-rose-900 transition cursor-pointer shadow-2xs"
                      >
                        <Package className="h-3.5 w-3.5 text-rose-200" /> Stok Obat
                      </Link>
                      <Link
                        href="/dashboard/faskes/pharmacy/sales-history"
                        className="inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-800/80 border border-white/25 text-white text-xs font-extrabold hover:bg-rose-900 transition cursor-pointer shadow-2xs"
                      >
                        <History className="h-3.5 w-3.5 text-rose-200" /> Riwayat POS
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {toast.show && (
            <div className="fixed right-4 bottom-4 z-50 max-w-sm rounded-3xl border border-slate-200/80 bg-white/95 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur-md">
              <div className="flex items-start gap-3">
                <div className={`mt-1 rounded-2xl p-2 ${toast.type === "success" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
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
