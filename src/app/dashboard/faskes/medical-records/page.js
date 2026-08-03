"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import TxHashLink from "@/components/ui/TxHashLink";
import { FileText, Plus, Search, ArrowUpRight, RefreshCw, X, Clock, Hash, User, Stethoscope, CalendarDays, FileText as FileTextIcon } from "lucide-react";
import { getHospitalMedicalRecords } from "@/services/hospitalService";

export default function FaskesMedicalRecordsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);

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
      if (result.success && result.data) {
        const mapped = result.data.map((item) => ({
          id: item.id,
          patientId: item.user_id,
          patientName: item.Owner?.name || "Pasien Tidak Diketahui",
          recordType: item.record_type,
          title: item.title,
          visitDate: item.visit_date,
          doctorName: item.doctor?.name || "-",
          status: item.status,
          dataHash: item.data_hash,
          txHash: item.tx_hash || null,
        }));
        setRecords(mapped);
        setFilteredRecords(mapped);
      }
    } catch (err) {
      console.error("Error fetching medical records", err);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    const filtered = records.filter((rec) =>
      [rec.patientName, rec.title, rec.recordType, rec.doctorName, rec.txHash]
        .join(" ")
        .toLowerCase()
        .includes(value.toLowerCase())
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
            <button
              type="button"
              onClick={() => router.push("/dashboard/faskes/medical-records/upload")}
              className="inline-flex items-center gap-2 rounded-2xl bg-rose-800 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-rose-700 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Upload Rekam Medis Baru
            </button>
          </div>

          <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
            <section className="space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-lg font-bold text-slate-900">Arsip Rekam Medis</h3>
                  <span className="text-xs text-slate-500">{filteredRecords.length} Data Ditemukan</span>
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
                      <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 border border-rose-100">{records.filter((r) => r.txHash).length} On-chain</span>
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 border border-slate-200">{records.filter((r) => !r.txHash).length} Off-chain</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-y-3 text-left text-sm">
                      <thead>
                        <tr className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          <th className="px-4 py-3">Visit Date</th>
                          <th className="px-4 py-3">Pasien</th>
                          <th className="px-4 py-3">JENIS</th>
                          <th className="px-4 py-3">Tx Hash</th>
                          <th className="px-4 py-3">Dokter</th>
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
                            <td className="px-4 py-4 text-slate-700">{new Date(item.visitDate).toLocaleDateString("id-ID")}</td>
                            <td className="px-4 py-4 font-semibold text-slate-900">{item.patientName}</td>
                            <td className="px-4 py-4 text-slate-700">{item.recordType.toUpperCase()}</td>
                            <td className="px-4 py-4">
                              <div onClick={(e) => e.stopPropagation()}>
                                {item.txHash ? (
                                  <TxHashLink
                                    txHash={item.txHash}
                                    className="font-mono text-[10px] font-bold text-rose-900 bg-linear-to-r from-rose-50 via-rose-100 to-rose-50 border border-rose-300 shadow-sm px-2 py-1 rounded-xl inline-flex items-center gap-1 whitespace-normal break-all"
                                    title={item.txHash}
                                  >
                                    <span className="tracking-[0.03em] leading-tight" title={item.txHash}>{item.txHash}</span>
                                  </TxHashLink>
                                ) : (
                                  <span className="text-xs text-slate-400 font-medium italic">Off-Chain</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-slate-700">{item.doctorName}</td>
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
            className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-linear-to-r from-rose-800 via-rose-700 to-red-800 px-6 py-5 text-white">
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
              <p className="mt-1 text-xs text-rose-100">Klik area luar atau tombol close untuk menutup detail.</p>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Pasien</p>
                  <p className="mt-1 font-semibold text-slate-900">{selectedRecord.patientName}</p>
                  <p className="text-xs text-slate-500">ID Pasien: {selectedRecord.patientId || "-"}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold flex items-center gap-1.5"><Stethoscope className="h-3.5 w-3.5" /> Dokter</p>
                  <p className="mt-1 font-semibold text-slate-900">{selectedRecord.doctorName}</p>
                  <p className="text-xs text-slate-500">Jenis: {selectedRecord.recordType.toUpperCase()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> Visit Date</p>
                  <p className="mt-1 font-semibold text-slate-900">{new Date(selectedRecord.visitDate).toLocaleDateString("id-ID")}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold flex items-center gap-1.5"><FileTextIcon className="h-3.5 w-3.5" /> Judul Rekam Medis</p>
                  <p className="mt-1 font-semibold text-slate-900">{selectedRecord.title || "-"}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold flex items-center gap-1.5"><Hash className="h-3.5 w-3.5" /> Status</p>
                  <p className="mt-1 font-semibold text-slate-900">{selectedRecord.status || "-"}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold flex items-center gap-1.5"><Hash className="h-3.5 w-3.5" /> Blockchain Tx Hash</p>
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
