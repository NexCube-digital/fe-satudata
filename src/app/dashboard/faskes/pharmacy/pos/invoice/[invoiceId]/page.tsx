"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Script from "next/script";
import { apiGet } from "@/lib/api";
import { payInvoiceMidtrans } from "@/services/invoiceService";
import { ArrowLeft, Loader2, AlertTriangle, CreditCard, RefreshCw } from "lucide-react";

const formatRupiah = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
};

const badgeForStatus = {
  unpaid: "Belum Lunas",
  paid: "Lunas",
  cancelled: "Dibatalkan",
  failed: "Gagal",
};

export default function PharmacyPOSInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const rawInvoiceId = Array.isArray(params?.invoiceId) ? params.invoiceId[0] : (params?.invoiceId as string);
  const invoiceId = rawInvoiceId || "";

  const [invoice, setInvoice] = useState(null);
  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch (err) {
      console.error("Gagal parse user dari localStorage", err);
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [midtransReady, setMidtransReady] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const removeStoredInvoice = () => {
    if (typeof window === "undefined" || !invoiceId) return;
    sessionStorage.removeItem(`pharmacy-pos-invoice-${invoiceId}`);
  };

  useEffect(() => {
    if (!invoiceId) return;

    const getStoredInvoice = () => {
      if (typeof window === "undefined" || !invoiceId) return null;
      const stored = sessionStorage.getItem(`pharmacy-pos-invoice-${invoiceId}`);
      return stored ? JSON.parse(stored) : null;
    };

    const loadInvoice = async () => {
      setLoading(true);

      try {
        const response = await apiGet(`/api/invoice/${invoiceId}`);
        if (response?.success && response.data) {
          setInvoice(response.data);
          setFeedback({ type: "", message: "" });
        } else {
          const storedInvoice = getStoredInvoice();
          if (storedInvoice) {
            setInvoice(storedInvoice);
            setFeedback({ type: "warning", message: "Data invoice lokal ditampilkan sementara. Periksa kembali status setelah pembayaran." });
          } else {
            setFeedback({ type: "error", message: "Invoice tidak ditemukan." });
          }
        }
      } catch (err) {
        console.error("Gagal memuat invoice:", err);
        const storedInvoice = getStoredInvoice();
        if (storedInvoice) {
          setInvoice(storedInvoice);
          setFeedback({ type: "warning", message: "Tidak dapat memuat data server, menampilkan invoice lokal sementara." });
        } else {
          setFeedback({ type: "error", message: err?.message || "Gagal memuat invoice." });
        }
      } finally {
        setLoading(false);
      }
    };

    void loadInvoice();
  }, [invoiceId]);

  const pollInvoiceStatus = async (attempt = 0) => {
    if (!invoiceId || attempt >= 6) return;

    try {
      const response = await apiGet(`/api/invoice/${invoiceId}`);
      if (response?.success && response.data) {
        setInvoice(response.data);
        if (response.data.status === "paid") {
          removeStoredInvoice();
          setFeedback({ type: "success", message: "Pembayaran terkonfirmasi. Mengalihkan ke POS..." });
          setTimeout(() => router.push("/dashboard/faskes/pharmacy/pos"), 1200);
          return;
        }
      }
    } catch (err) {
      console.error("Gagal polling status invoice:", err);
    }

    setTimeout(() => pollInvoiceStatus(attempt + 1), 3000);
  };

  const handlePayWithMidtrans = async () => {
    if (!invoiceId || paying) return;
    setPaying(true);
    setFeedback({ type: "info", message: "Menyiapkan pembayaran Midtrans..." });

    try {
      const response = await payInvoiceMidtrans(invoiceId);
      const snapToken = response?.data?.snapToken || response?.snapToken;

      if (!snapToken) {
        setFeedback({ type: "error", message: "Gagal mendapatkan token Midtrans." });
        return;
      }

      if (typeof window === "undefined" || !window.snap) {
        setFeedback({ type: "error", message: "Midtrans belum siap. Coba refresh halaman." });
        return;
      }

      window.snap.pay(snapToken, {
        onSuccess: () => {
          setFeedback({ type: "success", message: "Pembayaran berhasil. Menunggu konfirmasi..." });
          pollInvoiceStatus();
        },
        onPending: () => {
          setFeedback({ type: "info", message: "Pembayaran pending. Menunggu konfirmasi." });
          pollInvoiceStatus();
        },
        onError: () => {
          setFeedback({ type: "error", message: "Pembayaran gagal atau dibatalkan." });
        },
        onClose: () => {
          setFeedback({ type: "warning", message: "Popup pembayaran ditutup." });
        },
      });
    } catch (err) {
      console.error("Gagal memulai pembayaran Midtrans:", err);
      setFeedback({ type: "error", message: err.message || "Gagal memproses pembayaran Midtrans." });
    } finally {
      setPaying(false);
    }
  };

  if (!invoiceId) {
    return (
    <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <AlertTriangle className="mx-auto h-12 w-12 text-[#DC2626]" />
          <h1 className="mt-4 text-xl font-bold text-slate-900">Invoice tidak ditemukan</h1>
          <p className="mt-2 text-sm text-slate-600">Param invoice tidak tersedia di URL.</p>
          <button
            type="button"
            onClick={() => router.push("/dashboard/faskes/pharmacy/pos")}
            className="mt-6 inline-flex items-center gap-2 rounded-3xl bg-gradient-to-r from-teal-700 to-cyan-800 px-5 py-3 text-sm font-bold text-white hover:from-teal-800 hover:to-cyan-900 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke POS
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
        onLoad={() => setMidtransReady(true)}
      />
      
      <div className="flex flex-1 flex-col transition-all duration-300">
        

        <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-teal-800 font-bold">Invoice POS Farmasi</p>
              <h1 className="text-3xl font-extrabold text-slate-900">Bayar Invoice {invoiceId}</h1>
              <p className="text-sm text-slate-500">Pastikan data sudah benar sebelum melanjutkan ke Midtrans.</p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/dashboard/faskes/pharmacy/pos")}
              className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              <ArrowLeft className="h-4 w-4" /> Kembali ke POS
            </button>
          </div>

          {feedback.message ? (
            <div
              className={`rounded-3xl border px-4 py-3 text-sm font-semibold ${
                feedback.type === "error"
                  ? "border-red-200 bg-red-50 text-[#DC2626]"
                  : feedback.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-[#16A34A]"
                  : feedback.type === "warning"
                  ? "border-amber-200 bg-amber-50 text-[#D97706]"
                  : "border-slate-200 bg-slate-50 text-slate-700"
              }`}
            >
              {feedback.message}
            </div>
          ) : null}

          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <Loader2 className="h-10 w-10 animate-spin text-teal-700 mx-auto" />
              <p className="mt-4 text-sm text-slate-500">Memuat detail invoice...</p>
            </div>
          ) : invoice ? (
            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-slate-500 font-semibold">Detail Invoice</p>
                      <h2 className="mt-3 text-2xl font-extrabold text-slate-900">{invoice.id || invoiceId}</h2>
                    </div>
                    <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 border border-slate-200">
                      {badgeForStatus[invoice.status] || invoice.status || "-"}
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-3">
                    <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Pasien</p>
                      <p className="mt-2 font-semibold text-slate-900">{invoice.patient_name || invoice.patient_name || "Pasien Umum / Walk-in"}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Jumlah</p>
                      <p className="mt-2 font-semibold text-slate-900">{formatRupiah(Number(invoice.total_amount || invoice.totalAmount || 0))}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Metode Bayar</p>
                      <p className="mt-2 font-semibold text-slate-900">{invoice.payment_method || invoice.paymentMethod || "transfer"}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900">Rincian Item</h3>
                    <span className="text-xs uppercase tracking-[0.3em] text-slate-500">{Array.isArray(invoice.items) ? invoice.items.length : 0} item</span>
                  </div>

                  <div className="space-y-3">
                    {Array.isArray(invoice.items) && invoice.items.length > 0 ? (
                      invoice.items.map((item, index) => (
                        <div key={`${item.medicine_id || item.code || index}-${index}`} className="rounded-3xl bg-slate-50 p-4 border border-slate-200">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <p className="font-semibold text-slate-900">{item.name || item.description || item.code}</p>
                              <p className="mt-2 text-xs text-slate-500">Qty: {item.qty ?? 1}</p>
                            </div>
                            <p className="font-bold text-slate-900">{formatRupiah(Number(item.subtotal || item.price * item.qty || 0))}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">Tidak ada item pada invoice ini.</p>
                    )}
                  </div>
                </div>
              </section>

              <aside className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Pembayaran</h3>
                  <div className="space-y-3 text-sm text-slate-600">
                    <div className="flex justify-between">
                      <span>Total Tagihan</span>
                      <span className="font-semibold text-slate-900">{formatRupiah(Number(invoice.total_amount || invoice.totalAmount || 0))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status</span>
                      <span className="font-semibold text-slate-900">{badgeForStatus[invoice.status] || invoice.status || "-"}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!midtransReady || paying || invoice.status === "paid"}
                    onClick={handlePayWithMidtrans}
                    className={`mt-6 w-full inline-flex items-center justify-center gap-2 rounded-3xl px-4 py-3 text-sm font-bold text-white transition ${
                      !midtransReady || paying || invoice.status === "paid"
                        ? "bg-slate-300 cursor-not-allowed"
                        : "bg-gradient-to-r from-teal-700 to-cyan-800 hover:from-teal-800 hover:to-cyan-900"
                    }`}
                  >
                    {paying ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                    {invoice.status === "paid" ? "Sudah Terbayar" : "Bayar dengan Midtrans"}
                  </button>

                  {!midtransReady ? (
                    <p className="mt-3 text-xs text-slate-500">Menunggu Midtrans siap. Reload halaman jika popup tidak muncul.</p>
                  ) : null}
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">Petunjuk</p>
                  <ul className="mt-3 space-y-2 list-disc pl-5">
                    <li>Pastikan total invoice sudah sesuai sebelum membayar.</li>
                    <li>Setelah pembayaran sukses, halaman akan otomatis kembali ke POS.</li>
                    <li>Jika status belum berubah, refresh halaman invoice atau cek riwayat POS.</li>
                  </ul>
                </div>
              </aside>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <AlertTriangle className="mx-auto h-12 w-12 text-[#DC2626]" />
              <p className="mt-4 text-sm text-slate-500">Invoice tidak dapat ditampilkan.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
