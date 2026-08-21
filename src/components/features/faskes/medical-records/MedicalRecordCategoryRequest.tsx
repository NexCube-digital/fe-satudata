"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Toast from "@/components/ui/Toast";
import notify from "@/lib/notify";
import { getDoctors } from "@/services/doctorService";
import ModernDoctorSelect from "@/components/features/faskes/doctor/ModernDoctorSelect";
import {
  Activity,
  Send,
  RefreshCw,
  Search,
  CheckCircle,
  Clock,
  ShieldCheck,
  UserPlus,
  Info,
  FileText,
  Building2,
  Stethoscope,
  Scissors,
  HeartPulse,
  ArrowRight,
  User,
  TestTube,
  CheckCircle2,
  X,
} from "lucide-react";
import {
  getSupportTestRequestsByCategory,
  processSupportTestRequest,
  SupportTestRequest,
} from "@/services/supportTestStorage";

const CATEGORY_NAMES: Record<string, { title: string; subtitle: string; icon: any }> = {
  ranap: {
    title: "Permintaan Data Rekam Medis Rawat Inap",
    subtitle: "Pengajuan Izin Akses Rekam Medis Ranap Pasien ke Faskes / Pasien",
    icon: Building2,
  },
  bedah: {
    title: "Permintaan Data Rekam Medis Bedah (OK)",
    subtitle: "Pengajuan Izin Akses Laporan Operasi Bedah & Anestesi",
    icon: Scissors,
  },
  lab: {
    title: "Permintaan Data Rekam Medis Laboratorium",
    subtitle: "Pengajuan Izin Akses Hasil Pemeriksaan Laboratorium Pasien",
    icon: TestTube,
  },
  radiologi: {
    title: "Permintaan Data Rekam Medis Radiologi",
    subtitle: "Pengajuan Izin Akses Hasil Rontgen, USG & CT-Scan Pasien",
    icon: FileText,
  },
  rehab: {
    title: "Permintaan Data Rekam Medis Rehab Medik",
    subtitle: "Pengajuan Izin Akses Catatan Rehabilitasi Medis & Fisioterapi",
    icon: Activity,
  },
  rujuk: {
    title: "Permintaan Data Rekam Medis Rujukan",
    subtitle: "Pengajuan Transfer & Akses Dokumen Rujukan Medis",
    icon: ArrowRight,
  },
  death: {
    title: "Permintaan Data Surat Keterangan Kematian",
    subtitle: "Pengajuan Verifikasi & Akses Dokumen Kematian Pasien",
    icon: FileText,
  },
};

interface Props {
  categoryKey: string;
}

export default function MedicalRecordCategoryRequest({ categoryKey }: Props) {
  const router = useRouter();
  const config = CATEGORY_NAMES[categoryKey] || {
    title: `Permintaan Data Rekam Medis ${categoryKey.toUpperCase()}`,
    subtitle: `Pengajuan Izin Akses Rekam Medis ${categoryKey.toUpperCase()}`,
    icon: FileText,
  };

  const IconComp = config.icon;
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<any[]>([]);

  // Form state
  const [nikInput, setNikInput] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [purposeInput, setPurposeInput] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Search status: "idle", "searching", "found", "not_found"
  const [searchStatus, setSearchStatus] = useState("idle");
  const [patientData, setPatientData] = useState<any>(null);

  // Support Test Requests State
  const [supportRequests, setSupportRequests] = useState<SupportTestRequest[]>([]);
  const [processingReq, setProcessingReq] = useState<SupportTestRequest | null>(null);

  // Result Form State for Lab/Radiologi/Bedah/Rehab modal
  const [labResult, setLabResult] = useState({ hb: "13.5", leukosit: "8500", trombosit: "250000", gds: "110", labNotes: "Pemeriksaan lab dalam batas normal." });
  const [radResult, setRadResult] = useState({ radExpertise: "Cor dan Pulmo tak tampak kelainan. Infiltrat (-).", radImpression: "Foto Thorax Normal", doctorExpertise: "dr. Farhan, Sp.Rad" });
  const [bedahResult, setBedahResult] = useState({ opProcedure: "Appendektomi Cito / Laparatomi Exploresi", opDiagnosis: "Appendicitis Akut Perforasi", doctorExpertise: "dr. Ahmad Dahlan, Sp.B", opNotes: "Tindakan operasi berjalan lancar tanpa komplikasi." });
  const [rehabResult, setRehabResult] = useState({ rehabProgram: "Fisioterapi Terapi Latihan + IR + TENS (10 Sesi)", rehabDiagnosis: "Hemiparesis Dextra ec Stroke Iskemik", rehabNotes: "Kekuatan otot ekstremitas membaik." });
  const [genericResult, setGenericResult] = useState({ summary: "Permintaan pelayanan telah diproses & disetujui." });

  const [toast, setToast] = useState({ show: false, type: "success", title: "", message: "" });
  const showToast = (message: string, type = "success", title = "") =>
    notify(setToast, { type, title, message });

  const fetchSupportRequests = () => {
    const data = getSupportTestRequestsByCategory(categoryKey);
    setSupportRequests(data);
  };

  useEffect(() => {
    fetchDoctorsList();
    fetchSupportRequests();
    setLoading(false);
  }, [categoryKey]);

  const fetchDoctorsList = async () => {
    try {
      const res: any = await getDoctors();
      if (res?.success && res.data) {
        setDoctors(res.data);
      } else if (Array.isArray(res)) {
        setDoctors(res);
      }
    } catch (err) {
      console.error("Error fetching doctors:", err);
    }
  };

  const handleSearchNik = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nikInput.trim()) {
      showToast("Silakan masukkan NIK pasien terlebih dahulu.", "error", "Perhatian");
      return;
    }

    setSearchStatus("searching");
    try {
      setTimeout(() => {
        setPatientData({
          nik: nikInput,
          name: "Budi Santoso",
          gender: "Laki-laki",
          dob: "1990-05-15",
          phone: "081234567890",
        });
        setSearchStatus("found");
        showToast("Data NIK pasien berhasil ditemukan.", "success", "Berhasil");
      }, 600);
    } catch (err) {
      setSearchStatus("not_found");
      showToast("NIK pasien tidak ditemukan.", "error", "Tidak Ditemukan");
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientData) {
      showToast("Silakan cari NIK pasien terlebih dahulu.", "error", "Perhatian");
      return;
    }
    if (!purposeInput.trim()) {
      showToast("Silakan isi alasan pengajuan akses rekam medis.", "error", "Perhatian");
      return;
    }

    setSubmittingRequest(true);
    try {
      setTimeout(() => {
        setSubmittingRequest(false);
        showToast(`Permintaan akses data ${categoryKey.toUpperCase()} berhasil dikirimkan ke pasien.`, "success", "Berhasil");
        setNikInput("");
        setPatientData(null);
        setSearchStatus("idle");
        setPurposeInput("");
      }, 1000);
    } catch (err) {
      setSubmittingRequest(false);
      showToast("Gagal mengirimkan permintaan akses.", "error", "Gagal");
    }
  };

  const handleProcessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!processingReq) return;

    let resultData: any = genericResult;
    if (categoryKey === "lab") resultData = labResult;
    else if (categoryKey === "radiologi") resultData = radResult;
    else if (categoryKey === "bedah") resultData = bedahResult;
    else if (categoryKey === "rehab") resultData = rehabResult;

    const res = processSupportTestRequest(processingReq.id, resultData);
    if (res) {
      showToast(`Hasil ${categoryKey.toUpperCase()} berhasil diproses & dikirim kembali!`, "success", "Berhasil");
      setProcessingReq(null);
      fetchSupportRequests();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 md:p-8 space-y-6 font-sans">
      <Toast
        show={toast.show}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />

      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20 shrink-0">
            <IconComp className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{config.title}</h1>
            <p className="text-xs font-medium text-slate-500 mt-0.5">{config.subtitle}</p>
          </div>
        </div>

        <Link
          href={`/dashboard/faskes/medical-records/${categoryKey}/history`}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 text-slate-800 font-extrabold text-xs hover:bg-slate-200 transition cursor-pointer"
        >
          <Clock className="h-4 w-4 text-slate-600" />
          <span>Lihat History Dokumen &rarr;</span>
        </Link>
      </div>

      {/* INCOMING SERVICE REQUESTS FROM IGD / UNIT PELAYANAN */}
      <div className="rounded-3xl border-2 border-indigo-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/20">
              <IconComp className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Permintaan Masuk Dari Unit Pelayanan (IGD / Poliklinik)
              </h2>
              <p className="text-xs font-semibold text-indigo-700">
                Daftar rujukan &amp; permintaan {categoryKey.toUpperCase()} yang perlu diproses &amp; dikirim hasilnya kembali
              </p>
            </div>
          </div>
          <button
            onClick={fetchSupportRequests}
            className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center gap-1.5 text-xs font-bold transition cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh List
          </button>
        </div>

        {supportRequests.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
            <Clock className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-extrabold text-slate-700">Belum Ada Permintaan {categoryKey.toUpperCase()} Masuk</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Permintaan dari unit pelayanan IGD / Rajal akan muncul di sini secara otomatis.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {supportRequests.map((req) => {
              const isDone = req.status === "SELESAI";
              return (
                <div
                  key={req.id}
                  className={`p-5 rounded-2xl border transition space-y-3 ${
                    isDone ? "bg-emerald-50/50 border-emerald-200" : "bg-indigo-50/40 border-indigo-200 shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-black uppercase">
                      {req.requestOrigin}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                        isDone
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : "bg-amber-100 text-amber-900 border-amber-300 animate-pulse"
                      }`}
                    >
                      {isDone ? "✓ Selesai & Kirim Kembali" : "Menunggu Diproses"}
                    </span>
                  </div>

                  <div>
                    <div className="text-sm font-black text-slate-900">{req.patientName}</div>
                    <div className="text-xs font-mono text-slate-600">
                      Visit ID: <span className="font-bold text-slate-800">{req.visitId}</span> | RM: {req.noRm}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">Peminta: {req.doctorName}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                    <div className="text-[10px] font-extrabold uppercase text-slate-500">Rincian Yang Diminta:</div>
                    <div className="text-xs font-semibold text-slate-900">{req.testDetails}</div>
                  </div>

                  {!isDone ? (
                    <button
                      type="button"
                      onClick={() => setProcessingReq(req)}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 cursor-pointer"
                    >
                      <Send className="h-4 w-4" />
                      <span>Proses Permintaan &amp; Input Hasil {categoryKey.toUpperCase()}</span>
                    </button>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-emerald-100/70 border border-emerald-200 text-emerald-950 text-xs font-semibold flex items-center justify-between">
                      <span>Hasil telah terkirim kembali ke unit asal.</span>
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Form Request Access Standard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Cari NIK Pasien */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="h-8 w-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-black text-xs">
                1
              </div>
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Cari Pasien Berdasarkan NIK</h2>
            </div>

            <form onSubmit={handleSearchNik} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={nikInput}
                  onChange={(e) => setNikInput(e.target.value)}
                  placeholder="Masukkan 16 digit NIK Pasien..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white transition"
                  maxLength={16}
                />
              </div>
              <button
                type="submit"
                disabled={searchStatus === "searching"}
                className="px-6 py-3 rounded-2xl bg-teal-600 text-white font-extrabold text-xs hover:bg-teal-700 transition disabled:opacity-50 cursor-pointer shadow-md shadow-teal-600/20"
              >
                {searchStatus === "searching" ? "Mencari..." : "Cari NIK"}
              </button>
            </form>

            {searchStatus === "found" && patientData && (
              <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-teal-950 block">{patientData.name}</span>
                    <span className="text-[11px] font-mono text-teal-800">NIK: {patientData.nik}</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-teal-600 text-white text-[10px] font-black uppercase">Data Terverifikasi</span>
              </div>
            )}
          </div>

          {/* Step 2: Form Permintaan Akses */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="h-8 w-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-black text-xs">
                2
              </div>
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Detail Alasan &amp; Dokter Peminta Akses</h2>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  Dokter Penanggung Jawab / Peminta Akses
                </label>
                <ModernDoctorSelect
                  value={doctorId}
                  onChange={(val) => setDoctorId(val)}
                  doctors={doctors}
                  placeholder="-- Pilih Dokter Penanggung Jawab --"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  Alasan &amp; Keperluan Permintaan Rekam Medis {categoryKey.toUpperCase()}
                </label>
                <textarea
                  rows={3}
                  value={purposeInput}
                  onChange={(e) => setPurposeInput(e.target.value)}
                  placeholder={`Contoh: Diperlukan untuk evaluasi tindakan ${categoryKey.toUpperCase()}, konsultasi antar spesialis, atau rujukan medis...`}
                  className="w-full p-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white transition"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingRequest || !patientData}
                  className="w-full py-3.5 rounded-2xl bg-teal-600 text-white font-black text-xs hover:bg-teal-700 transition disabled:opacity-50 cursor-pointer shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  <span>{submittingRequest ? "Mengirimkan Permintaan..." : "Kirimkan Permintaan Akses Data"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-teal-200 bg-gradient-to-br from-teal-900 to-slate-900 text-white p-6 shadow-md space-y-3">
            <div className="h-10 w-10 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-wider">Perlindungan Data Rekam Medis</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Setiap pengajuan izin akses rekam medis {categoryKey.toUpperCase()} dicatat pada blockchain &amp; audit trail SatuData untuk menjamin kerahasiaan data pasien sesuai standar UU Kesehatanan dan SatuSehat Kemenkes.
            </p>
          </div>
        </div>
      </div>

      {/* MODAL INPUT HASIL FOR CATEGORIES */}
      {processingReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Input Hasil / Catatan {categoryKey.toUpperCase()}
                </h3>
                <p className="text-xs text-slate-500">
                  Pasien: <span className="font-bold text-slate-800">{processingReq.patientName}</span> ({processingReq.visitId})
                </p>
              </div>
              <button
                onClick={() => setProcessingReq(null)}
                className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleProcessSubmit} className="space-y-4">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <span className="font-bold text-slate-700 block">Rincian Yang Diminta:</span>
                <span className="text-slate-900 font-semibold">{processingReq.testDetails}</span>
              </div>

              {categoryKey === "lab" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Hemoglobin (Hb)</label>
                      <input
                        type="text"
                        value={labResult.hb}
                        onChange={(e) => setLabResult({ ...labResult, hb: e.target.value })}
                        placeholder="g/dL"
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Leukosit</label>
                      <input
                        type="text"
                        value={labResult.leukosit}
                        onChange={(e) => setLabResult({ ...labResult, leukosit: e.target.value })}
                        placeholder="/uL"
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Trombosit</label>
                      <input
                        type="text"
                        value={labResult.trombosit}
                        onChange={(e) => setLabResult({ ...labResult, trombosit: e.target.value })}
                        placeholder="/uL"
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">GDS (Gula Darah)</label>
                      <input
                        type="text"
                        value={labResult.gds}
                        onChange={(e) => setLabResult({ ...labResult, gds: e.target.value })}
                        placeholder="mg/dL"
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Laboratorium</label>
                    <textarea
                      rows={2}
                      value={labResult.labNotes}
                      onChange={(e) => setLabResult({ ...labResult, labNotes: e.target.value })}
                      placeholder="Catatan tambahan hasil lab..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>
              )}

              {categoryKey === "radiologi" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Hasil Ekspertisi Radiologi</label>
                    <textarea
                      rows={3}
                      value={radResult.radExpertise}
                      onChange={(e) => setRadResult({ ...radResult, radExpertise: e.target.value })}
                      placeholder="Deskripsi temuan ekspertisi foto rontgen / USG / CT-Scan..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-cyan-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Kesan Radiolog</label>
                    <input
                      type="text"
                      value={radResult.radImpression}
                      onChange={(e) => setRadResult({ ...radResult, radImpression: e.target.value })}
                      placeholder="Kesan kesimpulan foto..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-cyan-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Dokter Spesialis Radiologi</label>
                    <input
                      type="text"
                      value={radResult.doctorExpertise}
                      onChange={(e) => setRadResult({ ...radResult, doctorExpertise: e.target.value })}
                      placeholder="Nama Dokter Radiolog..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-cyan-600"
                    />
                  </div>
                </div>
              )}

              {categoryKey === "bedah" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tindakan / Prosedur Bedah (OK)</label>
                    <input
                      type="text"
                      value={bedahResult.opProcedure}
                      onChange={(e) => setBedahResult({ ...bedahResult, opProcedure: e.target.value })}
                      placeholder="Nama tindakan bedah..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-rose-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Diagnosis Pasca-Operasi (Post-Op)</label>
                    <input
                      type="text"
                      value={bedahResult.opDiagnosis}
                      onChange={(e) => setBedahResult({ ...bedahResult, opDiagnosis: e.target.value })}
                      placeholder="Diagnosis pasca operasi..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-rose-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Ahli Bedah Utama / Operator</label>
                    <input
                      type="text"
                      value={bedahResult.doctorExpertise}
                      onChange={(e) => setBedahResult({ ...bedahResult, doctorExpertise: e.target.value })}
                      placeholder="Nama Dokter Ahli Bedah..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-rose-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Laporan Operasi</label>
                    <textarea
                      rows={2}
                      value={bedahResult.opNotes}
                      onChange={(e) => setBedahResult({ ...bedahResult, opNotes: e.target.value })}
                      placeholder="Ringkasan laporan operasi & instruksi PACU..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-rose-600"
                    />
                  </div>
                </div>
              )}

              {categoryKey === "rehab" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Program Terapi Rehab Medis</label>
                    <input
                      type="text"
                      value={rehabResult.rehabProgram}
                      onChange={(e) => setRehabResult({ ...rehabResult, rehabProgram: e.target.value })}
                      placeholder="Program fisioterapi / terapi latihan..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Diagnosis Fungsi &amp; Kelainan</label>
                    <input
                      type="text"
                      value={rehabResult.rehabDiagnosis}
                      onChange={(e) => setRehabResult({ ...rehabResult, rehabDiagnosis: e.target.value })}
                      placeholder="Diagnosis fungsi otot / gerak..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Evaluasi Pemulihan</label>
                    <textarea
                      rows={2}
                      value={rehabResult.rehabNotes}
                      onChange={(e) => setRehabResult({ ...rehabResult, rehabNotes: e.target.value })}
                      placeholder="Catatan hasil fisioterapi / evaluasi pemulihan..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              )}

              {categoryKey !== "lab" && categoryKey !== "radiologi" && categoryKey !== "bedah" && categoryKey !== "rehab" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Pemrosesan Permintaan</label>
                  <textarea
                    rows={3}
                    value={genericResult.summary}
                    onChange={(e) => setGenericResult({ summary: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-teal-600"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setProcessingReq(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  Kirim Kembali Hasil &rarr;
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
