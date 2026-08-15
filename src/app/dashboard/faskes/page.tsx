"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TxHashLink from "@/components/ui/TxHashLink";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { getDoctors } from "@/services/doctorService";
import ModernDoctorSelect from "@/components/features/faskes/doctor/ModernDoctorSelect";
import { apiGet, apiPost } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import useFaskesDashboard from "@/hooks/faskes/useDashboard";
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
  const { user, loading, isStaff, hasPermission, handleLogout } = useAuth();
  const {
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
    toast: hookToast,
    stats,
    pharmacyStats,
    sessionOmzet,
    recentInvoices,
    loadingInvoices,
    handleCreateRequest,
    handleSyncBlockchain
  } = useFaskesDashboard();

  const statsAny: any = stats || {};
  const pharmacyStatsAny: any = pharmacyStats || {};

  // POS Kasir Simulator State
  const [billItems, setBillItems] = useState([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [receiptSuccess, setReceiptSuccess] = useState(false);
  const [toast, setToast] = useState<any>({ show: false, type: "info", title: "", message: "" });

  const handleSendRequest = async (e) => {
    e.preventDefault();
    await handleCreateRequest(e);
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
      }
    } catch (err) {
      console.error(err);
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
        setReceiptSuccess(true);
        setBillItems([]);
        setTimeout(() => setReceiptSuccess(false), 5000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const maskNik = (nik) => {
    if (!nik) return "";
    const str = String(nik);
    if (str.length < 16) return str;
    return str.slice(0, 6) + "******" + str.slice(12);
  };

  if (loading) {
    return <LoadingScreen message="Memuat Portal Faskes & Data Medis..." fullScreen={true} />;
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md">
          <Building2 className="h-12 w-12 text-teal-800 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Akses Memerlukan Login</h1>
          <p className="text-sm text-slate-500 mb-6">Silakan masuk dengan akun Fasilitas Kesehatan Anda.</p>
          <Link href="/auth/login" className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-gradient-to-r from-teal-700 to-cyan-800 text-white font-bold text-sm shadow-md hover:from-teal-800 hover:to-cyan-900 transition">
            Kembali ke Halaman Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Faskes Banner Header */}
          <div className="relative overflow-hidden rounded-3xl border border-teal-500/30 bg-gradient-to-r from-teal-800 via-teal-700 to-cyan-900 p-6 sm:p-8 text-white shadow-lg shadow-teal-900/10 mb-8">
            <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3.5 py-1 text-xs font-extrabold text-white backdrop-blur-md mb-3 shadow-xs">
                  <Stethoscope className="h-3.5 w-3.5 text-teal-200" />
                  {isStaff ? `Akses Staf: ${user?.staff_profile?.role_name || "Staf RS"}` : "Sistem HIS & Integrated Medis POS Active"}
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {hospitalProfile?.name || user?.name || "RS Cipto Mangunkusumo"}
                </h1>
                <p className="text-xs sm:text-sm text-teal-100 mt-1 max-w-xl font-medium leading-relaxed">
                  {isStaff
                    ? `Selamat Datang ${user?.name || ""}. Tampilan modul dan fitur di halaman ini disesuaikan dengan wewenang hak akses aktif Anda.`
                    : "Portal Fasilitas Kesehatan & Dokter Penanggung Jawab. Ajukan permohonan rekam medis eksternal secara terlisensi dan cetak billing kasir."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <div className="rounded-2xl border border-white/25 bg-white/15 p-3 text-xs font-mono backdrop-blur-md shadow-xs">
                  <p className="text-[10px] text-teal-100 uppercase font-extrabold flex items-center gap-1"><Coins className="h-3 w-3" /> Token Akun</p>
                  <p className="font-black text-amber-300 mt-0.5 text-lg">{hospitalProfile?.tokens ?? 0} <span className="text-[10px] text-teal-100 font-bold">token</span></p>
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
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-800">
                    <Users className="h-4 w-4" />
                  </span>
                </div>
                <p className="text-2xl font-extrabold text-slate-900 mt-3">
                  {statsAny.kunjungan_hari_ini} <span className="text-xs font-normal text-slate-500">Pasien</span>
                </p>
                <p className="text-[10px] font-medium text-[#16A34A] mt-1 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Antrean Rawat Jalan Operasional
                </p>
              </div>

              {hasPermission("access_request:read") && (
                <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Izin Akses Disetujui</span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-800">
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 mt-3">
                    {statsAny.izin_akses_disetujui} <span className="text-xs font-normal text-slate-500">Berkas Medis</span>
                  </p>
                  <p className="text-[10px] font-medium text-teal-800 mt-1 flex items-center gap-1">
                    <Unlock className="h-3 w-3" /> Dekripsi Diotorisasi Pasien
                  </p>
                </div>
              )}

              {(hasPermission("access_request:read") || hasPermission("access_request:create")) && (
                <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Request Pending</span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-[#D97706]">
                      <Clock className="h-4 w-4" />
                    </span>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 mt-3">
                    {statsAny.request_pending} <span className="text-xs font-normal text-slate-500">Menunggu</span>
                  </p>
                  <p className="text-[10px] font-medium text-[#D97706] mt-1 flex items-center gap-1">
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
                        <Send className="h-5 w-5 text-teal-800" />
                        Pengajuan Izin Akses Rekam Medis (requestAccess)
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Kirim permintaan otorisasi ke wallet pasien untuk membuka dekripsi rekam medis eksternal.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSendRequest} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        NIK Pasien Sasaran
                      </label>
                      <input
                        type="text"
                        maxLength={16}
                        value={nikInput}
                        onChange={(e) => setNikInput(e.target.value)}
                        placeholder="Masukkan 16 Digit NIK pasien"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-mono focus:border-teal-600 focus:outline-hidden"
                        required
                      />
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={submittingRequest}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-700 to-cyan-800 hover:from-teal-800 hover:to-cyan-900 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition cursor-pointer disabled:opacity-50"
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
                        <FileText className="h-5 w-5 text-teal-800" />
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
                          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-700 to-cyan-800 px-4 py-2 text-xs font-bold text-white hover:from-teal-800 hover:to-cyan-900 transition shadow-xs"
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
                          className="inline-flex items-center gap-2 rounded-xl border border-teal-700 bg-white px-4 py-2 text-xs font-bold text-teal-800 hover:bg-teal-50 transition"
                        >
                          <Plus className="h-4 w-4" /> Upload Rekam Medis Baru
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}



              {/* WIDGET UTAMA STAF APOTEKER & POS (Tampil jika staf memiliki izin pharmacy) */}
              {isStaff && (hasPermission("pharmacy:pos") || hasPermission("pharmacy:manage")) && (
                <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <Pill className="h-5 w-5 text-teal-800" />
                        Workspace Staf Apoteker & Kasir POS
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Pusat kendali transaksi kasir, penyerahan resep dokter, dan inventaris obat fasilitas kesehatan.
                      </p>
                    </div>
                    <span className="text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1 rounded-full">
                      {user?.staff_profile?.role_name || "Staf Apoteker"}
                    </span>
                  </div>

                  {/* Grid 4 Kartu Fitur Utama */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Kartu 1: Kasir POS Obat */}
                    {hasPermission("pharmacy:pos") && (
                      <div className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50/60 via-white to-slate-50 p-4 hover:shadow-md transition group">
                        <div className="flex items-center justify-between mb-3">
                          <span className="p-2.5 rounded-xl bg-gradient-to-r from-teal-700 to-cyan-800 text-white shadow-xs group-hover:scale-105 transition-transform">
                            <ShoppingCart className="h-5 w-5" />
                          </span>
                          <span className="text-xs font-mono font-bold text-teal-900 bg-white border border-teal-200 px-2.5 py-0.5 rounded-full">
                            Rp {sessionOmzet.toLocaleString("id-ID")}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">Kasir POS Obat</h4>
                        <p className="text-xs text-slate-500 mt-1 mb-4">Transaksi penjualan obat dan cetak struk billing kasir.</p>
                        <Link
                          href="/dashboard/faskes/pharmacy/pos"
                          className="inline-flex items-center gap-1.5 w-full justify-center rounded-xl bg-gradient-to-r from-teal-700 to-cyan-800 hover:from-teal-800 hover:to-cyan-900 py-2 text-xs font-bold text-white transition shadow-xs"
                        >
                          <ShoppingCart className="h-3.5 w-3.5" /> Buka Kasir POS
                        </Link>
                      </div>
                    )}

                    {/* Kartu 2: Antrean Resep */}
                    {hasPermission("pharmacy:manage") && (
                      <div className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50/60 via-white to-slate-50 p-4 hover:shadow-md transition group">
                        <div className="flex items-center justify-between mb-3">
                          <span className="p-2.5 rounded-xl bg-gradient-to-r from-teal-700 to-cyan-800 text-white shadow-xs group-hover:scale-105 transition-transform">
                            <FileText className="h-5 w-5" />
                          </span>
                          <span className="text-xs font-extrabold text-[#D97706] bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                            {pharmacyStatsAny.pending_prescriptions || 0} Menunggu
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
                      <div className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50/60 via-white to-slate-50 p-4 hover:shadow-md transition group">
                        <div className="flex items-center justify-between mb-3">
                          <span className="p-2.5 rounded-xl bg-gradient-to-r from-teal-700 to-cyan-800 text-white shadow-xs group-hover:scale-105 transition-transform">
                            <Package className="h-5 w-5" />
                          </span>
                          <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
                            {pharmacyStatsAny.total_medicines || 0} Jenis Obat
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">Katalog & Stok Obat</h4>
                        <p className="text-xs text-slate-500 mt-1 mb-4">Kelola data obat, harga, dan peringatan sisa stok.</p>
                        <Link
                          href="/dashboard/faskes/pharmacy/inventory"
                          className="inline-flex items-center gap-1.5 w-full justify-center rounded-xl bg-white border border-teal-200 text-teal-800 hover:bg-teal-50 py-2 text-xs font-bold transition shadow-2xs"
                        >
                          <Package className="h-3.5 w-3.5" /> Kelola Stok Obat
                        </Link>
                      </div>
                    )}

                    {/* Kartu 4: Riwayat POS */}
                    {hasPermission("pharmacy:pos") && (
                      <div className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50/60 via-white to-slate-50 p-4 hover:shadow-md transition group">
                        <div className="flex items-center justify-between mb-3">
                          <span className="p-2.5 rounded-xl bg-gradient-to-r from-teal-700 to-cyan-800 text-white shadow-xs group-hover:scale-105 transition-transform">
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
                          className="inline-flex items-center gap-1.5 w-full justify-center rounded-xl bg-white border border-teal-200 text-teal-800 hover:bg-teal-50 py-2 text-xs font-bold transition shadow-2xs"
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
                  <ShieldCheck className="h-12 w-12 text-teal-800 mx-auto mb-3" />
                  <h3 className="text-base font-extrabold text-slate-900">Hak Akses Modul Utama Terbatas</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Role staf Anda ({user?.staff_profile?.role_name || "Staf RS"}) belum memiliki wewenang aktif. Silakan hubungi Admin RS jika memerlukan akses.
                  </p>
                </div>
              )}
            </div>

            {/* Right Column (1 Col): List Tagihan Invoice */}
            <div className="space-y-8">
              {(hasPermission("pharmacy:pos") || hasPermission("pharmacy:manage") || hasPermission("finance:manage")) ? (
                <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Receipt className="h-4.5 w-4.5 text-teal-800" />
                        Tagihan & Faktur Invoice
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                        Ringkasan invoice & status pembayaran faskes
                      </p>
                    </div>
                  </div>

                  {/* Invoice list */}
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-0.5">
                    {loadingInvoices ? (
                      <div className="py-8 text-center space-y-2">
                        <RefreshCw className="h-5 w-5 animate-spin text-teal-700 mx-auto" />
                        <p className="text-xs text-slate-400 font-medium">Memuat tagihan invoice...</p>
                      </div>
                    ) : recentInvoices.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200/80 p-6 text-center bg-slate-50/50">
                        <Receipt className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-600">Belum Ada Tagihan Invoice</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Tagihan invoice pasien akan tercatat secara otomatis di sini.</p>
                      </div>
                    ) : (
                      recentInvoices.slice(0, 3).map((inv) => {
                        const isPaid = inv.status === "paid";
                        const isPendingCash = inv.status === "pending_cash";
                        return (
                          <div
                            key={inv.id}
                            className="rounded-2xl bg-slate-50/80 hover:bg-white border border-slate-200/80 hover:border-teal-300 p-3.5 transition-all duration-200 shadow-2xs group"
                          >
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="font-mono text-xs font-extrabold text-slate-900 truncate">
                                {inv.id}
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase shrink-0 border ${
                                  isPaid
                                    ? "bg-emerald-50 text-[#16A34A] border-emerald-200"
                                    : isPendingCash
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-rose-50 text-rose-700 border-rose-200"
                                }`}
                              >
                                {isPaid ? "Lunas" : isPendingCash ? "Menunggu Kasir" : "Belum Lunas"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/50">
                              <span className="text-slate-500 font-medium text-[11px] truncate max-w-[140px]">
                                {inv.patient_name || inv.patient?.name || inv.Patient?.name || "Pasien Faskes"}
                              </span>
                              <span className="font-mono font-extrabold text-teal-800 text-xs">
                                Rp {Number(inv.total_amount || 0).toLocaleString("id-ID")}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Button Navigate to /dashboard/faskes/finance/invoice */}
                  <div className="border-t border-slate-100 pt-3">
                    <Link
                      href="/dashboard/faskes/finance/invoice"
                      className="w-full rounded-2xl bg-gradient-to-r from-teal-700 via-teal-800 to-cyan-900 hover:from-teal-800 hover:to-cyan-950 py-3.5 px-4 text-center text-xs font-extrabold text-white shadow-md shadow-teal-950/20 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer group"
                    >
                      <Receipt className="h-4 w-4 text-teal-200 group-hover:scale-110 transition-transform" />
                      <span>Kelola Tagihan & Faktur Invoice</span>
                      <ArrowRight className="h-4 w-4 text-teal-200 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ) : null}

              {/* WIDGET 4: RINGKASAN APOTEKER & STOK FARMASI */}
              {(hasPermission("pharmacy:pos") || hasPermission("pharmacy:manage")) && (
                <div className="rounded-3xl bg-gradient-to-br from-teal-700 via-teal-800 to-cyan-900 border border-teal-500/30 p-6 text-white shadow-lg shadow-teal-900/10 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/20 pb-3">
                    <div className="flex items-center gap-2">
                      <Pill className="h-5 w-5 text-teal-100" />
                      <h3 className="font-black text-sm uppercase tracking-wider text-white">Apoteker & Stok Obat</h3>
                    </div>
                    <span className="text-[10px] font-extrabold bg-white/20 border border-white/30 px-2.5 py-0.5 rounded-full text-white backdrop-blur-md">Farmasi Integrated</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-white/15 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
                      <span className="text-[10px] text-teal-100 uppercase font-extrabold block">Antrean Resep</span>
                      <p className="text-xl font-black text-white mt-0.5">{pharmacyStatsAny.pending_prescriptions || 0}</p>
                      <span className="text-[10px] text-teal-100 font-medium">Perlu Penyerahan</span>
                    </div>

                    <div className="bg-white/15 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
                      <span className="text-[10px] text-teal-100 uppercase font-extrabold block">Peringatan Stok</span>
                      <p className="text-xl font-black text-amber-300 mt-0.5">{pharmacyStatsAny.low_stock_count || 0}</p>
                      <span className="text-[10px] text-teal-100 font-medium">Stok Menipis</span>
                    </div>
                  </div>

                  <div className="pt-1 flex flex-col gap-2">
                    <Link
                      href="/dashboard/faskes/pharmacy/prescriptions"
                      className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white text-teal-800 text-xs font-black shadow-md hover:bg-teal-50 transition cursor-pointer"
                    >
                      <FileText className="h-3.5 w-3.5 text-teal-700" /> Antrean Resep Doctor
                    </Link>
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/dashboard/faskes/pharmacy/inventory"
                        className="inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-teal-800/80 border border-white/25 text-white text-xs font-extrabold hover:bg-teal-900 transition cursor-pointer shadow-2xs"
                      >
                        <Package className="h-3.5 w-3.5 text-teal-200" /> Stok Obat
                      </Link>
                      <Link
                        href="/dashboard/faskes/pharmacy/sales-history"
                        className="inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-teal-800/80 border border-white/25 text-white text-xs font-extrabold hover:bg-teal-900 transition cursor-pointer shadow-2xs"
                      >
                        <History className="h-3.5 w-3.5 text-teal-200" /> Riwayat POS
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
                <div className={`mt-1 rounded-2xl p-2 ${toast.type === "success" ? "bg-emerald-100 text-[#16A34A]" : "bg-red-100 text-[#DC2626]"}`}>
                  {toast.type === "success" ? (
                    <CheckCircle className="h-5 w-5 text-[#16A34A]" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-[#DC2626]" />
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
    </div>
  );
}
