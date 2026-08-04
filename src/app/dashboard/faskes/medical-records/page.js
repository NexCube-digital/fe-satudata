"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import TxHashLink from "@/components/ui/TxHashLink";
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

export default function FaskesMedicalRecordsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

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
        setFilteredRecords(mapped);
        setPagination(result.pagination || null);
      } else {
        setRecords([]);
        setFilteredRecords([]);
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

  const handleSearch = (value) => {
    setSearchTerm(value);
    const keyword = value.toLowerCase();
    const filtered = records.filter((rec) =>
      [rec.patientName, rec.title, rec.recordType, rec.doctorName, rec.txHash]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
    setFilteredRecords(filtered);
  };

  const openRecordDetail = (record) => {
    setSelectedRecord(record);
  };

  const closeRecordDetail = () => {
    setSelectedRecord(null);
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
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-rose-700 font-bold">Dashboard Faskes</p>
              <h1 className="text-3xl font-extrabold text-slate-900 mt-3">Direktori Rekam Medis</h1>
              <p className="max-w-2xl text-sm text-slate-500 mt-2">Daftar seluruh rekam medis yang telah diunggah dan terenkripsi.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard/faskes/medical-records/upload")}
                className="inline-flex items-center gap-2 rounded-2xl bg-rose-800 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-rose-700 transition cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Upload Rekam Medis Baru
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
            <section className="space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-lg font-bold text-slate-900">Arsip Rekam Medis</h3>
                  <span className="text-xs text-slate-500">
                    {filteredRecords.length} Data Ditemukan
                    {pagination ? ` dari ${pagination.total} total` : ""}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="relative flex-1">
                      <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Cari pasien, judul, tx hash..."
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-10 py-3 text-sm text-slate-800 focus:border-rose-700 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 border border-rose-100">
                        {records.filter((r) => r.txHash).length} On-chain
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 border border-slate-200">
                        {records.filter((r) => !r.txHash).length} Off-chain
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-y-3 text-left text-sm">
                      <thead>
                        <tr className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          <th className="px-4 py-3">Visit Date</th>
                          <th className="px-4 py-3">Pasien</th>
                          <th className="px-4 py-3">Judul</th>
                          <th className="px-4 py-3">Jenis</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Tx Hash</th>
                          <th className="px-4 py-3">Dokter</th>
                          <th className="px-4 py-3">Lampiran</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRecords.map((item) => (
                          <tr
                            key={item.id}
                            className="rounded-3xl border border-slate-200/80 bg-slate-50 transition hover:bg-slate-100 cursor-pointer"
                            onClick={() => openRecordDetail(item)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                openRecordDetail(item);
                              }
                            }}
                          >
                            <td className="px-4 py-4 text-slate-700 whitespace-nowrap">
                              {item.visitDate ? new Date(item.visitDate).toLocaleDateString("id-ID") : "-"}
                            </td>
                            <td className="px-4 py-4 font-semibold text-slate-900">{item.patientName}</td>
                            <td className="px-4 py-4 text-slate-700 max-w-[220px] truncate" title={item.title}>
                              {item.title || "-"}
                            </td>
                            <td className="px-4 py-4 text-slate-700">{formatRecordType(item.recordType)}</td>
                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                                  item.status === "draft"
                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                }`}
                              >
                                {item.status || "-"}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div onClick={(e) => e.stopPropagation()}>
                                {item.txHash ? (
                                  <TxHashLink
                                    txHash={item.txHash}
                                    className="font-mono text-[10px] font-bold text-rose-900 bg-linear-to-r from-rose-50 via-rose-100 to-rose-50 border border-rose-300 shadow-sm px-2 py-1 rounded-xl inline-flex items-center gap-1 whitespace-normal break-all"
                                    title={item.txHash}
                                  >
                                    <span className="tracking-[0.03em] leading-tight" title={item.txHash}>
                                      {item.txHash}
                                    </span>
                                  </TxHashLink>
                                ) : (
                                  <span className="text-xs text-slate-400 font-medium italic">Off-Chain</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-slate-700">{item.doctorName}</td>
                            <td className="px-4 py-4 text-slate-700">
                              {item.attachments.length > 0 ? (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600">
                                  <Paperclip className="h-3.5 w-3.5" /> {item.attachments.length}
                                </span>
                              ) : (
                                <span className="text-xs text-slate-300">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredRecords.length === 0 && (
                      <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-slate-500">
                        Belum ada rekam medis yang cocok dengan pencarian.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      {selectedRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={closeRecordDetail}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 bg-linear-to-r from-rose-800 via-rose-700 to-red-800 px-6 py-5 text-white">
              <button
                type="button"
                onClick={closeRecordDetail}
                className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 transition"
                aria-label="Tutup detail rekam medis"
                title="Tutup"
              >
                <X className="h-4 w-4" />
              </button>
              <p className="text-[10px] uppercase tracking-[0.3em] text-rose-200 font-bold">Detail Rekam Medis</p>
              <h3 className="mt-2 text-2xl font-extrabold tracking-tight">{selectedRecord.patientName}</h3>
              <p className="mt-1 text-xs text-rose-100">{selectedRecord.title}</p>
            </div>

            <div className="p-6 space-y-4 text-sm">
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
                  <p className="mt-1 font-semibold text-slate-900">{selectedRecord.patientName}</p>
                  <p className="text-xs text-slate-500">ID Pasien: {selectedRecord.patientId ?? "-"}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold flex items-center gap-1.5">
                    <Stethoscope className="h-3.5 w-3.5" /> Dokter
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">{selectedRecord.doctorName}</p>
                  <p className="text-xs text-slate-500">{selectedRecord.doctorSpecialist}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" /> Visit Date
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {selectedRecord.visitDate ? new Date(selectedRecord.visitDate).toLocaleDateString("id-ID") : "-"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold flex items-center gap-1.5">
                    <FileTextIcon className="h-3.5 w-3.5" /> Jenis
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">{formatRecordType(selectedRecord.recordType)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold flex items-center gap-1.5">
                    <Hash className="h-3.5 w-3.5" /> Status
                  </p>
                  <p className="mt-1 font-semibold text-slate-900 capitalize">{selectedRecord.status || "-"}</p>
                </div>
              </div>

              {selectedRecord.summary && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">Ringkasan</p>
                  <p className="mt-1 text-slate-700 whitespace-pre-line">{selectedRecord.summary}</p>
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
                        <div className="mt-2 space-y-2">
                          {entries.map(([key, val]) => (
                            <div key={key}>
                              <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">
                                {fieldLabels[key] || key}
                              </p>
                              <p className="text-slate-700 whitespace-pre-line">{String(val)}</p>
                            </div>
                          ))}
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
                  <ul className="mt-2 space-y-2">
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
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {selectedRecord.txHash ? (
                    <TxHashLink
                      txHash={selectedRecord.txHash}
                      className="font-mono text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg inline-flex items-center gap-1"
                      title={selectedRecord.txHash}
                    >
                      <span>{selectedRecord.txHash}</span>
                    </TxHashLink>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Off-Chain</span>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">Data Hash</p>
                <p className="mt-1 font-mono text-xs text-slate-700 break-all">{selectedRecord.dataHash || "-"}</p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={closeRecordDetail}
                  className="inline-flex items-center gap-2 rounded-2xl bg-rose-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700 transition cursor-pointer"
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