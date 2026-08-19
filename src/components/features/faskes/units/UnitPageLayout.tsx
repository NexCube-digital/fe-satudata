"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  Plus,
  RefreshCw,
  Search,
  Clock,
  CheckCircle2,
  FileText,
  User,
  Stethoscope,
  Building2,
  Scissors,
  HeartPulse,
  Database,
  Eye,
  History,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import MedicalRecordWizard from "@/components/features/faskes/MedicalRecordWizard";
import LoadingScreen from "@/components/ui/LoadingScreen";
import TxHashLink from "@/components/ui/TxHashLink";
import { getHospitalMedicalRecords } from "@/services/hospitalService";

interface UnitPageLayoutProps {
  unitKey: string;
  unitTitle: string;
  unitSubtitle: string;
  unitBadge: string;
  themeColor: {
    bgGradient: string;
    badgeBg: string;
    border: string;
    text: string;
  };
  matchKeys: string[];
  defaultTab?: "antrean" | "tambah" | "riwayat";
}

export default function UnitPageLayout({
  unitKey,
  unitTitle,
  unitSubtitle,
  unitBadge,
  themeColor,
  matchKeys,
  defaultTab = "antrean",
}: UnitPageLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams?.get("tab");

  const [activeTab, setActiveTab] = useState<string>(defaultTab || tabFromUrl || "antrean");
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [records, setRecords] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    } else if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [defaultTab, tabFromUrl]);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    const unitPathMap: Record<string, string> = {
      antrean: `/dashboard/faskes/medical-records/${unitKey}/antrean`,
      tambah: `/dashboard/faskes/medical-records/${unitKey}/upload`,
      riwayat: `/dashboard/faskes/medical-records/${unitKey}/history`,
    };
    if (unitPathMap[newTab]) {
      router.push(unitPathMap[newTab]);
    }
  };

  const fetchRecords = async () => {
    try {
      const result = await getHospitalMedicalRecords();
      if (result?.success && Array.isArray(result.data)) {
        const mapped = result.data.map((item: any) => ({
          id: item.id,
          patientId: item.patient?.id ?? item.user_id ?? null,
          patientName: item.patient?.name || "Pasien Tidak Diketahui",
          patientNik: item.patient?.nik || "-",
          recordType: item.record_type,
          typeOfTreatment: item.type_of_treatment,
          title: item.title,
          visitDate: item.visit_date,
          status: item.status,
          doctorName: item.doctor?.name || "-",
          doctorSpecialist: item.doctor?.specialist || "-",
          summary: item.summary || null,
          detail: item.detail || {},
          txHash: item.tx_hash || null,
        }));

        // Filter for records belonging to this specific unit
        const filtered = mapped.filter((rec) => {
          const typeTreatment = (rec.typeOfTreatment || "").toLowerCase();
          const recType = (rec.recordType || "").toLowerCase();
          const titleText = (rec.title || "").toLowerCase();
          const detailStr = JSON.stringify(rec.detail || {}).toLowerCase();
          const combined = `${typeTreatment} ${recType} ${titleText} ${detailStr}`;

          return matchKeys.some((k) => combined.includes(k.toLowerCase()));
        });

        setRecords(filtered);
      } else {
        setRecords([]);
      }
    } catch (err) {
      console.error(`Error fetching records for unit ${unitKey}`, err);
    }
  };

  useEffect(() => {
    fetchRecords().finally(() => setLoading(false));
  }, [unitKey]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRecords();
    setRefreshing(false);
  };

  const keyword = searchTerm.trim().toLowerCase();
  const searchFilteredRecords = records.filter((rec) => {
    if (!keyword) return true;
    return [rec.patientName, rec.patientNik, rec.title, rec.doctorName, rec.txHash]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(keyword);
  });

  const antreanRecords = searchFilteredRecords.filter(
    (r) => r.status === "draft" || r.status === "pending" || !r.txHash
  );
  const riwayatRecords = searchFilteredRecords.filter((r) => r.status === "final" || r.txHash);

  if (loading) {
    return <LoadingScreen message={`Memuat Modul ${unitTitle}...`} fullScreen={false} />;
  }

  return (
    <div className="space-y-6">
      {/* Header Banner Unit */}
      <div className={`rounded-3xl p-6 sm:p-8 text-white shadow-xl ${themeColor.bgGradient} relative overflow-hidden`}>
        <div className="absolute right-0 top-0 -mr-12 -mt-12 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold bg-white/20 backdrop-blur-md border border-white/30 text-white uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{unitBadge}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">{unitTitle}</h1>
            <p className="text-sm sm:text-base text-white/80 max-w-2xl">{unitSubtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 px-4 py-3 text-sm font-bold text-white transition cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              <span>Refresh Data</span>
            </button>
            <button
              type="button"
              onClick={() => router.push(`/dashboard/faskes/medical-records/${unitKey}/upload`)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-slate-900 px-5 py-3 text-sm font-black shadow-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>+ Input Rekam Medis {unitKey.toUpperCase()}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="mt-8 flex flex-wrap gap-2 border-t border-white/20 pt-6">
          <button
            type="button"
            onClick={() => handleTabChange("antrean")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition cursor-pointer ${
              activeTab === "antrean"
                ? "bg-white text-slate-900 shadow-md"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>📋 Antrean Pasien Unit</span>
            <span className="ml-1 rounded-full bg-slate-900/20 px-2 py-0.5 text-[10px] font-bold">
              {antreanRecords.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("tambah")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition cursor-pointer ${
              activeTab === "tambah"
                ? "bg-white text-slate-900 shadow-md"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <Plus className="h-4 w-4" />
            <span>➕ Form Input Rekam Medis</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("riwayat")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition cursor-pointer ${
              activeTab === "riwayat"
                ? "bg-white text-slate-900 shadow-md"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <History className="h-4 w-4" />
            <span>📜 Riwayat Rekam Medis</span>
            <span className="ml-1 rounded-full bg-slate-900/20 px-2 py-0.5 text-[10px] font-bold">
              {riwayatRecords.length}
            </span>
          </button>
        </div>
      </div>

      {/* Tab Content Display */}
      {activeTab === "antrean" && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Antrean Aktif</span>
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">{antreanRecords.length} Pasien</p>
              <p className="text-xs text-slate-400 mt-1">Dalam antrean pelayanan unit {unitTitle}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Selesai & Final</span>
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">{riwayatRecords.length} Berkas</p>
              <p className="text-xs text-slate-400 mt-1">Telah diverifikasi & terenkripsi</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pelayanan</span>
                <Activity className="h-5 w-5 text-teal-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">{records.length} Pasien</p>
              <p className="text-xs text-slate-400 mt-1">Total akumulasi pasien unit ini</p>
            </div>
          </div>

          {/* Table Antrean Unit */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Daftar Antrean & Draf Pelayanan</h3>
                <p className="text-xs text-slate-500">Pasien yang siap ditangani atau dalam proses pengisian form medis.</p>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari pasien / NIK / dokter..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 rounded-xl border border-slate-200 pl-9 pr-4 py-2 text-xs font-medium focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>

            {antreanRecords.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
                <Clock className="mx-auto h-10 w-10 text-slate-300" />
                <h4 className="mt-3 text-sm font-bold text-slate-700">Tidak ada antrean aktif saat ini</h4>
                <p className="mt-1 text-xs text-slate-400">Klik "+ Input Rekam Medis" untuk mendaftarkan penanganan baru.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Pasien</th>
                      <th className="px-4 py-3">Judul / Layanan</th>
                      <th className="px-4 py-3">Dokter DPJP</th>
                      <th className="px-4 py-3">Tanggal Kunjungan</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {antreanRecords.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-4 py-3 font-bold text-slate-900">
                          <div>{rec.patientName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">NIK: {rec.patientNik}</div>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800">{rec.title}</td>
                        <td className="px-4 py-3 font-medium text-slate-600">{rec.doctorName}</td>
                        <td className="px-4 py-3 font-medium text-slate-500">{rec.visitDate || "-"}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200">
                            {rec.status || "Antrean"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => router.push(`/dashboard/faskes/medical-records/${rec.id}/edit`)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-teal-700 transition cursor-pointer"
                          >
                            <span>Tangani Pasien</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "tambah" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
          <MedicalRecordWizard />
        </div>
      )}

      {activeTab === "riwayat" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Riwayat Rekam Medis {unitTitle}</h3>
              <p className="text-xs text-slate-500">Seluruh berkas medis final unit yang telah terenkripsi end-to-end.</p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari riwayat medis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 rounded-xl border border-slate-200 pl-9 pr-4 py-2 text-xs font-medium focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          {riwayatRecords.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
              <History className="mx-auto h-10 w-10 text-slate-300" />
              <h4 className="mt-3 text-sm font-bold text-slate-700">Belum ada riwayat rekam medis final</h4>
              <p className="mt-1 text-xs text-slate-400">Berkas medis yang diselesaikan akan muncul secara otomatis di sini.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Pasien</th>
                    <th className="px-4 py-3">Judul Layanan</th>
                    <th className="px-4 py-3">Dokter Penanggung Jawab</th>
                    <th className="px-4 py-3">Tanggal Pelayanan</th>
                    <th className="px-4 py-3">Verifikasi Blockchain</th>
                    <th className="px-4 py-3 text-right">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {riwayatRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3 font-bold text-slate-900">
                        <div>{rec.patientName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">NIK: {rec.patientNik}</div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">{rec.title}</td>
                      <td className="px-4 py-3 font-medium text-slate-600">{rec.doctorName}</td>
                      <td className="px-4 py-3 font-medium text-slate-500">{rec.visitDate || "-"}</td>
                      <td className="px-4 py-3">
                        <TxHashLink txHash={rec.txHash} className="text-xs font-mono font-bold text-teal-800 bg-teal-50 border border-teal-200 rounded-xl px-2.5 py-1" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => router.push(`/dashboard/faskes/medical-records?recordId=${rec.id}`)}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>Lihat</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
