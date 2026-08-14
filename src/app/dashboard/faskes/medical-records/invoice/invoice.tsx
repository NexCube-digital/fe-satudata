"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Script from "next/script";
import { Plus, RefreshCw, ShoppingCart, FileText, ChevronRight, CheckCircle2, CreditCard, Search, Trash2 } from "lucide-react";
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

const badgeForStatus = {
  unpaid: "Belum Lunas",
  paid: "Lunas",
  cancelled: "Dibatalkan",
  failed: "Gagal",
};

export default function FaskesInvoicePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
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

  useEffect(() => {
    if (selectedPatientId) {
      fetchPatientOverview(selectedPatientId);
      fetchInvoiceList(selectedPatientId);
    } else {
      setPatientOverview(null);
      setSelectedRecords([]);
      setInvoices([]);
    }
  }, [selectedPatientId]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [patientsRes, chargesRes] = await Promise.all([getInvoicePatients(), getAdditionalCharges()]);
      setPatients(Array.isArray(patientsRes?.data) ? patientsRes.data : []);
      setChargeOptions(Array.isArray(chargesRes?.data) ? chargesRes.data : []);
      setNewChargeCode("");
    } catch (err) {
      console.error("Error loading invoice data", err);
      setFeedback({ type: "error", message: "Gagal memuat data invoice. Coba refresh halaman." });
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientOverview = async (patientId) => {
    try {
      const result = await getPatientOverview(patientId);
      setPatientOverview(result?.data || null);
      setSelectedRecords([]);
    } catch (err) {
      console.error("Error loading patient overview", err);
      setFeedback({ type: "error", message: "Gagal memuat ringkasan pasien." });
    }
  };

  const fetchInvoiceList = async (patientId) => {
    try {
      const result = await listInvoices(patientId);
      setInvoices(Array.isArray(result?.data) ? result.data : []);
    } catch (err) {
      console.error("Error loading invoices", err);
      setFeedback({ type: "error", message: "Gagal memuat daftar invoice." });
    }
  };

  const availableRecords = useMemo(() => {
    return Array.isArray(patientOverview?.records) ? patientOverview.records : [];
  }, [patientOverview]);

  const selectedRecordItems = useMemo(() => {
    return availableRecords.filter((record) => selectedRecords.includes(Number(record.id)));
  }, [availableRecords, selectedRecords]);

  const recordsSubtotal = useMemo(() => {
    return selectedRecordItems.reduce((sum, record) => {
      const amount = Number(record.biaya?.total_keseluruhan || record.total_amount || 0);
      return sum + amount;
    }, 0);
  }, [selectedRecordItems]);

  const extrasSubtotal = useMemo(() => {
    return additionalItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1), 0);
  }, [additionalItems]);

  const invoiceTotal = recordsSubtotal + extrasSubtotal;

  const handleToggleRecord = (record) => {
    if (record.already_invoiced) return;
    setSelectedRecords((current) => {
      const id = Number(record.id);
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }
      return [...current, id];
    });
  };

  const handleAddExtraItem = () => {
  if (chargeMode === "dropdown") {
    if (!newChargeCode) {
      setFeedback({ type: "error", message: "Pilih layanan terlebih dahulu." });
      return;
    }
    const option = chargeOptions.find((item) => item.code === newChargeCode);
    if (!option) {
      setFeedback({ type: "error", message: "Layanan tidak ditemukan." });
      return;
    }
    setAdditionalItems((current) => {
      if (current.find((item) => item.code === option.code)) return current;
      return [...current, { ...option, qty: 1 }];
    });
    setNewChargeCode("");
    return;
  }

  const trimmedName = newChargeName.trim();
  const fixedPrice = Number(newChargePrice);
  if (!trimmedName || !Number.isFinite(fixedPrice) || fixedPrice <= 0) {
    setFeedback({ type: "error", message: "Isi nama layanan dan harga manual dengan benar." });
    return;
  }
  const manualCode = `manual-${trimmedName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}-${Date.now()}`;
  setAdditionalItems((current) => [...current, { code: manualCode, name: trimmedName, price: fixedPrice, qty: 1 }]);
  setNewChargeName("");
  setNewChargePrice("");
};

  const handleRemoveExtra = (code) => {
    setAdditionalItems((current) => current.filter((item) => item.code !== code));
  };

  const [chargeMode, setChargeMode] = useState("dropdown");

  const handleCreateInvoice = async () => {
    if (!selectedPatientId) {
      setFeedback({ type: "error", message: "Pilih pasien terlebih dahulu." });
      return;
    }
    if (selectedRecords.length === 0 && additionalItems.length === 0) {
      setFeedback({ type: "error", message: "Pilih minimal satu rekam medis atau biaya tambahan." });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        medicalRecordIds: selectedRecords,
        additionalItems: additionalItems.map((item) => ({ code: item.code, qty: item.qty, name: item.name, price: item.price })),
        notes: notes.trim() || undefined,
      };

      const result = await createInvoice(selectedPatientId, payload);
      if (result?.data) {
        setFeedback({ type: "success", message: "Invoice berhasil dibuat." });
        setSelectedRecords([]);
        setAdditionalItems([]);
        setNotes("");
        fetchPatientOverview(selectedPatientId);
        fetchInvoiceList(selectedPatientId);
      }
    } catch (err) {
      console.error("Error creating invoice", err);
      setFeedback({ type: "error", message: err.message || "Gagal membuat invoice." });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayNow = async (invoiceId) => {
    try {
      await payInvoice(invoiceId, { paymentMethod: "cash" });
      setFeedback({ type: "success", message: "Invoice berhasil dilunasi." });
      fetchInvoiceList(selectedPatientId);
    } catch (err) {
      console.error("Error paying invoice", err);
      setFeedback({ type: "error", message: err.message || "Gagal melunasi invoice." });
    }
  };

  const handlePayMidtrans = async (invoiceId) => {
  try {
    const result = await payInvoiceMidtrans(invoiceId);
    const snapToken = result?.data?.snapToken;

    if (!snapToken) {
      setFeedback({ type: "error", message: "Gagal mendapatkan token pembayaran." });
      return;
    }
    if (!midtransReady || typeof window === "undefined" || !window.snap) {
      setFeedback({ type: "error", message: "Midtrans belum siap. Coba refresh halaman." });
      return;
    }

    window.snap.pay(snapToken, {
      onSuccess: () => {
        setFeedback({ type: "success", message: "Pembayaran berhasil! Memperbarui status..." });
        pollInvoiceStatus(invoiceId);
      },
      onPending: () => {
        setFeedback({ type: "success", message: "Pembayaran diproses, menunggu konfirmasi." });
        pollInvoiceStatus(invoiceId);
      },
      onError: () => {
        setFeedback({ type: "error", message: "Pembayaran gagal, silakan coba lagi." });
      },
      onClose: () => {
        setFeedback({ type: "", message: "Kamu menutup popup pembayaran." });
      },
    });
  } catch (err) {
    console.error("Error requesting Midtrans payment", err);
    setFeedback({ type: "error", message: err.message || "Gagal memproses pembayaran Midtrans." });
  }
};

// Webhook dari Midtrans jalan async, jadi status invoice belum tentu langsung
// berubah pas onSuccess dipanggil. Polling singkat biar UI ke-update otomatis.
const pollInvoiceStatus = (invoiceId, attempt = 0) => {
  if (attempt >= 5) return;
  setTimeout(async () => {
    await fetchInvoiceList(selectedPatientId);
    const updated = invoices.find((inv) => inv.id === invoiceId);
    if (!updated || updated.status === "unpaid") {
      pollInvoiceStatus(invoiceId, attempt + 1);
    }
  }, 3000);
};

  const handlePatientSelect = (event) => {
    setSelectedPatientId(event.target.value);
    setFeedback({ type: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfcf8] via-[#fbf7f1] to-[#f7f1ea] flex flex-col pb-16 md:pb-0">
        <Script
            src="https://app.sandbox.midtrans.com/snap/snap.js"
            data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
            strategy="afterInteractive"
            onLoad={() => setMidtransReady(true)}
            onError={(e) => console.error("Gagal memuat Midtrans Snap SDK", e)}
            />
      <Navbar user={user} roleLabel="Fasilitas Kesehatan" onLogout={() => router.push("/login")} />
      <div className="flex flex-1">
        <Sidebar role="faskes" />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-rose-700 font-bold">Tagihan & Invoice</p>
              <h1 className="text-3xl font-extrabold text-slate-900">Kelola Invoice Pasien</h1>
              <p className="max-w-2xl text-sm text-slate-500">
                Pilih pasien, tinjau rekam medis yang belum ditagih, tambahkan biaya ekstra, lalu buat invoice yang dapat dilihat dan dibayar.
              </p>
            </div>
            <div className="inline-flex items-center gap-2">
              <button
                type="button"
                onClick={() => fetchInitialData()}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition"
              >
                <RefreshCw className="h-4 w-4" /> Segarkan
              </button>
            </div>
          </div>

          {feedback.message ? (
            <div
              className={`rounded-3xl border px-4 py-3 mb-6 text-sm font-semibold ${
                feedback.type === "error"
                  ? "border-rose-200 bg-rose-50 text-rose-800"
                  : "border-emerald-200 bg-emerald-50 text-emerald-900"
              }`}
            >
              {feedback.message}
            </div>
          ) : null}

          <div className="grid gap-6 xl:grid-cols-[1.4fr_0.95fr]">
            <section className="space-y-6">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Buat Invoice Baru</h2>
                    <p className="text-sm text-slate-500">Pilih pasien dan sesuaikan rekam medis yang akan ditagih.</p>
                  </div>
                  <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                      {patients.length} pasien tersedia
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
                  <label className="block text-sm font-semibold text-slate-700">
                    Pilih Pasien
                    <select
                      value={selectedPatientId}
                      onChange={handlePatientSelect}
                      className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                    >
                      <option value="">-- Pilih pasien --</option>
                      {patients.map((patient) => (
                        <option key={patient.id} value={patient.id}>
                          {patient.name || `Pasien ${patient.id}`}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    <p className="font-semibold text-slate-900">Ringkasan Status</p>
                    <p className="mt-2">Rekam medis belum ditagih: <strong>{patientOverview?.total_belum_ditagih ? formatRupiah(patientOverview.total_belum_ditagih) : "-"}</strong></p>
                    <p className="mt-2 text-slate-500">Invoice aktif: {invoices.filter((item) => item.status !== "paid").length}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Rekam Medis Pasien</h3>
                    <p className="text-sm text-slate-500">Centang rekam medis yang ingin ditagih.</p>
                  </div>
                  <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">
                    {availableRecords.length} item
                  </span>
                </div>

                <div className="mt-5 overflow-hidden rounded-3xl border border-slate-100 bg-slate-50">
                  {availableRecords.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-500">
                      Pilih pasien untuk melihat rekam medis yang belum ditagih.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200">
                      {availableRecords.map((record) => {
                        const amount = Number(record.biaya?.total_keseluruhan || record.total_amount || 0);
                        return (
                          <button
                            key={record.id}
                            type="button"
                            onClick={() => handleToggleRecord(record)}
                            className={`w-full text-left px-5 py-4 transition hover:bg-slate-100 ${record.already_invoiced ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
                            disabled={record.already_invoiced}
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">{record.record_type || record.type || "Umum"}</span>
                                  <span>{record.title || record.description || "Rekam medis"}</span>
                                </div>
                                <p className="mt-2 text-sm text-slate-700 truncate">Tanggal: {new Date(record.visit_date || record.created_at || record.updated_at || Date.now()).toLocaleDateString("id-ID")}</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-sm font-semibold text-slate-900">{formatRupiah(amount)}</span>
                                <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${record.already_invoiced ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"}`}>
                                  {record.already_invoiced ? "Sudah Ditagih" : "Belum Ditagih"}
                                </span>
                                <span className={`h-5 w-5 shrink-0 rounded-full border ${selectedRecords.includes(Number(record.id)) ? "border-rose-600 bg-rose-600" : "border-slate-300 bg-white"}`} />
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Biaya Tambahan Opsional</h3>
                    <p className="text-sm text-slate-500">Tambahkan layanan non-rekam medis jika perlu.</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                    {chargeOptions.length} pilihan
                  </span>
                </div>

                <div className="mt-5 grid gap-4">
                    <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1 w-fit">
                        <button
                        type="button"
                        onClick={() => setChargeMode("dropdown")}
                        className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] transition ${
                            chargeMode === "dropdown" ? "bg-rose-900 text-white shadow" : "text-slate-500"
                        }`}
                        >
                        Dari Daftar Layanan
                        </button>
                        <button
                        type="button"
                        onClick={() => setChargeMode("manual")}
                        className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] transition ${
                            chargeMode === "manual" ? "bg-rose-900 text-white shadow" : "text-slate-500"
                        }`}
                        >
                        Input Manual
                        </button>
                    </div>

                    {chargeMode === "dropdown" ? (
                        <label className="block text-sm font-semibold text-slate-700">
                        Pilih Layanan
                        <select
                            value={newChargeCode}
                            onChange={(event) => setNewChargeCode(event.target.value)}
                            className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                        >
                            <option value="">-- pilih layanan --</option>
                            {chargeOptions.map((charge) => (
                            <option key={charge.code} value={charge.code}>
                                {charge.name} - {formatRupiah(charge.price)}
                            </option>
                            ))}
                        </select>
                        </label>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-[1.8fr_1fr]">
                        <label className="block text-sm font-semibold text-slate-700">
                            Nama Layanan Manual
                            <input
                            type="text"
                            value={newChargeName}
                            onChange={(event) => setNewChargeName(event.target.value)}
                            className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                            placeholder="Contoh: Administrasi"
                            />
                        </label>
                        <label className="block text-sm font-semibold text-slate-700">
                            Harga Manual
                            <input
                            type="number"
                            min={0}
                            value={newChargePrice}
                            onChange={(event) => setNewChargePrice(event.target.value)}
                            className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                            placeholder="0"
                            />
                        </label>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handleAddExtraItem}
                        className="mt-3 inline-flex items-center gap-2 rounded-3xl bg-rose-900 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-rose-800 transition w-fit"
                    >
                        <Plus className="h-4 w-4" /> Tambah Biaya
                    </button>
                </div>

                {additionalItems.length > 0 ? (
                  <div className="mt-6 space-y-3">
                    {additionalItems.map((item) => (
                      <div key={item.code} className="flex flex-col rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                          <p className="text-sm text-slate-600">{formatRupiah(item.price)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveExtra(item.code)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-rose-700 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="h-4 w-4" /> Hapus
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-6 text-sm text-slate-500">Belum ada biaya tambahan ditambahkan.</p>
                )}
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <label className="block text-sm font-semibold text-slate-700">
                  Catatan Invoice (opsional)
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={4}
                    className="mt-2 w-full resize-none rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                    placeholder="Contoh: Invoice untuk pemeriksaan akhir bulan"
                  />
                </label>
              </div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-3xl bg-rose-900 p-3 text-white">
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Ringkasan Tagihan</h3>
                    <p className="text-sm text-slate-500">Periksa total biaya sebelum membuat invoice.</p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
                    <div className="flex justify-between gap-2">
                      <span>Rekam medis terpilih</span>
                      <strong>{formatRupiah(recordsSubtotal)}</strong>
                    </div>
                    <div className="mt-2 flex justify-between gap-2 text-slate-500">
                      <span>{selectedRecordItems.length} item</span>
                      <span>{selectedRecordItems.filter((item) => item.already_invoiced).length > 0 ? "Termasuk sudah ditagih" : ""}</span>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
                    <div className="flex justify-between gap-2">
                      <span>Biaya tambahan</span>
                      <strong>{formatRupiah(extrasSubtotal)}</strong>
                    </div>
                    <div className="mt-2 text-slate-500">{additionalItems.length} layanan</div>
                  </div>

                  <div className="rounded-[1.75rem] border border-slate-200 bg-rose-950 p-5 text-white">
                    <p className="text-sm uppercase tracking-[0.25em] text-rose-300">Total Invoice</p>
                    <p className="mt-3 text-3xl font-extrabold">{formatRupiah(invoiceTotal)}</p>
                    <p className="mt-2 text-sm text-rose-200/80">Akan dibuat sebagai invoice baru untuk pasien terpilih.</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCreateInvoice}
                    disabled={submitting}
                    className="w-full rounded-3xl bg-rose-900 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-rose-900/20 transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? "Membuat invoice..." : "Buat Invoice"}
                  </button>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-3xl bg-slate-100 p-3 text-rose-900">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Riwayat Invoice</h3>
                    <p className="text-sm text-slate-500">Daftar invoice yang sudah dibuat untuk pasien.</p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {invoices.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                      Belum ada invoice untuk pasien terpilih.
                    </div>
                  ) : (
                    invoices.map((invoice) => (
                      <div key={invoice.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900">{invoice.id}</p>
                            <p className="mt-1 text-xs text-slate-500">{invoice.notes || badgeForStatus[invoice.status] || "Invoice"}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-700 border border-slate-200">
                              {badgeForStatus[invoice.status] || invoice.status}
                            </span>
                            <span className="text-sm font-semibold text-slate-900">{formatRupiah(Number(invoice.total_amount || invoice.totalAmount || 0))}</span>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                          <span>Pasien ID: {invoice.patient_id || invoice.patientId}</span>
                          <span className="text-slate-600">•</span>
                          <span>{new Date(invoice.created_at || invoice.createdAt || Date.now()).toLocaleDateString("id-ID")}</span>
                          <span>Item: {Array.isArray(invoice.items) ? invoice.items.length : "-"}</span>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {invoice.status !== "paid" && invoice.status !== "cancelled" ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handlePayNow(invoice.id)}
                                className="inline-flex items-center gap-2 rounded-2xl bg-rose-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-rose-800"
                              >
                                <CreditCard className="h-4 w-4" /> Bayar Cash
                              </button>
                              <button
                                type="button"
                                onClick={() => handlePayMidtrans(invoice.id)}
                                disabled={!midtransReady}
                                className={`inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-rose-300 hover:text-rose-800 disabled:cursor-not-allowed disabled:opacity-60`}
                              >
                                <ShoppingCart className="h-4 w-4" /> Transfer
                              </button>
                            </>
                          ) : (
                            <span className="inline-flex items-center gap-2 rounded-2xl bg-emerald-100 px-4 py-2 text-xs font-bold text-emerald-700">
                              <CheckCircle2 className="h-4 w-4" /> Sudah dibayar
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => router.push(`/dashboard/faskes/medical-records/invoice/${encodeURIComponent(invoice.id)}`)}
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-rose-300 hover:text-rose-800"
                          >
                            <ChevronRight className="h-4 w-4" /> Lihat Detail
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
