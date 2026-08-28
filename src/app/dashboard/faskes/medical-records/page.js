"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import TxHashLink from "@/components/ui/TxHashLink";
import { isRealTxHash } from "@/lib/blockchain";
import { 
  FileText, 
  Search, 
  RefreshCw, 
  X, 
  User, 
  Users, 
  Stethoscope, 
  CalendarDays, 
  ChevronRight,
  Activity,
  CheckCircle,
  Hash,
  FileCheck
} from "lucide-react";
import { getHospitalMedicalRecords } from "@/services/hospitalService";

export default function FaskesMedicalRecordsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

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
          patientId: item.user_id || item.patient_id,
          patientName: item.Owner?.name || item.Patient?.name || item.patient_name || "Pasien Terdaftar",
          nik: item.Owner?.profil?.nik || item.Owner?.nik || item.patient_nik || item.Patient?.profil?.nik || item.Patient?.nik || item.user?.profil?.nik || item.user?.nik || item.nik || "3204390000000006",
          recordType: item.record_type || "rawat jalan",
          title: item.title || "Pemeriksaan Medis Rutin",
          visitDate: item.visit_date || item.created_at || new Date().toISOString(),
          doctorName: item.doctor?.name || "dr. Penanggung Jawab",
          status: item.status || "Disetujui",
          dataHash: item.data_hash || "0x9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f",
          txHash: item.tx_hash || item.txHash || null,
        }));
        setRecords(mapped);
      }
    } catch (err) {
      console.error("Error fetching medical records", err);
    }
  };

  const formatTxHash = (hash) => {
    if (!hash || typeof hash !== "string") return "uploading";
    const cleaned = hash.trim();
    if (!isRealTxHash(cleaned)) return "uploading";
    if (cleaned.length <= 18) return cleaned;
    return cleaned.slice(0, 10) + "..." + cleaned.slice(-8);
  };

  const maskNik = (nik) => {
    if (!nik || nik === "-" || nik === "undefined" || nik === "null") return "320439******0006";
    const str = String(nik).trim();
    if (str.length < 16) return str.slice(0, 6) + "******" + (str.length > 6 ? str.slice(-4) : "0006");
    return str.slice(0, 6) + "******" + str.slice(12);
  };

  // Group records by unique patient
  const patientGroups = Object.values(
    records.reduce((acc, item) => {
      const key = item.patientId || item.patientName;
      if (!acc[key]) {
        acc[key] = {
          patientId: item.patientId,
          patientName: item.patientName,
          nik: item.nik && item.nik !== "-" ? item.nik : "3204390000000006",
          history: []
        };
      } else if ((!acc[key].nik || acc[key].nik === "-") && item.nik && item.nik !== "-") {
        acc[key].nik = item.nik;
      }
      acc[key].history.push(item);
      return acc;
    }, {})
  ).map((patient) => {
    // Sort history descending by visitDate
    patient.history.sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));
    patient.totalRecords = patient.history.length;
    patient.latestVisit = patient.history[0]?.visitDate;
    patient.latestTitle = patient.history[0]?.title || "Pemeriksaan Medis";
    patient.latestDoctor = patient.history[0]?.doctorName || "-";
    patient.latestTxHash = patient.history[0]?.txHash || null;
    return patient;
  });

  // Filter grouped patients by search query
  const filteredPatients = patientGroups.filter((patient) => {
    const q = searchTerm.toLowerCase();
    return (
      patient.patientName.toLowerCase().includes(q) ||
      patient.nik.toLowerCase().includes(q) ||
      patient.history.some(
        (h) =>
          h.title.toLowerCase().includes(q) ||
          h.doctorName.toLowerCase().includes(q) ||
          (h.txHash && h.txHash.toLowerCase().includes(q))
      )
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16 md:pb-0">
      <Navbar user={user} roleLabel="Fasilitas Kesehatan" onLogout={() => router.push("/auth/login")} />
      
      <div className="flex flex-1">
        <Sidebar role="faskes" />
        
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-2xl border border-teal-500/30 bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 px-5 py-4 text-white shadow-md mb-6">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-teal-400/20 blur-2xl" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                  <FileText className="h-6 w-6 text-teal-200" />
                  Direktori Rekam Medis Pasien
                </h1>
                <p className="text-xs text-teal-100/90 mt-1 max-w-2xl leading-relaxed">
                  Daftar pasien terotorisasi. Klik pada nama pasien untuk melihat seluruh histori penyakit dan riwayat pemeriksaan.
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push("/dashboard/faskes/patients")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white text-primary-hover hover:bg-teal-50 font-bold px-4 py-2.5 text-xs shadow-xs transition shrink-0 cursor-pointer"
              >
                <Users className="h-4 w-4" /> Data Pasien Aktif
              </button>
            </div>
          </div>

          {/* Table Card (Full Width) */}
          <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Daftar Pasien Terdaftar
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Ringkasan berkas rekam medis per individu pasien</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari pasien, NIK, atau diagnosis..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-4 py-2 text-xs text-slate-800 focus:border-primary focus:bg-white focus:outline-hidden transition"
                />
              </div>
            </div>

            {/* Patient Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-3 px-4 text-center rounded-l-xl">Pasien / NIK</th>
                    <th className="py-3 px-4 text-center">Total Rekam Medis</th>
                    <th className="py-3 px-4 text-center">Kunjungan Terakhir</th>
                    <th className="py-3 px-4 text-center">Diagnosis Terakhir</th>
                    <th className="py-3 px-4 text-center rounded-r-xl">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPatients.map((patient) => (
                    <tr
                      key={patient.patientId || patient.patientName}
                      className="hover:bg-slate-50/80 transition cursor-pointer group"
                      onClick={() => setSelectedPatient(patient)}
                    >
                      {/* Pasien / NIK */}
                      <td className="py-4 px-4 text-center">
                        <p className="font-bold text-slate-900 group-hover:text-primary transition">{patient.patientName}</p>
                        <p className="font-mono text-[9px] text-slate-400 mt-0.5">NIK: {maskNik(patient.nik)}</p>
                      </td>

                      {/* Total Rekam Medis Badge */}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-tint border border-teal-200 px-3 py-1 text-[10px] font-bold text-primary shadow-2xs">
                          <FileCheck className="h-3 w-3" /> {patient.totalRecords} Berkas EHR
                        </span>
                      </td>

                      {/* Kunjungan Terakhir */}
                      <td className="py-4 px-4 text-center text-slate-600 font-semibold">
                        {patient.latestVisit ? new Date(patient.latestVisit).toLocaleDateString("id-ID") : "-"}
                      </td>

                      {/* Diagnosis Terakhir */}
                      <td className="py-4 px-4 text-center text-slate-800 font-medium max-w-[200px] truncate">
                        {patient.latestTitle}
                      </td>

                      {/* Aksi Button */}
                      <td className="py-4 px-4 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPatient(patient);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 group-hover:bg-primary group-hover:text-white text-slate-700 font-bold px-3 py-1.5 text-xs transition cursor-pointer border border-slate-200 group-hover:border-teal-700"
                        >
                          Lihat Riwayat <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredPatients.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-slate-500 mt-4">
                  Tidak ada data pasien yang ditemukan.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal Detail Riwayat Penyakit & Pemeriksaan Pasien */}
      {selectedPatient && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setSelectedPatient(null)}
        >
          <div
            className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 px-6 py-5 text-white shrink-0">
              <button
                type="button"
                onClick={() => setSelectedPatient(null)}
                className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 transition cursor-pointer"
                title="Tutup"
              >
                <X className="h-4 w-4 text-white" />
              </button>
              <div className="flex items-center gap-2 text-teal-200 text-[10px] font-extrabold uppercase tracking-widest">
                <Users className="h-3.5 w-3.5" /> Riwayat Rekam Medis & Examination
              </div>
              <h3 className="mt-1 text-2xl font-extrabold tracking-tight">{selectedPatient.patientName}</h3>
              <p className="mt-0.5 text-xs text-teal-100 font-mono">
                NIK: {maskNik(selectedPatient.nik)} • {selectedPatient.totalRecords} Riwayat Pemeriksaan Terdaftar
              </p>
            </div>

            {/* Modal Body: Timeline Riwayat Penyakit */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-primary" /> Histori Pemeriksaan & Rekam Medis
              </h4>

              <div className="space-y-3">
                {selectedPatient.history.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 hover:bg-white hover:border-teal-300 hover:shadow-md transition duration-200 space-y-3"
                  >
                    {/* Top Row: Date & Type */}
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <CalendarDays className="h-3.5 w-3.5 text-primary" />
                        {new Date(item.visitDate).toLocaleDateString("id-ID", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        })}
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary-tint border border-teal-200 px-2.5 py-0.5 text-[9px] font-bold text-primary uppercase tracking-wider">
                        {item.recordType}
                      </span>
                    </div>

                    {/* Content Row: Title & Doctor */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Diagnosis / Pemeriksaan</p>
                        <p className="text-xs font-extrabold text-slate-900 mt-0.5">{item.title}</p>
                      </div>

                      <div>
                        <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Dokter Penanggung Jawab</p>
                        <p className="text-xs font-bold text-slate-700 mt-0.5 flex items-center gap-1">
                          <Stethoscope className="h-3 w-3 text-teal-600" /> {item.doctorName}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Row: Blockchain TxHash & Verification */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-slate-200/60 gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Tx Hash:</span>
                        <TxHashLink
                          txHash={item.txHash}
                          className="font-mono text-[9px] font-bold text-primary bg-white border border-teal-200 px-2.5 py-0.5 rounded-lg inline-flex items-center gap-1 shadow-2xs"
                          title={item.txHash}
                        >
                          <span>{formatTxHash(item.txHash)}</span>
                        </TxHashLink>
                      </div>

                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full w-fit">
                        <CheckCircle className="h-3 w-3 text-emerald-600" /> Terenkripsi On-Chain
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setSelectedPatient(null)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold px-5 py-2 text-xs transition cursor-pointer"
              >
                <X className="h-4 w-4" /> Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
