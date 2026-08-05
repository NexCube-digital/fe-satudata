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
  AlertTriangle,
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

// --- Preset umum "Aturan Pakai" obat. Ini hanya daftar bantuan di dropdown --
// user tetap bebas mengetik teks lain kalau tidak ada yang cocok (lihat
// ComboboxInput di bawah, ini BUKAN <select> biasa).
const DOSAGE_RULE_PRESETS = [
  "1x1 sebelum makan",
  "1x1 sesudah makan",
  "1x1 malam hari sebelum tidur",
  "2x1 sebelum makan",
  "2x1 sesudah makan",
  "2x1 pagi dan malam",
  "3x1 sebelum makan",
  "3x1 sesudah makan",
  "3x1 saat makan",
  "4x1 sesudah makan",
  "Setiap 8 jam",
  "Setiap 12 jam",
  "Bila perlu (prn)",
  "Dioleskan pada area yang sakit",
  "Sesuai anjuran dokter",
];

// PENTING: examination_type ditambahkan di sini (lab & radiologi) -- kolom
// ini NOT NULL di database (dipakai juga sebagai field utama di halaman
// list/detail), tapi sebelumnya tidak ada input-nya di wizard sama sekali,
// sehingga selalu dikirim kosong -> INSERT gagal di database -> 500 error
// setiap kali menambahkan jenis lab/radiologi.
function getDetailFieldsConfig(type) {
  switch (type) {
    case "lab":
      return [
        { name: "examination_type", label: "Jenis Pemeriksaan" },
        { name: "checkup_result", label: "Hasil Pemeriksaan" },
        { name: "reference_values", label: "Nilai Referensi" },
        { name: "conclusion", label: "Kesimpulan" },
      ];
    case "radiologi":
      return [
        { name: "examination_type", label: "Jenis Pemeriksaan" },
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
// halaman UPLOAD (create baru) dibuka ulang, kita tahu draft mana yang harus
// di-fetch ulang dari backend dan step berapa yang harus di-render (isi form
// sebenarnya SELALU diambil ulang dari backend, bukan dari localStorage, biar
// tidak basi/rawan tamper).
//
// PENTING: mekanisme localStorage ini HANYA dipakai di halaman "Upload Baru"
// (/medical-records/upload). Halaman "/medical-records/[id]/edit" tidak
// pernah menyentuh localStorage sama sekali -- dia selalu fetch langsung
// pakai id dari URL, supaya bisa dibuka dari device/browser manapun selama
// draft itu masih ada & masih berstatus draft.
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

// --- Normalisasi 1 baris obat dari katalog backend (GET /api/hospital/pharmacy/medicines)
// PENTING: nama field di bawah ini masih TEBAKAN karena kita tidak punya akses ke
// pharmacyService.js / model Medicine. Sesuaikan key (name/nama, stock/stok, unit/satuan)
// dengan bentuk response asli backend kamu supaya dropdown & validasi stok akurat.
function normalizeMedicine(raw) {
  const id = raw.id ?? raw.medicine_id ?? raw._id ?? raw.uuid;
  const name = raw.name || raw.nama || raw.medicine_name || raw.nama_obat || "Tanpa Nama";
  const stockRaw = raw.stock ?? raw.stok ?? raw.quantity ?? raw.qty ?? raw.jumlah ?? 0;
  const unit = raw.unit || raw.satuan || raw.uom || raw.unit_type || "unit";
  const price = raw.price ?? raw.harga ?? null;
  return {
    id: id != null ? String(id) : null,
    name,
    stock: Number.isFinite(Number(stockRaw)) ? Number(stockRaw) : 0,
    unit,
    price,
  };
}

// Buat 1 baris obat kosong. id dipakai sebagai React key + acuan update/hapus baris,
// TIDAK dikirim ke backend (hanya field medicine/quantity/rule yang diserialize).
// medicineId dipakai untuk mengaitkan baris ke katalog obat (validasi stok & satuan).
function buildEmptyPrescriptionRow() {
  return {
    id: `obat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    medicineId: "",
    medicine: "",
    unit: "",
    quantity: "",
    rule: "",
  };
}

// Ubah 1 record hasil GET /api/hospital/medical-record/:id menjadi bentuk
// state wizard (jenis yang dipilih, isi tiap detail, dan daftar obat).
// Dipakai bareng oleh mode "create" (resume dari localStorage) maupun mode
// "edit" (fetch langsung dari id di URL).
function buildStateFromRecord(record, selectedTypesHint) {
  const resumedTypes =
    Array.isArray(selectedTypesHint) && selectedTypesHint.length > 0
      ? selectedTypesHint
      : Object.keys(record.detail || {}).filter((t) => RECORD_TYPES.some((rt) => rt.value === t));

  const resumedDetails = {};
  resumedTypes.forEach((type) => {
    const source = record.detail?.[type] || {};
    const picked = {};
    getDetailFieldsConfig(type).forEach((f) => {
      if (source[f.name] !== undefined && source[f.name] !== null) picked[f.name] = source[f.name];
    });
    resumedDetails[type] = { ...buildEmptyDetail(type), ...picked };
  });

  // Prefill data obat dari draft sebelumnya (kalau ada). list_of_medicines
  // disimpan backend sebagai JSON string berisi array {medicine_id?, medicine, quantity, rule}.
  // Draft lama (sebelum fitur dropdown obat) mungkin tidak punya medicine_id --
  // baris seperti itu tetap ditampilkan sebagai teks lama, dan medicine_id akan
  // dicoba dicocokkan otomatis begitu katalog obat selesai dimuat (lihat effect di bawah).
  let prescriptionRows = [];
  const rawPrescription = record.detail?.resep?.list_of_medicines;
  if (rawPrescription) {
    try {
      const parsed = JSON.parse(rawPrescription);
      if (Array.isArray(parsed)) {
        prescriptionRows = parsed.map((item) => ({
          id: `obat-resume-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          medicineId: item.medicine_id ? String(item.medicine_id) : "",
          medicine: item.medicine || "",
          unit: item.unit || "",
          quantity: (item.quantity || "").toString().split(" ")[0] || "",
          rule: item.rule || "",
        }));
      }
    } catch (err) {
      console.error("Gagal membaca data obat dari draft sebelumnya", err);
    }
  }

  return { resumedTypes, resumedDetails, prescriptionRows };
}

/**
 * Dropdown dengan kotak pencarian di dalamnya. Klik untuk membuka, ketik
 * untuk memfilter daftar opsi berdasarkan label, klik opsi atau klik di luar
 * untuk menutup. Opsi bisa ditandai `disabled` (misal obat yang stoknya habis)
 * -- opsi itu tetap tampil (supaya user tahu obatnya ada) tapi tidak bisa diklik.
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
                    disabled={opt.disabled}
                    onClick={() => {
                      if (opt.disabled) return;
                      onChange(opt.value);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition ${
                      opt.disabled
                        ? "text-slate-300 cursor-not-allowed"
                        : opt.value === value
                        ? "bg-rose-50 text-rose-800 font-semibold cursor-pointer"
                        : "text-slate-700 hover:bg-slate-50 cursor-pointer"
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

/**
 * Combobox untuk "Aturan Pakai": input teks bebas + dropdown preset di
 * bawahnya. Beda dengan SearchableSelect, value TIDAK dibatasi harus salah
 * satu dari `options` -- user boleh mengetik apapun kalau tidak ada preset
 * yang cocok. Klik salah satu preset akan mengisi input dengan teks itu.
 */
function ComboboxInput({ value, onChange, options, placeholder = "Ketik atau pilih dari daftar..." }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    const q = (value || "").trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, value]);

  const isCustomValue = value && value.trim() !== "" && !options.some((o) => o.toLowerCase() === value.trim().toLowerCase());

  return (
    <div className="relative" ref={containerRef}>
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        type="text"
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-rose-700 focus:outline-none"
      />

      {open && (
        <div className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          <ul className="max-h-52 overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-3 text-sm text-slate-400">Tidak ada preset yang cocok, teks kamu tetap dipakai.</li>
            ) : (
              filteredOptions.map((opt) => (
                <li key={opt}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onChange(opt);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition cursor-pointer ${
                      opt.toLowerCase() === (value || "").trim().toLowerCase()
                        ? "bg-rose-50 text-rose-800 font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {opt}
                  </button>
                </li>
              ))
            )}
          </ul>
          {isCustomValue && (
            <div className="border-t border-slate-100 px-4 py-2 text-[11px] text-slate-400">
              Tidak ada di daftar preset -- teks kustom kamu akan tetap dipakai:{" "}
              <span className="font-semibold text-slate-600">&ldquo;{value}&rdquo;</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StepIndicator({ steps, currentIndex }) {
  const stepLabel = (step) => {
    if (step === STEP_JENIS) return "Jenis Rekam Medis";
    if (step === STEP_KUNJUNGAN) return "Informasi Kunjungan";
    if (step === STEP_LAMPIRAN) return "Obat & Lampiran File";
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

/**
 * Wizard upload / edit rekam medis.
 *
 * - Mode "create" (dipakai oleh /medical-records/upload): recordId dimulai
 *   dari null, draft yang belum selesai di-resume dari meta di localStorage.
 * - Mode "edit" (dipakai oleh /medical-records/[id]/edit): `routeRecordId`
 *   diisi dari URL, wizard SELALU fetch record itu langsung dari backend
 *   (tidak peduli localStorage) lalu prefill semua step dengan data yang
 *   sudah ada -- tinggal dilengkapi kekurangannya atau diedit.
 *
 * CATATAN: record berstatus "final" TETAP BISA dimuat & dikoreksi lewat
 * halaman edit (bukan diblokir). Backend (updateMedicalRecord) memang sudah
 * mendukung "koreksi pasca-publish" -- kalau record yang diedit statusnya
 * final, backend memotong token lagi & re-anchor ulang ke blockchain begitu
 * perubahan disimpan. Wizard menampilkan banner peringatan (lihat
 * `isFinalRecord`) supaya user faskes sadar konsekuensinya.
 */
export default function MedicalRecordWizard({ recordId: routeRecordId = null }) {
  const router = useRouter();
  const isEditRoute = !!routeRecordId;

  const [user, setUser] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingStep, setIsSavingStep] = useState(false);
  const [isResuming, setIsResuming] = useState(true);
  const [resumedFromDraft, setResumedFromDraft] = useState(false);
  const [loadError, setLoadError] = useState("");

  // Menandai record yang dimuat di mode edit berstatus "final" (sudah pernah
  // di-anchor ke blockchain) -- dipakai untuk menampilkan banner peringatan,
  // bukan untuk memblokir loading data.
  const [isFinalRecord, setIsFinalRecord] = useState(false);

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

  // Katalog obat dari modul Apoteker (dipakai untuk dropdown obat, satuan
  // otomatis, dan validasi stok pada step Lampiran).
  const [medicinesCatalog, setMedicinesCatalog] = useState([]);
  const [loadingMedicines, setLoadingMedicines] = useState(true);

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

  // --- Muat katalog obat (nama, stok, satuan) dari modul Apoteker ---
  useEffect(() => {
    const fetchMedicines = async () => {
      setLoadingMedicines(true);
      try {
        const result = await apiGet("/api/hospital/pharmacy/medicines");
        const meds = Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result?.data?.items)
          ? result.data.items
          : [];
        setMedicinesCatalog(meds.map(normalizeMedicine).filter((m) => m.id));
      } catch (err) {
        console.error("Gagal memuat katalog obat", err);
      } finally {
        setLoadingMedicines(false);
      }
    };

    fetchMedicines();
  }, []);

  // Terapkan 1 record hasil fetch backend ke seluruh state wizard, lalu
  // lompat ke step pertama yang datanya belum lengkap (atau step Lampiran
  // kalau semua jenis yang dipilih sudah ada isinya).
  function applyLoadedRecord(record, selectedTypesHint) {
    setRecordId(record.id);
    setPatientId(record.patient_id || "");
    setTitle(record.title || "");
    setVisitDate(record.visit_date || todayStr);
    setTypeOfTreatment(record.type_of_treatment || "");
    setDoctorId(record.doctor?.id ? String(record.doctor.id) : "");
    setSummary(record.summary || "");
    setExistingAttachmentsInfo(record.attachments || []);

    const { resumedTypes, resumedDetails, prescriptionRows } = buildStateFromRecord(record, selectedTypesHint);

    if (prescriptionRows.length > 0) setPrescriptionItems(prescriptionRows);

    setSelectedTypes(resumedTypes);
    setDetailsByType(resumedDetails);

    const firstIncompleteType = resumedTypes.find((type) => {
      const fields = resumedDetails[type] || {};
      return !Object.values(fields).some((v) => v && String(v).trim() !== "");
    });
    const resumeStepKey = firstIncompleteType ? detailStepKey(firstIncompleteType) : STEP_LAMPIRAN;
    const stepsAfterResume = [STEP_JENIS, STEP_KUNJUNGAN, ...resumedTypes.map(detailStepKey), STEP_LAMPIRAN];
    const resumeIndex = stepsAfterResume.indexOf(resumeStepKey);
    setCurrentStepIndex(resumeIndex >= 0 ? resumeIndex : 1);

    if (!isEditRoute) {
      saveWizardDraftMeta(record.id, resumedTypes);
    }
  }

  // --- Muat data awal wizard ---
  // Mode edit (routeRecordId ada): SELALU fetch langsung by id dari URL,
  // tidak pernah baca localStorage sama sekali. Record dengan status apapun
  // (draft ATAU final) tetap dimuat -- tidak ada lagi guard yang memblokir
  // record final, karena backend memang mendukung koreksi pasca-publish.
  useEffect(() => {
    if (isEditRoute) {
      (async () => {
        try {
          const result = await getMedicalRecordById(routeRecordId);
          const record = result?.data;

          if (!result?.success || !record) {
            setLoadError("Rekam medis tidak ditemukan atau Anda tidak memiliki akses ke data ini.");
            return;
          }

          setIsFinalRecord(record.status === "final");
          applyLoadedRecord(record);
          setResumedFromDraft(true);
        } catch (err) {
          console.error("Gagal memuat rekam medis untuk diedit", err);
          setLoadError(err.message || "Gagal memuat data rekam medis.");
        } finally {
          setIsResuming(false);
        }
      })();
      return;
    }

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

        applyLoadedRecord(record, meta.selectedTypes);
        setResumedFromDraft(true);
      } catch (err) {
        console.error("Gagal memuat draft rekam medis sebelumnya", err);
        clearWizardDraftMeta();
      } finally {
        setIsResuming(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditRoute, routeRecordId]);

  // Sinkronkan meta draft di localStorage dengan jenis rekam medis yang sedang
  // dipilih (mode create saja). Tanpa ini, kalau user menambah jenis baru di
  // tengah wizard lalu menutup halaman, resume berikutnya memakai daftar jenis
  // lama dari localStorage sehingga jenis yang baru ditambahkan "hilang".
  useEffect(() => {
    if (!isEditRoute && recordId) {
      saveWizardDraftMeta(recordId, selectedTypes);
    }
  }, [recordId, selectedTypes, isEditRoute]);

  // Setelah katalog obat siap, coba cocokkan baris obat hasil resume yang belum
  // punya medicineId (draft lama) berdasarkan nama obat -- supaya validasi stok
  // dan satuan tetap jalan untuk draft lama juga. Kalau tidak ketemu, dibiarkan
  // apa adanya (user tinggal pilih ulang obatnya dari dropdown).
  useEffect(() => {
    if (medicinesCatalog.length === 0) return;
    setPrescriptionItems((prev) => {
      let changed = false;
      const next = prev.map((item) => {
        if (item.medicineId || !item.medicine) return item;
        const match = medicinesCatalog.find(
          (m) => m.name.trim().toLowerCase() === item.medicine.trim().toLowerCase()
        );
        if (!match) return item;
        changed = true;
        return { ...item, medicineId: match.id, unit: match.unit };
      });
      return changed ? next : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medicinesCatalog]);

  // Daftar dokter untuk dropdown selalu menampilkan SEMUA dokter yang terhubung
  // ke faskes, tanpa difilter berdasarkan jenis rekam medis. Dulu ada filter
  // spesialisasi di sini yang membuat daftar dokter "hilang" saat mode edit
  // (hanya dokter yang sudah terpilih + yang spesialisasinya cocok yang tampil).
  // Dokter yang sudah dipilih tetap dijaga agar selalu ada di daftar opsi.
  const doctorsForSelection = useMemo(() => {
    if (doctorId && !doctorsList.some((d) => String(d.id) === String(doctorId))) {
      const selectedDoctor = doctorsList.find((d) => String(d.id) === String(doctorId));
      if (selectedDoctor) return [selectedDoctor, ...doctorsList];
    }
    return doctorsList;
  }, [doctorsList, doctorId]);

  const patientOptions = useMemo(
    () =>
      approvedPatients.map((p) => ({
        value: p.patientId,
        label: `${p.patientName} - ${p.nik}`,
      })),
    [approvedPatients]
  );

  // Label dropdown dokter sekarang menyertakan jam praktik (practice_schedule)
  // -- field ini sudah dikirim backend (GET /api/doctor untuk role rumah_sakit
  // menyertakan practice_schedule dari tabel doctor_hospitals), tinggal
  // ditampilkan di sini.
  const doctorOptions = useMemo(
    () =>
      doctorsForSelection.map((d) => {
        const schedule = d.practice_schedule?.trim();
        return {
          value: d.id,
          label: schedule
            ? `${d.name} - ${d.specialist || "Dokter Umum"} (${schedule})`
            : `${d.name} - ${d.specialist || "Dokter Umum"}`,
        };
      }),
    [doctorsForSelection]
  );

  // Dokter yang sedang dipilih (untuk menampilkan detail jam praktik di bawah
  // dropdown, dan sebagai referensi cepat di beberapa tempat lain).
  const selectedDoctorInfo = useMemo(
    () => doctorsForSelection.find((d) => String(d.id) === String(doctorId)) || null,
    [doctorsForSelection, doctorId]
  );

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

  // Sisa stok obat tertentu untuk 1 baris tertentu = stok gudang dikurangi
  // total yang SUDAH dipakai baris-baris LAIN untuk obat yang sama. Ini yang
  // jadi batas atas (max) input jumlah pada baris tsb, supaya total across
  // semua baris tidak pernah melebihi stok riil.
  const getRemainingStockForRow = (rowId, medicineId) => {
    const med = medicinesCatalog.find((m) => m.id === medicineId);
    if (!med) return 0;
    const usedByOtherRows = prescriptionItems
      .filter((i) => i.id !== rowId && i.medicineId === medicineId)
      .reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
    return Math.max(0, med.stock - usedByOtherRows);
  };

  // Saat user memilih obat dari dropdown: isi nama + satuan otomatis, dan
  // jumlah yang sudah diketik sebelumnya dipangkas (clamp) kalau ternyata
  // melebihi sisa stok obat yang baru dipilih.
  const selectMedicineForRow = (rowId, medicineId) => {
    setPrescriptionItems((prev) => {
      const med = medicinesCatalog.find((m) => m.id === medicineId);
      return prev.map((item) => {
        if (item.id !== rowId) return item;
        if (!med) {
          return { ...item, medicineId: "", medicine: "", unit: "", quantity: "" };
        }
        const otherRowsUsed = prev
          .filter((i) => i.id !== rowId && i.medicineId === med.id)
          .reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
        const remaining = Math.max(0, med.stock - otherRowsUsed);
        const currentQty = Number(item.quantity) || 0;
        const cappedQty = currentQty > remaining ? (remaining > 0 ? String(remaining) : "") : item.quantity;
        return {
          ...item,
          medicineId: med.id,
          medicine: med.name,
          unit: med.unit,
          quantity: cappedQty,
        };
      });
    });
  };

  // Input jumlah dibatasi langsung saat mengetik (clamp) supaya tidak mungkin
  // mengisi angka yang lebih besar dari sisa stok -- ini yang mencegah bug
  // "stok sisa 10 tapi diisi 20".
  const handleQuantityChange = (rowId, medicineId, rawValue) => {
    if (rawValue === "") {
      updatePrescriptionRow(rowId, "quantity", "");
      return;
    }
    let num = parseInt(rawValue, 10);
    if (Number.isNaN(num) || num < 0) num = 0;
    if (medicineId) {
      const remaining = getRemainingStockForRow(rowId, medicineId);
      if (num > remaining) num = remaining;
    }
    updatePrescriptionRow(rowId, "quantity", String(num));
  };

  // Opsi dropdown obat untuk 1 baris: menampilkan sisa stok per obat (dihitung
  // gabungan dengan baris lain), dan menonaktifkan obat yang stoknya habis.
  const getMedicineOptionsForRow = (rowId) =>
    medicinesCatalog.map((med) => {
      const remaining = getRemainingStockForRow(rowId, med.id);
      return {
        value: med.id,
        disabled: remaining <= 0,
        label: remaining <= 0 ? `${med.name} — Stok Habis` : `${med.name} — Sisa ${remaining} ${med.unit}`,
      };
    });

  // Pesan error per baris kalau jumlah yang diisi (dijumlah dengan baris lain
  // untuk obat yang sama) melebihi stok gudang. Secara normal ini tidak akan
  // pernah terjadi karena input sudah di-clamp, tapi tetap dicek ulang di sini
  // sebagai jaring pengaman terakhir sebelum data dikirim ke server.
  const getRowStockError = (item) => {
    if (!item.medicineId) return null;
    const med = medicinesCatalog.find((m) => m.id === item.medicineId);
    if (!med) return null;
    const totalAllocated = prescriptionItems
      .filter((i) => i.medicineId === item.medicineId)
      .reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
    if (totalAllocated > med.stock) {
      return `Melebihi stok tersedia. Sisa stok ${med.name}: ${med.stock} ${med.unit}.`;
    }
    return null;
  };

  const hasPrescriptionStockErrors = () => prescriptionItems.some((item) => getRowStockError(item));

  // Serialize baris obat yang benar-benar diisi (obat dipilih + jumlah > 0)
  // menjadi payload "details.resep" yang dipahami backend. Balikin null kalau
  // tidak ada obat yang valid, supaya tidak mengirim field kosong ke server.
  const buildPrescriptionDetailPayload = () => {
    const validItems = prescriptionItems
      .filter((item) => item.medicineId && Number(item.quantity) > 0)
      .map((item) => ({
        medicine_id: item.medicineId,
        medicine: item.medicine.trim(),
        unit: item.unit,
        quantity: `${item.quantity} ${item.unit}`.trim(),
        rule: item.rule.trim(),
      }));

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
      if (!isEditRoute) saveWizardDraftMeta(newId, selectedTypes);
    } else {
      const result = await updateMedicalRecordDraft(recordId, fd);
      if (!result?.success) throw new Error(result?.message || "Gagal memperbarui informasi kunjungan.");
    }
  }

  async function persistDetailStep(type) {
    const source = detailsByType[type] || {};
    const payload = {};
    getDetailFieldsConfig(type).forEach((f) => {
      if (source[f.name] !== undefined && source[f.name] !== null) payload[f.name] = source[f.name];
    });
    const fd = new FormData();
    fd.append("details", JSON.stringify({ [type]: payload }));
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
      if (!isEditRoute && visitDate < todayStr) return setErrorMessage("Tanggal kunjungan tidak boleh sebelum hari ini.");
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

    if (hasPrescriptionStockErrors()) {
      setErrorMessage("Ada obat yang jumlahnya melebihi stok tersedia. Perbaiki dahulu sebelum finalisasi.");
      return;
    }

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
        if (!isEditRoute) resetWizard();
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

    if (hasPrescriptionStockErrors()) {
      setErrorMessage("Ada obat yang jumlahnya melebihi stok tersedia. Perbaiki dahulu sebelum menyimpan draft.");
      return;
    }

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

  const pageTitle = isEditRoute ? "Lengkapi / Edit Rekam Medis" : "Upload Rekam Medis Baru";
  const pageSubtitle = isEditRoute
    ? "Data yang sudah tersimpan sebelumnya sudah terisi otomatis -- tinggal lengkapi kekurangannya atau perbaiki isinya, lalu simpan lagi sebagai draft atau finalisasi."
    : "Satu rekam medis mewakili satu kunjungan pasien. Isi bertahap per langkah — progres otomatis tersimpan sebagai draft setiap kali Anda menekan \"Lanjut\".";

  return (
    <div className="min-h-screen bg-linear-to-br from-[#faf7f2] via-[#fdfbf7] to-[#f5efe6] flex flex-col pb-16 md:pb-0">
      <Navbar user={user} roleLabel="Fasilitas Kesehatan" onLogout={() => router.push("/auth/login")} />
      <div className="flex flex-1">
        <Sidebar role="faskes" />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-rose-700 font-bold">Dashboard Faskes</p>
              <h1 className="text-3xl font-extrabold text-slate-900 mt-3">{pageTitle}</h1>
              <p className="max-w-2xl text-sm text-slate-500 mt-2">{pageSubtitle}</p>
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
              <RefreshCw className="h-4 w-4 animate-spin" />
              {isEditRoute ? "Memuat data rekam medis..." : "Memeriksa draft yang belum selesai..."}
            </div>
          ) : loadError ? (
            <div className="rounded-3xl bg-white border border-rose-200 p-10 shadow-xs flex flex-col items-center justify-center gap-3 text-center">
              <AlertTriangle className="h-8 w-8 text-rose-500" />
              <p className="text-sm font-semibold text-rose-700">{loadError}</p>
              <button
                type="button"
                onClick={() => router.push("/dashboard/faskes/medical-records")}
                className="inline-flex items-center gap-2 rounded-2xl bg-rose-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700 transition"
              >
                Kembali ke Daftar Rekam Medis
              </button>
            </div>
          ) : (
            <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
              {resumedFromDraft && !isEditRoute && (
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

              {isEditRoute && !isFinalRecord && (
                <div className="mb-5 flex items-center gap-3 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3">
                  <Info className="h-4 w-4 shrink-0 text-sky-700" />
                  <p className="text-xs font-semibold text-sky-800">
                    Mode edit draft — semua data yang sudah ada terisi otomatis. Lengkapi bagian yang kurang lalu
                    lanjutkan sampai step terakhir untuk menyimpan perubahan.
                  </p>
                </div>
              )}

              {isEditRoute && isFinalRecord && (
                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
                  <p className="text-xs font-semibold text-amber-800">
                    Rekam medis ini sudah <span className="underline">final</span> dan pernah di-anchor ke
                    blockchain. Menyimpan perubahan di sini adalah koreksi pasca-publish -- akan memotong 1 token
                    tambahan dan membuat bukti transaksi (tx hash) baru menggantikan yang lama.
                  </p>
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
                      {isEditRoute && (
                        <>
                          {" "}
                          Menghapus centang jenis yang datanya sudah pernah tersimpan hanya menyembunyikannya dari
                          wizard ini, isinya di server tidak otomatis terhapus.
                        </>
                      )}
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
                          min={isEditRoute ? undefined : todayStr}
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
                        {selectedDoctorInfo?.practice_schedule?.trim() && (
                          <p className="mt-2 flex items-start gap-1.5 text-xs text-slate-500">
                            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-slate-400" />
                            Jam praktik:{" "}
                            <span className="font-semibold text-slate-700">{selectedDoctorInfo.practice_schedule}</span>
                          </p>
                        )}
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

                      {/* NOTE: sengaja TIDAK memakai <table> + overflow-x-auto lagi -- kombinasi
                          itu bikin overflow-y ikut ke-set "auto" oleh browser, sehingga dropdown
                          pencarian obat (position: absolute) kepotong oleh batas kontainer.
                          Kartu per baris di bawah ini tidak overflow-clipped sama sekali. */}
                      <div className="space-y-3">
                        {prescriptionItems.length === 0 ? (
                          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center text-xs text-slate-400">
                            Belum ada obat ditambahkan.
                          </div>
                        ) : (
                          prescriptionItems.map((item, idx) => {
                            const stockError = getRowStockError(item);
                            const remaining = item.medicineId
                              ? getRemainingStockForRow(item.id, item.medicineId)
                              : null;
                            return (
                              <div
                                key={item.id}
                                className={`rounded-2xl border p-4 transition ${
                                  stockError ? "border-rose-300 bg-rose-50/40" : "border-slate-200 bg-slate-50/40"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                                    <Pill className="h-3 w-3" /> Obat #{idx + 1}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => removePrescriptionRow(item.id)}
                                    className="text-slate-400 hover:text-rose-700 transition cursor-pointer"
                                    title="Hapus obat"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                                  <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-1.5">
                                      Nama Obat
                                    </label>
                                    <SearchableSelect
                                      value={item.medicineId}
                                      onChange={(val) => selectMedicineForRow(item.id, val)}
                                      options={getMedicineOptionsForRow(item.id)}
                                      isLoading={loadingMedicines}
                                      loadingText="Memuat katalog obat..."
                                      placeholder="Cari & pilih obat"
                                      emptyText="Obat tidak ditemukan."
                                    />
                                    {!loadingMedicines && medicinesCatalog.length === 0 && (
                                      <p className="mt-1.5 text-[10px] text-amber-700 font-medium">
                                        Katalog obat masih kosong. Tambahkan dulu di modul Apoteker.
                                      </p>
                                    )}
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-1.5">
                                      Jumlah
                                    </label>
                                    <div className="flex items-center gap-2">
                                      <input
                                        value={item.quantity}
                                        onChange={(e) =>
                                          handleQuantityChange(item.id, item.medicineId, e.target.value)
                                        }
                                        type="number"
                                        min={0}
                                        max={remaining ?? undefined}
                                        disabled={!item.medicineId}
                                        placeholder={item.medicineId ? "0" : "Pilih obat dulu"}
                                        className={`w-full min-w-0 rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed ${
                                          stockError
                                            ? "border-rose-400 focus:border-rose-500"
                                            : "border-slate-200 focus:border-rose-700"
                                        }`}
                                      />
                                      {item.unit && (
                                        <span className="shrink-0 rounded-xl bg-slate-100 px-3 py-2.5 text-xs font-bold text-slate-500">
                                          {item.unit}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-4">
                                  <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-1.5">
                                    Aturan Pakai
                                  </label>
                                  <ComboboxInput
                                    value={item.rule}
                                    onChange={(val) => updatePrescriptionRow(item.id, "rule", val)}
                                    options={DOSAGE_RULE_PRESETS}
                                    placeholder="Contoh: 3x1 sesudah makan, atau ketik sendiri"
                                  />
                                </div>

                                {item.medicineId && !stockError && remaining != null && (
                                  <p className="mt-3 text-[11px] text-slate-400">
                                    Sisa stok tersedia:{" "}
                                    <span className="font-semibold text-slate-600">
                                      {remaining} {item.unit}
                                    </span>
                                  </p>
                                )}
                                {stockError && (
                                  <p className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-rose-600">
                                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {stockError}
                                  </p>
                                )}
                              </div>
                            );
                          })
                        )}
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
                      Klik &ldquo;Unggah &amp; Finalisasi&rdquo; untuk mengenkripsi dan menjangkarkan data ke blockchain. Atau simpan
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
                      {isFinalRecord ? "Simpan Koreksi & Anchor Ulang" : "Unggah & Finalisasi ke Blockchain"}
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
              <h3 className="text-xl font-extrabold tracking-tight">
                {isEditRoute ? "Perubahan Berhasil Disimpan!" : "Rekam Medis Berhasil Diunggah!"}
              </h3>
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
                    if (isEditRoute) {
                      router.push("/dashboard/faskes/medical-records");
                      return;
                    }
                    closeSuccessModal();
                    setUploadedResult(null);
                  }}
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-100 hover:bg-slate-200 px-5 py-3 text-xs font-bold text-slate-700 transition cursor-pointer"
                >
                  {isEditRoute ? "Kembali ke Daftar" : "Unggah Lagi"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}