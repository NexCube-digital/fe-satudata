"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import TxHashLink from "@/components/ui/TxHashLink";
import PrescriptionList from "@/components/PrescriptionList";
import {
  FileText,
  Plus,
  Search,
  RefreshCw,
  X,
  Hash,
  User,
  Stethoscope,
  CalendarDays,
  FileText as FileTextIcon,
  Paperclip,
  Download,
  Pencil,
  Inbox,
  ChevronRight,
} from "lucide-react";
import { getHospitalMedicalRecords } from "@/services/hospitalService";

// Label tampilan untuk tiap jenis detail rekam medis
const DETAIL_TYPE_LABELS = {
  umum: "Pemeriksaan Umum",
  lab: "Laboratorium",
  radiologi: "Radiologi",
  resep: "Resep",
};

// Label field per jenis detail, biar ga nampilin key mentah (mis. "note_doctor")
const DETAIL_FIELD_LABELS = {
  umum: {
    complaint: "Keluhan",
    diagnosis: "Diagnosis",
    action: "Tindakan",
    note_doctor: "Catatan Dokter",
  },
  lab: {
    examination_type: "Jenis Pemeriksaan",
    checkup_result: "Hasil Pemeriksaan",
    reference_values: "Nilai Rujukan",
    conclusion: "Kesimpulan",
  },
  radiologi: {
    examination_type: "Jenis Pemeriksaan",
    checkup_result: "Hasil Pemeriksaan",
    conclusion: "Kesimpulan",
  },
  resep: {
    list_of_medicines: "Daftar Obat",
    note: "Catatan",
  },
};

function formatRecordType(recordType) {
  if (!recordType) return "-";
  return recordType
    .split(",")
    .map((t) => DETAIL_TYPE_LABELS[t.trim()] || t.trim().toUpperCase())
    .join(", ");
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }) {
  const isDraft = status === "draft";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ${
        isDraft
          ? "bg-amber-50 text-amber-700 border border-amber-200"
          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
      }`}
    >
      {status || "FINAL"}
    </span>
  );
}

// Potong hash jadi "depan...belakang" biar baris tabel/kartu tetap rapi.
function shortenHash(hash, head = 14, tail = 8) {
  if (!hash || hash.length <= head + tail + 3) return hash;
  return `${hash.slice(0, head)}...${hash.slice(-tail)}`;
}

function TxHashPill({ txHash, compact = false, truncate = true }) {
  if (!txHash) {
    return <span className="text-xs text-slate-400 font-medium italic">Off-Chain</span>;
  }
  return (
    <TxHashLink
      txHash={txHash}
      className={`font-mono font-bold text-rose-900 bg-linear-to-r from-rose-50 via-rose-100 to-rose-50 border border-rose-300 shadow-sm rounded-xl inline-flex items-center gap-1 max-w-full ${
        compact ? "text-[10px] px-2.5 py-1" : "text-xs px-3 py-1.5"
      } ${truncate ? "whitespace-nowrap" : "whitespace-normal break-all"}`}
      title={txHash}
    >
      <span className="tracking-[0.03em] leading-tight">
        {truncate ? shortenHash(txHash, 14, 8) : txHash}
      </span>
    </TxHashLink>
  );
}

export default function FaskesMedicalRecordsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [recordStages, setRecordStages] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem("activePatientStage");
    if (saved) {
      const stageVal = parseInt(saved, 10);
      setRecordStages((prev) => ({ 1: stageVal, ...prev }));
    }
  }, []);

  const handleStageChange = (recordId, newStage) => {
    setRecordStages((prev) => ({ ...prev, [recordId]: newStage }));
    localStorage.setItem("activePatientStage", newStage.toString());
    window.dispatchEvent(new Event("storage"));
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Invalid user data", e);
      }
    }

    fetchRecords().finally(() => setLoading(false));
  }, []);

  const fetchRecords = async () => {
    try {
      const result = await getHospitalMedicalRecords();
      if (result?.success && Array.isArray(result.data)) {
        const mapped = result.data.map((item) => ({
          id: item.id,
          patientId: item.patient?.id ?? item.user_id ?? null,
          patientName: item.patient?.name || "Pasien Tidak Diketahui",
          recordType: item.record_type,
          title: item.title,
          visitDate: item.visit_date,
          status: item.status,
          doctorName: item.doctor?.name || "-",
          doctorSpecialist: item.doctor?.specialist || "-",
          summary: item.summary || null,
          detail: item.detail || {},
          attachments: item.attachments || [],
          dataHash: item.data_hash,
          txHash: item.tx_hash || null,
          decryptError: item.decryptError || null,
        }));
        setRecords(mapped);
        setPagination(result.pagination || null);
      } else {
        setRecords([]);
      }
    } catch (err) {
      console.error("Error fetching medical records", err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRecords();
    setRefreshing(false);
  };

  // Filter dihitung langsung dari records + searchTerm, jadi selalu konsisten
  // walau data di-refresh sementara ada keyword pencarian aktif.
  const keyword = searchTerm.trim().toLowerCase();
  const filteredRecords = keyword
    ? records.filter((rec) =>
        [rec.patientName, rec.title, rec.recordType, rec.doctorName, rec.txHash]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(keyword)
      )
    : records;

  const draftCount = records.filter((r) => r.status === "draft").length;
  const onChainCount = records.filter((r) => r.txHash).length;
  const offChainCount = records.length - onChainCount;

  const openRecordDetail = (record) => setSelectedRecord(record);
  const closeRecordDetail = () => setSelectedRecord(null);
  const goToEditDraft = (recordId) => router.push(`/dashboard/faskes/medical-records/${recordId}/edit`);

  const handleDownloadPdf = (record) => {
    setSelectedRecord(record);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // Draft -> langsung ke wizard edit (lebih berguna daripada modal view karena
  // datanya memang belum lengkap). Final -> tetap buka modal detail seperti biasa.
  const handleRowActivate = (record) => {
    if (record.status === "draft") {
      goToEditDraft(record.id);
      return;
    }
    openRecordDetail(record);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">
        <RefreshCw className="h-8 w-8 animate-spin text-rose-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#faf7f2] via-[#fdfbf7] to-[#f5efe6] flex flex-col pb-16 md:pb-0">
      <Navbar user={user} roleLabel="Fasilitas Kesehatan" onLogout={() => router.push("/auth/login")} />
      <div className="flex flex-1">
        <Sidebar role="faskes" />
        <main className="flex-1 min-w-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
          {/* Header */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6 sm:mb-8">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.3em] text-rose-700 font-bold">Dashboard Faskes</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">Direktori Rekam Medis</h1>
              <p className="max-w-2xl text-sm text-slate-500 mt-1.5">
                Daftar seluruh rekam medis yang telah diunggah dan terenkripsi.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 shrink-0 ${refreshing ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard/faskes/medical-records/upload")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-800 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-rose-700 transition cursor-pointer"
              >
                <Plus className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Upload Rekam Medis Baru</span>
                <span className="sm:hidden">Upload</span>
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-white border border-slate-200/80 p-4 sm:p-6 shadow-xs">
            <section className="space-y-5">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-bold text-slate-900">Arsip Rekam Medis</h3>
                <span className="text-xs text-slate-500">
                  {filteredRecords.length} data ditemukan
                  {pagination ? ` dari ${pagination.total} total` : ""}
                </span>
              </div>

              {/* Search + stat pills */}
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="relative flex-1 md:max-w-sm">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari pasien, judul, tx hash..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-9 py-3 text-sm text-slate-800 focus:border-rose-700 focus:outline-none"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      aria-label="Hapus pencarian"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 border border-amber-100 whitespace-nowrap">
                    {draftCount} Draft
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 border border-rose-100 whitespace-nowrap">
                    {onChainCount} On-chain
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200 whitespace-nowrap">
                    {offChainCount} Off-chain
                  </span>
                </div>
              </div>

              {filteredRecords.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-slate-200 bg-slate-50 py-14 text-center text-slate-500">
                  <Inbox className="h-8 w-8 text-slate-300" />
                  <p className="text-sm font-medium px-4">
                    {keyword ? "Tidak ada rekam medis yang cocok dengan pencarian." : "Belum ada rekam medis."}
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop besar & sedang: table 6 kolom ringkas */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-y-3 text-left text-sm">
                      <thead>
                        <tr className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          <th className="px-4 py-2 font-semibold whitespace-nowrap">Visit Date</th>
                          <th className="px-4 py-2 font-semibold">Pasien</th>
                          <th className="px-4 py-2 font-semibold">Judul & Tx Hash</th>
                          <th className="px-4 py-2 font-semibold">Jenis</th>
                          <th className="px-4 py-2 font-semibold">Status</th>
                          <th className="px-4 py-2 font-semibold text-right">Tombol Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRecords.map((item) => {
                          const isDraft = item.status === "draft";
                          return (
                            <tr
                              key={item.id}
                              className="group cursor-pointer"
                              onClick={() => handleRowActivate(item)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  handleRowActivate(item);
                                }
                              }}
                            >
                              <td className="px-4 py-4 text-slate-700 whitespace-nowrap bg-slate-50 group-hover:bg-slate-100 transition rounded-l-2xl border-y border-l border-slate-200/80">
                                {formatDate(item.visitDate)}
                              </td>
                              <td className="px-4 py-4 font-bold text-slate-900 bg-slate-50 group-hover:bg-slate-100 transition border-y border-slate-200/80 max-w-[150px] truncate">
                                {item.patientName}
                              </td>
                              <td className="px-4 py-4 bg-slate-50 group-hover:bg-slate-100 transition border-y border-slate-200/80">
                                <div className="flex flex-col gap-1.5 min-w-0">
                                  <span className="font-bold text-slate-900 truncate max-w-[280px]" title={item.title}>
                                    {item.title || "-"}
                                  </span>
                                  <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                                    <TxHashPill txHash={item.txHash} compact />
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-slate-700 bg-slate-50 group-hover:bg-slate-100 transition border-y border-slate-200/80 whitespace-nowrap">
                                {formatRecordType(item.recordType)}
                              </td>
                              <td className="px-4 py-4 bg-slate-50 group-hover:bg-slate-100 transition border-y border-slate-200/80">
                                <StatusBadge status={item.status} />
                              </td>
                              <td className="px-4 py-4 text-right bg-slate-50 group-hover:bg-slate-100 transition rounded-r-2xl border-y border-r border-slate-200/80">
                                {isDraft ? (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      goToEditDraft(item.id);
                                    }}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-amber-700 transition cursor-pointer whitespace-nowrap shadow-2xs"
                                  >
                                    <Pencil className="h-3.5 w-3.5" /> Lanjutkan Draft
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownloadPdf(item);
                                    }}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-rose-800 hover:bg-rose-900 text-white px-3.5 py-2 text-xs font-bold transition cursor-pointer whitespace-nowrap shadow-2xs"
                                  >
                                    <Download className="h-3.5 w-3.5" /> Download PDF
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile & tablet (< lg): stacked cards */}
                  <div className="lg:hidden space-y-3">
                    {filteredRecords.map((item) => {
                      const isDraft = item.status === "draft";
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleRowActivate(item)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleRowActivate(item);
                            }
                          }}
                          className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 space-y-3 active:bg-slate-100 transition cursor-pointer"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate">{item.patientName}</p>
                              <p className="text-xs font-semibold text-slate-700 mt-0.5">{item.title || "-"}</p>
                            </div>
                            <StatusBadge status={item.status} />
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                            <span className="inline-flex items-center gap-1">
                              <CalendarDays className="h-3.5 w-3.5 text-slate-400" /> {formatDate(item.visitDate)}
                            </span>
                            <span className="font-medium text-slate-500">{formatRecordType(item.recordType)}</span>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
                            <div onClick={(e) => e.stopPropagation()} className="min-w-0">
                              <TxHashPill txHash={item.txHash} compact />
                            </div>
                            {isDraft ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  goToEditDraft(item.id);
                                }}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700 transition cursor-pointer whitespace-nowrap"
                              >
                                <Pencil className="h-3.5 w-3.5" /> Lanjutkan
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadPdf(item);
                                }}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-800 hover:bg-rose-900 text-white px-3 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap shadow-2xs"
                              >
                                <Download className="h-3.5 w-3.5" /> Download PDF
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </section>
          </div>
        </main>
      </div>

      {selectedRecord && (
        <div
          className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto"
          onClick={closeRecordDetail}
        >
          <div
            className="w-full max-w-2xl my-6 sm:my-0 max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 bg-linear-to-r from-rose-800 via-rose-700 to-red-800 px-5 sm:px-6 py-5 text-white">
              <button
                type="button"
                onClick={closeRecordDetail}
                className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 transition cursor-pointer"
                aria-label="Tutup detail rekam medis"
                title="Tutup"
              >
                <X className="h-4 w-4" />
              </button>
              <p className="text-[10px] uppercase tracking-[0.3em] text-rose-200 font-bold">Detail Rekam Medis</p>
              <h3 className="mt-2 text-xl sm:text-2xl font-extrabold tracking-tight pr-10 break-words">
                {selectedRecord.patientName}
              </h3>
              <p className="mt-1 text-xs text-rose-100 break-words">{selectedRecord.title}</p>
            </div>

            <div className="p-5 sm:p-6 space-y-4 text-sm">
              {selectedRecord.decryptError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                  {selectedRecord.decryptError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" /> Pasien
                  </p>
                  <p className="mt-1.5 font-semibold text-slate-900 break-words">{selectedRecord.patientName}</p>
                  <p className="text-xs text-slate-500">ID Pasien: {selectedRecord.patientId ?? "-"}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold flex items-center gap-1.5">
                    <Stethoscope className="h-3.5 w-3.5" /> Dokter
                  </p>
                  <p className="mt-1.5 font-semibold text-slate-900 break-words">{selectedRecord.doctorName}</p>
                  <p className="text-xs text-slate-500">{selectedRecord.doctorSpecialist}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 xs:grid-cols-3 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" /> Visit Date
                  </p>
                  <p className="mt-1.5 font-semibold text-slate-900">{formatDate(selectedRecord.visitDate)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold flex items-center gap-1.5">
                    <FileTextIcon className="h-3.5 w-3.5" /> Jenis
                  </p>
                  <p className="mt-1.5 font-semibold text-slate-900">{formatRecordType(selectedRecord.recordType)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold flex items-center gap-1.5">
                    <Hash className="h-3.5 w-3.5" /> Status
                  </p>
                  <p className="mt-1.5 font-semibold text-slate-900 capitalize">{selectedRecord.status || "-"}</p>
                </div>
              </div>

              {selectedRecord.summary && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">Ringkasan</p>
                  <p className="mt-1.5 text-slate-700 whitespace-pre-line break-words">{selectedRecord.summary}</p>
                </div>
              )}

              {Object.keys(selectedRecord.detail || {}).length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">Detail Pemeriksaan</p>
                  {Object.entries(selectedRecord.detail).map(([type, fields]) => {
                    if (!fields) return null;
                    const fieldLabels = DETAIL_FIELD_LABELS[type] || {};
                    const entries = Object.entries(fields).filter(
                      ([key, val]) => !["id", "medical_record_id", "created_at", "updated_at"].includes(key) && val
                    );
                    if (entries.length === 0) return null;
                    return (
                      <div key={type} className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4">
                        <p className="text-xs font-bold text-rose-800 uppercase tracking-wide">
                          {DETAIL_TYPE_LABELS[type] || type}
                        </p>
                        <div className="mt-2.5 space-y-3">
                          {entries.map(([key, val]) => {
                            // PERBAIKAN: field "list_of_medicines" pada resep berisi string JSON
                            // (array obat), bukan teks biasa -- jangan di-String() mentah,
                            // render pakai PrescriptionList supaya rapi (nama, jumlah, aturan pakai).
                            const isMedicinesField = type === "resep" && key === "list_of_medicines";

                            return (
                              <div key={key}>
                                <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-1.5">
                                  {fieldLabels[key] || key}
                                </p>
                                {isMedicinesField ? (
                                  <PrescriptionList rawListOfMedicines={val} />
                                ) : (
                                  <p className="text-slate-700 whitespace-pre-line break-words">{String(val)}</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedRecord.attachments.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold flex items-center gap-1.5">
                    <Paperclip className="h-3.5 w-3.5" /> Lampiran ({selectedRecord.attachments.length})
                  </p>
                  <ul className="mt-2.5 space-y-2">
                    {selectedRecord.attachments.map((att) => (
                      <li
                        key={att.id}
                        className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2"
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                          <span className="truncate text-slate-700" title={att.fileName}>
                            {att.fileName}
                          </span>
                        </span>
                        <a
                          href={att.filePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 hover:text-rose-800 shrink-0"
                        >
                          <Download className="h-3.5 w-3.5" /> Unduh
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5" /> Blockchain Tx Hash
                </p>
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <TxHashPill txHash={selectedRecord.txHash} />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-4">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 rounded-2xl bg-rose-800 hover:bg-rose-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                >
                  <Download className="h-4 w-4" /> Unduh Dokumen PDF
                </button>
                <button
                  type="button"
                  onClick={closeRecordDetail}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 hover:bg-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition cursor-pointer"
                >
                  <X className="h-4 w-4" /> Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}