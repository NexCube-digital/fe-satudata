// record pasien

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script";
import TxHashLink from "@/components/ui/TxHashLink";
import { maskSip } from "@/utils/masking";
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
  Info,
  Landmark,
  Banknote,
  ClipboardList,
  PhoneCall
} from "lucide-react";


import { useAuth } from "@/hooks/use-auth";
import usePatientRecords from "@/hooks/patient/useRecords";

export default function PatientNewRecordsPage() {
  const router = useRouter();
  const { user, handleLogout } = useAuth();
  const {
    stepperContainerRef,
    loading,
    records,
    invoices,
    selectedInvoiceId,
    setSelectedInvoiceId,
    invoiceLoading,
    invoiceError,
    activeStage,
    setActiveStage,
    paymentMethod,
    setPaymentMethod,
    showPaymentModal,
    setShowPaymentModal,
    isProcessingPayment,
    midtransReady,
    setMidtransReady,
    paymentFlowStage,
    paymentFlowInvoiceId,
    pollAttemptsExceeded,
    decryptedState,
    decryptedDetails,
    decryptingIds,
    selectedRecord,
    setSelectedRecord,
    searchTerm,
    setSearchTerm,
    selectedInvoice,
    paymentStatus,
    flatInvoiceItems,
    totalAmount,
    filteredRecords,
    isCompletedVisit,
    toggleDecryptRecord,
    handleOpenDetailModal,
    handleProcessOnlinePayment,
    handleClosePaymentFlow
  } = usePatientRecords();

  const flowSteps = [
    { id: 1, title: "Antrean & Pendaftaran", statusName: "Verifikasi Berkas", icon: Activity },
    { id: 2, title: "Pemeriksaan Dokter", statusName: "Konsultasi & Diagnosa", icon: Stethoscope },
    { id: 3, title: "Resep & Farmasi", statusName: "Penyiapan Obat", icon: Pill },
    { id: 4, title: "Faktur & Pelunasan", statusName: "Billing Medis", icon: Receipt }
  ];

  const hasInvoice = invoices.length > 0;
  const effectiveStage = hasInvoice ? 4 : Math.min(Math.max(activeStage || 1, 1), flowSteps.length);
  const normalizedActiveStage = Math.min(Math.max(effectiveStage, 1), flowSteps.length);
  const progressWidthPercent = Math.max(0, Math.min(100, ((normalizedActiveStage - 1) / Math.max(1, flowSteps.length - 1)) * 100));
  const stepperSteps = flowSteps.map((step) => {
    const isPaid = paymentStatus === "paid";
    const isCompleted = isPaid ? step.id <= 4 : step.id < normalizedActiveStage;
    const isActive = step.id === normalizedActiveStage;
    return {
      ...step,
      isCompleted,
      isActive,
    };
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <RefreshCw className="h-8 w-8 animate-spin text-teal-600" />
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
      

      <div>
        

        <div className="space-y-6">

          {/* Check if all active visits & billing are finished & paid */}
          {isCompletedVisit ? (
            <div className="rounded-3xl bg-white border border-slate-200/80 p-8 sm:p-12 text-center space-y-5 shadow-xs my-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200 text-[#16A34A] shadow-2xs">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">Tidak Ada Kunjungan & Tagihan Aktif</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Seluruh alur pemeriksaan rekam medis dan pelunasan tagihan Anda telah <span className="font-bold text-[#16A34A]">SELESAI & LUNAS</span>. Seluruh berkas rekam medis dan kuitansi pembayaran tersimpan aman di menu Riwayat.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/dashboard/pasien/history"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-700 to-cyan-800 hover:from-teal-800 hover:to-cyan-900 text-white px-6 py-3 text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <FileText className="h-4 w-4" /> Lihat Riwayat Medis & Invoice <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6 sm:space-y-8">
              {/* SECTION 1: INDIKATOR ALUR DOKUMEN REKAM MEDIS */}
              <div className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 p-4 sm:p-6 shadow-xs mb-4 sm:mb-8">
                <div className="flex flex-col xs:flex-row xs:items-center justify-between border-b border-slate-100 pb-3 mb-4 sm:pb-4 sm:mb-6 gap-2 sm:gap-3">
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-1.5 sm:gap-2">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-teal-700 shrink-0" />
                      Indikator Alur Dokumen Rekam Medis & Layanan
                    </h2>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                      Indikator progres dokumen medis, status pengunggahan oleh dokter, resep farmasi, dan faktur pelunasan faskes secara real-time.
                    </p>
                  </div>
                  <span className="rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-[11px] font-bold text-teal-800 flex items-center gap-1.5 shrink-0 self-start xs:self-auto">
                    <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-teal-500 animate-ping" />
                    Indikator Active
                  </span>
                </div>

                {/* Read-Only Automatic Flow Stepper Bar (Horizontal Line) */}
                <div ref={stepperContainerRef} className="py-2 sm:py-3 overflow-x-auto pb-3 sm:pb-4">
                  <div className="relative px-1 sm:px-8 min-w-[420px] sm:min-w-0">
                    {/* Connecting Line Background */}
                    <div className="absolute top-[18px] sm:top-[22px] left-8 right-8 sm:left-10 sm:right-10 h-1 -translate-y-1/2 bg-slate-100 rounded-full z-0" />

                    {/* Active Connecting Progress Fill Line */}
                    <div
                      className="absolute top-[18px] sm:top-[22px] left-8 sm:left-10 h-1 -translate-y-1/2 bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-700 rounded-full transition-all duration-500 z-0"
                      style={{ width: `${progressWidthPercent}%` }}
                    />

                    {/* 4 Step Nodes Grid */}
                    <div className="relative z-10 grid grid-cols-4 text-center">
                      {stepperSteps.map((step) => {
                        const IconComponent = step.icon;
                        const isActive = step.isActive;
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
                                  ? "h-9 w-9 sm:h-11 sm:w-11 bg-teal-700 text-white ring-3 sm:ring-4 ring-teal-700/20 shadow-md scale-105 sm:scale-110 -mt-1"
                                  : isDone
                                  ? "h-6 w-6 sm:h-7 sm:w-7 bg-[#16A34A] text-white border-2 border-white shadow-2xs mt-0.5 sm:mt-1"
                                  : "h-5 w-5 sm:h-6 sm:w-6 bg-slate-100 text-slate-400 border border-slate-200 mt-1 sm:mt-1.5"
                              }`}
                            >
                              {isActive ? (
                                <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-white animate-pulse" />
                              ) : isDone ? (
                                <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                              ) : (
                                <span className="text-[8.5px] sm:text-[9px] font-bold font-mono">{step.id}</span>
                              )}
                            </div>

                            {/* Text Labels */}
                            <div className="mt-1.5 sm:mt-2 space-y-0.5 max-w-[100px] sm:max-w-[140px] text-center">
                              <p
                                className={`transition-all duration-200 ${
                                  isActive
                                    ? "text-[10px] sm:text-xs font-black text-teal-950 uppercase tracking-tight"
                                    : isDone
                                    ? "text-[9px] sm:text-[10px] font-semibold text-slate-500"
                                    : "text-[8.5px] sm:text-[9px] font-normal text-slate-400"
                                }`}
                              >
                                {step.title}
                              </p>
                              <p
                                className={`${
                                  isActive
                                    ? "text-[9px] sm:text-[10px] font-extrabold text-teal-700"
                                    : "text-[7.5px] sm:text-[8px] text-slate-400"
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
                <div className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 p-4 sm:p-8 shadow-xs mb-6 sm:mb-8 animate-fade-in">
                  <div className="flex items-start gap-2.5 sm:gap-3 border-b border-slate-100 pb-3 sm:pb-4 mb-4 sm:mb-5">
                    <span className="flex h-9 w-9 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-amber-50 border border-amber-200 text-[#D97706] shadow-2xs font-bold">
                      <Receipt className="h-4 w-4 sm:h-6 sm:w-6" />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <h3 className="text-sm sm:text-lg font-extrabold text-slate-900">Rincian Tagihan & Pelunasan Jasa Medis</h3>
                        {paymentStatus === "paid" ? (
                          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-[#16A34A]">
                            ✔ LUNAS
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-[#D97706] animate-pulse">
                            Menunggu Pelunasan
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                        Rincian jasa dan status pembayaran dari invoice yang diterbitkan faskes.
                      </p>
                    </div>
                  </div>

                  {invoiceError && (
                    <div className="mb-4 sm:mb-5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs font-semibold text-[#DC2626]">
                      {invoiceError}
                    </div>
                  )}

                  <div className="mb-4 sm:mb-6 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wide text-slate-700">Daftar Invoice Pasien</h4>
                      {invoiceLoading && <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin text-teal-600" />}
                    </div>
                    {invoices.length > 0 ? (
                      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                        {invoices.map((invoice) => (
                          <button
                            key={invoice.id}
                            type="button"
                            onClick={() => setSelectedInvoiceId(invoice.id)}
                            className={`rounded-xl border p-2.5 sm:p-3 text-left transition ${selectedInvoiceId === invoice.id ? "border-teal-600 bg-teal-50/60" : "border-slate-200 bg-slate-50 hover:border-teal-300"}`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-[10px] sm:text-[11px] font-extrabold text-slate-800">{invoice.id}</span>
                              <span className={`rounded-full px-2 py-0.5 text-[9px] sm:text-[10px] font-bold border ${invoice.status === "paid" ? "bg-emerald-50 text-[#16A34A] border-emerald-200" : invoice.status === "pending_cash" ? "bg-amber-50 text-[#D97706] border-amber-200" : "bg-red-50 text-[#DC2626] border-red-200"}`}>
                                {invoice.status === "paid" ? "LUNAS" : invoice.status === "pending_cash" ? "MENUNGGU KONFIRMASI" : invoice.status.toUpperCase()}
                              </span>
                            </div>
                            <p className="mt-1 text-xs sm:text-sm font-bold text-teal-800">Rp {Number(invoice.total_amount || 0).toLocaleString("id-ID")}</p>
                            <p className="mt-0.5 text-[9px] sm:text-[10px] text-slate-500">{new Date(invoice.created_at).toLocaleDateString("id-ID")}</p>
                          </button>
                        ))}
                      </div>
                    ) : !invoiceLoading ? (
                      <p className="rounded-xl border border-dashed border-slate-300 px-3.5 py-3 sm:px-4 sm:py-4 text-xs text-slate-500">Belum ada invoice yang diterbitkan oleh faskes.</p>
                    ) : null}
                  </div>

                  {/* RINCIAN LAYANAN — tabel flat langsung dari item invoice (BE) */}
                  {/* Mobile List Card View (< sm) */}
                  <div className="block sm:hidden space-y-2 mb-5">
                    {flatInvoiceItems.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-bold text-slate-800 text-[11px] leading-snug">{item.name}</p>
                          <span className="font-mono font-extrabold text-slate-900 text-[11px] shrink-0">
                            {item.subtotal === 0 ? "GRATIS" : `Rp ${Number(item.subtotal).toLocaleString("id-ID")}`}
                          </span>
                        </div>
                        <div>
                          <span className="inline-block rounded-md bg-white px-1.5 py-0.5 font-mono text-[9px] text-slate-600 border border-slate-200/80">
                            {item.category}
                          </span>
                        </div>
                      </div>
                    ))}

                    {flatInvoiceItems.length === 0 && (
                      <p className="rounded-xl border border-dashed border-slate-300 px-3.5 py-3 text-xs text-slate-500 text-center">
                        Tidak ada rincian layanan pada invoice ini.
                      </p>
                    )}

                    {flatInvoiceItems.length > 0 && (
                      <div className="p-3 rounded-xl bg-teal-50/80 border border-teal-200 flex items-center justify-between text-xs">
                        <span className="font-extrabold text-slate-900 text-xs">TOTAL PELUNASAN</span>
                        <span className="font-mono font-extrabold text-teal-800 text-sm">
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
                          <tr className="border-t-2 border-slate-200 bg-teal-50/40">
                            <td colSpan={2} className="py-4 px-4 font-extrabold text-slate-900 text-sm">
                              TOTAL PELUNASAN TAGIHAN
                            </td>
                            <td className="py-4 px-4 text-right font-mono font-extrabold text-teal-800 text-base">
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

                  {/* Action Button: Bayar Tagihan Sekarang */}
                  {paymentStatus === "unpaid" && selectedInvoice && (
                    <div className="flex justify-end mb-4 sm:mb-6">
                      <button
                        onClick={() => setShowPaymentModal(true)}
                        className="w-full sm:w-auto rounded-xl sm:rounded-2xl bg-[#16A34A] hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-3 sm:px-6 sm:py-3.5 shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CreditCard className="h-4 w-4" />
                        Bayar Tagihan Sekarang
                      </button>
                    </div>
                  )}

                  {/* Opsi Pelunasan Section (Transfer Bank & Bayar di Loket) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {/* Opsi 1: Transfer Bank / Virtual Account */}
                    <div className="rounded-xl sm:rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50/60 via-cyan-50/30 to-slate-50 p-4 sm:p-5 space-y-2.5 sm:space-y-3.5">
                      <div className="flex items-center gap-2 text-teal-800 font-extrabold text-xs">
                        <Landmark className="h-4 w-4 text-teal-600 shrink-0" />
                        OPSI A: Transfer Bank (Virtual Account)
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                        Bayar tagihan non tunai melalui Virtual Account bank pilihan Anda. Praktis dan pembayaran langsung terverifikasi otomatis.
                      </p>

                      <ul className="space-y-1.5">
                        <li className="flex items-start gap-2 text-[10px] sm:text-[11px] text-slate-600">
                          <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 mt-0.5 shrink-0" />
                          Sistem akan menerbitkan nomor Virtual Account atas nama Anda.
                        </li>
                        <li className="flex items-start gap-2 text-[10px] sm:text-[11px] text-slate-600">
                          <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 mt-0.5 shrink-0" />
                          Transfer melalui m-Banking, ATM, atau Internet Banking.
                        </li>
                        <li className="flex items-start gap-2 text-[10px] sm:text-[11px] text-slate-600">
                          <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 mt-0.5 shrink-0" />
                          Status invoice otomatis LUNAS begitu transfer diterima.
                        </li>
                        <li className="flex items-start gap-2 text-[10px] sm:text-[11px] text-slate-600">
                          <Clock className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
                          Nomor Virtual Account berlaku selama 24 jam.
                        </li>
                      </ul>

                      {paymentStatus === "paid" ? (
                        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 sm:p-3 text-xs text-[#16A34A] font-bold flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-[#16A34A] shrink-0" />
                          Pembayaran invoice telah dikonfirmasi lunas oleh backend.
                        </div>
                      ) : paymentStatus === "pending_cash" ? (
                        <div className="rounded-xl bg-amber-50 border border-amber-200 p-2.5 sm:p-3 text-xs text-[#D97706] font-bold flex items-center gap-2">
                          <Clock className="h-4 w-4 text-[#D97706] shrink-0" />
                          Menunggu konfirmasi kasir setelah pembayaran cash di loket.
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setPaymentMethod("va");
                            setShowPaymentModal(true);
                          }}
                          className="w-full rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs py-2 sm:py-2.5 shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Landmark className="h-4 w-4" />
                          Bayar via Transfer Bank
                        </button>
                      )}
                    </div>

                    {/* Opsi 2: Bayar Tunai di Loket */}
                    <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 space-y-2.5 sm:space-y-3.5">
                      <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xs">
                        <Banknote className="h-4 w-4 text-teal-600 shrink-0" />
                        OPSI B: Bayar Tunai di Loket Kasir
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                        Bayar tunai langsung di loket kasir faskes. Petugas akan memverifikasi pelunasan tagihan Anda di tempat.
                      </p>

                      <ul className="space-y-1.5">
                        <li className="flex items-start gap-2 text-[10px] sm:text-[11px] text-slate-600">
                          <ClipboardList className="h-3.5 w-3.5 text-teal-600 mt-0.5 shrink-0" />
                          Tunjukkan kode billing invoice di bawah ini kepada petugas kasir.
                        </li>
                        <li className="flex items-start gap-2 text-[10px] sm:text-[11px] text-slate-600">
                          <Clock className="h-3.5 w-3.5 text-teal-600 mt-0.5 shrink-0" />
                          Setelah dikonfirmasi kasir, status invoice diperbarui menjadi LUNAS.
                        </li>
                        <li className="flex items-start gap-2 text-[10px] sm:text-[11px] text-slate-600">
                          <PhoneCall className="h-3.5 w-3.5 text-teal-600 mt-0.5 shrink-0" />
                          Kendala pembayaran? Hubungi bagian informasi faskes.
                        </li>
                      </ul>

                      <div className="rounded-xl bg-white border border-slate-200 p-2.5 text-xs font-mono flex items-center justify-between text-slate-700">
                        <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase">Kode Billing RS:</span>
                        <span className="font-extrabold text-teal-800 text-xs sm:text-sm">{selectedInvoice?.id || "-"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl sm:rounded-3xl bg-slate-50/80 border border-slate-200/80 p-4 sm:p-5 mb-6 sm:mb-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <span className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-slate-200/60 text-slate-500 font-bold">
                      <Receipt className="h-4 w-4 sm:h-5 sm:w-5" />
                    </span>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800">Tahap Pelunasan Tagihan Belum Aktif</h4>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
                        Rincian tagihan & bukti pelunasan jasa medis akan otomatis muncul ketika dokumen berada di <span className="font-bold text-teal-800">Step 04: Dokumen Faktur & Pelunasan</span> (Status: Menunggu Pelunasan).
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveStage(4)}
                    className="w-full sm:w-auto rounded-xl border border-slate-300 bg-white hover:bg-slate-100 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-slate-700 transition shrink-0 cursor-pointer text-center"
                  >
                    Lihat Fase Pelunasan (Step 04) →
                  </button>
                </div>
              )}
        </div>
      )}



          {/* PAYMENT MODAL */}
          {showPaymentModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 font-bold">
                      <CreditCard className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">Konfirmasi Pembayaran</h3>
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
                    <span className="font-extrabold text-teal-800 text-sm">Rp {totalAmount.toLocaleString("id-ID")}</span>
                  </div>
                </div>

                {/* Select Method */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-700 block">Pilih Metode Pembayaran:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod("va")}
                      className={`rounded-2xl border p-3.5 text-left text-xs transition ${
                        paymentMethod === "va" ? "border-teal-600 bg-teal-50/50 font-bold text-teal-900" : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <Landmark className="h-5 w-5 text-teal-600 mb-1.5" />
                      Transfer Bank
                    </button>
                    <button
                      onClick={() => setPaymentMethod("cash")}
                      className={`rounded-2xl border p-3.5 text-left text-xs transition ${
                        paymentMethod === "cash" ? "border-teal-600 bg-teal-50/50 font-bold text-teal-900" : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <Banknote className="h-5 w-5 text-teal-600 mb-1.5" />
                      Bayar Cash di Loket
                    </button>
                  </div>
                </div>

                {paymentMethod === "va" && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                    <p className="text-xs font-bold text-slate-700">Pembayaran Transfer Bank</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Anda akan mendapatkan nomor Virtual Account. Transfer sesuai nominal tagihan melalui m-Banking, ATM, atau Internet Banking. Status invoice akan otomatis diperbarui setelah transfer diterima.
                    </p>
                  </div>
                )}

                {paymentMethod === "cash" && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                    <p className="text-xs font-bold text-slate-700">Pembayaran Cash di Loket</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Setelah Anda mengonfirmasi di sini, tunjukkan kode invoice kepada petugas kasir. Status invoice akan berubah menjadi menunggu konfirmasi kasir hingga pembayaran tunai Anda diverifikasi.
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 flex gap-3">
                  <button
                    onClick={handleProcessOnlinePayment}
                    disabled={isProcessingPayment || !paymentMethod}
                    className="w-full rounded-2xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs py-3 shadow-md transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isProcessingPayment ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" /> Memproses Pelunasan...
                      </>
                    ) : (
                      paymentMethod === "cash" ? "Konfirmasi Bayar Cash" : "Lanjutkan ke Transfer Bank"
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
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 border border-teal-100">
                      <RefreshCw className="h-8 w-8 text-teal-600 animate-spin" />
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
                        className="text-xs font-bold text-teal-700 underline underline-offset-2 cursor-pointer"
                      >
                        Tutup, saya cek nanti
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200">
                      <CheckCircle2 className="h-9 w-9 text-[#16A34A]" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-extrabold text-slate-900">Pembayaran Berhasil!</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Invoice <span className="font-mono font-bold text-slate-700">{paymentFlowInvoiceId}</span> telah lunas. Terima kasih.
                      </p>
                    </div>
                    <button
                      onClick={handleClosePaymentFlow}
                      className="w-full rounded-2xl bg-gradient-to-r from-teal-700 to-cyan-800 hover:from-teal-800 hover:to-cyan-900 text-white font-bold text-xs py-3 transition cursor-pointer"
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
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-800 font-bold text-xs">
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
                      <RefreshCw className="h-8 w-8 animate-spin text-teal-600 mb-3" />
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
                        <p className="text-teal-800 font-bold">VERIFIKASI BLOCKCHAIN & ENKRIPSI:</p>
                        <p className="text-slate-700">Tx Hash: <TxHashLink txHash={displaySelected.txHash} className="inline-flex items-center gap-1" title={displaySelected.txHash}><span>{displaySelected.txHash}</span></TxHashLink></p>
                        <p className="text-slate-500">Enkripsi: Off-chain AES-256 CBC Mode</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-6 border-t border-slate-100 mt-6 flex justify-end gap-3">
                    <button
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-700 to-cyan-800 hover:from-teal-800 hover:to-cyan-900 text-white px-5 py-2.5 text-xs font-bold shadow-sm transition cursor-pointer"
                    >
                      <Download className="h-4 w-4" /> Unduh Dokumen PDF
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}