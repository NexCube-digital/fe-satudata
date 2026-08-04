"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { apiGet } from "@/lib/api";
import { Plus, RefreshCw, ArrowUpRight, CheckCircle, Hash, FileText, Check, X, Paperclip, Info } from "lucide-react";
import { uploadMedicalRecord } from "@/services/hospitalService";

// "resep" SENGAJA tidak ada di sini: backend (DETAIL_MODEL_BY_TYPE) tidak
// mengizinkan RS mengisi resep lewat endpoint ini -- itu modul apoteker
// terpisah. Kalau dikirim, backend akan membuangnya diam-diam.
const RECORD_TYPES = [
  { value: "umum", label: "Umum" },
  { value: "lab", label: "Laboratorium" },
  { value: "radiologi", label: "Radiologi" },
];

const TYPE_OF_TREATMENT_OPTIONS = [
  { value: "rawat_jalan", label: "Rawat Jalan" },
  { value: "rawat_inap", label: "Rawat Inap" },
  { value: "igd", label: "IGD" },
  { value: "one_day_care", label: "One Day Care" },
];

const SPECIALIST_KEYWORDS_BY_TYPE = {
  umum: ["umum"],
  lab: ["patologi klinik", "laboratorium"],
  radiologi: ["radiologi"],
};

// Field detail per jenis -- HANYA field detail (bukan title/visitDate/doctor/
// summary, karena itu sekarang satu set untuk seluruh rekam medis, bukan per
// jenis, mengikuti model MedicalRecord di backend).
function getDetailFieldsConfig(type) {
  switch (type) {
    case "lab":
      return [
        { name: "checkup_result", label: "Hasil Pemeriksaan" },
        { name: "reference_values", label: "Nilai Referensi" },
        { name: "conclusion", label: "Kesimpulan" },
      ];
    case "radiologi":
      return [
        { name: "checkup_result", label: "Temuan Radiologi" },
        { name: "conclusion", label: "Kesimpulan" },
      ];
    default:
      return [
        { name: "complaint", label: "Keluhan Pasien" },
        { name: "diagnosis", label: "Diagnosa" },
        { name: "action", label: "Tindakan" },
        { name: "note_doctor", label: "Catatan Dokter" },
      ];
  }
}

function buildEmptyDetail(type) {
  const empty = {};
  getDetailFieldsConfig(type).forEach((f) => {
    empty[f.name] = "";
  });
  return empty;
}

const MAX_ATTACHMENTS = 5;

export default function FaskesMedicalRecordUploadPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [patientId, setPatientId] = useState("");
  const [approvedPatients, setApprovedPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Field header -- satu set untuk keseluruhan rekam medis (1 kunjungan)
  const [title, setTitle] = useState("");
  const [visitDate, setVisitDate] = useState(todayStr);
  const [typeOfTreatment, setTypeOfTreatment] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState("final"); // "final" | "draft"

  const [selectedTypes, setSelectedTypes] = useState([]);
  const [detailsByType, setDetailsByType] = useState({});

  const [attachmentFiles, setAttachmentFiles] = useState([]);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadedResult, setUploadedResult] = useState(null);
  const [copiedTx, setCopiedTx] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [doctorsList, setDoctorsList] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  const closeSuccessModal = () => setShowSuccessModal(false);

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

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoadingDoctors(true);
      try {
        const result = await apiGet("/api/doctor");
        const docs = Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result?.data?.items)
          ? result.data.items
          : [];
        setDoctorsList(docs);
      } catch (err) {
        console.error("Gagal memuat daftar dokter", err);
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, []);

  // Dokter yang cocok dengan jenis-jenis yang sedang dipilih (union
  // keyword). Kalau belum ada jenis dipilih atau tidak ada yang cocok,
  // tampilkan semua dokter.
  const doctorsForSelection = useMemo(() => {
    if (selectedTypes.length === 0) return doctorsList;
    const keywords = selectedTypes.flatMap((t) => SPECIALIST_KEYWORDS_BY_TYPE[t] || []);
    if (keywords.length === 0) return doctorsList;
    const filtered = doctorsList.filter((doc) => {
      const spec = (doc.specialist || "").toLowerCase();
      return keywords.some((k) => spec.includes(k));
    });
    return filtered.length > 0 ? filtered : doctorsList;
  }, [doctorsList, selectedTypes]);

  const toggleRecordType = (type) => {
    setSelectedTypes((prev) => {
      if (prev.includes(type)) {
        setDetailsByType((prevData) => {
          const next = { ...prevData };
          delete next[type];
          return next;
        });
        return prev.filter((t) => t !== type);
      }

      setDetailsByType((prevData) => ({ ...prevData, [type]: buildEmptyDetail(type) }));
      return [...prev, type];
    });
  };

  const updateDetailField = (type, fieldName, value) => {
    setDetailsByType((prev) => ({
      ...prev,
      [type]: { ...prev[type], [fieldName]: value },
    }));
  };

  const handleFilesSelected = (fileList) => {
    const incoming = Array.from(fileList || []);
    setAttachmentFiles((prev) => {
      const combined = [...prev, ...incoming];
      if (combined.length > MAX_ATTACHMENTS) {
        setErrorMessage(`Maksimal ${MAX_ATTACHMENTS} lampiran per rekam medis.`);
        return combined.slice(0, MAX_ATTACHMENTS);
      }
      return combined;
    });
  };

  const removeAttachment = (index) => {
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setPatientId("");
    setTitle("");
    setVisitDate(todayStr);
    setTypeOfTreatment("");
    setDoctorId("");
    setSummary("");
    setStatus("final");
    setSelectedTypes([]);
    setDetailsByType({});
    setAttachmentFiles([]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!patientId) {
      setErrorMessage("Pilih pasien terlebih dahulu.");
      return;
    }
    if (!title.trim()) {
      setErrorMessage("Judul rekam medis wajib diisi.");
      return;
    }
    if (!visitDate) {
      setErrorMessage("Tanggal kunjungan wajib diisi.");
      return;
    }
    if (visitDate < todayStr) {
      setErrorMessage("Tanggal kunjungan tidak boleh sebelum hari ini.");
      return;
    }
    if (!typeOfTreatment) {
      setErrorMessage("Jenis perawatan wajib dipilih.");
      return;
    }
    if (selectedTypes.length === 0) {
      setErrorMessage("Pilih minimal 1 jenis rekam medis (Umum/Lab/Radiologi) yang ingin diunggah.");
      return;
    }

    // Pastikan setiap jenis yang dipilih punya minimal 1 field terisi,
    // sesuai validasi pickValidDetails() di backend.
    for (const type of selectedTypes) {
      const fields = detailsByType[type] || {};
      const hasContent = Object.values(fields).some((v) => v && String(v).trim() !== "");
      if (!hasContent) {
        const typeLabel = RECORD_TYPES.find((t) => t.value === type)?.label || type;
        setErrorMessage(`Lengkapi minimal 1 data untuk rekam medis ${typeLabel}, atau hapus centang jenis ini.`);
        return;
      }
    }

    setIsUploading(true);

    const details = {};
    selectedTypes.forEach((type) => {
      details[type] = detailsByType[type];
    });

    try {
      const formData = new FormData();
      formData.append("patientId", patientId);
      formData.append("title", title);
      formData.append("visitDate", visitDate);
      formData.append("typeOfTreatment", typeOfTreatment);
      formData.append("status", status);
      if (doctorId) formData.append("doctorId", doctorId);
      if (summary) formData.append("summary", summary);
      // "details" dikirim sebagai JSON string -- ini yang di-parse balik oleh
      // parseMedicalRecordPayload() di hospitalController.
      formData.append("details", JSON.stringify(details));
      attachmentFiles.forEach((file) => formData.append("attachments", file));

      const result = await uploadMedicalRecord(formData);
      if (result?.success) {
        setUploadedResult({
          recordType: result.data?.record_type,
          title: result.data?.title,
          status: result.data?.status,
          txHash: result.data?.tx_hash || "",
        });
        setShowSuccessModal(true);
        resetForm();
      } else {
        setErrorMessage(result?.message || "Gagal mengunggah rekam medis.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "Koneksi ke backend bermasalah.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#faf7f2] via-[#fdfbf7] to-[#f5efe6] flex flex-col pb-16 md:pb-0">
      <Navbar user={user} roleLabel="Fasilitas Kesehatan" onLogout={() => router.push("/auth/login")} />
      <div className="flex flex-1">
        <Sidebar role="faskes" />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-rose-700 font-bold">Dashboard Faskes</p>
              <h1 className="text-3xl font-extrabold text-slate-900 mt-3">Upload Rekam Medis Baru</h1>
              <p className="max-w-2xl text-sm text-slate-500 mt-2">
                Satu rekam medis mewakili satu kunjungan pasien. Anda bisa mengisi kombinasi Umum, Lab, dan/atau Radiologi
                sekaligus dalam kunjungan yang sama.
              </p>
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

              {/* --- Header rekam medis: berlaku untuk keseluruhan kunjungan --- */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 space-y-5">
                <span className="text-xs font-extrabold uppercase tracking-wider text-rose-800">Informasi Kunjungan</span>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Judul Rekam Medis</label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      type="text"
                      placeholder="Contoh: Pemeriksaan Gula Darah"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-rose-700 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Tanggal Kunjungan</label>
                    <input
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      type="date"
                      min={todayStr}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-rose-700 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Jenis Perawatan</label>
                    <select
                      value={typeOfTreatment}
                      onChange={(e) => setTypeOfTreatment(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-rose-700 focus:outline-none cursor-pointer"
                      required
                    >
                      <option value="">-- Pilih Jenis Perawatan --</option>
                      {TYPE_OF_TREATMENT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">
                      Dokter Penanggung Jawab <span className="text-slate-400 font-medium normal-case ml-1">(opsional)</span>
                    </label>
                    <select
                      value={doctorId}
                      onChange={(e) => setDoctorId(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-rose-700 focus:outline-none cursor-pointer font-medium"
                    >
                      <option value="">{loadingDoctors ? "Memuat daftar dokter..." : "-- Tidak ditentukan --"}</option>
                      {doctorsForSelection.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.name} - {doc.specialist || "Dokter Umum"}
                        </option>
                      ))}
                    </select>
                    {!loadingDoctors && doctorsForSelection.length === 0 && (
                      <p className="mt-2 text-xs text-amber-700 font-medium">Belum ada dokter yang terhubung ke Faskes Anda.</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Ringkasan Medis</label>
                  <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    rows={3}
                    placeholder="Ringkasan singkat kondisi pasien"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-rose-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Status</label>
                  <div className="flex gap-3">
                    {[
                      { value: "final", label: "Final (langsung di-anchor ke blockchain)" },
                      { value: "draft", label: "Draft (belum di-anchor)" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setStatus(opt.value)}
                        className={`flex-1 rounded-2xl border px-4 py-3 text-xs font-bold transition cursor-pointer ${
                          status === opt.value
                            ? "border-rose-700 bg-rose-800 text-white shadow-md"
                            : "border-slate-200 bg-white text-slate-600 hover:border-rose-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* --- Jenis pemeriksaan --- */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Jenis Rekam Medis (bisa pilih lebih dari satu)</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {RECORD_TYPES.map((option) => {
                    const active = selectedTypes.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => toggleRecordType(option.value)}
                        className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition cursor-pointer ${
                          active
                            ? "border-rose-700 bg-rose-800 text-white shadow-md"
                            : "border-slate-200 bg-slate-50 text-slate-700 hover:border-rose-300"
                        }`}
                      >
                        {active && <Check className="h-4 w-4" />}
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 flex items-start gap-1.5 text-xs text-slate-400">
                  <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  Resep obat tidak diisi lewat halaman ini — resep ditambahkan oleh modul Apoteker.
                </p>
              </div>

              {selectedTypes.length === 0 && (
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-500">
                  Pilih minimal 1 jenis rekam medis di atas untuk mulai mengisi data pemeriksaan.
                </div>
              )}

              {selectedTypes.map((type) => {
                const typeLabel = RECORD_TYPES.find((t) => t.value === type)?.label || type;
                const detailFields = getDetailFieldsConfig(type);
                const entryDetail = detailsByType[type] || buildEmptyDetail(type);

                return (
                  <div key={type} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 space-y-5">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-rose-800">Data: {typeLabel}</span>
                    <div className="grid gap-6">
                      {detailFields.map((field) => (
                        <div key={field.name}>
                          <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">{field.label}</label>
                          <textarea
                            value={entryDetail[field.name] || ""}
                            onChange={(e) => updateDetailField(type, field.name, e.target.value)}
                            rows={3}
                            placeholder={field.label}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-rose-700 focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* --- Lampiran --- */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">
                  Lampiran <span className="text-slate-400 font-medium normal-case ml-1">(opsional, maks. {MAX_ATTACHMENTS} file)</span>
                </label>
                <label
                  htmlFor="attachments-input"
                  className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-rose-300 bg-rose-50/40 px-4 py-6 text-sm font-semibold text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                >
                  <Paperclip className="h-4 w-4" /> Klik untuk pilih file lampiran
                </label>
                <input
                  id="attachments-input"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    handleFilesSelected(e.target.files);
                    e.target.value = "";
                  }}
                />
                {attachmentFiles.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {attachmentFiles.map((file, idx) => (
                      <li
                        key={`${file.name}-${idx}`}
                        className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2"
                      >
                        <span className="flex items-center gap-2 min-w-0 text-sm text-slate-700">
                          <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                          <span className="truncate">{file.name}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(idx)}
                          className="text-slate-400 hover:text-rose-700 transition shrink-0"
                          title="Hapus lampiran"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {errorMessage && (
                <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm font-medium text-rose-700">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isUploading || selectedTypes.length === 0}
                className="inline-flex items-center gap-2 rounded-2xl bg-rose-800 px-5 py-3 text-sm font-bold text-white hover:bg-rose-700 transition disabled:opacity-50"
              >
                {isUploading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Unggah Rekam Medis ke Blockchain
              </button>
            </form>
          </div>
        </main>
      </div>

      {showSuccessModal && uploadedResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={closeSuccessModal}
        >
          <div
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeSuccessModal}
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition cursor-pointer z-10"
              aria-label="Tutup modal"
              title="Tutup modal"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="bg-linear-to-r from-emerald-600 via-teal-600 to-emerald-700 px-6 py-8 text-white text-center relative overflow-hidden">
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-xl" />
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-lg ring-4 ring-white/30">
                <CheckCircle className="h-9 w-9 text-white" />
              </div>
              <h3 className="text-xl font-extrabold tracking-tight">Rekam Medis Berhasil Diunggah!</h3>
              <p className="text-xs text-emerald-100 mt-1 font-medium max-w-sm mx-auto">
                {uploadedResult.status === "draft"
                  ? "Data tersimpan sebagai draft dan belum di-anchor ke blockchain."
                  : "Data rekam medis terenkripsi AES-256 dan bukti transaksi terjangkar secara resmi ke Smart Contract Blockchain."}
              </p>
            </div>

            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Hash className="h-3.5 w-3.5 text-rose-600" />
                    {uploadedResult.title || "Rekam Medis"}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full border border-rose-200">
                    {uploadedResult.recordType}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-3 gap-2">
                  <span className="font-mono text-xs font-bold text-rose-900 break-all select-all">
                    {uploadedResult.txHash || "Belum di-anchor (draft)"}
                  </span>
                  {uploadedResult.txHash && (
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(uploadedResult.txHash);
                        setCopiedTx(true);
                        setTimeout(() => setCopiedTx(false), 2000);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-800 hover:bg-rose-100 font-bold text-xs transition cursor-pointer shrink-0 border border-rose-200"
                    >
                      {copiedTx ? "Tersalin!" : "Salin Hash"}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => router.push("/dashboard/faskes/medical-records")}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-800 hover:bg-rose-900 px-5 py-3 text-xs font-bold text-white shadow-md transition cursor-pointer"
                >
                  <FileText className="h-4 w-4" />
                  Lihat Semua Rekam Medis
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closeSuccessModal();
                    setUploadedResult(null);
                  }}
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-100 hover:bg-slate-200 px-5 py-3 text-xs font-bold text-slate-700 transition cursor-pointer"
                >
                  Unggah Lagi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}