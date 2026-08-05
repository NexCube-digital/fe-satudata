"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { apiGet } from "@/lib/api";
import {
  Plus,
  RefreshCw,
  ArrowUpRight,
  CheckCircle,
  Hash,
  FileText,
  Check,
  X,
  Paperclip,
  Info,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Save,
  Pill,
} from "lucide-react";
import {
  createMedicalRecordDraft,
  updateMedicalRecordDraft,
  getMedicalRecordById,
} from "@/services/hospitalService";

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

// --- Wizard step keys ---
const STEP_JENIS = "jenis";
const STEP_KUNJUNGAN = "kunjungan";
const STEP_LAMPIRAN = "lampiran";
const detailStepKey = (type) => `detail_${type}`;

// Hanya menyimpan id draft + jenis yang dipilih (bukan isi form) supaya kalau
// halaman dibuka ulang, kita tahu draft mana yang harus di-fetch ulang dari
// backend dan step berapa yang harus di-render (isi form sebenarnya SELALU
// diambil ulang dari backend, bukan dari localStorage, biar tidak basi/rawan tamper).
const WIZARD_DRAFT_STORAGE_KEY = "faskes_medrec_wizard_draft_v1";

function saveWizardDraftMeta(recordId, selectedTypes) {
  try {
    localStorage.setItem(WIZARD_DRAFT_STORAGE_KEY, JSON.stringify({ recordId, selectedTypes }));
  } catch (err) {
    console.error("Gagal menyimpan meta draft ke localStorage", err);
  }
}

function loadWizardDraftMeta() {
  try {
    const raw = localStorage.getItem(WIZARD_DRAFT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error("Gagal membaca meta draft dari localStorage", err);
    return null;
  }
}

function clearWizardDraftMeta() {
  try {
    localStorage.removeItem(WIZARD_DRAFT_STORAGE_KEY);
  } catch (err) {
    console.error("Gagal menghapus meta draft dari localStorage", err);
  }
}

// Buat 1 baris obat kosong. id dipakai sebagai React key + acuan update/hapus baris,
// TIDAK dikirim ke backend (hanya field medicine/quantity/rule yang diserialize).
function buildEmptyPrescriptionRow() {
  return {
    id: `obat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    medicine: "",
    quantity: "",
    rule: "",
  };
}

/**
 * Dropdown dengan kotak pencarian di dalamnya. Klik untuk membuka, ketik
 * untuk memfilter daftar opsi berdasarkan label, klik opsi atau klik di luar
 * untuk menutup.
 */
function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "-- Pilih --",
  isLoading = false,
  loadingText = "Memuat...",
  emptyText = "Tidak ada hasil yang cocok.",
  disabled = false,
  required = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [open]);

  const selected = options.find((o) => o.value === value);

  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.trim().toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const toggleOpen = () => {
    if (disabled || isLoading) return;
    setOpen((o) => !o);
  };

  return (
    <div className="relative" ref={containerRef}>
      {required && (
        <input tabIndex={-1} value={value || ""} onChange={() => {}} required className="sr-only" aria-hidden="true" />
      )}

      <button
        type="button"
        onClick={toggleOpen}
        disabled={disabled || isLoading}
        className="w-full flex items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-rose-700 focus:outline-none disabled:opacity-60 cursor-pointer"
      >
        <span className={`truncate text-left ${selected ? "text-slate-900 font-medium" : "text-slate-400"}`}>
          {isLoading ? loadingText : selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && !isLoading && (
        <div className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setOpen(false);
                    setQuery("");
                  }
                }}
                placeholder="Cari..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm text-slate-900 focus:border-rose-700 focus:outline-none"
              />
            </div>
          </div>

          <ul className="max-h-56 overflow-y-auto py-1">
            {value && (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                    setQuery("");
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-50 cursor-pointer"
                >
                  -- Kosongkan pilihan --
                </button>
              </li>
            )}

            {filteredOptions.length === 0 ? (
              <li className="px-4 py-3 text-sm text-slate-400">{emptyText}</li>
            ) : (
              filteredOptions.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition cursor-pointer ${
                      opt.value === value
                        ? "bg-rose-50 text-rose-800 font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

function StepIndicator({ steps, currentIndex }) {
  const stepLabel = (step) => {
    if (step === STEP_JENIS) return "Jenis Rekam Medis";
    if (step === STEP_KUNJUNGAN) return "Informasi Kunjungan";
    if (step === STEP_LAMPIRAN) return "Lampiran & Finalisasi";
    const type = step.replace("detail_", "");
    return `Data ${RECORD_TYPES.find((t) => t.value === type)?.label || type}`;
  };

  return (
    <ol className="flex flex-wrap items-center gap-2 mb-6">
      {steps.map((step, idx) => {
        const isDone = idx < currentIndex;
        const isActive = idx === currentIndex;
        return (
          <li key={step} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                isActive
                  ? "bg-rose-800 text-white shadow-md"
                  : isDone
                  ? "bg-rose-100 text-rose-800"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                  isActive ? "bg-white/20" : isDone ? "bg-rose-200" : "bg-white"
                }`}
              >
                {isDone ? <Check className="h-3 w-3" /> : idx + 1}
              </span>
              {stepLabel(step)}
            </div>
            {idx < steps.length - 1 && <span className="h-px w-4 bg-slate-200" />}
          </li>
        );
      })}
    </ol>
  );
}

export default function FaskesMedicalRecordUploadPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingStep, setIsSavingStep] = useState(false);
  const [isResuming, setIsResuming] = useState(true);
  const [resumedFromDraft, setResumedFromDraft] = useState(false);

  const [patientId, setPatientId] = useState("");
  const [approvedPatients, setApprovedPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  const [title, setTitle] = useState("");
  const [visitDate, setVisitDate] = useState(todayStr);
  const [typeOfTreatment, setTypeOfTreatment] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [summary, setSummary] = useState("");

  const [selectedTypes, setSelectedTypes] = useState([]);
  const [detailsByType, setDetailsByType] = useState({});

  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [existingAttachmentsInfo, setExistingAttachmentsInfo] = useState([]);

  // Daftar obat (opsional). Disimpan terpisah dari detailsByType karena obat
  // bukan bagian dari jenis rekam medis (umum/lab/radiologi) -- selalu
  // tersedia di step terakhir apapun jenis rekam medis yang dipilih.
  const [prescriptionItems, setPrescriptionItems] = useState([]);

  const [recordId, setRecordId] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadedResult, setUploadedResult] = useState(null);
  const [copiedTx, setCopiedTx] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [doctorsList, setDoctorsList] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  const closeSuccessModal = () => setShowSuccessModal(false);

  // steps mengikuti jenis rekam medis yang dipilih, jadi wizard otomatis
  // lebih pendek kalau cuma pilih 1 jenis.
  const steps = useMemo(
    () => [STEP_JENIS, STEP_KUNJUNGAN, ...selectedTypes.map(detailStepKey), STEP_LAMPIRAN],
    [selectedTypes]
  );
  const currentStep = steps[currentStepIndex] || STEP_JENIS;

  useEffect(() => {
    setCurrentStepIndex((idx) => Math.min(idx, steps.length - 1));
  }, [steps.length]);

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

  // --- Resume draft yang belum selesai (kalau ada) ---
  useEffect(() => {
    const meta = loadWizardDraftMeta();
    if (!meta?.recordId) {
      setIsResuming(false);
      return;
    }

    (async () => {
      try {
        const result = await getMedicalRecordById(meta.recordId);
        const record = result?.data;

        if (!result?.success || !record || record.status !== "draft") {
          // draft sudah final di tab lain / dihapus / gagal dimuat -> mulai baru
          clearWizardDraftMeta();
          setIsResuming(false);
          return;
        }

        setRecordId(record.id);
        setPatientId(record.patient_id || "");
        setTitle(record.title || "");
        setVisitDate(record.visit_date || todayStr);
        setTypeOfTreatment(record.type_of_treatment || "");
        setDoctorId(record.doctor?.id ? String(record.doctor.id) : "");
        setSummary(record.summary || "");
        setExistingAttachmentsInfo(record.attachments || []);

        // Prefill data obat dari draft sebelumnya (kalau ada). list_of_medicines
        // disimpan backend sebagai JSON string berisi array {medicine,quantity,rule}.
        const rawPrescription = record.detail?.resep?.list_of_medicines;
        if (rawPrescription) {
          try {
            const parsed = JSON.parse(rawPrescription);
            if (Array.isArray(parsed)) {
              setPrescriptionItems(
                parsed.map((item) => ({
                  id: `obat-resume-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                  medicine: item.medicine || "",
                  quantity: item.quantity || "",
                  rule: item.rule || "",
                }))
              );
            }
          } catch (err) {
            console.error("Gagal membaca data obat dari draft sebelumnya", err);
          }
        }

        const resumedTypes =
          Array.isArray(meta.selectedTypes) && meta.selectedTypes.length > 0
            ? meta.selectedTypes
            : Object.keys(record.detail || {}).filter((t) => RECORD_TYPES.some((rt) => rt.value === t));
        setSelectedTypes(resumedTypes);

        const resumedDetails = {};
        resumedTypes.forEach((type) => {
          resumedDetails[type] = { ...buildEmptyDetail(type), ...(record.detail?.[type] || {}) };
        });
        setDetailsByType(resumedDetails);

        // lompat ke jenis pertama yang datanya belum diisi, atau ke step
        // lampiran kalau semua jenis yang dipilih sudah ada isinya
        const firstIncompleteType = resumedTypes.find((type) => {
          const fields = resumedDetails[type] || {};
          return !Object.values(fields).some((v) => v && String(v).trim() !== "");
        });
        const resumeStepKey = firstIncompleteType ? detailStepKey(firstIncompleteType) : STEP_LAMPIRAN;
        const stepsAfterResume = [STEP_JENIS, STEP_KUNJUNGAN, ...resumedTypes.map(detailStepKey), STEP_LAMPIRAN];
        const resumeIndex = stepsAfterResume.indexOf(resumeStepKey);
        setCurrentStepIndex(resumeIndex >= 0 ? resumeIndex : 1);

        setResumedFromDraft(true);
      } catch (err) {
        console.error("Gagal memuat draft rekam medis sebelumnya", err);
        clearWizardDraftMeta();
      } finally {
        setIsResuming(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const patientOptions = useMemo(
    () =>
      approvedPatients.map((p) => ({
        value: p.patientId,
        label: `${p.patientName} - ${p.nik}`,
      })),
    [approvedPatients]
  );

  const doctorOptions = useMemo(
    () =>
      doctorsForSelection.map((d) => ({
        value: d.id,
        label: `${d.name} - ${d.specialist || "Dokter Umum"}`,
      })),
    [doctorsForSelection]
  );

  useEffect(() => {
    if (doctorId && !doctorsForSelection.some((d) => String(d.id) === String(doctorId))) {
      setDoctorId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorsForSelection]);

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

  // --- Handler daftar obat (Obat / Jumlah / Aturan, bisa lebih dari satu baris) ---
  const addPrescriptionRow = () => {
    setPrescriptionItems((prev) => [...prev, buildEmptyPrescriptionRow()]);
  };

  const updatePrescriptionRow = (id, field, value) => {
    setPrescriptionItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const removePrescriptionRow = (id) => {
    setPrescriptionItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Serialize baris obat yang benar-benar diisi (nama obat wajib) menjadi
  // payload "details.resep" yang dipahami backend. Balikin null kalau tidak
  // ada obat yang valid, supaya tidak mengirim field kosong ke server.
  const buildPrescriptionDetailPayload = () => {
    const validItems = prescriptionItems
      .map((item) => ({
        medicine: item.medicine.trim(),
        quantity: item.quantity.trim(),
        rule: item.rule.trim(),
      }))
      .filter((item) => item.medicine !== "");

    if (validItems.length === 0) return null;

    return { resep: { list_of_medicines: JSON.stringify(validItems) } };
  };

  const resetWizard = () => {
    setPatientId("");
    setTitle("");
    setVisitDate(todayStr);
    setTypeOfTreatment("");
    setDoctorId("");
    setSummary("");
    setSelectedTypes([]);
    setDetailsByType({});
    setAttachmentFiles([]);
    setExistingAttachmentsInfo([]);
    setPrescriptionItems([]);
    setRecordId(null);
    setCurrentStepIndex(0);
    setResumedFromDraft(false);
    clearWizardDraftMeta();
  };

  // --- Simpan progres ke backend (autosave tiap "Lanjut") ---
  async function persistHeaderStep() {
    const fd = new FormData();
    fd.append("patientId", patientId);
    fd.append("title", title);
    fd.append("visitDate", visitDate);
    fd.append("typeOfTreatment", typeOfTreatment);
    if (doctorId) fd.append("doctorId", doctorId);
    if (summary) fd.append("summary", summary);

    if (!recordId) {
      fd.append("status", "draft");
      fd.append("details", JSON.stringify({}));
      const result = await createMedicalRecordDraft(fd);
      if (!result?.success) throw new Error(result?.message || "Gagal menyimpan informasi kunjungan.");
      const newId = result.data?.id;
      setRecordId(newId);
      saveWizardDraftMeta(newId, selectedTypes);
    } else {
      const result = await updateMedicalRecordDraft(recordId, fd);
      if (!result?.success) throw new Error(result?.message || "Gagal memperbarui informasi kunjungan.");
    }
  }

  async function persistDetailStep(type) {
    const fd = new FormData();
    fd.append("details", JSON.stringify({ [type]: detailsByType[type] }));
    const result = await updateMedicalRecordDraft(recordId, fd);
    if (!result?.success) throw new Error(result?.message || `Gagal menyimpan data ${type}.`);
  }

  const handleNext = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (currentStep === STEP_JENIS) {
      if (selectedTypes.length === 0) {
        setErrorMessage("Pilih minimal 1 jenis rekam medis (Umum/Lab/Radiologi) yang ingin diunggah.");
        return;
      }
      setCurrentStepIndex((i) => i + 1);
      return;
    }

    if (currentStep === STEP_KUNJUNGAN) {
      if (!patientId) return setErrorMessage("Pilih pasien terlebih dahulu.");
      if (!title.trim()) return setErrorMessage("Judul rekam medis wajib diisi.");
      if (!visitDate) return setErrorMessage("Tanggal kunjungan wajib diisi.");
      if (visitDate < todayStr) return setErrorMessage("Tanggal kunjungan tidak boleh sebelum hari ini.");
      if (!typeOfTreatment) return setErrorMessage("Jenis perawatan wajib dipilih.");

      setIsSavingStep(true);
      try {
        await persistHeaderStep();
        setCurrentStepIndex((i) => i + 1);
      } catch (err) {
        console.error(err);
        setErrorMessage(err.message || "Gagal menyimpan informasi kunjungan.");
      } finally {
        setIsSavingStep(false);
      }
      return;
    }

    if (currentStep.startsWith("detail_")) {
      const type = currentStep.replace("detail_", "");
      const fields = detailsByType[type] || {};
      const hasContent = Object.values(fields).some((v) => v && String(v).trim() !== "");
      if (!hasContent) {
        const typeLabel = RECORD_TYPES.find((t) => t.value === type)?.label || type;
        setErrorMessage(`Lengkapi minimal 1 data untuk rekam medis ${typeLabel}.`);
        return;
      }

      setIsSavingStep(true);
      try {
        await persistDetailStep(type);
        setCurrentStepIndex((i) => i + 1);
      } catch (err) {
        console.error(err);
        setErrorMessage(err.message || `Gagal menyimpan data ${type}.`);
      } finally {
        setIsSavingStep(false);
      }
    }
  };

  const handlePrev = () => {
    setErrorMessage("");
    setCurrentStepIndex((i) => Math.max(0, i - 1));
  };

  // step terakhir: finalisasi (anchor ke blockchain) -- sekarang ikut mengirim
  // data obat (kalau diisi) selain lampiran.
  const handleFinalSubmit = async () => {
    setErrorMessage("");
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("status", "final");

      const prescriptionDetail = buildPrescriptionDetailPayload();
      if (prescriptionDetail) fd.append("details", JSON.stringify(prescriptionDetail));

      attachmentFiles.forEach((file) => fd.append("attachments", file));

      const result = await updateMedicalRecordDraft(recordId, fd);
      if (result?.success) {
        setUploadedResult({
          recordType: result.data?.record_type,
          title: result.data?.title,
          status: result.data?.status,
          txHash: result.data?.tx_hash || "",
        });
        setShowSuccessModal(true);
        resetWizard();
      } else {
        setErrorMessage(result?.message || "Gagal memfinalisasi rekam medis.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "Koneksi ke backend bermasalah.");
    } finally {
      setIsUploading(false);
    }
  };

  // step terakhir tapi belum mau final -> tetap draft, tinggalkan halaman.
  // Sekarang ikut menyimpan lampiran DAN data obat yang sudah diisi.
  const handleSaveDraftAndExit = async () => {
    setErrorMessage("");
    setIsSavingStep(true);
    try {
      const fd = new FormData();
      let hasChanges = false;

      if (attachmentFiles.length > 0) {
        attachmentFiles.forEach((file) => fd.append("attachments", file));
        hasChanges = true;
      }

      const prescriptionDetail = buildPrescriptionDetailPayload();
      if (prescriptionDetail) {
        fd.append("details", JSON.stringify(prescriptionDetail));
        hasChanges = true;
      }

      if (hasChanges) {
        const result = await updateMedicalRecordDraft(recordId, fd);
        if (!result?.success) throw new Error(result?.message || "Gagal menyimpan lampiran/obat.");
      }

      setSuccessMessage("Draft tersimpan. Anda bisa melanjutkan pengisian kapan saja dari halaman ini.");
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "Gagal menyimpan draft.");
    } finally {
      setIsSavingStep(false);
    }
  };

  const isLastContentStep = currentStep === STEP_LAMPIRAN;
  const isFirstStep = currentStepIndex === 0;

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
                Satu rekam medis mewakili satu kunjungan pasien. Isi bertahap per langkah — progres otomatis
                tersimpan sebagai draft setiap kali Anda menekan "Lanjut".
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

          {isResuming ? (
            <div className="rounded-3xl bg-white border border-slate-200/80 p-10 shadow-xs flex items-center justify-center gap-3 text-slate-500 text-sm">
              <RefreshCw className="h-4 w-4 animate-spin" /> Memeriksa draft yang belum selesai...
            </div>
          ) : (
            <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
              {resumedFromDraft && (
                <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-xs font-semibold text-amber-800 flex items-center gap-2">
                    <Info className="h-4 w-4 shrink-0" />
                    Melanjutkan draft yang belum selesai sebelumnya.
                  </p>
                  <button
                    type="button"
                    onClick={resetWizard}
                    className="text-xs font-bold text-amber-800 underline underline-offset-2 hover:text-amber-900 self-start sm:self-auto"
                  >
                    Mulai draft baru
                  </button>
                </div>
              )}

              <StepIndicator steps={steps} currentIndex={currentStepIndex} />

              <div className="space-y-6">
                {/* --- STEP 1: Jenis Rekam Medis --- */}
                {currentStep === STEP_JENIS && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">
                      Jenis Rekam Medis (bisa pilih lebih dari satu)
                    </label>
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
                      Obat bisa ditambahkan belakangan di step terakhir (Lampiran). Resep lanjutan tetap bisa
                      ditambahkan terpisah oleh modul Apoteker.
                    </p>
                  </div>
                )}

                {/* --- STEP 2: Informasi Kunjungan --- */}
                {currentStep === STEP_KUNJUNGAN && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">
                        Pilih Pasien Terotorisasi
                      </label>
                      <SearchableSelect
                        value={patientId}
                        onChange={setPatientId}
                        options={patientOptions}
                        isLoading={loadingPatients}
                        loadingText="Memuat pasien terotorisasi..."
                        placeholder="Pilih pasien yang sudah menyetujui akses"
                        emptyText="Tidak ada pasien yang cocok dengan pencarian."
                        disabled={!!recordId}
                        required
                      />
                      {!!recordId && (
                        <p className="mt-2 text-xs text-slate-400">
                          Pasien tidak bisa diganti setelah rekam medis draft dibuat. Mulai draft baru kalau salah pilih.
                        </p>
                      )}
                      {!loadingPatients && approvedPatients.length === 0 && (
                        <p className="mt-2 text-xs text-slate-500">
                          Belum ada pasien yang memberi akses. Silakan ajukan permintaan akses terlebih dahulu.
                        </p>
                      )}
                    </div>

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
                        <SearchableSelect
                          value={doctorId}
                          onChange={setDoctorId}
                          options={doctorOptions}
                          isLoading={loadingDoctors}
                          loadingText="Memuat daftar dokter..."
                          placeholder="-- Tidak ditentukan --"
                          emptyText="Tidak ada dokter yang cocok dengan pencarian."
                        />
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
                  </div>
                )}

                {/* --- STEP N: Detail per jenis rekam medis --- */}
                {currentStep.startsWith("detail_") &&
                  (() => {
                    const type = currentStep.replace("detail_", "");
                    const typeLabel = RECORD_TYPES.find((t) => t.value === type)?.label || type;
                    const detailFields = getDetailFieldsConfig(type);
                    const entryDetail = detailsByType[type] || buildEmptyDetail(type);

                    return (
                      <div className="space-y-5">
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
                  })()}

                {/* --- STEP TERAKHIR: Obat, Lampiran & Finalisasi --- */}
                {currentStep === STEP_LAMPIRAN && (
                  <div className="space-y-8">
                    {/* --- Obat --- */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">
                        Obat <span className="text-slate-400 font-medium normal-case ml-1">(opsional, bisa lebih dari satu)</span>
                      </label>

                      <div className="overflow-x-auto rounded-2xl border border-slate-200">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-4 py-2.5 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                                Obat
                              </th>
                              <th className="px-4 py-2.5 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-500 w-32">
                                Jumlah
                              </th>
                              <th className="px-4 py-2.5 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                                Aturan
                              </th>
                              <th className="px-2 py-2.5 w-10" />
                            </tr>
                          </thead>
                          <tbody>
                            {prescriptionItems.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="px-4 py-5 text-center text-xs text-slate-400">
                                  Belum ada obat ditambahkan.
                                </td>
                              </tr>
                            ) : (
                              prescriptionItems.map((item) => (
                                <tr key={item.id} className="border-t border-slate-100">
                                  <td className="px-2 py-2">
                                    <input
                                      value={item.medicine}
                                      onChange={(e) => updatePrescriptionRow(item.id, "medicine", e.target.value)}
                                      type="text"
                                      placeholder="Contoh: Paracetamol 500mg"
                                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-rose-700 focus:outline-none"
                                    />
                                  </td>
                                  <td className="px-2 py-2">
                                    <input
                                      value={item.quantity}
                                      onChange={(e) => updatePrescriptionRow(item.id, "quantity", e.target.value)}
                                      type="text"
                                      placeholder="10 tablet"
                                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-rose-700 focus:outline-none"
                                    />
                                  </td>
                                  <td className="px-2 py-2">
                                    <input
                                      value={item.rule}
                                      onChange={(e) => updatePrescriptionRow(item.id, "rule", e.target.value)}
                                      type="text"
                                      placeholder="3x1 sesudah makan"
                                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-rose-700 focus:outline-none"
                                    />
                                  </td>
                                  <td className="px-2 py-2 text-center">
                                    <button
                                      type="button"
                                      onClick={() => removePrescriptionRow(item.id)}
                                      className="text-slate-400 hover:text-rose-700 transition cursor-pointer"
                                      title="Hapus obat"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      <button
                        type="button"
                        onClick={addPrescriptionRow}
                        className="mt-3 inline-flex items-center gap-2 rounded-xl border border-dashed border-rose-300 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" /> Tambah Obat
                      </button>
                    </div>

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

                      {existingAttachmentsInfo.length > 0 && (
                        <p className="mt-3 text-xs text-slate-500">
                          {existingAttachmentsInfo.length} lampiran sudah tersimpan dari sesi sebelumnya.
                        </p>
                      )}

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

                    <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-700 flex items-start gap-2">
                      <Info className="h-4 w-4 mt-0.5 shrink-0" />
                      Klik "Unggah & Finalisasi" untuk mengenkripsi dan menjangkarkan data ke blockchain. Atau simpan
                      sebagai draft dulu kalau belum yakin — data yang sudah diisi (termasuk obat) tidak akan hilang.
                    </div>
                  </div>
                )}
              </div>

              {successMessage && (
                <div className="mt-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-medium text-emerald-700">
                  {successMessage}
                </div>
              )}
              {errorMessage && (
                <div className="mt-6 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm font-medium text-rose-700">
                  {errorMessage}
                </div>
              )}

              {/* --- Navigasi Prev / Next --- */}
              <div className="mt-8 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={isFirstStep || isSavingStep || isUploading}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" /> Sebelumnya
                </button>

                {isLastContentStep ? (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSaveDraftAndExit}
                      disabled={isSavingStep || isUploading || !recordId}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
                    >
                      {isSavingStep ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Simpan Draft, Lanjutkan Nanti
                    </button>
                    <button
                      type="button"
                      onClick={handleFinalSubmit}
                      disabled={isUploading || !recordId}
                      className="inline-flex items-center gap-2 rounded-2xl bg-rose-800 px-5 py-3 text-sm font-bold text-white hover:bg-rose-700 transition disabled:opacity-50"
                    >
                      {isUploading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      Unggah & Finalisasi ke Blockchain
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={isSavingStep}
                    className="inline-flex items-center gap-2 rounded-2xl bg-rose-800 px-5 py-3 text-sm font-bold text-white hover:bg-rose-700 transition disabled:opacity-50"
                  >
                    {isSavingStep ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
                    Lanjutkan <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}
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
                Data rekam medis terenkripsi AES-256 dan bukti transaksi terjangkar secara resmi ke Smart Contract Blockchain.
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