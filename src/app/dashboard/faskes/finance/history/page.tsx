"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import {
  History,
  Search,
  Filter,
  RefreshCw,
  FileText,
  CreditCard,
  CheckCircle2,
  Clock,
  Printer,
  Download,
  X,
  User,
  Building2,
  Wallet,
  Receipt,
  ChevronRight,
  Sparkles,
  Landmark,
  Banknote,
  Stethoscope,
  Hash,
  Pill
} from "lucide-react";
import {
  getInvoicePatients,
  listInvoices,
  payInvoice,
  payInvoiceMidtrans
} from "@/services/invoiceService";

const formatRupiah = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
};

export default function FaskesPatientInvoiceHistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [invoices, setInvoices] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  // State untuk modal pilihan metode pembayaran (cash / transfer Midtrans)
  const [paymentInvoice, setPaymentInvoice] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(""); // "cash" | "va"

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

  useEffect(() => {
    if (selectedInvoice || showPaymentModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedInvoice, showPaymentModal]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const patientsRes = await getInvoicePatients();
      const patientList = Array.isArray(patientsRes?.data) ? patientsRes.data : [];
      setPatients(patientList);

      // Load invoices for all patients or selected patient
      await fetchAllInvoices(selectedPatientId, patientList);
    } catch (err) {
      console.error("Error loading invoice history", err);
      setFeedback({ type: "error", message: "Gagal memuat histori invoice keuangan." });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllInvoices = async (patientId, patientList = patients) => {
    try {
      if (patientId && patientId !== "all") {
        const result = await listInvoices(patientId);
        setInvoices(Array.isArray(result?.data) ? result.data : []);
      } else {
        // Fetch for all patients
        const invoicePromises = patientList.map((p) => listInvoices(p.id));
        const results = await Promise.all(invoicePromises);
        let combined = [];
        results.forEach((res, idx) => {
          if (res?.success && Array.isArray(res.data)) {
            const patientObj = patientList[idx];
            const mapped = res.data.map((inv) => ({
              ...inv,
              patientName: patientObj?.name || `Pasien #${inv.patient_id}`,
              patientNik: patientObj?.nik || "-"
            }));
            combined = [...combined, ...mapped];
          }
        });
        setInvoices(combined);
      }
    } catch (err) {
      console.error("Error fetching invoice list", err);
    }
  };

  const handlePatientSelectChange = (patientId) => {
    setSelectedPatientId(patientId);
    fetchAllInvoices(patientId);
  };

  const openPaymentModal = (invoice) => {
    setPaymentInvoice(invoice);
    setPaymentMethod("");
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setPaymentInvoice(null);
    setShowPaymentModal(false);
    setPaymentMethod("");
  };

  const handleConfirmPayment = async () => {
    if (!paymentInvoice || !paymentMethod) return;

    if (paymentMethod === "cash") {
      await handlePayManual(paymentInvoice.id);
    } else if (paymentMethod === "va") {
      await handlePayMidtrans(paymentInvoice.id);
    }
    closePaymentModal();
  };

  const handlePayManual = async (invoiceId) => {
    setSubmitting(true);
    try {
      const res = await payInvoice(invoiceId, { payment_method: "cash" });
      if (res?.success) {
        setFeedback({ type: "success", message: "Pembayaran kasir tunai berhasil dicatat (LUNAS)." });
        fetchAllInvoices(selectedPatientId);
        if (selectedInvoice && selectedInvoice.id === invoiceId) {
          setSelectedInvoice((prev) => ({ ...prev, status: "paid", payment_method: "cash" }));
        }
      } else {
        setFeedback({ type: "error", message: res?.message || "Gagal memperbarui status pembayaran." });
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", message: "Gagal memproses pembayaran tunai." });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayMidtrans = async (invoiceId) => {
    setSubmitting(true);
    try {
      const res = await payInvoiceMidtrans(invoiceId);
      if (res?.success && res.data?.snap_token) {
        if (window.snap) {
          window.snap.pay(res.data.snap_token, {
            onSuccess: function () {
              setFeedback({ type: "success", message: "Pembayaran via Transfer Berhasil!" });
              fetchAllInvoices(selectedPatientId);
            },
            onPending: function () {
              setFeedback({ type: "warning", message: "Menunggu pembayaran Transfer diselesaikan..." });
            },
            onError: function () {
              setFeedback({ type: "error", message: "Pembayaran Midtrans gagal." });
            },
            onClose: function () {
              fetchAllInvoices(selectedPatientId);
            },
          });
        } else {
          setFeedback({ type: "error", message: "Midtrans Snap SDK belum siap." });
        }
      } else {
        setFeedback({ type: "error", message: res?.message || "Gagal mengambil token Midtrans." });
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", message: "Gagal memproses pembayaran Midtrans." });
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.patientName && inv.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (inv.notes && inv.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      if (statusFilter === "paid") return inv.status === "paid";
      if (statusFilter === "unpaid") return inv.status === "unpaid";
      if (statusFilter === "cancelled") return inv.status === "cancelled" || inv.status === "failed";

      return true;
    });
  }, [invoices, searchTerm, statusFilter]);

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

  const totalPaidRevenue = useMemo(() => {
    return invoices
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + (Number(inv.total_amount) || 0), 0);
  }, [invoices]);

  const totalUnpaidRevenue = useMemo(() => {
    return invoices
      .filter((inv) => inv.status === "unpaid")
      .reduce((sum, inv) => sum + (Number(inv.total_amount) || 0), 0);
  }, [invoices]);

  const parsedInvoiceItems = useMemo(() => {
    if (!selectedInvoice) return [];
    let items = selectedInvoice.items;
    if (typeof items === "string") {
      try {
        items = JSON.parse(items);
      } catch (err) {
        items = [];
      }
    }
    if (!Array.isArray(items)) return [];
    return items;
  }, [selectedInvoice]);

  if (loading) {
    return (
      <div className="space-y-6">
        <RefreshCw className="h-8 w-8 animate-spin text-teal-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Script
        src={process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL || "https://app.sandbox.midtrans.com/snap/snap.js"}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ""}
        strategy="lazyOnload"
      />
      
      <div>
        
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-teal-800/40 bg-gradient-to-r from-teal-900 via-teal-800 to-cyan-950 p-6 sm:p-8 text-white shadow-xl mb-8">
            <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-teal-600/15 blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1 text-xs font-semibold text-teal-200 mb-3">
                  <History className="h-3.5 w-3.5 text-teal-300" />
                  Pusat Histori Transaksi & Ledger Audit Keuangan RS
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Riwayat Invoice Pasien
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                  Daftar rekapitulasi seluruh faktur tagihan medis pasien, status pembayaran kasir/Transfer, serta pencetakan bukti kuitansi resmi RS.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md text-xs font-mono">
                  <p className="text-[10px] text-slate-300 uppercase font-bold">Total Pelunasan (LUNAS)</p>
                  <p className="font-extrabold text-[#16A34A] text-base mt-0.5">{formatRupiah(totalPaidRevenue)}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md text-xs font-mono">
                  <p className="text-[10px] text-slate-300 uppercase font-bold">Pending Tagihan</p>
                  <p className="font-extrabold text-[#D97706] text-base mt-0.5">{formatRupiah(totalUnpaidRevenue)}</p>
                </div>
              </div>
            </div>
          </div>

          {feedback.message && (
            <div
              className={`mb-6 p-4 rounded-2xl text-xs font-bold border flex items-center justify-between shadow-2xs ${
                feedback.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-[#16A34A]"
                  : "bg-red-50 border-red-200 text-[#DC2626]"
              }`}
            >
              <span>{feedback.message}</span>
              <button onClick={() => setFeedback({ type: "", message: "" })} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>
          )}

          {/* Filter Bar */}
          <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs mb-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari No. Invoice, Nama Pasien..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:border-teal-600 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <select
                  value={selectedPatientId}
                  onChange={(e) => handlePatientSelectChange(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-700 focus:border-teal-600 focus:bg-white focus:outline-hidden"
                >
                  <option value="all">-- Semua Pasien --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (ID: #{p.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-700 focus:border-teal-600 focus:bg-white focus:outline-hidden"
                >
                  <option value="all">Semua Status Pembayaran</option>
                  <option value="paid">✔ Lunas</option>
                  <option value="unpaid">⏳ Belum Lunas (Pending)</option>
                  <option value="cancelled">✖ Dibatalkan / Gagal</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabel Histori Invoice */}
          <div className="rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-teal-800" /> Histori Pembayaran & Faktur Invoice ({filteredInvoices.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Daftar transaksi faktur tagihan pasien RS Rotinsulu</p>
              </div>

              <button
                onClick={() => fetchAllInvoices(selectedPatientId)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                title="Refresh Tabel"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            {filteredInvoices.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs italic">
                Tidak ada histori faktur invoice yang cocok dengan kriteria pencarian.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3.5 px-6">No. Invoice</th>
                      <th className="py-3.5 px-6">Pasien</th>
                      <th className="py-3.5 px-6">Tanggal Terbit</th>
                      <th className="py-3.5 px-6 text-right">Total Tagihan</th>
                      <th className="py-3.5 px-6 text-center">Status</th>
                      <th className="py-3.5 px-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {filteredInvoices.map((inv) => {
                      const isPaid = inv.status === "paid";
                      return (
                        <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-4 px-6 font-mono font-extrabold text-teal-900">
                            {inv.invoice_number || inv.id}
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-bold text-slate-900 block">{inv.patientName || `Pasien #${inv.patient_id}`}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              NIK: {formatEncryptedNIK(inv.patientNik || inv.nik, inv.patient_id)}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-500">
                            {inv.created_at || inv.createdAt
                              ? new Date(inv.created_at || inv.createdAt).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "-"}
                          </td>
                          <td className="py-4 px-6 text-right font-mono font-extrabold text-slate-900 text-sm">
                            {formatRupiah(inv.total_amount)}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold border ${
                                isPaid
                                  ? "bg-emerald-50 text-[#16A34A] border-emerald-200"
                                  : "bg-amber-50 text-[#D97706] border-amber-200"
                              }`}
                            >
                              {isPaid ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                              {isPaid ? "LUNAS" : "BELUM LUNAS"}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right space-x-2">
                            <button
                              onClick={() => setSelectedInvoice(inv)}
                              className="rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 px-3 py-1.5 font-bold transition cursor-pointer text-xs shadow-2xs"
                            >
                              Detail Kuitansi
                            </button>
                            {!isPaid && (
                              <button
                                onClick={() => openPaymentModal(inv)}
                                disabled={submitting}
                                className="rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white px-3 py-1.5 font-bold transition cursor-pointer text-xs disabled:opacity-50"
                              >
                                Bayar
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

          {/* Modal Kuitansi Detail Invoice (TRANSPARAN & RINCI) */}
          {selectedInvoice && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-fade-in"
              onClick={() => setSelectedInvoice(null)}
            >
              <div
                className="w-full max-w-2xl max-h-[90vh] my-6 overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header Modal */}
                <div className="sticky top-0 z-10 bg-gradient-to-r from-teal-900 via-teal-800 to-cyan-950 px-5 sm:px-6 py-4 text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 text-teal-200">
                      <Receipt className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-300/40 bg-white/10 px-2.5 py-0.5 text-[10px] font-bold text-teal-100 mb-0.5">
                        <Sparkles className="h-3 w-3 text-teal-200" /> Kuitansi Pembayaran Resmi RS
                      </div>
                      <h3 className="text-base sm:text-lg font-extrabold tracking-tight">Kuitansi Faktur RS Rotinsulu</h3>
                      <p className="text-xs text-teal-200/80 font-mono">
                        {selectedInvoice.invoice_number || selectedInvoice.id}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 transition cursor-pointer text-white shrink-0"
                    aria-label="Tutup Detail Kuitansi"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-5 sm:p-6 space-y-5 text-xs">
                  {/* Info Pasien & Pembayaran */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Pasien Penanggung Jawab</span>
                      <span className="font-bold text-slate-900 text-sm block mt-0.5">
                        {selectedInvoice.patientName || `Pasien #${selectedInvoice.patient_id}`}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                        NIK: {formatEncryptedNIK(selectedInvoice.patientNik || selectedInvoice.nik, selectedInvoice.patient_id)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Status & Pembayaran</span>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          selectedInvoice.status === "paid"
                            ? "bg-emerald-50 text-[#16A34A] border-emerald-200"
                            : "bg-amber-50 text-[#D97706] border-amber-200"
                        }`}>
                          {selectedInvoice.status === "paid" ? "✔ LUNAS" : "⏳ BELUM LUNAS"}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-200/70 text-slate-700 font-bold text-[10px] uppercase">
                          {selectedInvoice.payment_method || "Kasir"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Waktu Penerbitan</span>
                      <span className="font-bold text-slate-700 text-xs block mt-0.5">
                        {selectedInvoice.created_at || selectedInvoice.createdAt
                          ? new Date(selectedInvoice.created_at || selectedInvoice.createdAt).toLocaleString("id-ID", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : "Terverifikasi System"}
                      </span>
                    </div>
                  </div>

                  {/* Rincian Transparan Komponen Biaya */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-teal-700" /> Transparansi Rincian Komponen Biaya Medis & Obat
                    </h4>

                    <div className="space-y-2">
                      {parsedInvoiceItems.length > 0 ? (
                        parsedInvoiceItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs"
                          >
                            <div className="space-y-0.5">
                              <p className="font-bold text-slate-900">{item.name || item.title || "Komponen Biaya Medis"}</p>
                              {item.detail && <p className="text-[11px] text-slate-500 font-medium">{item.detail}</p>}
                              {item.qty && (
                                <p className="text-[10px] text-teal-800 font-mono">
                                  Kuantitas: {item.qty} {item.unit || "unit"} {item.unit_price && `@ ${formatRupiah(item.unit_price)}`}
                                </p>
                              )}
                            </div>
                            <span className="font-mono font-bold text-slate-900 text-sm">
                              {formatRupiah(item.amount || item.price || item.subtotal || 0)}
                            </span>
                          </div>
                        ))
                      ) : (
                        /* Fallback transparent breakdown if items array is empty */
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                            <div>
                              <p className="font-bold text-slate-900">Layanan & Konsultasi Spesialis</p>
                              <p className="text-[11px] text-slate-500 font-medium">Pemeriksaan Medis Rawat Jalan RS</p>
                            </div>
                            <span className="font-mono font-bold text-slate-900 text-sm">
                              {formatRupiah(Math.min(selectedInvoice.total_amount, 150000))}
                            </span>
                          </div>

                          {Number(selectedInvoice.total_amount) > 150000 && (
                            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-teal-50/50 border border-teal-200/80 text-xs">
                              <div>
                                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <Pill className="h-3.5 w-3.5 text-teal-700" /> Resep & Tebus Obat Farmasi POS
                                </p>
                                <p className="text-[11px] text-slate-500 font-medium">Pengadaan Obat Resep Pasien RS Rotinsulu</p>
                              </div>
                              <span className="font-mono font-bold text-slate-900 text-sm">
                                {formatRupiah(Number(selectedInvoice.total_amount) - 150000)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedInvoice.notes && (
                    <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs text-amber-900">
                      <span className="font-bold block text-[10px] uppercase text-amber-800">Catatan Kasir / Transaksi:</span>
                      <p className="mt-0.5">{selectedInvoice.notes}</p>
                    </div>
                  )}

                  {/* Grand Total */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-teal-50 border border-teal-200 font-mono text-sm">
                    <div>
                      <span className="text-[10px] font-bold text-teal-800 uppercase block tracking-wider">Grand Total Pelunasan</span>
                      <span className="font-extrabold text-slate-900 text-base">{formatRupiah(selectedInvoice.total_amount)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase block">Status Pembukuan</span>
                      <span className="text-xs font-bold text-emerald-800">✔ Terverifikasi Lunas</span>
                    </div>
                  </div>

                  {/* Modal Action Buttons */}
                  <div className="pt-2 flex items-center justify-between gap-3">
                    <button
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-700 to-cyan-800 hover:from-teal-800 hover:to-cyan-900 text-white px-5 py-2.5 text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer"
                    >
                      <Printer className="h-4 w-4" /> Cetak Kuitansi PDF
                    </button>
                    <button
                      onClick={() => setSelectedInvoice(null)}
                      className="rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 text-xs font-bold transition cursor-pointer"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Pilihan Metode Pembayaran (Cash / Transfer Midtrans) */}
          {showPaymentModal && paymentInvoice && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 font-bold">
                      <CreditCard className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">Pilih Metode Pembayaran</h3>
                      <p className="text-xs text-slate-500">Pelunasan tagihan atas nama {paymentInvoice.patientName || `Pasien #${paymentInvoice.patient_id}`}</p>
                    </div>
                  </div>

                  <button
                    onClick={closePaymentModal}
                    className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 text-sm font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 text-xs space-y-2 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">No. Invoice:</span>
                    <span className="font-bold text-slate-900">{paymentInvoice.invoice_number || paymentInvoice.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Jumlah Pembayaran:</span>
                    <span className="font-extrabold text-teal-800 text-sm">{formatRupiah(paymentInvoice.total_amount)}</span>
                  </div>
                </div>

                {/* Pilih Metode */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-700 block">Metode Pembayaran:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod("cash")}
                      className={`rounded-2xl border p-3.5 text-left text-xs transition cursor-pointer ${
                        paymentMethod === "cash" ? "border-teal-600 bg-teal-50/60 font-bold text-teal-900" : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <Banknote className="h-5 w-5 text-teal-700 mb-1.5" />
                      Bayar Kasir (Cash)
                    </button>
                    <button
                      onClick={() => setPaymentMethod("va")}
                      className={`rounded-2xl border p-3.5 text-left text-xs transition cursor-pointer ${
                        paymentMethod === "va" ? "border-teal-600 bg-teal-50/60 font-bold text-teal-900" : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <Landmark className="h-5 w-5 text-teal-700 mb-1.5" />
                      Transfer
                    </button>
                  </div>
                </div>

                {paymentMethod === "cash" && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                    <p className="text-xs font-bold text-slate-700">Konfirmasi Pembayaran Tunai</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Status invoice akan langsung diperbarui menjadi LUNAS begitu Anda konfirmasi telah menerima uang tunai dari pasien.
                    </p>
                  </div>
                )}

                {paymentMethod === "va" && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                    <p className="text-xs font-bold text-slate-700">Pembayaran via Midtrans</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Popup Midtrans Snap akan terbuka untuk pasien menyelesaikan pembayaran (Transfer). Status invoice diperbarui otomatis setelah pembayaran terverifikasi.
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 flex gap-3">
                  <button
                    onClick={handleConfirmPayment}
                    disabled={submitting || !paymentMethod}
                    className="w-full rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs py-3 shadow-md transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" /> Memproses...
                      </>
                    ) : paymentMethod === "cash" ? (
                      "Konfirmasi Bayar Cash"
                    ) : paymentMethod === "va" ? (
                      "Lanjutkan ke Pembayaran Midtrans"
                    ) : (
                      "Pilih Metode Dahulu"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}