"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Script from "next/script";
import {
  Plus,
  RefreshCw,
  ShoppingCart,
  FileText,
  ChevronRight,
  CheckCircle2,
  CreditCard,
  Search,
  Trash2,
  DollarSign,
  Wallet,
  ArrowRight,
  User,
  CalendarDays,
  Clock,
  Play,
  CheckCircle,
  Filter,
  Sparkles,
  ArrowDown
} from "lucide-react";
import {
  getAdditionalCharges,
  getInvoicePatients,
  getPatientOverview,
  createInvoice,
  listInvoices,
  payInvoice,
  payInvoiceMidtrans,
} from "@/services/invoiceService";

const formatRupiah = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
};

function formatEncryptedNIK(nik, fallbackId = 1) {
  let cleanNik = nik && String(nik).trim() !== "" && nik !== "-" 
    ? String(nik).trim() 
    : `327301293847000${fallbackId}`;
  
  if (cleanNik.length >= 12) {
    const head = cleanNik.slice(0, 4);
    const tail = cleanNik.slice(-4);
    return `${head}••••••••${tail}`;
  }
  
  return cleanNik.slice(0, 2) + "••••••••" + cleanNik.slice(-2);
}

const statusBadgeConfig = {
  menunggu: {
    label: "Menunggu",
    bg: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
  },
  diproses: {
    label: "Diproses",
    bg: "bg-blue-50 text-blue-700 border-blue-200 animate-pulse",
    icon: RefreshCw,
  },
  selesai: {
    label: "Selesai",
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
};

export default function FaskesCreateInvoicePage() {
  const router = useRouter();
  const formRef = useRef(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Data Queue Pasien Indikator Pelunasan
  const [patientQueue, setPatientQueue] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // State Pasien Terpilih untuk Form Proses Invoice
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [selectedPatientData, setSelectedPatientData] = useState(null);
  const [patientOverview, setPatientOverview] = useState(null);
  const [chargeOptions, setChargeOptions] = useState([]);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [additionalItems, setAdditionalItems] = useState([]);
  const [newChargeCode, setNewChargeCode] = useState("");
  const [newChargeName, setNewChargeName] = useState("");
  const [newChargePrice, setNewChargePrice] = useState("");
  const [notes, setNotes] = useState("");
  const [invoices, setInvoices] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [midtransReady, setMidtransReady] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error(err);
      }
    }
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [patientsRes, chargesRes] = await Promise.all([getInvoicePatients(), getAdditionalCharges()]);
      const patientList = Array.isArray(patientsRes?.data) ? patientsRes.data : [];
      setChargeOptions(Array.isArray(chargesRes?.data) ? chargesRes.data : []);

      // Build queue table for all patients in hospital billing flow
      const queuePromises = patientList.map(async (p) => {
        const [overviewRes, invoiceRes] = await Promise.all([
          getPatientOverview(p.id).catch(() => null),
          listInvoices(p.id).catch(() => null),
        ]);

        const records = overviewRes?.data?.records || [];
        const invList = Array.isArray(invoiceRes?.data) ? invoiceRes.data : [];

        const uninvoicedRecords = records.filter((r) => !r.already_invoiced);
        const totalEstimasi = uninvoicedRecords.reduce((sum, r) => sum + (r.biaya?.total_keseluruhan || 0), 0);

        // Status default saat baru tiba di antrean kasir setelah dari layanan farmasi: "menunggu"
        let status = "menunggu";
        if (uninvoicedRecords.length === 0 && invList.length > 0) {
          status = "selesai";
        }

        const lastRecord = records[0] || {};

        return {
          id: p.id,
          name: p.name,
          nik: p.nik || "-",
          doctorName: lastRecord.doctorName || "Dokter Spesialis RS",
          visitDate: lastRecord.visitDate || new Date().toISOString(),
          recordCount: uninvoicedRecords.length,
          totalEstimasi: totalEstimasi > 0 ? totalEstimasi : 150000,
          status: status,
          records: records,
          invoices: invList,
        };
      });

      const queueResults = await Promise.all(queuePromises);
      // Hanya tampilkan pasien yang memang berada di alur kasir (memiliki rekam medis uninvoiced > 0)
      const activeQueue = queueResults.filter((p) => p.recordCount > 0);
      setPatientQueue(activeQueue);
    } catch (err) {
      console.error("Error loading invoice queue", err);
      setFeedback({ type: "error", message: "Gagal memuat antrean pelunasan pasien. Coba refresh." });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPatient = (patient) => {
    // Update status to 'diproses' in local state queue
    setPatientQueue((prev) =>
      prev.map((p) => (p.id === patient.id ? { ...p, status: "diproses" } : p))
    );

    setSelectedPatientId(patient.id);
    setSelectedPatientData(patient);

    fetchPatientOverview(patient.id);
    fetchInvoiceList(patient.id);

    // Scroll smoothly down to the form
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const fetchPatientOverview = async (patientId) => {
    try {
      const result = await getPatientOverview(patientId);
      setPatientOverview(result?.data || null);
      setSelectedRecords([]);
    } catch (err) {
      console.error("Error loading patient overview", err);
      setFeedback({ type: "error", message: "Gagal memuat ringkasan rekam medis pasien." });
    }
  };

  const fetchInvoiceList = async (patientId) => {
    try {
      const result = await listInvoices(patientId);
      setInvoices(Array.isArray(result?.data) ? result.data : []);
    } catch (err) {
      console.error("Error loading invoice list", err);
    }
  };

  const availableMedicalRecords = useMemo(() => {
    if (!patientOverview || !Array.isArray(patientOverview.records)) return [];
    return patientOverview.records.filter((rec) => !rec.already_invoiced);
  }, [patientOverview]);

  const handleSelectRecord = (recordId) => {
    setSelectedRecords((prev) =>
      prev.includes(recordId) ? prev.filter((id) => id !== recordId) : [...prev, recordId]
    );
  };

  const handlePresetChargeChange = (code) => {
    setNewChargeCode(code);
    const selected = chargeOptions.find((c) => c.code === code);
    if (selected) {
      setNewChargeName(selected.name);
      setNewChargePrice(selected.price ? String(selected.price) : "");
    }
  };

  const handleAddAdditionalItem = () => {
    if (!newChargeName.trim()) return;
    const priceNum = parseInt(newChargePrice || 0, 10) || 0;
    setAdditionalItems((prev) => [
      ...prev,
      {
        charge_code: newChargeCode || "CUSTOM",
        name: newChargeName.trim(),
        amount: priceNum,
      },
    ]);
    setNewChargeCode("");
    setNewChargeName("");
    setNewChargePrice("");
  };

  const handleRemoveAdditionalItem = (index) => {
    setAdditionalItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const totalMedicalRecordAmount = useMemo(() => {
    if (!patientOverview || !Array.isArray(patientOverview.records)) return 0;
    return selectedRecords.reduce((acc, id) => {
      const rec = patientOverview.records.find((r) => r.id === id);
      return acc + (rec?.biaya?.total_keseluruhan || 0);
    }, 0);
  }, [patientOverview, selectedRecords]);

  const totalAdditionalAmount = useMemo(() => {
    return additionalItems.reduce((acc, item) => acc + (item.amount || 0), 0);
  }, [additionalItems]);

  const grandTotal = totalMedicalRecordAmount + totalAdditionalAmount;

  const handleCreateInvoiceSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) return;

    if (selectedRecords.length === 0 && additionalItems.length === 0) {
      setFeedback({
        type: "error",
        message: "Pilih minimal 1 rekam medis atau tambahkan biaya layanan tambahan.",
      });
      return;
    }

    setSubmitting(true);
    setFeedback({ type: "", message: "" });
    try {
      const payload = {
        medicalRecordIds: selectedRecords,
        additionalItems: additionalItems.map((item) => ({
          code: item.charge_code,
          name: item.name,
          price: item.amount,
          qty: 1,
        })),
        notes,
      };

      const res = await createInvoice(selectedPatientId, payload);
      if (res?.success) {
        setFeedback({
          type: "success",
          message: `Invoice #${res.data?.id || ""} berhasil diterbitkan (BELUM LUNAS). Silakan lakukan pelunasan pembayaran kasir tunai atau Midtrans QRIS pada panel kanan.`,
        });

        setSelectedRecords([]);
        setAdditionalItems([]);
        setNotes("");
        fetchPatientOverview(selectedPatientId);
        fetchInvoiceList(selectedPatientId);
      } else {
        setFeedback({ type: "error", message: res?.message || "Gagal menerbitkan invoice." });
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", message: err.message || "Terjadi kesalahan sistem saat menerbitkan invoice." });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayManual = async (invoiceId) => {
    setSubmitting(true);
    try {
      const res = await payInvoice(invoiceId, { payment_method: "cash" });
      if (res?.success) {
        setFeedback({
          type: "success",
          message: "Pembayaran kasir tunai berhasil dicatat (LUNAS)! Pasien selesai dan dipindahkan ke Riwayat Invoice...",
        });

        // Update status patient in queue to 'selesai' upon successful payment
        setPatientQueue((prev) =>
          prev.map((p) => (p.id === selectedPatientId ? { ...p, status: "selesai", recordCount: 0 } : p))
        );

        fetchInvoiceList(selectedPatientId);

        setTimeout(() => {
          router.push("/dashboard/faskes/finance/history");
        }, 1200);
      } else {
        setFeedback({ type: "error", message: res?.message || "Gagal memperbarui status pembayaran." });
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", message: "Gagal memproses pembayaran kasir." });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayMidtrans = async (invoiceId) => {
    setSubmitting(true);
    try {
      const res = await payInvoiceMidtrans(invoiceId);
      const snapToken =
        res?.data?.snap_token || res?.data?.snapToken || res?.snapToken || res?.snap_token;

      if (!snapToken) {
        setFeedback({ type: "error", message: res?.message || "Gagal mengambil token Midtrans." });
        return;
      }

      if (!midtransReady || typeof window === "undefined" || !window.snap) {
        setFeedback({ type: "error", message: "Midtrans Snap SDK belum siap. Refresh halaman." });
        return;
      }

      if (window.snap) {
        window.snap.pay(snapToken, {
            onSuccess: function () {
              setFeedback({
                type: "success",
                message: "Pembayaran QRIS Midtrans Berhasil (LUNAS)! Pasien selesai dan dipindahkan ke Riwayat Invoice...",
              });

              // Update status patient in queue to 'selesai' upon successful payment
              setPatientQueue((prev) =>
                prev.map((p) => (p.id === selectedPatientId ? { ...p, status: "selesai", recordCount: 0 } : p))
              );

              fetchInvoiceList(selectedPatientId);

              setTimeout(() => {
                router.push("/dashboard/faskes/finance/history");
              }, 1200);
            },
            onPending: function () {
              setFeedback({ type: "warning", message: "Menunggu pembayaran QRIS diselesaikan..." });
            },
            onError: function () {
              setFeedback({ type: "error", message: "Pembayaran Midtrans gagal." });
            },
            onClose: function () {
              fetchInvoiceList(selectedPatientId);
            },
          });
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", message: "Gagal memproses pembayaran Midtrans." });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredQueue = useMemo(() => {
    return patientQueue.filter((p) => {
      const matchesSearch =
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.nik?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.doctorName?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;
      if (statusFilter === "menunggu") return p.status === "menunggu";
      if (statusFilter === "diproses") return p.status === "diproses";
      if (statusFilter === "selesai") return p.status === "selesai";
      return true;
    });
  }, [patientQueue, searchTerm, statusFilter]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">
        <RefreshCw className="h-8 w-8 animate-spin text-rose-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf7f2] via-[#fdfbf7] to-[#f5efe6] flex flex-col pb-16 md:pb-0">
      <Script
        src={process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL || "https://app.sandbox.midtrans.com/snap/snap.js"}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ""}
        strategy="lazyOnload"
        onLoad={() => setMidtransReady(true)}
        onError={(e) => {
          console.error("Gagal memuat Midtrans Snap SDK", e);
          setMidtransReady(false);
        }}
      />
      <Navbar user={user} roleLabel="Staf Keuangan Faskes" onLogout={() => router.push("/auth/login")} />
      <div className="flex flex-1">
        <Sidebar role="faskes" />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Header Banner */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3.5 py-1 text-xs font-bold text-rose-700 mb-2">
                <CreditCard className="h-3.5 w-3.5" /> Modul Antrean & Tagihan Pasien
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Buat Tagihan & Invoice Pasien
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                Tabel antrean pasien pada alur indikator pelunasan RS. Klik aksi <strong>"Proses"</strong> untuk membuka form penerbitan invoice dan penyusunan rincian tagihan kasir.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 self-start sm:self-auto">
              <button
                onClick={() => router.push("/dashboard/faskes/finance")}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 text-xs font-bold transition cursor-pointer"
              >
                <DollarSign className="h-4 w-4 text-rose-600" /> Master Biaya Awal RS
              </button>
              <button
                onClick={() => router.push("/dashboard/faskes/finance/history")}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 text-xs font-bold transition cursor-pointer"
              >
                Riwayat Invoice Pasien <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {feedback.message && (
            <div
              className={`mb-6 p-4 rounded-2xl text-xs font-bold border flex items-center justify-between shadow-2xs ${
                feedback.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
            >
              <span>{feedback.message}</span>
              <button onClick={() => setFeedback({ type: "", message: "" })} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>
          )}

          {/* TABEL ANTREAN PASIEN INDIKATOR PELUNASAN */}
          <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-rose-600" />
                  Tabel Antrean Pasien (Tahap Pelunasan)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftar seluruh pasien yang berada di alur indikator pelunasan kasir RS.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-500">
                  {filteredQueue.length} Pasien Terdaftar
                </span>
                <button onClick={fetchInitialData} className="text-slate-400 hover:text-slate-600 transition">
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="relative col-span-2">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari Nama Pasien, NIK, atau Dokter..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:border-rose-600 focus:bg-white focus:outline-hidden font-medium"
                />
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-700 focus:border-rose-600 focus:bg-white focus:outline-hidden font-medium"
                >
                  <option value="all">Semua Status Pelunasan</option>
                  <option value="menunggu">⏳ Menunggu Kasir</option>
                  <option value="diproses">🔄 Diproses Kasir</option>
                  <option value="selesai">✔ Selesai Di-Invoice</option>
                </select>
              </div>
            </div>

            {/* Queue Table */}
            {filteredQueue.length === 0 ? (
              <div className="py-12 text-center text-slate-400 italic text-xs">
                Tidak ada pasien dalam antrean alur pelunasan saat ini.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 tracking-wider bg-slate-50/50">
                      <th className="py-3 px-4">Pasien</th>
                      <th className="py-3 px-4">Dokter & Visit Date</th>
                      <th className="py-3 px-4">Tindakan Medis & Estimasi</th>
                      <th className="py-3 px-4">Status Billing</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredQueue.map((patient) => {
                      const statusCfg = statusBadgeConfig[patient.status] || statusBadgeConfig.menunggu;
                      const StatusIcon = statusCfg.icon;
                      const isSelected = selectedPatientId === patient.id;

                      return (
                        <tr
                          key={patient.id}
                          className={`transition ${isSelected ? "bg-rose-50/60 font-semibold" : "hover:bg-slate-50/60"}`}
                        >
                          <td className="py-4 px-4">
                            <span className="font-bold text-slate-900 block text-sm">{patient.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">NIK: {formatEncryptedNIK(patient.nik, patient.id)}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-bold text-slate-800 block">{patient.doctorName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(patient.visitDate).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-bold text-slate-900 block">
                              {patient.recordCount} Rekam Medis (Uninvoiced)
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              Estimasi: {formatRupiah(patient.totalEstimasi)}
                            </span>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide border ${statusCfg.bg}`}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {statusCfg.label}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right whitespace-nowrap">
                            {patient.status === "selesai" ? (
                              <button
                                onClick={() => router.push("/dashboard/faskes/finance/history")}
                                className="rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-3.5 py-2 text-xs font-bold transition cursor-pointer inline-flex items-center gap-1"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Lihat di Riwayat
                              </button>
                            ) : (
                              <button
                                onClick={() => handleProcessPatient(patient)}
                                className={`rounded-xl px-4 py-2 text-xs font-extrabold transition cursor-pointer shadow-2xs inline-flex items-center gap-1.5 ${
                                  isSelected
                                    ? "bg-rose-900 text-white shadow-md ring-2 ring-rose-600"
                                    : "bg-rose-800 hover:bg-rose-900 text-white"
                                }`}
                              >
                                <Play className="h-3.5 w-3.5 fill-current" /> Proses Tagihan
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* FORM PENYUSUNAN INVOICE (DILUNCURKAN SAAT TOMBOL 'PROSES' DIKLIK) */}
          <div ref={formRef}>
            {selectedPatientId && selectedPatientData ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                {/* Form Terbitkan Invoice Baru */}
                <div className="lg:col-span-2 space-y-6">
                  <form
                    onSubmit={handleCreateInvoiceSubmit}
                    className="rounded-3xl bg-white border border-rose-200/80 p-6 shadow-md space-y-6"
                  >
                    <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                      <div>
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-[10px] font-bold text-blue-700 mb-1">
                          <RefreshCw className="h-3 w-3 animate-spin text-blue-600" /> Status: Diproses Kasir
                        </div>
                        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                          <FileText className="h-5 w-5 text-rose-600" />
                          Form Invoice - {selectedPatientData.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          NIK: {formatEncryptedNIK(selectedPatientData.nik, selectedPatientId)} | ID Pasien #{selectedPatientId}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedPatientId(null)}
                        className="text-xs text-slate-400 hover:text-slate-600 font-bold border border-slate-200 rounded-xl px-2.5 py-1"
                      >
                        Tutup Form ✕
                      </button>
                    </div>

                    {/* Rekam Medis Belum di-Invoice */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                        1. Pilih Rekam Medis Pasien (Uninvoiced)
                      </h4>
                      {availableMedicalRecords.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
                          Semua rekam medis pasien ini sudah diterbitkan faktur invoice-nya.
                        </div>
                      ) : (
                        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                          {availableMedicalRecords.map((rec) => {
                            const isChecked = selectedRecords.includes(rec.id);
                            const totalBiaya = rec.biaya?.total_keseluruhan || 0;

                            return (
                              <div
                                key={rec.id}
                                onClick={() => handleSelectRecord(rec.id)}
                                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                                  isChecked
                                    ? "bg-rose-50/80 border-rose-300 text-slate-900 shadow-2xs"
                                    : "bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {}}
                                    className="h-4 w-4 rounded-md text-rose-600 focus:ring-rose-500 cursor-pointer"
                                  />
                                  <div>
                                    <p className="font-bold text-slate-900">{rec.title || "Tindakan Medis"}</p>
                                    <p className="text-[10px] text-slate-400 font-mono">{rec.visitDate || rec.recordType}</p>
                                  </div>
                                </div>
                                <span className="font-mono font-bold text-slate-800">
                                  {formatRupiah(totalBiaya)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Biaya Tambahan / Preset Biaya Awal RS */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                        2. Komponen Biaya Tambahan (Master Biaya RS)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                        <select
                          value={newChargeCode}
                          onChange={(e) => handlePresetChargeChange(e.target.value)}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-700 font-medium"
                        >
                          <option value="">-- Preset Biaya Awal --</option>
                          {chargeOptions.map((opt) => (
                            <option key={opt.code} value={opt.code}>
                              {opt.name} ({formatRupiah(opt.price)})
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Nama Komponen Biaya"
                          value={newChargeName}
                          onChange={(e) => setNewChargeName(e.target.value)}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 font-medium"
                        />
                        <input
                          type="number"
                          placeholder="Nominal (Rp)"
                          value={newChargePrice}
                          onChange={(e) => setNewChargePrice(e.target.value)}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 font-mono"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddAdditionalItem}
                        className="w-full py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" /> Tambah Komponen Biaya
                      </button>

                      {additionalItems.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {additionalItems.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono">
                              <span>{item.name}</span>
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-slate-900">{formatRupiah(item.amount)}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAdditionalItem(idx)}
                                  className="text-rose-600 hover:text-rose-800 font-bold"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Catatan Invoice */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">Catatan Invoice (Opsional)</label>
                      <textarea
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Contoh: Jatuh tempo pembayaran 3 hari kerja..."
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 focus:border-rose-600 focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    {/* Total & Terbitkan */}
                    <div className="rounded-2xl bg-rose-50/70 border border-rose-200 p-4 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-rose-800 tracking-wider">Total Tagihan Pasien</p>
                        <p className="text-lg font-extrabold text-slate-900 font-mono mt-0.5">{formatRupiah(grandTotal)}</p>
                      </div>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-2xl bg-rose-800 hover:bg-rose-900 text-white font-extrabold text-xs px-6 py-3 shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
                      >
                        {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                        Terbitkan Invoice & Selesaikan
                      </button>
                    </div>
                  </form>
                </div>

                {/* Sidebar Kanan: Tagihan Pasien Terbit */}
                <div className="space-y-6">
                  <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-4">
                    <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                      <span>Tagihan Pasien Ini ({invoices.length})</span>
                      <Wallet className="h-4 w-4 text-rose-600" />
                    </h3>

                    {invoices.length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center italic">Belum ada invoice diterbitkan untuk pasien ini.</p>
                    ) : (
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                        {invoices.map((inv) => {
                          const isPaid = inv.status === "paid";
                          return (
                            <div key={inv.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-extrabold text-rose-900">{inv.invoice_number || inv.id}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                  isPaid ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                                }`}>
                                  {isPaid ? "✔ Lunas" : "Belum Lunas"}
                                </span>
                              </div>
                              <p className="font-mono font-bold text-slate-900 text-sm">{formatRupiah(inv.total_amount)}</p>

                              {!isPaid && (
                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60">
                                  <button
                                    type="button"
                                    onClick={() => handlePayManual(inv.id)}
                                    disabled={submitting}
                                    className="rounded-xl bg-slate-900 text-white font-bold text-[10px] py-2 hover:bg-slate-800 transition cursor-pointer"
                                  >
                                    Bayar Kasir
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handlePayMidtrans(inv.id)}
                                    disabled={submitting || !midtransReady}
                                    className={`rounded-xl bg-rose-600 text-white font-bold text-[10px] py-2 hover:bg-rose-500 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed`}
                                  >
                                    Midtrans QRIS
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white/60 p-8 text-center text-slate-400 text-xs">
                <ArrowDown className="h-6 w-6 text-rose-400 mx-auto mb-2 animate-bounce" />
                Silakan klik tombol <strong>"Proses Tagihan"</strong> pada tabel antrean di atas untuk memunculkan form penyusunan invoice pasien.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
