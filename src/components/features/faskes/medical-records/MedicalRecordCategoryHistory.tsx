"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TxHashLink from "@/components/ui/TxHashLink";
import LoadingScreen from "@/components/ui/LoadingScreen";
import {
  FileText,
  Plus,
  Search,
  RefreshCw,
  X,
  User,
  Stethoscope,
  CalendarDays,
  Activity,
  ArrowRight,
  ShieldCheck,
  Building2,
  Scissors,
  Pill,
  HeartPulse,
  ChevronRight,
  Inbox,
  Filter,
} from "lucide-react";
import { getHospitalMedicalRecords } from "@/services/hospitalService";

const CATEGORY_CONFIGS: Record<string, { title: string; subtitle: string; icon: any; color: string; badgeBg: string; uploadUrl: string }> = {
  igd: {
    title: "Kelola Rekam Medis IGD",
    subtitle: "Instalasi Gawat Darurat & Status Triase Pasien",
    icon: Activity,
    color: "amber",
    badgeBg: "bg-amber-100 text-amber-950 border-amber-300",
    uploadUrl: "/dashboard/faskes/medical-records/igd/upload",
  },
  odc: {
    title: "Kelola Rekam Medis ODC",
    subtitle: "One Day Care (Perawatan Satu Hari)",
    icon: HeartPulse,
    color: "purple",
    badgeBg: "bg-purple-100 text-purple-950 border-purple-300",
    uploadUrl: "/dashboard/faskes/medical-records/odc/upload",
  },
  rajal: {
    title: "Kelola Rekam Medis Rawat Jalan",
    subtitle: "Poliklinik & Pelayanan Rawat Jalan Pasien",
    icon: Stethoscope,
    color: "cyan",
    badgeBg: "bg-cyan-100 text-cyan-950 border-cyan-300",
    uploadUrl: "/dashboard/faskes/medical-records/rajal/upload",
  },
  ranap: {
    title: "Kelola Rekam Medis Rawat Inap",
    subtitle: "Bangsal & Catatan Perkembangan Pasien Terpadu (CPPT)",
    icon: Building2,
    color: "indigo",
    badgeBg: "bg-indigo-100 text-indigo-950 border-indigo-300",
    uploadUrl: "/dashboard/faskes/medical-records/ranap/upload",
  },
  bedah: {
    title: "Kelola Rekam Medis Bedah",
    subtitle: "Laporan Operasi Bedah & Anestesi Sentral",
    icon: Scissors,
    color: "teal",
    badgeBg: "bg-teal-100 text-teal-950 border-teal-300",
    uploadUrl: "/dashboard/faskes/medical-records/bedah/upload",
  },
  lab: {
    title: "Kelola Rekam Medis Laboratorium",
    subtitle: "Hasil Pemeriksaan Hematologi, Kimia Klinik & Patologi",
    icon: FileText,
    color: "emerald",
    badgeBg: "bg-emerald-100 text-emerald-950 border-emerald-300",
    uploadUrl: "/dashboard/faskes/medical-records/lab/upload",
  },
  radiologi: {
    title: "Kelola Rekam Medis Radiologi",
    subtitle: "Pemeriksaan Rontgen, USG, CT-Scan & MRI",
    icon: FileText,
    color: "violet",
    badgeBg: "bg-violet-100 text-violet-950 border-violet-300",
    uploadUrl: "/dashboard/faskes/medical-records/radiologi/upload",
  },
  rehab: {
    title: "Kelola Rekam Medis Rehab Medik",
    subtitle: "Rehabilitasi Medis, Fisioterapi & Terapi Okupasi",
    icon: Activity,
    color: "rose",
    badgeBg: "bg-rose-100 text-rose-950 border-rose-300",
    uploadUrl: "/dashboard/faskes/medical-records/rehab/upload",
  },
  rujuk: {
    title: "Kelola Surat Rujukan Medis",
    subtitle: "Surat Rujukan Antar Faskes & Resume Klinis Transfer",
    icon: ArrowRight,
    color: "sky",
    badgeBg: "bg-sky-100 text-sky-950 border-sky-300",
    uploadUrl: "/dashboard/faskes/medical-records/rujuk/upload",
  },
  death: {
    title: "Kelola Surat Keterangan Kematian",
    subtitle: "Dokumen Resmi Surat Kematian Pasien (Death Certificate)",
    icon: FileText,
    color: "slate",
    badgeBg: "bg-slate-200 text-slate-900 border-slate-400",
    uploadUrl: "/dashboard/faskes/medical-records/death/upload",
  },
  "discharge-summary": {
    title: "Kelola Ringkasan Pulang (Discharge Summary)",
    subtitle: "Resume Kondisi Pasien Saat Pulang dari Faskes",
    icon: FileText,
    color: "purple",
    badgeBg: "bg-purple-100 text-purple-950 border-purple-300",
    uploadUrl: "/dashboard/faskes/medical-records/discharge-summary/upload",
  },
};

interface Props {
  categoryKey: string;
}

export default function MedicalRecordCategoryHistory({ categoryKey }: Props) {
  const router = useRouter();
  const config = CATEGORY_CONFIGS[categoryKey] || {
    title: `Kelola Rekam Medis ${categoryKey.toUpperCase()}`,
    subtitle: `Riwayat dan Upload Dokumen Rekam Medis ${categoryKey.toUpperCase()}`,
    icon: FileText,
    color: "teal",
    badgeBg: "bg-teal-100 text-teal-950 border-teal-300",
    uploadUrl: `/dashboard/faskes/medical-records/${categoryKey}/upload`,
  };

  const IconComp = config.icon;
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await getHospitalMedicalRecords();
      if (response && response.success && Array.isArray(response.data)) {
        setRecords(response.data);
      } else if (Array.isArray(response)) {
        setRecords(response);
      }
    } catch (err) {
      console.error("Error fetching category records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [categoryKey]);

  // Filter records matching the specific category
  const categoryFilteredRecords = useMemo(() => {
    return records.filter((item) => {
      const recType = String(item.recordType || item.category || "").toLowerCase();
      const recTitle = String(item.title || "").toLowerCase();
      const recDetail = item.detail ? JSON.stringify(item.detail).toLowerCase() : "";
      
      const key = categoryKey.toLowerCase();
      if (key === "igd") return recType.includes("igd") || recType.includes("gawat") || recTitle.includes("igd");
      if (key === "odc") return recType.includes("odc") || recType.includes("one_day") || recTitle.includes("odc");
      if (key === "rajal") return recType.includes("rawat_jalan") || recType.includes("rajal") || recTitle.includes("jalan");
      if (key === "ranap") return recType.includes("rawat_inap") || recType.includes("ranap") || recTitle.includes("inap");
      if (key === "bedah") return recType.includes("bedah") || recType.includes("operasi") || recTitle.includes("bedah");
      if (key === "lab") return recType.includes("lab") || recType.includes("laboratorium") || recTitle.includes("lab");
      if (key === "radiologi") return recType.includes("radiologi") || recType.includes("rontgen") || recTitle.includes("radiologi");
      if (key === "rehab") return recType.includes("rehab") || recType.includes("fisio") || recTitle.includes("rehab");
      if (key === "rujuk") return recType.includes("rujuk") || recType.includes("referral") || recTitle.includes("rujuk");
      if (key === "death") return recType.includes("death") || recType.includes("kematian") || recType.includes("meninggal");
      if (key === "discharge-summary") return recType.includes("discharge") || recType.includes("ringkasan") || recDetail.includes("discharge");
      
      return recType.includes(key);
    });
  }, [records, categoryKey]);

  const searchFilteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return categoryFilteredRecords;
    const q = searchQuery.toLowerCase().trim();
    return categoryFilteredRecords.filter((item) => {
      const patientName = String(item.patientName || item.patient?.name || "").toLowerCase();
      const nik = String(item.patientNik || item.patient?.nik || "").toLowerCase();
      const doctorName = String(item.doctorName || item.doctor?.name || "").toLowerCase();
      const title = String(item.title || "").toLowerCase();
      const visitId = String(item.visitId || "").toLowerCase();
      return patientName.includes(q) || nik.includes(q) || doctorName.includes(q) || title.includes(q) || visitId.includes(q);
    });
  }, [categoryFilteredRecords, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 md:p-8 space-y-6 font-sans">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20 shrink-0">
            <IconComp className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{config.title}</h1>
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${config.badgeBg}`}>
                Dokumen Resmi
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 mt-0.5">{config.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchRecords}
            className="p-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-teal-600" : ""}`} />
          </button>

          <Link
            href={config.uploadUrl}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-teal-600 text-white font-black text-xs hover:bg-teal-700 transition shadow-lg shadow-teal-600/20 active:scale-98 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Form Input / Upload Baru</span>
          </Link>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Total Dokumen Dokumen</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{categoryFilteredRecords.length}</p>
          <span className="text-[10px] font-semibold text-teal-600 mt-1 inline-block">Tersimpan dalam database faskes</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Status Terverifikasi</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {categoryFilteredRecords.filter((r) => r.status === "verified" || r.status === "final" || r.txHash).length}
          </p>
          <span className="text-[10px] font-semibold text-emerald-600 mt-1 inline-block">Siap Terhubung SatuSehat / On-Chain</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Draft Pengisian</span>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {categoryFilteredRecords.filter((r) => r.status === "draft").length}
          </p>
          <span className="text-[10px] font-semibold text-amber-600 mt-1 inline-block">Perlu penyelesaian tenaga medis</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama pasien, NIK, nama dokter, atau judul rekam medis..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="text-xs font-bold text-slate-500 px-3">
          Menampilkan <span className="text-teal-700 font-extrabold">{searchFilteredRecords.length}</span> dari {categoryFilteredRecords.length} dokumen
        </div>
      </div>

      {/* Main Table / Record List */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="h-8 w-8 text-teal-600 animate-spin" />
            <span className="text-xs font-bold text-slate-500">Memuat riwayat rekam medis...</span>
          </div>
        ) : searchFilteredRecords.length === 0 ? (
          <div className="py-16 px-6 text-center flex flex-col items-center justify-center">
            <div className="h-16 w-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
              <Inbox className="h-8 w-8" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-800">Belum Ada Dokumen {config.title}</h3>
            <p className="text-xs text-slate-500 max-w-md mt-1 mb-4">
              Dokumen rekam medis untuk kategori ini belum tersedia atau tidak cocok dengan pencarian Anda.
            </p>
            <Link
              href={config.uploadUrl}
              className="px-4 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition"
            >
              Buat Dokumen Baru Now
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">Pasien & ID Kunjungan</th>
                  <th className="py-3.5 px-4">Judul Dokumen</th>
                  <th className="py-3.5 px-4">Dokter Pemeriksa</th>
                  <th className="py-3.5 px-4">Tanggal Kunjungan</th>
                  <th className="py-3.5 px-4">Status & Verifikasi</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {searchFilteredRecords.map((item, idx) => {
                  const patientName = item.patientName || item.patient?.name || "Pasien Faskes";
                  const patientNik = item.patientNik || item.patient?.nik || "-";
                  const doctorName = item.doctorName || item.doctor?.name || "Dokter Penanggung Jawab";
                  const dateStr = item.visitDate || item.created_at || item.createdAt || "-";

                  return (
                    <tr key={item.id || idx} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {patientName.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 text-xs">{patientName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">NIK: {patientNik}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-800 text-xs">{item.title || config.title}</div>
                        <div className="text-[10px] text-slate-400">{item.visitId || `ID: REC-${item.id}`}</div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                          <Stethoscope className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                          <span>{doctorName}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-xs font-semibold text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{dateStr}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md border ${
                              item.status === "verified" || item.status === "final" || item.txHash
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {item.status === "verified" || item.status === "final" || item.txHash ? "Terverifikasi" : "Draft"}
                          </span>
                          {item.txHash && <TxHashLink txHash={item.txHash} className="text-[10px]" />}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedRecord(item)}
                          className="px-3 py-1.5 rounded-xl border border-teal-200 bg-teal-50 text-teal-700 font-bold text-xs hover:bg-teal-600 hover:text-white transition cursor-pointer"
                        >
                          Detail &rarr;
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Detail Rekam Medis */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {selectedRecord.title || config.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">ID: {selectedRecord.id || selectedRecord.visitId}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-sans bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Pasien</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {selectedRecord.patientName || selectedRecord.patient?.name || "Pasien Faskes"}
                </span>
                <p className="text-[11px] text-slate-500">NIK: {selectedRecord.patientNik || selectedRecord.patient?.nik || "-"}</p>
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Dokter Penanggung Jawab</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {selectedRecord.doctorName || selectedRecord.doctor?.name || "-"}
                </span>
                <p className="text-[11px] text-slate-500">Tgl: {selectedRecord.visitDate || selectedRecord.created_at || "-"}</p>
              </div>
            </div>

            {selectedRecord.detail && (
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">Rincian Form Medis</h4>
                <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-xs overflow-x-auto max-h-60">
                  <pre>{JSON.stringify(selectedRecord.detail, null, 2)}</pre>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-white font-extrabold text-xs hover:bg-slate-900 transition cursor-pointer"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
