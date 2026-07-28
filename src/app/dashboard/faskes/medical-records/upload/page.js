"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { apiGet } from "@/lib/api";
import { Plus, RefreshCw, ArrowUpRight } from "lucide-react";
import { uploadMedicalRecord } from "@/services/hospitalService";

const RECORD_TYPES = [
  { value: "umum", label: "Umum" },
  { value: "lab", label: "Laboratorium" },
  { value: "radiologi", label: "Radiologi" },
  { value: "resep", label: "Resep" }
];

export default function FaskesMedicalRecordUploadPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [approvedPatients, setApprovedPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [recordType, setRecordType] = useState("umum");
  const [title, setTitle] = useState("");
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split("T")[0]);
  const [doctorId, setDoctorId] = useState("");
  const [summary, setSummary] = useState("");
  const [detail, setDetail] = useState({
    complaint: "",
    diagnosis: "",
    action: "",
    note_doctor: "",
    checkup_result: "",
    reference_values: "",
    conclusion: "",
    list_of_medicines: ""
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const rawUser = localStorage.getItem("user");
    if (rawUser) {
      try {
        setUser(JSON.parse(rawUser));
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  useEffect(() => {
    const fetchApprovedPatients = async () => {
      setLoadingPatients(true);
      try {
        const result = await apiGet("/api/hospital/access-requests");
        const approved = Array.isArray(result?.data)
          ? result.data.filter((item) => item.status === "approved")
          : [];

        setApprovedPatients(
          approved.map((item) => ({
            patientId: item.patient_id,
            patientName: item.Patient?.name || item.patient?.name || "Pasien Terotorisasi",
            nik: item.Patient?.profil?.nik || item.patient?.profil?.nik || "-",
            requestId: item.id,
          }))
        );
      } catch (err) {
        console.error("Gagal memuat pasien terotorisasi", err);
      } finally {
        setLoadingPatients(false);
      }
    };

    fetchApprovedPatients();
  }, []);

  const recordTypeDetails = useMemo(() => {
    switch (recordType) {
      case "lab":
        return [
          { name: "checkup_result", label: "Hasil Pemeriksaan" },
          { name: "reference_values", label: "Nilai Referensi" },
          { name: "conclusion", label: "Kesimpulan" }
        ];
      case "radiologi":
        return [
          { name: "checkup_result", label: "Temuan Radiologi" },
          { name: "conclusion", label: "Kesimpulan" }
        ];
      case "resep":
        return [
          { name: "list_of_medicines", label: "Daftar Obat (pisahkan dengan ; )" },
          { name: "note_doctor", label: "Catatan Dokter" }
        ];
      default:
        return [
          { name: "complaint", label: "Keluhan Pasien" },
          { name: "diagnosis", label: "Diagnosa" },
          { name: "action", label: "Tindakan" },
          { name: "note_doctor", label: "Catatan Dokter" }
        ];
    }
  }, [recordType]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!patientId || !title || !visitDate || !doctorId) {
      setErrorMessage("Lengkapi semua field yang wajib diisi terlebih dahulu.");
      return;
    }

    setIsUploading(true);

    const payload = {
      patientId: Number(patientId),
      recordType,
      title,
      visitDate,
      doctorId: Number(doctorId),
      summary,
      detail: {
        complaint: detail.complaint,
        diagnosis: detail.diagnosis,
        action: detail.action,
        note_doctor: detail.note_doctor,
        checkup_result: detail.checkup_result,
        reference_values: detail.reference_values,
        conclusion: detail.conclusion,
        list_of_medicines: detail.list_of_medicines
      }
    };

    try {
      const result = await uploadMedicalRecord(payload);
      if (result.success) {
        setSuccessMessage("Rekam medis berhasil diunggah dan tersimpan ke blockchain.");
        setPatientId("");
        setTitle("");
        setDoctorId("");
        setSummary("");
        setDetail({
          complaint: "",
          diagnosis: "",
          action: "",
          note_doctor: "",
          checkup_result: "",
          reference_values: "",
          conclusion: "",
          list_of_medicines: ""
        });
      } else {
        setErrorMessage(result.message || "Gagal mengunggah rekam medis.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "Koneksi ke backend bermasalah.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf7f2] via-[#fdfbf7] to-[#f5efe6] flex flex-col pb-16 md:pb-0">
      <Navbar user={user} roleLabel="Fasilitas Kesehatan" onLogout={() => router.push("/auth/login")} />
      <div className="flex flex-1">
        <Sidebar role="faskes" />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-rose-700 font-bold">Dashboard Faskes</p>
              <h1 className="text-3xl font-extrabold text-slate-900 mt-3">Upload Rekam Medis Baru</h1>
              <p className="max-w-2xl text-sm text-slate-500 mt-2">Form upload terpisah untuk menambahkan rekam medis baru dan mencatat tx hash blockchain.</p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/dashboard/faskes/medical-records")}
              className="inline-flex items-center gap-2 rounded-2xl bg-rose-800 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-rose-700 transition"
            >
              <ArrowUpRight className="h-4 w-4" /> Semua Rekam Medis
            </button>
          </div>

          <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Pilih Pasien Terotorisasi</label>
                  <select
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-rose-700 focus:outline-none"
                    required
                  >
                    <option value="">{loadingPatients ? "Memuat pasien terotorisasi..." : "Pilih pasien yang sudah menyetujui akses"}</option>
                    {approvedPatients.map((patient) => (
                      <option key={patient.patientId} value={patient.patientId}>
                        {patient.patientName} - {patient.nik}
                      </option>
                    ))}
                  </select>
                  {!loadingPatients && approvedPatients.length === 0 && (
                    <p className="mt-2 text-xs text-slate-500">Belum ada pasien yang memberi akses. Silakan ajukan permintaan akses terlebih dahulu.</p>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Jenis Rekam Medis</label>
                  <select
                    value={recordType}
                    onChange={(e) => setRecordType(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-rose-700 focus:outline-none"
                  >
                    {RECORD_TYPES.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Judul Rekam Medis</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    type="text"
                    placeholder="Contoh: Pemeriksaan Gula Darah"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-rose-700 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Tanggal Kunjungan</label>
                  <input
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    type="date"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-rose-700 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Dokter Penanggung Jawab</label>
                <input
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                  type="text"
                    placeholder="Masukkan nama atau ID dokter"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-rose-700 focus:outline-none"
                    required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Ringkasan Medis</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={3}
                  placeholder="Ringkasan singkat kondisi pasien"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-rose-700 focus:outline-none"
                />
              </div>

              <div className="grid gap-6">
                {recordTypeDetails.map((field) => (
                  <div key={field.name}>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">{field.label}</label>
                    <textarea
                      value={detail[field.name]}
                      onChange={(e) => setDetail((prev) => ({ ...prev, [field.name]: e.target.value }))}
                      rows={3}
                      placeholder={field.label}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-rose-700 focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              {errorMessage && <p className="text-sm text-rose-700 font-medium">{errorMessage}</p>}
              {successMessage && <p className="text-sm text-emerald-700 font-medium">{successMessage}</p>}

              <button
                type="submit"
                disabled={isUploading}
                className="inline-flex items-center gap-2 rounded-2xl bg-rose-800 px-5 py-3 text-sm font-bold text-white hover:bg-rose-700 transition disabled:opacity-50"
              >
                {isUploading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Unggah Rekam Medis ke Blockchain
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
