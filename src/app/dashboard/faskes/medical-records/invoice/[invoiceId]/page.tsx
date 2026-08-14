"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";

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

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawInvoiceId = Array.isArray(params?.invoiceId) ? params.invoiceId[0] : (params?.invoiceId as string);
  const invoiceId = rawInvoiceId || "";

  const [user, setUser] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error(err);
      }
    }

    if (!invoiceId) {
      setError("Invoice tidak ditemukan.");
      setLoading(false);
      return;
    }

    fetchInvoiceDetail(invoiceId);
  }, [invoiceId]);

  const fetchInvoiceDetail = async (id) => {
    setLoading(true);
    try {
      const response = await apiGet(`/api/invoice/${id}`);
      if (response?.success && response.data) {
        setInvoice(response.data);
      } else {
        setError("Invoice tidak ditemukan.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat mengambil data invoice.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
    <div className="space-y-6">
        <Loader2 className="h-10 w-10 animate-spin text-rose-600" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
    <div className="space-y-6">
        
        <div className="flex flex-1">
          
          <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-700 mb-6">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-3">Invoice Tidak Ditemukan</h1>
              <p className="text-sm text-slate-600 mb-6">Data invoice yang diminta tidak tersedia atau tidak dapat diakses.</p>
              <button
                type="button"
                onClick={() => router.push("/dashboard/faskes/medical-records/invoice")}
                className="inline-flex items-center gap-2 rounded-3xl bg-rose-900 px-5 py-3 text-sm font-bold text-white hover:bg-rose-800 transition"
              >
                <ArrowLeft className="h-4 w-4" /> Kembali ke Invoice
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="flex flex-1">
        
        <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <p className="text-sm font-semibold text-slate-500">Detail Invoice</p>
                <h1 className="text-3xl font-extrabold text-slate-900">{invoice.id}</h1>
              </div>
              <button
                type="button"
                onClick={() => router.push("/dashboard/faskes/medical-records/invoice")}
                className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                <ArrowLeft className="h-4 w-4" /> Kembali
              </button>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500 font-semibold">Status Invoice</p>
                      <p className="mt-2 text-lg font-bold text-slate-900">{badgeForStatus[invoice.status] || invoice.status}</p>
                    </div>
                    <div className="rounded-3xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 border border-slate-200">
                      Total Tagihan: {formatRupiah(Number(invoice.total_amount || invoice.totalAmount || 0))}
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl bg-white p-4 border border-slate-200">
                      <p className="text-sm text-slate-500">Pasien ID</p>
                      <p className="mt-2 text-base font-semibold text-slate-900">{invoice.patient_id || invoice.patientId}</p>
                    </div>
                    <div className="rounded-3xl bg-white p-4 border border-slate-200">
                      <p className="text-sm text-slate-500">Tanggal</p>
                      <p className="mt-2 text-base font-semibold text-slate-900">{new Date(invoice.created_at || invoice.createdAt || Date.now()).toLocaleDateString("id-ID")}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Item Tagihan</h2>
                  <div className="space-y-3">
                    {Array.isArray(invoice.items) && invoice.items.length > 0 ? (
                      invoice.items.map((item, idx) => (
                        <div key={`${item.code}-${idx}`} className="rounded-3xl bg-white p-4 border border-slate-200">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-semibold text-slate-900">{item.name || item.code}</p>
                              <p className="text-sm text-slate-500">Qty: {item.qty ?? 1}</p>
                            </div>
                            <p className="font-semibold text-slate-900">{formatRupiah(Number(item.subtotal || item.price * item.qty || 0))}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">Tidak ada item invoice.</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Catatan & Status</h2>
                <div className="rounded-3xl bg-white p-4 border border-slate-200">
                  <p className="text-sm text-slate-500">Catatan</p>
                  <p className="mt-3 text-sm text-slate-700">{invoice.notes || "Tidak ada catatan."}</p>
                </div>
                <div className="mt-6 rounded-3xl bg-white p-4 border border-slate-200">
                  <p className="text-sm text-slate-500">Metode Pembayaran</p>
                  <p className="mt-3 text-sm text-slate-700">{invoice.payment_method || invoice.paymentMethod || "-"}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
