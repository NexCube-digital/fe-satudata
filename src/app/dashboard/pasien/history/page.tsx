"use client";

import { Suspense } from "react";
import Link from "next/link";
import TxHashLink from "@/components/ui/TxHashLink";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { useAuth } from "@/hooks/use-auth";
import usePatientHistory from "@/hooks/patient/useHistory";
import {
  FileText,
  Download,
  Search,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ShieldCheck,
  Building2,
  Calendar,
  Stethoscope,
  CheckCircle,
  CheckCircle2,
  RefreshCw,
  ChevronRight,
  History,
  Database,
  XCircle,
  X
} from "lucide-react";

function PatientUnifiedHistoryContent() {
  const { user, handleLogout } = useAuth();
  const {
    loading,
    activeMainTab,
    records,
    searchTermRecords,
    setSearchTermRecords,
    hospitalFilter,
    setHospitalFilter,
    categoryFilter,
    setCategoryFilter,
    decryptedState,
    decryptedDetails,
    decryptingIds,
    selectedRecord,
    setSelectedRecord,
    requests,
    consentTab,
    setConsentTab,
    searchTermConsent,
    setSearchTermConsent,
    submittingId,
    auditLogs,
    filteredRecords,
    uniqueHospitals,
    historyRequestsList,
    filteredConsentHistory,
    changeTab,
    toggleDecryptRecord,
    handleOpenDetailModal,
    handleConsentAction
  } = usePatientHistory();

  if (loading) {
    return <LoadingScreen message="Memuat Riwayat Rekam Medis & Aktivitas..." fullScreen={false} />;
  }

  return (
    <div className="space-y-6">
      

      <div>
        

        <div className="space-y-6">
          {/* Header Banner */}
          <div className="hidden sm:block relative overflow-hidden rounded-3xl border border-teal-800/40 bg-gradient-to-r from-teal-900 via-teal-800 to-cyan-950 p-6 sm:p-8 text-white shadow-xl mb-8">
            <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-teal-600/15 blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1 text-xs font-semibold text-teal-200 mb-3">
                  <History className="h-3.5 w-3.5 text-teal-300" />
                  Pusat Riwayat & Ledger Audit Terpadu Pasien
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Riwayat Aktivitas & Medis
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                  Rekapitulasi riwayat rekam medis terenkripsi, log otorisasi hak akses faskes, serta audit trail blockchain dalam satu halaman terpadu.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-md text-xs font-mono">
                  <p className="text-[10px] text-slate-300 uppercase font-bold">Total Rekam Medis</p>
                  <p className="font-extrabold text-white text-base mt-0.5">{records.length} Berkas</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-md text-xs font-mono">
                  <p className="text-[10px] text-slate-300 uppercase font-bold">Otorisasi Disetujui</p>
                  <p className="font-bold text-[#16A34A] text-base mt-0.5">{requests.filter(r => r.status === "approved").length} Faskes</p>
                </div>
              </div>
            </div>
          </div>

          {/* UNIFIED TAB NAVIGATION BAR */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-1 sm:p-1.5 shadow-xs mb-4 sm:mb-8 grid grid-cols-3 gap-1">
            <button
              onClick={() => changeTab("records")}
              className={`py-2 px-1 sm:py-3 sm:px-4 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 cursor-pointer ${
                activeMainTab === "records"
                  ? "bg-gradient-to-r from-teal-700 to-cyan-800 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden sm:inline">Riwayat Rekam Medis</span>
              <span className="sm:hidden">Rekam Medis</span>
              <span className="text-[9px] sm:text-xs">({records.length})</span>
            </button>

            <button
              onClick={() => changeTab("consent")}
              className={`py-2 px-1 sm:py-3 sm:px-4 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 cursor-pointer ${
                activeMainTab === "consent"
                  ? "bg-gradient-to-r from-teal-700 to-cyan-800 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden sm:inline">Riwayat Otorisasi</span>
              <span className="sm:hidden">Otorisasi</span>
              <span className="text-[9px] sm:text-xs">({historyRequestsList.length})</span>
            </button>

            <button
              onClick={() => changeTab("audit")}
              className={`py-2 px-1 sm:py-3 sm:px-4 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 cursor-pointer ${
                activeMainTab === "audit"
                  ? "bg-gradient-to-r from-teal-700 to-cyan-800 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Database className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden sm:inline">Audit Trail Blockchain</span>
              <span className="sm:hidden">Audit Trail</span>
              <span className="text-[9px] sm:text-xs">({auditLogs.length})</span>
            </button>
          </div>

          {/* TAB 1: RIWAYAT REKAM MEDIS */}
          {activeMainTab === "records" && (
            <div className="space-y-4 sm:space-y-6 animate-fade-in">
              {/* Search & Filter Bar */}
              <div className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 p-3 sm:p-4 shadow-xs space-y-2.5 sm:space-y-3">
                {/* Search Bar */}
                <div className="relative w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-700 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Cari RS, Dokter, atau Diagnosa..."
                    value={searchTermRecords}
                    onChange={(e) => setSearchTermRecords(e.target.value)}
                    className="w-full rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50/60 pl-10 pr-9 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-teal-600 focus:bg-white focus:outline-hidden transition shadow-2xs font-medium"
                  />
                  {searchTermRecords && (
                    <button
                      onClick={() => setSearchTermRecords("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Dropdowns Grid: 2 columns side-by-side on mobile */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {/* Hospital Filter */}
                  <div className="relative">
                    <select
                      value={hospitalFilter}
                      onChange={(e) => setHospitalFilter(e.target.value)}
                      className="w-full appearance-none rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50/60 pl-3 pr-7 py-2 text-[11px] sm:text-xs font-bold text-slate-700 focus:border-teal-600 focus:bg-white focus:outline-hidden transition truncate cursor-pointer"
                    >
                      <option value="all">Semua RS ({uniqueHospitals.length || records.length})</option>
                      {uniqueHospitals.map((h, i) => (
                        <option key={i} value={h}>{h}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div className="relative">
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full appearance-none rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50/60 pl-3 pr-7 py-2 text-[11px] sm:text-xs font-bold text-slate-700 focus:border-teal-600 focus:bg-white focus:outline-hidden transition truncate cursor-pointer"
                    >
                      <option value="all">Semua Kategori</option>
                      <option value="umum">Pemeriksaan Umum</option>
                      <option value="resep">Resep & Obat</option>
                      <option value="lab">Laboratorium</option>
                      <option value="radiologi">Radiologi</option>
                    </select>
                    <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Reset Active Filter Bar */}
                {(searchTermRecords || hospitalFilter !== "all" || categoryFilter !== "all") && (
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-500">
                    <span className="font-medium text-teal-800">
                      Menampilkan <strong className="font-extrabold">{filteredRecords.length}</strong> hasil pencarian
                    </span>
                    <button
                      onClick={() => {
                        setSearchTermRecords("");
                        setHospitalFilter("all");
                        setCategoryFilter("all");
                      }}
                      className="font-bold text-[#DC2626] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <X className="h-3 w-3" /> Reset Filter
                    </button>
                  </div>
                )}
              </div>

              {/* Records List Container */}
              <div className="space-y-3 sm:space-y-4">
                {filteredRecords.length === 0 ? (
                  <div className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 p-8 sm:p-12 text-center shadow-xs">
                    <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-slate-300 mx-auto mb-2.5" />
                    <p className="text-xs sm:text-sm font-extrabold text-slate-700">Tidak Ada Rekam Medis Ditemukan</p>
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter rumah sakit Anda.</p>
                  </div>
                ) : (
                  filteredRecords.map((rec) => {
                    const isDecrypted = decryptedState[rec.id];
                    const isDecrypting = decryptingIds[rec.id];
                    const displayRec = decryptedDetails[rec.id] || rec;

                    return (
                      <div
                        key={rec.id}
                        className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 p-3.5 sm:p-6 shadow-xs hover:border-teal-300 hover:shadow-md transition-all duration-200"
                      >
                        {/* Header Info */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 border-b border-slate-100 pb-3 sm:pb-4 mb-3 sm:mb-4">
                          <div className="flex items-start gap-2.5 sm:gap-3.5 min-w-0">
                            <span className="flex h-9 w-9 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-teal-50 border border-teal-200 font-bold text-teal-800 text-xs sm:text-sm shadow-2xs">
                              {rec.hospitalName.substring(0, 2).toUpperCase()}
                            </span>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                <h3 className="text-xs sm:text-base font-extrabold text-slate-900 truncate">{rec.hospitalName}</h3>
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] sm:text-[10px] font-mono font-bold text-slate-600 border border-slate-200 shrink-0">
                                  {rec.hospitalCode}
                                </span>
                                <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-teal-800 border border-teal-200 uppercase shrink-0">
                                  {rec.category}
                                </span>
                                <span className="rounded-full bg-emerald-50 text-[#16A34A] border border-emerald-200 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold shrink-0 inline-flex items-center gap-1">
                                  <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-[#16A34A]" /> SELESAI & LUNAS
                                </span>
                              </div>
                              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 flex items-center gap-1 sm:gap-1.5 truncate">
                                <Stethoscope className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400 shrink-0" />
                                {rec.doctorName} <span className="text-slate-300">•</span> {rec.specialty}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between text-[10px] sm:text-xs text-slate-500 font-mono shrink-0">
                            <span className="flex items-center gap-1 text-slate-600 font-bold">
                              <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400" /> {rec.date}
                            </span>
                            <span className="text-[9px] sm:text-[10px] text-slate-400 sm:mt-0.5">{rec.time}</span>
                          </div>
                        </div>

                        {/* Content Preview Box */}
                        <div className="mb-3 sm:mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                              {isDecrypted ? "Data Rekam Medis (Terdekripsi AES-256)" : "Ciphertext Terenkripsi"}
                            </span>

                            <button
                              onClick={() => toggleDecryptRecord(rec.id)}
                              disabled={isDecrypting}
                              className="inline-flex items-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-2.5 py-1 text-[10px] sm:text-xs font-bold text-slate-700 transition cursor-pointer disabled:opacity-50"
                            >
                              {isDecrypting ? (
                                <>
                                  <RefreshCw className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin text-teal-700" /> Mendekripsi...
                                </>
                              ) : isDecrypted ? (
                                <>
                                  <EyeOff className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-teal-800" /> Sembunyikan Data
                                </>
                              ) : (
                                <>
                                  <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#16A34A]" /> Dekripsi Rekam Medis
                                </>
                              )}
                            </button>
                          </div>

                          {isDecrypting ? (
                            <div className="rounded-xl sm:rounded-2xl bg-slate-50 p-4 sm:p-6 flex flex-col items-center justify-center border border-slate-200">
                              <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-teal-800 mb-1.5" />
                              <p className="text-[11px] sm:text-xs font-bold text-slate-500">Mendekripsi data rekam medis dengan Kunci Privat Anda...</p>
                            </div>
                          ) : isDecrypted ? (() => {
                            return (
                              <div className="rounded-xl sm:rounded-2xl bg-teal-50/40 border border-teal-100 p-3.5 sm:p-5 text-slate-800 shadow-xs animate-fade-in space-y-3 sm:space-y-4 text-xs">
                                <div className="border-b border-teal-100 pb-2.5 sm:pb-3">
                                  <p className="text-teal-800 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider mb-0.5 sm:mb-1">Diagnosa Utama:</p>
                                  <p className="text-xs sm:text-sm font-extrabold text-slate-900">{displayRec.diagnosis}</p>
                                </div>

                                {displayRec.vitals && (
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 bg-white/90 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-teal-100/50 text-[10px] sm:text-[11px] font-mono">
                                    <div>
                                      <span className="text-teal-800 block text-[8.5px] sm:text-[9px] font-bold">Tekanan Darah</span>
                                      <span className="font-bold text-slate-800">{displayRec.vitals.bp}</span>
                                    </div>
                                    <div>
                                      <span className="text-teal-800 block text-[8.5px] sm:text-[9px] font-bold">Nadi</span>
                                      <span className="font-bold text-slate-800">{displayRec.vitals.pulse}</span>
                                    </div>
                                    <div>
                                      <span className="text-teal-800 block text-[8.5px] sm:text-[9px] font-bold">Suhu Tubuh</span>
                                      <span className="font-bold text-slate-800">{displayRec.vitals.temp}</span>
                                    </div>
                                    <div>
                                      <span className="text-teal-800 block text-[8.5px] sm:text-[9px] font-bold">Berat Badan</span>
                                      <span className="font-bold text-slate-800">{displayRec.vitals.weight}</span>
                                    </div>
                                  </div>
                                )}

                                {displayRec.prescriptions && displayRec.prescriptions.length > 0 && (
                                  <div>
                                    <p className="text-teal-800 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider mb-1.5 sm:mb-2">Resep Obat & Aturan Pakai:</p>
                                    <div className="space-y-1 sm:space-y-1.5">
                                      {displayRec.prescriptions.map((rx, idx) => (
                                        <div key={idx} className="flex items-center justify-between rounded-md sm:rounded-lg bg-white/90 px-2.5 py-1 sm:px-3 sm:py-1.5 border border-teal-100/40 text-[11px]">
                                          <span className="font-bold text-slate-800">{rx.medicine}</span>
                                          <span className="text-[9.5px] sm:text-[10px] text-slate-500 font-medium">{rx.dosage}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div>
                                  <p className="text-teal-800 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider mb-1">Catatan Dokter:</p>
                                  <p className="text-slate-700 leading-relaxed text-[10px] sm:text-[11px] bg-white/90 p-2 sm:p-2.5 rounded-md sm:rounded-lg border border-teal-100/40 whitespace-pre-line">{displayRec.notes}</p>
                                </div>
                              </div>
                            );
                          })() : null}
                        </div>

                        {/* Record Footer */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 text-xs pt-2.5 sm:pt-3 border-t border-slate-100 min-w-0">
                          <div className="font-mono text-[9px] sm:text-[10px] text-slate-500 min-w-0">
                            Blockchain Tx Hash:{" "}
                            {rec.txHash ? (
                              <TxHashLink txHash={rec.txHash} className="text-teal-800 font-bold font-mono inline-flex items-center gap-1 max-w-full" title={rec.txHash}>
                                <span className="truncate max-w-[130px] xs:max-w-[200px] sm:max-w-[280px]">{rec.txHash}</span>
                              </TxHashLink>
                            ) : (
                              <span className="text-slate-400 font-sans italic">Belum ada (Pending Blockchain)</span>
                            )}
                          </div>

                          <button
                            onClick={() => handleOpenDetailModal(rec)}
                            className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-teal-800 hover:text-teal-900 cursor-pointer shrink-0 self-start sm:self-auto"
                          >
                            Detail Lengkap & Audit Trail <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: RIWAYAT OTORISASI AKSES */}
          {activeMainTab === "consent" && (
            <div className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-6 animate-fade-in">
              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2.5 sm:gap-4 border-b border-slate-100 pb-3 sm:pb-4">
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5 sm:gap-2">
                    <ShieldCheck className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-teal-800 shrink-0" />
                    Riwayat & Status Persetujuan ({historyRequestsList.length})
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">Daftar izin akses yang telah Anda putuskan sebelumnya.</p>
                </div>

                <div className="flex items-center gap-1 shrink-0 self-start xs:self-auto">
                  <button
                    onClick={() => setConsentTab("all")}
                    className={`px-2.5 py-1 rounded-md sm:rounded-lg text-[9px] sm:text-[10px] font-bold transition cursor-pointer ${
                      consentTab === "all" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    onClick={() => setConsentTab("approved")}
                    className={`px-2.5 py-1 rounded-md sm:rounded-lg text-[9px] sm:text-[10px] font-bold transition cursor-pointer ${
                      consentTab === "approved" ? "bg-[#16A34A] text-white" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Aktif
                  </button>
                  <button
                    onClick={() => setConsentTab("revoked")}
                    className={`px-2.5 py-1 rounded-md sm:rounded-lg text-[9px] sm:text-[10px] font-bold transition cursor-pointer ${
                      consentTab === "revoked" ? "bg-[#DC2626] text-white" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Dicabut
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchTermConsent}
                  onChange={(e) => setSearchTermConsent(e.target.value)}
                  placeholder="Cari dalam histori otorisasi..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-teal-600 focus:outline-hidden bg-slate-50/50"
                />
              </div>

              <div className="space-y-3 sm:space-y-4">
                {filteredConsentHistory.length === 0 ? (
                  <div className="rounded-xl sm:rounded-2xl bg-slate-50/50 border border-slate-100 p-6 sm:p-8 text-center">
                    <Building2 className="h-7 w-7 sm:h-8 sm:w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-500">Histori Otorisasi Kosong</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Tidak ada riwayat izin akses yang sesuai filter.</p>
                  </div>
                ) : (
                  filteredConsentHistory.map((req) => (
                    <div
                      key={req.id}
                      className="rounded-xl sm:rounded-2xl border border-slate-200/90 p-3.5 sm:p-4 transition-all duration-200 hover:border-teal-300 hover:shadow-xs bg-white"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-2.5 sm:mb-3">
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                          <span className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 text-xs shadow-2xs">
                            {req.hospitalName.charAt(0)}{req.hospitalName.charAt(3)}
                          </span>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{req.hospitalName}</h4>
                              <span className="text-[9px] sm:text-[10px] font-mono text-slate-400">({req.hospitalCode})</span>
                            </div>
                            <p className="text-[11px] sm:text-xs text-slate-500 truncate">{req.department}</p>
                          </div>
                        </div>

                        <div className="shrink-0 self-start sm:self-auto">
                          {req.status === "approved" && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold text-[#16A34A]">
                              <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#16A34A]" />
                              Akses Disetujui
                            </span>
                          )}
                          {(req.status === "revoked" || req.status === "rejected") && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold text-[#DC2626]">
                              <Lock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#DC2626]" />
                              Izin Akses Dicabut
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Request description */}
                      <div className="rounded-lg sm:rounded-xl border border-slate-100 bg-slate-50 p-2 sm:p-2.5 mb-2.5 sm:mb-3 text-[9.5px] sm:text-[10px] text-slate-500">
                        <span className="text-slate-400 block">Keterangan Pengajuan Data:</span>
                        <span className="font-bold text-slate-700 whitespace-pre-line">{req.requestDescription}</span>
                      </div>

                      {/* Actions */}
                      <div className="border-t border-slate-100 pt-2.5 sm:pt-3 mt-2.5 sm:mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 text-xs min-w-0">
                        <div className="font-mono text-[9px] text-slate-400 min-w-0">
                          Tx Hash: <TxHashLink txHash={req.txHash} className="text-teal-800 font-bold inline-flex items-center gap-1 max-w-full" title={req.txHash}><span className="truncate max-w-[130px] xs:max-w-[200px] sm:max-w-[280px]">{req.txHash}</span></TxHashLink>
                        </div>

                        <div className="shrink-0 w-full sm:w-auto">
                          {req.status === "approved" && (
                            <button
                              onClick={() => handleConsentAction(req.id, "revoked")}
                              disabled={submittingId === req.id}
                              className="rounded-lg sm:rounded-xl bg-red-50 border border-red-200 text-[#DC2626] hover:bg-red-100 px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 w-full sm:w-auto"
                            >
                              {submittingId === req.id ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
                              Cabut Akses
                            </button>
                          )}

                          {req.status === "revoked" && (
                            <div className="rounded-lg sm:rounded-xl border border-slate-200 bg-slate-100 px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-[11px] font-bold text-slate-500 flex items-center justify-center gap-1.5 w-full sm:w-auto">
                              <Lock className="h-3.5 w-3.5" />
                              Izin Telah Nonaktif
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: AUDIT TRAIL BLOCKCHAIN STREAM */}
          {activeMainTab === "audit" && (
            <div className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-6 animate-fade-in">
              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2.5 sm:gap-3 border-b border-slate-100 pb-3 sm:pb-4">
                <div>
                  <h3 className="text-xs sm:text-base font-extrabold text-slate-900 flex items-center gap-1.5 sm:gap-2">
                    <Database className="h-4 w-4 sm:h-5 sm:w-5 text-teal-800 shrink-0" />
                    Console Audit Trail Blockchain Real-time ({auditLogs.length})
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                    Seluruh mutasi hak akses, dekripsi rekam medis, dan aksi transaksi terikat secara tak-terubahkan (immutable) pada ledger blockchain.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-[11px] font-bold text-[#16A34A] self-start xs:self-auto shrink-0">
                  <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-[#16A34A] animate-ping" />
                  Ledger Sync Active
                </span>
              </div>

              <div className="space-y-2.5 sm:space-y-3">
                {auditLogs.length === 0 ? (
                  <div className="rounded-xl sm:rounded-2xl bg-slate-50/50 border border-slate-100 p-6 sm:p-8 text-center">
                    <Database className="h-7 w-7 sm:h-8 sm:w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-500">Belum Ada Aktivitas Audit Trail</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Setiap mutasi akses dan pelunasan transaksi akan tercatat otomatis pada ledger.</p>
                  </div>
                ) : (
                  auditLogs.map((log) => (
                    <div key={log.id} className="rounded-xl sm:rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3 sm:p-4 text-xs hover:border-teal-200 hover:bg-white transition shadow-2xs space-y-1.5 sm:space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className={`font-extrabold text-[11px] sm:text-xs flex items-center gap-1.5 ${log.status === "success" ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
                          {log.status === "success" ? <CheckCircle2 className="h-3.5 w-3.5 text-[#16A34A]" /> : <XCircle className="h-3.5 w-3.5 text-[#DC2626]" />}
                          {log.action}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">{log.timestamp}</span>
                      </div>
                      <p className="text-slate-700 font-semibold text-[11px] sm:text-xs leading-relaxed">{log.hospital}</p>
                      <div className="pt-1.5 border-t border-slate-200/50 flex flex-wrap items-center justify-between gap-2 text-[9px] sm:text-[10px] font-mono text-slate-500">
                        <span>Blockchain Tx Hash:</span>
                        <TxHashLink txHash={log.txHash} className="text-teal-800 font-bold font-mono inline-flex items-center gap-1" title={log.txHash}>
                          <span className="truncate max-w-[140px] xs:max-w-[220px] sm:max-w-[340px]">{log.txHash}</span>
                        </TxHashLink>
                      </div>
                    </div>
                  ))
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
                      className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  {isModalDecrypting ? (
                    <div className="py-12 flex flex-col items-center justify-center">
                      <RefreshCw className="h-8 w-8 animate-spin text-teal-800 mb-3" />
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
                        <p className="text-slate-700 min-w-0">Tx Hash: <TxHashLink txHash={displaySelected.txHash} className="inline-flex items-center gap-1 max-w-full" title={displaySelected.txHash}><span className="truncate max-w-[200px] sm:max-w-[320px]">{displaySelected.txHash}</span></TxHashLink></p>
                        <p className="text-slate-500">Enkripsi: Off-chain AES-256 CBC Mode</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-6 border-t border-slate-100 mt-6 flex justify-end gap-3">
                    <button
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-700 to-cyan-800 text-white px-5 py-2.5 text-xs font-bold shadow-sm hover:from-teal-800 hover:to-cyan-900 transition cursor-pointer"
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

export default function PatientUnifiedHistoryPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Memuat Riwayat Kesehatan..." fullScreen={false} />}>
      <PatientUnifiedHistoryContent />
    </Suspense>
  );
}
