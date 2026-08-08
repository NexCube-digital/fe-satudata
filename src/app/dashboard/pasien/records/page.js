"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import TxHashLink from "@/components/ui/TxHashLink";
import {
  getMyInvoiceDetail,
  listMyInvoices,
  payMyInvoiceCash,
  payMyInvoiceMidtrans,
} from "@/services/invoiceService";
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
  Clock,
  CreditCard,
  QrCode,
  MapPin,
  Pill,
  Receipt,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Info
} from "lucide-react";


export default function PatientNewRecordsPage() {
  const router = useRouter();
  const stepperContainerRef = useRef(null);
  const [user] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch (err) {
      console.error(err);
      return null;
    }
  });

  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceError, setInvoiceError] = useState("");

  // Active Flow State (Stage: 1: Registrasi, 2: Rekam Medis, 3: Farmasi, 4: Pelunasan)
  const [activeStage, setActiveStage] = useState(3); // Default to Farmasi -> Ready for Billing
  const [paymentMethod, setPaymentMethod] = useState(null); // "qris" | "va" | "cash"
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [midtransReady, setMidtransReady] = useState(false);

  // Modal Proses & Sukses Pembayaran (blocking full-screen)
  // stage: null (tidak tampil) | "processing" (menunggu konfirmasi) | "success" (lunas)
  const [paymentFlowStage, setPaymentFlowStage] = useState(null);
  const [paymentFlowInvoiceId, setPaymentFlowInvoiceId] = useState(null);
  const [pollAttemptsExceeded, setPollAttemptsExceeded] = useState(false);
  const pollingActiveRef = useRef(false);

  // Decryption State (Map of record ID -> boolean)
  const [decryptedState, setDecryptedState] = useState({});
  const [decryptedDetails, setDecryptedDetails] = useState({});
  const [decryptingIds, setDecryptingIds] = useState({});
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");

  async function fetchInvoicesFromBE() {
    setInvoiceLoading(true);
    setInvoiceError("");
    try {
      const result = await listMyInvoices();
      const invoiceList = Array.isArray(result?.data) ? result.data : [];
      setInvoices(invoiceList);
      setSelectedInvoiceId((currentId) => {
        if (currentId && invoiceList.some((invoice) => invoice.id === currentId)) return currentId;
        return invoiceList.find((invoice) => ["unpaid", "pending_cash"].includes(invoice.status))?.id || invoiceList[0]?.id || null;
      });
      if (invoiceList.length > 0) setActiveStage(4);
    } catch (err) {
      console.error("Error fetching patient invoices", err);
      setInvoiceError(err.message || "Gagal memuat daftar invoice pasien.");
    } finally {
      setInvoiceLoading(false);
      setLoading(false);
    }
  }

  const selectedInvoice = invoices.find((invoice) => invoice.id === selectedInvoiceId) || null;
  const paymentStatus = selectedInvoice?.status || "pending";

  // Auto-center active stage node in horizontal stepper scroll container
  useEffect(() => {
    if (!loading && stepperContainerRef.current) {
      const activeEl = stepperContainerRef.current.querySelector(`[data-stage="${activeStage}"]`);
      if (activeEl) {
        const container = stepperContainerRef.current;
        const nodeCenter = activeEl.offsetLeft + activeEl.offsetWidth / 2;
        const containerCenter = container.offsetWidth / 2;
        container.scrollTo({
          left: Math.max(0, nodeCenter - containerCenter),
          behavior: "smooth"
        });
      }
    }
  }, [activeStage, loading]);

  async function fetchHistoryFromBE() {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/patient/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.data) {
        const beRecords = result.data.map((item) => ({
          id: item.id,
          hospitalName: item.hospital?.user?.name || item.hospital_name || item.hospital?.name || "Faskes tidak tersedia",
          hospitalCode: item.hospital?.medical_license || "-",
          doctorName: item.doctor?.name || "Dokter tidak tersedia",
          specialty: item.doctor?.specialist || "-",
          category: item.record_type || "resep",
          status: item.status || "final",
          date: new Date(item.visit_date || item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
          time: new Date(item.visit_date || item.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
          txHash: item.tx_hash || null,
          encryptedData: item.encrypted_data || null,
          diagnosis: item.title || "Rekam medis",
          prescriptions: Array.isArray(item.prescriptions) ? item.prescriptions : [],
          vitals: item.vitals || {},
          notes: item.notes || ""
        }));
        setRecords(beRecords);
      }
    } catch (err) {
      console.log("Error fetching history", err);
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      fetchHistoryFromBE();
      fetchInvoicesFromBE();
    });

    const syncStage = () => {
      const saved = localStorage.getItem("activePatientStage");
      if (saved) setActiveStage(parseInt(saved, 10));
    };
    syncStage();
    window.addEventListener("storage", syncStage);
    const interval = setInterval(syncStage, 800);
    return () => {
      window.removeEventListener("storage", syncStage);
      clearInterval(interval);
      pollingActiveRef.current = false; // hentikan polling saat komponen unmount
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  const mapBackendDetailToFrontend = (rec, backendData) => {
    const detail = backendData.detail || {};
    const summary = backendData.summary || backendData.title || rec.diagnosis;

    let diagnosis = summary;
    let prescriptions = rec.prescriptions;
    let vitals = rec.vitals;
    let notes = "Telah didekripsi secara aman dari backend.";

    if (rec.category === "umum") {
      diagnosis = detail.diagnosis || summary;
      notes = detail.note_doctor || "Tidak ada catatan tambahan.";
    } else if (rec.category === "resep") {
      diagnosis = "Resep Obat Rawat Jalan";
      notes = detail.note || "Aturan pakai terlampir.";
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
          setDecryptedState((prev) => ({ ...prev, [id]: true }));
        }
      } catch (err) {
        console.error("Error decrypting modal detail:", err);
      } finally {
        setDecryptingIds((prev) => ({ ...prev, [id]: false }));
      }
    }
  };

  const updateInvoiceFromServer = async (invoiceId) => {
    const result = await getMyInvoiceDetail(invoiceId);
    if (!result?.data) return null;

    setInvoices((current) => current.map((invoice) => invoice.id === invoiceId ? result.data : invoice));
    return result.data;
  };

  // Polling status invoice sampai berstatus "paid", dipakai untuk flow Midtrans
  // maupun cash. maxAttempts * 3 detik = total durasi tunggu sebelum kita bilang
  // "masih diproses" ke pasien (tidak dianggap gagal, cuma butuh waktu lebih lama
  // karena kasir RS yang harus konfirmasi manual untuk pembayaran cash).
  const pollInvoiceStatus = async (invoiceId, attempt = 0, maxAttempts = 40) => {
    if (!invoiceId || !pollingActiveRef.current) return;
    try {
      const invoice = await updateInvoiceFromServer(invoiceId);
      if (invoice?.status === "paid") {
        setPaymentFlowStage("success");
        pollingActiveRef.current = false;
        return;
      }
    } catch (err) {
      console.error("Error polling invoice status", err);
    }
    if (!pollingActiveRef.current) return;
    if (attempt + 1 >= maxAttempts) {
      setPollAttemptsExceeded(true);
    }
    window.setTimeout(() => pollInvoiceStatus(invoiceId, attempt + 1, maxAttempts), 3000);
  };

  const startPaymentFlow = (invoiceId) => {
    setPaymentFlowInvoiceId(invoiceId);
    setPollAttemptsExceeded(false);
    setPaymentFlowStage("processing");
    pollingActiveRef.current = true;
    pollInvoiceStatus(invoiceId, 0);
  };

  const handleClosePaymentFlow = () => {
    pollingActiveRef.current = false;
    setPaymentFlowStage(null);
    setPaymentFlowInvoiceId(null);
    setPollAttemptsExceeded(false);
    // Refresh daftar invoice biar status terbaru langsung kelihatan di list
    fetchInvoicesFromBE();
  };

  const handleProcessOnlinePayment = async () => {
    if (!selectedInvoice || isProcessingPayment) return;
    setIsProcessingPayment(true);

    try {
      if (paymentMethod === "cash") {
        const result = await payMyInvoiceCash(selectedInvoice.id);
        if (result?.data) {
          setInvoices((current) => current.map((invoice) => invoice.id === selectedInvoice.id ? result.data : invoice));
          setShowPaymentModal(false);
          // Belum otomatis lunas (masih pending_cash) -> tampilkan modal proses,
          // lalu polling sampai staf RS konfirmasi uang cash sudah diterima.
          startPaymentFlow(selectedInvoice.id);
        }
        return;
      }

      if (!midtransReady || typeof window === "undefined" || !window.snap) {
        throw new Error("Payment Gateway belum siap. Coba refresh halaman.");
      }

      const result = await payMyInvoiceMidtrans(selectedInvoice.id);
      const snapToken = result?.data?.snap_token || result?.data?.snapToken || result?.snap_token || result?.snapToken;
      if (!snapToken) throw new Error("Token pembayaran tidak tersedia dari backend.");

      setShowPaymentModal(false);
      window.snap.pay(snapToken, {
        onSuccess: () => startPaymentFlow(selectedInvoice.id),
        onPending: () => startPaymentFlow(selectedInvoice.id),
        onError: () => setInvoiceError("Pembayaran Midtrans gagal diproses."),
        onClose: () => {}, // pasien menutup popup Snap tanpa menyelesaikan pembayaran
      });
    } catch (err) {
      console.error("Error processing patient payment", err);
      setInvoiceError(err.message || "Gagal memproses pembayaran invoice.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Document Indicator Flow Configuration
  const flowSteps = [
    {
      id: 1,
      title: "Dokumen Registrasi",
      statusName: "Pendaftaran Faskes",
      docTag: "BERKAS DIAJUKAN",
      time: "Hari Ini, 07.30 WIB",
      desc: "Status antrean & identitas terverifikasi di Loket Pendaftaran RS.",
      icon: Building2,
      isCompleted: true
    },
    {
      id: 2,
      title: "Dokumen Rekam Medis",
      statusName: "Upload Rekam Medis (Dokter)",
      docTag: "EHR TERBIT",
      time: "Hari Ini, 08.15 WIB",
      desc: "Dokter mengunggah diagnosa & rekam medis terenkripsi AES-256.",
      icon: Stethoscope,
      isCompleted: activeStage >= 2
    },
    {
      id: 3,
      title: "Dokumen Resep Farmasi",
      statusName: "Layanan Farmasi & Apotek",
      docTag: "RESEP DITERBITKAN",
      time: "Hari Ini, 08.45 WIB",
      desc: "Staf Apotek merilis lembar resep & racikan obat terkonfirmasi.",
      icon: Pill,
      isCompleted: activeStage >= 3
    },
    {
      id: 4,
      title: "Dokumen Faktur & Pelunasan",
      statusName: paymentStatus === "paid" ? "Selesai & Lunas" : "Menunggu Pelunasan",
      docTag: paymentStatus === "paid" ? "FAKTUR LUNAS" : "TAGIHAN TERBIT",
      time: paymentStatus === "paid" ? "Hari Ini, 09.00 WIB" : "Memerlukan Pembayaran",
      desc: paymentStatus === "paid" ? "Kwitansi & faktur pembayaran sah diterbitkan." : "Rincian biaya siap dilunasi via Gateway / Loket Pendaftaran.",
      icon: Receipt,
      isCompleted: paymentStatus === "paid"
    }
  ];

  // items dari backend KADANG bisa berupa JSON string mentah, bukan array —
  // ini bisa terjadi kalau di suatu titik (mis. proxy, middleware, atau versi
  // model lama) nilainya sempat di-stringify dua kali. Helper ini menjaga FE
  // tetap tampil benar apapun bentuk datanya, tanpa perlu ubah backend.
  function parseInvoiceItems(rawItems) {
    if (Array.isArray(rawItems)) return rawItems;
    if (typeof rawItems === "string") {
      try {
        const parsed = JSON.parse(rawItems);
        return Array.isArray(parsed) ? parsed : [];
      } catch (err) {
        console.error("Gagal parse invoice.items:", err, rawItems);
        return [];
      }
    }
    return [];
  }

  // Map kode item invoice -> label kategori yang ramah dibaca pasien.
  // Kode "resep" datang dari medicalrecordService (biaya.total_resep), kode
  // lain (umum/lab/radiologi) dari MEDICAL_TYPE_CODES di BE, sisanya dianggap
  // biaya tambahan/administrasi (dari service_prices non-medis).
  function getItemCategoryLabel(item) {
    const code = (item.code || "").toLowerCase();
    if (code === "resep") return "Farmasi";
    if (["umum", "lab", "radiologi"].includes(code)) return "Layanan Medis";
    if (item.medical_record_id) return "Layanan Medis";
    return "Administrasi / Biaya Tambahan";
  }

  // Ambil semua item invoice sebagai list flat, dilengkapi kategori & subtotal.
  // Dipakai untuk tabel rincian di bawah — tidak bergantung pada matching ke
  // `records`, jadi tetap tampil walau data rekam medis tidak sinkron.
  function getFlatInvoiceItems(invoice) {
    const items = parseInvoiceItems(invoice?.items);
    return items.map((item) => ({
      ...item,
      category: getItemCategoryLabel(item),
      subtotal: item.subtotal ?? Number(item.price || 0) * Number(item.qty || 1),
    }));
  }

  const flatInvoiceItems = getFlatInvoiceItems(selectedInvoice);
  const totalAmount = Number(selectedInvoice?.total_amount || 0);

  const filteredRecords = records.filter((rec) => {
    return (
      rec.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const isCompletedVisit = invoices.length === 0 && activeStage >= 5;
  const progressWidthPercent = Math.max(0, Math.min(100, ((activeStage - 1) / Math.max(1, flowSteps.length - 1)) * 100));

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
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
        onLoad={() => setMidtransReady(true)}
      />
      <Navbar user={user} roleLabel="Pasien Terdaftar" onLogout={handleLogout} />

      <div className="flex flex-1">
        <Sidebar role="pasien" />

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

          {/* Check if all active visits & billing are finished & paid */}
          {isCompletedVisit ? (
            <div className="rounded-3xl bg-white border border-slate-200/80 p-8 sm:p-12 text-center space-y-5 shadow-xs my-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 shadow-2xs">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">Tidak Ada Kunjungan & Tagihan Aktif</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Seluruh alur pemeriksaan rekam medis dan pelunasan tagihan Anda telah <span className="font-bold text-emerald-700">SELESAI & LUNAS</span>. Seluruh berkas rekam medis dan kuitansi pembayaran tersimpan aman di menu Riwayat.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/dashboard/pasien/history"
                  className="inline-flex items-center gap-2 rounded-2xl bg-rose-800 hover:bg-rose-900 text-white px-6 py-3 text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <FileText className="h-4 w-4" /> Lihat Riwayat Medis & Invoice <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* SECTION 1: INDIKATOR ALUR DOKUMEN REKAM MEDIS */}
              <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-6 gap-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-rose-600 shrink-0" />
                  Indikator Alur Dokumen Rekam Medis & Layanan
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Indikator progres dokumen medis, status pengunggahan oleh dokter, resep farmasi, dan faktur pelunasan faskes secara real-time.
                </p>
              </div>
              <span className="rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-[11px] font-bold text-rose-700 flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                Indikator Dokumen Active
              </span>
            </div>

            {/* Read-Only Automatic Flow Stepper Bar (Horizontal Line) */}
            <div ref={stepperContainerRef} className="py-3 overflow-x-auto pb-4">
              <div className="relative px-2 sm:px-8 min-w-[540px] sm:min-w-0">
                {/* Connecting Line Background */}
                <div className="absolute top-[22px] left-10 right-10 h-1 -translate-y-1/2 bg-slate-100 rounded-full z-0" />

                {/* Active Connecting Progress Fill Line */}
                <div
                  className="absolute top-[22px] left-10 h-1 -translate-y-1/2 bg-gradient-to-r from-emerald-400 via-rose-700 to-rose-900 rounded-full transition-all duration-500 z-0"
                  style={{ width: `${progressWidthPercent}%` }}
                />

                {/* 4 Step Nodes Grid */}
                <div className="relative z-10 grid grid-cols-4 text-center">
                  {flowSteps.map((step) => {
                    const IconComponent = step.icon;
                    const isActive = activeStage === step.id;
                    const isDone = step.isCompleted && !isActive;

                    return (
                      <div
                        key={step.id}
                        data-stage={step.id}
                        onClick={() => setActiveStage(step.id)}
                        className="flex flex-col items-center group cursor-pointer"
                      >
                        {/* Circle Node Icon */}
                        <div
                          className={`flex items-center justify-center transition-all duration-300 rounded-full select-none ${
                            isActive
                              ? "h-11 w-11 bg-rose-900 text-white ring-4 ring-rose-900/20 shadow-md scale-110 -mt-1"
                              : isDone
                              ? "h-7 w-7 bg-emerald-500 text-white border-2 border-white shadow-2xs mt-1"
                              : "h-6 w-6 bg-slate-100 text-slate-400 border border-slate-200 mt-1.5"
                          }`}
                        >
                          {isActive ? (
                            <IconComponent className="h-5 w-5 text-white animate-pulse" />
                          ) : isDone ? (
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          ) : (
                            <span className="text-[9px] font-bold font-mono">{step.id}</span>
                          )}
                        </div>

                        {/* Text Labels */}
                        <div className="mt-2 space-y-0.5 max-w-[140px] text-center">
                          <p
                            className={`transition-all duration-200 ${
                              isActive
                                ? "text-xs font-black text-rose-950 uppercase tracking-tight scale-105"
                                : isDone
                                ? "text-[10px] font-semibold text-slate-500"
                                : "text-[9px] font-normal text-slate-400"
                            }`}
                          >
                            {step.title}
                          </p>
                          <p
                            className={`${
                              isActive
                                ? "text-[10px] font-extrabold text-rose-800"
                                : "text-[8px] text-slate-400"
                            }`}
                          >
                            {step.statusName}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: NOTIFIKASI RINCIAN JASA & PELUNASAN (BILLING DETAILS) */}
          {activeStage === 4 || invoices.length > 0 ? (
            <div className="rounded-3xl bg-white border border-slate-200/80 p-4 sm:p-8 shadow-xs mb-8 animate-fade-in">
              <div className="flex items-start gap-3 border-b border-slate-100 pb-4 mb-5">
                <span className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 shadow-2xs font-bold">
                  <Receipt className="h-5 w-5 sm:h-6 sm:w-6" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900">Rincian Tagihan & Pelunasan Jasa Medis</h3>
                    {paymentStatus === "paid" ? (
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-0.5 text-[11px] font-bold text-emerald-700">
                        ✔ LUNAS
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-0.5 text-[11px] font-bold text-amber-700 animate-pulse">
                        Menunggu Pelunasan
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Rincian jasa dan status pembayaran dari invoice yang diterbitkan faskes.
                  </p>
                </div>
              </div>

              {invoiceError && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
                  {invoiceError}
                </div>
              )}

              <div className="mb-6 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wide text-slate-700">Daftar Invoice Pasien</h4>
                  {invoiceLoading && <RefreshCw className="h-4 w-4 animate-spin text-rose-600" />}
                </div>
                {invoices.length > 0 ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {invoices.map((invoice) => (
                      <button
                        key={invoice.id}
                        type="button"
                        onClick={() => setSelectedInvoiceId(invoice.id)}
                        className={`rounded-xl border p-3 text-left transition ${selectedInvoiceId === invoice.id ? "border-rose-500 bg-rose-50" : "border-slate-200 bg-slate-50 hover:border-rose-300"}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[11px] font-extrabold text-slate-800">{invoice.id}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${invoice.status === "paid" ? "bg-emerald-100 text-emerald-700" : invoice.status === "pending_cash" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
                            {invoice.status === "paid" ? "LUNAS" : invoice.status === "pending_cash" ? "MENUNGGU KONFIRMASI" : invoice.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="mt-1 text-xs font-bold text-rose-700">Rp {Number(invoice.total_amount || 0).toLocaleString("id-ID")}</p>
                        <p className="mt-1 text-[10px] text-slate-500">{new Date(invoice.created_at).toLocaleDateString("id-ID")}</p>
                      </button>
                    ))}
                  </div>
                ) : !invoiceLoading ? (
                  <p className="rounded-xl border border-dashed border-slate-300 px-4 py-4 text-xs text-slate-500">Belum ada invoice yang diterbitkan oleh faskes.</p>
                ) : null}
              </div>

              {/* RINCIAN LAYANAN — tabel flat langsung dari item invoice (BE), supaya */}
              {/* selalu tampil apa adanya walau data record tidak sinkron dengan invoice. */}

              {/* Mobile List Card View (< sm) */}
              <div className="block sm:hidden space-y-2.5 mb-6">
                {flatInvoiceItems.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1.5">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-bold text-slate-800 text-xs leading-snug">{item.name}</p>
                      <span className="font-mono font-extrabold text-slate-900 text-xs shrink-0">
                        {item.subtotal === 0 ? "GRATIS" : `Rp ${Number(item.subtotal).toLocaleString("id-ID")}`}
                      </span>
                    </div>
                    <div>
                      <span className="inline-block rounded-md bg-white px-2 py-0.5 font-mono text-[10px] text-slate-600 border border-slate-200/80">
                        {item.category}
                      </span>
                    </div>
                  </div>
                ))}

                {flatInvoiceItems.length === 0 && (
                  <p className="rounded-xl border border-dashed border-slate-300 px-4 py-4 text-xs text-slate-500 text-center">
                    Tidak ada rincian layanan pada invoice ini.
                  </p>
                )}

                {flatInvoiceItems.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200 flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-900 text-xs">TOTAL PELUNASAN</span>
                    <span className="font-mono font-extrabold text-rose-700 text-base">
                      Rp {totalAmount.toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
              </div>

              {/* Desktop Table View (>= sm) */}
              {flatInvoiceItems.length > 0 ? (
                <div className="hidden sm:block overflow-x-auto rounded-2xl border border-slate-200 mb-6">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 tracking-wider bg-slate-50/50">
                        <th className="py-3 px-4">Deskripsi Layanan / Obat</th>
                        <th className="py-3 px-4">Kategori</th>
                        <th className="py-3 px-4 text-right">Biaya (Rp)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {flatInvoiceItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60 transition">
                          <td className="py-3.5 px-4 font-bold text-slate-800">{item.name}</td>
                          <td className="py-3.5 px-4 font-mono text-[11px]">
                            <span className="rounded-lg bg-slate-100 px-2 py-1 text-slate-600 border border-slate-200">
                              {item.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                            {item.subtotal === 0 ? "GRATIS" : `Rp ${Number(item.subtotal).toLocaleString("id-ID")}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-200 bg-rose-50/50">
                        <td colSpan={2} className="py-4 px-4 font-extrabold text-slate-900 text-sm">
                          TOTAL PELUNASAN TAGIHAN
                        </td>
                        <td className="py-4 px-4 text-right font-mono font-extrabold text-rose-700 text-base">
                          Rp {totalAmount.toLocaleString("id-ID")}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <p className="hidden sm:block rounded-xl border border-dashed border-slate-300 px-4 py-4 text-xs text-slate-500 text-center mb-6">
                  Tidak ada rincian layanan pada invoice ini
                  {selectedInvoice?.id ? <> (Invoice <span className="font-mono font-bold">{selectedInvoice.id}</span>).</> : "."}
                </p>
              )}

              {/* Action Button: Bayar Tagihan Sekarang (Hijau, Pindah ke Bawah Tabel) */}
              {paymentStatus === "unpaid" && selectedInvoice && (
                <div className="flex justify-end mb-6">
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full sm:w-auto rounded-xl sm:rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-6 py-3.5 shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CreditCard className="h-4 w-4" />
                    Bayar Tagihan Sekarang
                  </button>
                </div>
              )}

              {/* Opsi Pelunasan Section (Online & Pendaftaran/Informasi) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Opsi 1: Payment Gateway */}
                <div className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50/60 via-pink-50/30 to-slate-50 p-5 space-y-3">
                  <div className="flex items-center gap-2 text-rose-800 font-extrabold text-xs">
                    <CreditCard className="h-4 w-4 text-rose-600" />
                    OPSI A: Pelunasan Online via Payment Gateway
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Bayar langsung secara instan melalui QRIS, Transfer Virtual Account, atau E-Wallet. Konfirmasi pembayaran otomatis seketika.
                  </p>
                  {paymentStatus === "paid" ? (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 font-bold flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      Pembayaran invoice telah dikonfirmasi lunas oleh backend.
                    </div>
                  ) : paymentStatus === "pending_cash" ? (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 font-bold flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                      Menunggu konfirmasi kasir setelah pembayaran cash di loket.
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setPaymentMethod("qris");
                        setShowPaymentModal(true);
                      }}
                      className="w-full rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-2.5 shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <QrCode className="h-4 w-4" />
                      Buka QRIS & Virtual Account
                    </button>
                  )}
                </div>

                {/* Opsi 2: Pendaftaran / Informasi / Kasir Faskes */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xs">
                    <MapPin className="h-4 w-4 text-rose-600" />
                    OPSI B: Pelunasan di Loket Informasi / Pendaftaran Faskes
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Tunjukkan kode invoice kepada petugas kasir atau loket informasi faskes untuk pelunasan tunai.
                  </p>
                  <div className="rounded-xl bg-white border border-slate-200 p-2.5 text-xs font-mono flex items-center justify-between text-slate-700">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Kode Billing RS:</span>
                    <span className="font-extrabold text-rose-700">{selectedInvoice?.id || "-"}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-slate-50/80 border border-slate-200/80 p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-200/60 text-slate-500 font-bold">
                  <Receipt className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800">Tahap Pelunasan Tagihan Belum Aktif</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Rincian tagihan & bukti pelunasan jasa medis akan otomatis muncul ketika dokumen berada di <span className="font-bold text-rose-700">Step 04: Dokumen Faktur & Pelunasan</span> (Status: Menunggu Pelunasan).
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveStage(4)}
                className="rounded-xl border border-slate-300 bg-white hover:bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 transition shrink-0 cursor-pointer"
              >
                Lihat Fase Pelunasan (Step 04) →
              </button>
            </div>
          )}
        </div>
      )}



          {/* PAYMENT GATEWAY MODAL */}
          {showPaymentModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 font-bold">
                      <CreditCard className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">Payment Gateway SatuData</h3>
                      <p className="text-xs text-slate-500">Pelunasan tagihan layanan faskes</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 text-sm font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 text-xs space-y-2 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kode Invoice:</span>
                    <span className="font-bold text-slate-900">{selectedInvoice?.id || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Jumlah Pembayaran:</span>
                    <span className="font-extrabold text-rose-700 text-sm">Rp {totalAmount.toLocaleString("id-ID")}</span>
                  </div>
                </div>

                {/* Select Method */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-700 block">Pilih Metode Pembayaran:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => setPaymentMethod("qris")}
                      className={`rounded-2xl border p-3.5 text-left text-xs transition ${
                        paymentMethod === "qris" ? "border-rose-600 bg-rose-50/50 font-bold text-rose-900" : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <QrCode className="h-5 w-5 text-rose-600 mb-1.5" />
                      QRIS / E-Wallet Instan
                    </button>
                    <button
                      onClick={() => setPaymentMethod("va")}
                      className={`rounded-2xl border p-3.5 text-left text-xs transition ${
                        paymentMethod === "va" ? "border-rose-600 bg-rose-50/50 font-bold text-rose-900" : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <Building2 className="h-5 w-5 text-rose-600 mb-1.5" />
                      Virtual Account Bank
                    </button>
                    <button
                      onClick={() => setPaymentMethod("cash")}
                      className={`rounded-2xl border p-3.5 text-left text-xs transition ${
                        paymentMethod === "cash" ? "border-rose-600 bg-rose-50/50 font-bold text-rose-900" : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <MapPin className="h-5 w-5 text-rose-600 mb-1.5" />
                      Bayar Cash di Loket
                    </button>
                  </div>
                </div>

                {(paymentMethod === "qris" || paymentMethod === "va") && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center space-y-2">
                    <p className="text-xs font-bold text-slate-700">Pembayaran {paymentMethod === "qris" ? "QRIS / E-Wallet" : "Virtual Account"} akan dibuka melalui Midtrans.</p>
                    <p className="text-[10px] text-slate-400">Klik konfirmasi untuk memperoleh sesi pembayaran resmi dari backend.</p>
                  </div>
                )}

                {paymentMethod === "cash" && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs font-mono">
                    <p className="font-bold text-slate-700">Pembayaran cash di loket</p>
                    <p className="text-slate-600 font-sans">Setelah Anda mengonfirmasi, status invoice menjadi menunggu konfirmasi kasir RS.</p>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 flex gap-3">
                  <button
                    onClick={handleProcessOnlinePayment}
                    disabled={isProcessingPayment || !paymentMethod}
                    className="w-full rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-3 shadow-md transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isProcessingPayment ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" /> Memproses Pelunasan...
                      </>
                    ) : (
                      paymentMethod === "cash" ? "Konfirmasi Bayar Cash" : "Lanjutkan ke Payment Gateway"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODAL PROSES & SUKSES PEMBAYARAN — full-screen, blocking */}
          {paymentFlowStage && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
              <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-5 shadow-2xl">
                {paymentFlowStage === "processing" ? (
                  <>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 border border-rose-100">
                      <RefreshCw className="h-8 w-8 text-rose-600 animate-spin" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-extrabold text-slate-900">Memproses Pembayaran...</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {pollAttemptsExceeded
                          ? "Masih menunggu konfirmasi dari petugas kasir faskes. Anda bisa menutup jendela ini — status akan otomatis diperbarui setelah dikonfirmasi."
                          : "Mohon tunggu sebentar, sistem sedang memverifikasi status pembayaran Anda. Jangan tutup halaman ini."}
                      </p>
                    </div>
                    {pollAttemptsExceeded && (
                      <button
                        onClick={handleClosePaymentFlow}
                        className="text-xs font-bold text-rose-700 underline underline-offset-2 cursor-pointer"
                      >
                        Tutup, saya cek nanti
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200">
                      <CheckCircle2 className="h-9 w-9 text-emerald-600" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-extrabold text-slate-900">Pembayaran Berhasil!</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Invoice <span className="font-mono font-bold text-slate-700">{paymentFlowInvoiceId}</span> telah lunas. Terima kasih.
                      </p>
                    </div>
                    <button
                      onClick={handleClosePaymentFlow}
                      className="w-full rounded-2xl bg-rose-800 hover:bg-rose-900 text-white font-bold text-xs py-3 transition cursor-pointer"
                    >
                      Selesai
                    </button>
                  </>
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
                      className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 font-bold"
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
                        <p className="text-slate-700">Tx Hash: <TxHashLink txHash={displaySelected.txHash} className="inline-flex items-center gap-1" title={displaySelected.txHash}><span>{displaySelected.txHash}</span></TxHashLink></p>
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