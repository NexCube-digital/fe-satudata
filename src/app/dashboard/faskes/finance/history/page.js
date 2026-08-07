"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
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
  Sparkles
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
              setFeedback({ type: "success", message: "Pembayaran via Midtrans QRIS Berhasil!" });
              fetchAllInvoices(selectedPatientId);
            },
            onPending: function () {
              setFeedback({ type: "warning", message: "Menunggu pembayaran QRIS diselesaikan..." });
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
      />
      <Navbar user={user} roleLabel="Staf Keuangan Faskes" onLogout={() => router.push("/auth/login")} />
      <div className="flex flex-1">
        <Sidebar role="faskes" />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-rose-800/40 bg-gradient-to-r from-rose-900 via-rose-800 to-red-900 p-6 sm:p-8 text-white shadow-xl mb-8">
            <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-rose-600/15 blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1 text-xs font-semibold text-rose-300 mb-3">
                  <History className="h-3.5 w-3.5 text-rose-400" />
                  Pusat Histori Transaksi & Ledger Audit Keuangan RS
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Riwayat Invoice Pasien
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                  Daftar rekapitulasi seluruh faktur tagihan medis pasien, status pembayaran kasir/QRIS, serta pencetakan bukti kuitansi resmi RS.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md text-xs font-mono">
                  <p className="text-[10px] text-slate-300 uppercase font-bold">Total Pelunasan (LUNAS)</p>
                  <p className="font-extrabold text-emerald-400 text-base mt-0.5">{formatRupiah(totalPaidRevenue)}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md text-xs font-mono">
                  <p className="text-[10px] text-slate-300 uppercase font-bold">Pending Tagihan</p>
                  <p className="font-extrabold text-amber-300 text-base mt-0.5">{formatRupiah(totalUnpaidRevenue)}</p>
                </div>
              </div>
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
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:border-rose-600 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <select
                  value={selectedPatientId}
                  onChange={(e) => handlePatientSelectChange(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-700 focus:border-rose-600 focus:bg-white focus:outline-hidden"
                >
                  <option value="all">Semua Pasien ({patients.length})</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-700 focus:border-rose-600 focus:bg-white focus:outline-hidden"
                >
                  <option value="all">Semua Status Pembayaran</option>
                  <option value="paid">✔ LUNAS (Paid)</option>
                  <option value="unpaid">⏳ Belum Lunas (Unpaid)</option>
                  <option value="cancelled">✖ Dibatalkan / Gagal</option>
                </select>
              </div>
            </div>
          </div>

          {/* Invoice Records List */}
          <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Receipt className="h-5 w-5 text-rose-600" />
                Riwayat Invoice Pasien ({filteredInvoices.length})
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                Total {invoices.length} faktur diterbitkan
              </span>
            </div>

            {filteredInvoices.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-12 text-center space-y-2">
                <Receipt className="h-10 w-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">
                  Riwayat Invoice Pasien ({filteredInvoices.length})
                </h4>
                <p className="text-xs text-slate-500">
                  Belum ada riwayat invoice untuk pasien ini.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 tracking-wider bg-slate-50/50">
                      <th className="py-3 px-4">No. Invoice & Tanggal</th>
                      <th className="py-3 px-4">Pasien</th>
                      <th className="py-3 px-4">Rincian Layanan / Komponen</th>
                      <th className="py-3 px-4">Status & Metode</th>
                      <th className="py-3 px-4 text-right">Total Nominal</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredInvoices.map((inv) => {
                      const isPaid = inv.status === "paid";
                      const itemCount = Array.isArray(inv.items) ? inv.items.length : 0;

                      return (
                        <tr key={inv.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-4 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                            <span className="block text-rose-900 font-extrabold text-sm">{inv.invoice_number || inv.id}</span>
                            <span className="text-[10px] text-slate-400 font-sans font-normal">
                              {new Date(inv.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-bold text-slate-900 block">{inv.patientName || `Pasien #${inv.patient_id}`}</span>
                            <span className="text-[10px] text-slate-400 font-mono">NIK: {formatEncryptedNIK(inv.patientNik || inv.nik, inv.patient_id)}</span>
                          </td>
                          <td className="py-4 px-4 max-w-xs">
                            <span className="font-bold text-slate-800 block text-xs truncate">
                              {Array.isArray(inv.items) && inv.items.length > 0 ? inv.items[0].name : "Layanan Medis"}
                            </span>
                            {itemCount > 1 && (
                              <span className="text-[10px] text-slate-500 font-medium">
                                + {itemCount - 1} komponen biaya lainnya
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex flex-col items-start gap-1">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                isPaid
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                              }`}>
                                {isPaid ? "✔ LUNAS" : "⏳ BELUM LUNAS"}
                              </span>
                              <span className="text-[10px] text-slate-400 uppercase font-mono">
                                {inv.payment_method === "cash" ? "Kasir Tunai" : inv.payment_method === "midtrans_qris" ? "QRIS Payment" : "Pend. Billing"}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right font-mono font-extrabold text-slate-900 text-sm whitespace-nowrap">
                            {formatRupiah(inv.total_amount)}
                          </td>
                          <td className="py-4 px-4 text-right whitespace-nowrap space-x-2">
                            <button
                              onClick={() => setSelectedInvoice(inv)}
                              className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 font-bold text-slate-700 transition cursor-pointer text-xs"
                            >
                              Detail & Kuitansi
                            </button>

                            {!isPaid && (
                              <button
                                onClick={() => handlePayManual(inv.id)}
                                disabled={submitting}
                                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 font-bold transition cursor-pointer text-xs"
                              >
                                Bayar Kasir
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

          {/* Modal Kuitansi Detail Invoice */}
          {selectedInvoice && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-700 font-bold text-xs">
                      <Receipt className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">Kuitansi Faktur RS Rotinsulu</h3>
                      <p className="text-xs text-slate-500 font-mono">{selectedInvoice.invoice_number || selectedInvoice.id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Pasien Penanggung Jawab</span>
                      <span className="font-bold text-slate-900 text-sm block mt-0.5">{selectedInvoice.patientName || `Pasien #${selectedInvoice.patient_id}`}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Status Pembayaran</span>
                      <span className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        selectedInvoice.status === "paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {selectedInvoice.status === "paid" ? "✔ LUNAS" : "⏳ BELUM LUNAS"}
                      </span>
                    </div>
                  </div>

                  {/* Component Items */}
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-2">Rincian Komponen Biaya Medis</span>
                    <div className="space-y-1.5">
                      {Array.isArray(selectedInvoice.items) && selectedInvoice.items.length > 0 ? (
                        selectedInvoice.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 font-mono">
                            <span className="font-bold text-slate-800">{item.name}</span>
                            <span className="font-bold text-slate-900">{formatRupiah(item.price || item.amount || item.subtotal)}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-400 italic">Detail komponen biaya umum.</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-50 border border-rose-200 font-mono text-sm">
                    <span className="font-extrabold text-slate-900">GRAND TOTAL PELUNASAN</span>
                    <span className="font-extrabold text-rose-800">{formatRupiah(selectedInvoice.total_amount)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 rounded-2xl bg-rose-800 hover:bg-rose-900 text-white px-5 py-2.5 text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    <Printer className="h-4 w-4" /> Cetak Kuitansi PDF
                  </button>
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 text-xs font-bold transition cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
