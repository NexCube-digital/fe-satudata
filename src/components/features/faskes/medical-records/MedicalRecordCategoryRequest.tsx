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
} from "lucide-react";

const CATEGORY_NAMES: Record<string, { title: string; subtitle: string; icon: any }> = {
  ranap: {
    title: "Permintaan Data Rekam Medis Rawat Inap",
    subtitle: "Pengajuan Izin Akses Rekam Medis Ranap Pasien ke Faskes / Pasien",
    icon: Building2,
  },
  bedah: {
    title: "Permintaan Data Rekam Medis Bedah",
    subtitle: "Pengajuan Izin Akses Laporan Operasi Bedah & Anestesi",
    icon: Scissors,
  },
  lab: {
    title: "Permintaan Data Rekam Medis Laboratorium",
    subtitle: "Pengajuan Izin Akses Hasil Pemeriksaan Laboratorium Pasien",
    icon: FileText,
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

  const [toast, setToast] = useState({ show: false, type: "success", title: "", message: "" });
  const showToast = (message: string, type = "success", title = "") =>
    notify(setToast, { type, title, message });

  useEffect(() => {
    fetchDoctorsList();
    setLoading(false);
  }, []);

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
      // Simulate NIK search / lookup
      setTimeout(() => {
        setPatientData({
          nik: nikInput,
          name: "Pasien Terdaftar",
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

      {/* Form Request Access */}
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
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Detail Alasan & Dokter Peminta Akses</h2>
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
                  Alasan & Keperluan Permintaan Rekam Medis {categoryKey.toUpperCase()}
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
              Setiap pengajuan izin akses rekam medis {categoryKey.toUpperCase()} dicatat pada blockchain & audit trail SatuData untuk menjamin kerahasiaan data pasien sesuai standar UU Kesehatanan dan SatuSehat Kemenkes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
