"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import MedicalRecordMain from "@/components/features/faskes/MedicalRecordMain";
import { apiGet } from "@/lib/api";
import {
  ArrowUpRight,
  CheckCircle,
  Hash,
  FileText,
  X,
} from "lucide-react";
import {
  createMedicalRecordDraft,
  updateMedicalRecordDraft,
  getMedicalRecordById,
} from "@/services/hospitalService";
import { getServicePrices } from "@/services/servicePriceService";
import { getSpecialties } from "@/services/specialtyService";
import Toast from "@/components/ui/Toast";
import notify from "@/lib/notify";

const DEFAULT_PELAYANAN_MEDIS = [
  { value: "igd", label: "Instalasi Gawat Darurat" },
  { value: "rawat_jalan", label: "Instalasi Rawat Jalan" },
  { value: "rawat_inap", label: "Instalasi Rawat Inap" },
  { value: "bedah_sentral", label: "Instalasi Bedah Sentral" },
  { value: "rehab_medik", label: "Pelayanan Rehabilitas Medik" },
  { value: "one_day_care", label: "One Day Care" },
];

function getMedisOrderRank(val, label = "") {
  const normVal = (val || "").toLowerCase().replace(/[^a-z0-9]+/g, "_");
  const normLbl = (label || "").toLowerCase();

  if (normVal.includes("igd") || normLbl.includes("gawat darurat")) return 1;
  if (normVal.includes("rawat_jalan") || normLbl.includes("rawat jalan")) return 2;
  if (normVal.includes("rawat_inap") || normLbl.includes("rawat inap")) return 3;
  if (normVal.includes("bedah") || normLbl.includes("bedah")) return 4;
  if (normVal.includes("rehab") || normLbl.includes("rehabilitas")) return 5;
  if (normVal.includes("one_day_care") || normLbl.includes("one day care") || normVal.includes("odc")) return 6;
  return 99;
}

const DEFAULT_PENUNJANG_OPTIONS = [
  { value: "laboratorium", label: "Laboratorium (Pemeriksaan Blood / Lab)", category: "Laboratorium" },
  { value: "radiologi", label: "Radiologi (Rontgen / USG / CT Scan)", category: "Radiologi" },
];

const TYPE_OF_TREATMENT_OPTIONS = [
  { value: "rawat_jalan", label: "Rawat Jalan" },
  { value: "rawat_inap", label: "Rawat Inap" },
  { value: "igd", label: "IGD" },
  { value: "one_day_care", label: "One Day Care" },
];

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

function isDoctorMatchingSpecialty(doctor, selectedSpec) {
  if (!selectedSpec || selectedSpec === "all") return true;

  const docSpec = (doctor?.specialist || "").toLowerCase().trim();
  const targetSpec = (selectedSpec || "").toLowerCase().trim();

  if (!docSpec) return false;
  if (docSpec === targetSpec) return true;

  const extractKeyTerm = (str) => {
    if (str.includes("paru") || str.includes("pulmonologi")) return "paru";
    if (str.includes("jantung") || str.includes("kardiologi") || str.includes("kardiovaskuler")) return "jantung";
    if (str.includes("penyakit dalam") || str.includes("sp.pd") || str.includes("internis")) return "dalam";
    if (str.includes("bedah") || str.includes("sp.b")) return "bedah";
    if (str.includes("anak") || str.includes("sp.a") || str.includes("pediatri")) return "anak";
    if (str.includes("obstetri") || str.includes("ginekologi") || str.includes("obgyn")) return "obgyn";
    if (str.includes("saraf") || str.includes("neurologi")) return "saraf";
    if (str.includes("anestesi")) return "anestesi";
    if (str.includes("umum")) return "umum";
    return str;
  };

  const docKey = extractKeyTerm(docSpec);
  const targetKey = extractKeyTerm(targetSpec);

  return docKey === targetKey || docSpec.includes(targetSpec) || targetSpec.includes(docSpec);
}

function buildEmptyDetail(type) {
  const empty = {};
  getDetailFieldsConfig(type).forEach((f) => {
    empty[f.name] = "";
  });
  return empty;
}

function isDoctorMatchingTreatment(doctor, treatmentType) {
  if (!treatmentType) return true;

  const spec = (doctor?.specialist || "").toLowerCase();
  const name = (doctor?.name || "").toLowerCase();

  switch (treatmentType) {
    case "rawat_inap": {
      // Rawat Inap: Penyakit Dalam, Paru, Jantung, Bedah, Obsgyn, Saraf, Anak, Anestesi, Dokter Umum
      const keywords = [
        "penyakit dalam", "sp.pd", "internis",
        "paru", "pulmonologi", "sp.p",
        "jantung", "kardiologi", "kardiovaskuler", "sp.jp",
        "bedah", "sp.b", "sp.btkv", "sp.bs", "sp.ot", "sp.ba", "sp.u", "sp.bp",
        "obstetri", "ginekologi", "obgyn", "obsgyn", "sp.og",
        "saraf", "neurologi", "sp.n", "sp.s",
        "anak", "pediatri", "sp.a",
        "anestesi", "sp.an",
        "umum"
      ];
      return keywords.some((kw) => spec.includes(kw) || name.includes(kw));
    }
    case "rawat_jalan": {
      // Rawat Jalan: Semua dokter
      return true;
    }
    case "igd": {
      // IGD: Dokter Umum, Bedah, Anestesi, Penyakit Dalam, Jantung, Paru, Anak, Obsgyn, Saraf, IGD
      const keywords = [
        "umum", "kepala klinik",
        "bedah", "sp.b", "sp.btkv", "sp.bs", "sp.ot", "sp.ba", "sp.u", "sp.bp",
        "anestesi", "sp.an",
        "penyakit dalam", "sp.pd", "internis",
        "jantung", "kardiologi", "kardiovaskuler", "sp.jp",
        "paru", "pulmonologi", "sp.p",
        "anak", "pediatri", "sp.a",
        "obstetri", "ginekologi", "obgyn", "sp.og",
        "saraf", "neurologi", "sp.n", "sp.s",
        "gawat", "darurat", "igd"
      ];
      return keywords.some((kw) => spec.includes(kw) || name.includes(kw));
    }
    case "one_day_care": {
      // One Day Care: Bedah, Rehab Medis (KFR), Obsgyn, Penyakit Dalam, Mata, THT, Gigi, Dokter Umum
      const keywords = [
        "bedah", "sp.b", "sp.btkv", "sp.bs", "sp.ot", "sp.ba", "sp.u", "sp.bp",
        "rehabilitasi", "kfr", "sp.kfr",
        "obstetri", "ginekologi", "obgyn", "sp.og",
        "penyakit dalam", "sp.pd", "internis",
        "mata", "sp.m",
        "tht", "sp.tht",
        "gigi", "mulut",
        "umum"
      ];
      return keywords.some((kw) => spec.includes(kw) || name.includes(kw));
    }
    default:
      return true;
  }
}

const MAX_ATTACHMENTS = 5;

const STEP_JENIS = "jenis";
const STEP_KUNJUNGAN = "kunjungan";
const STEP_LAMPIRAN = "lampiran";
const detailStepKey = (type) => `detail_${type}`;

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

function buildStateFromRecord(record, selectedTypesHint) {
  const resumedTypes =
    Array.isArray(selectedTypesHint) && selectedTypesHint.length > 0
      ? selectedTypesHint
      : Object.keys(record.detail || {});

  const resumedDetails = {};
  resumedTypes.forEach((type) => {
    const source = record.detail?.[type] || {};
    const picked = {};
    getDetailFieldsConfig(type).forEach((f) => {
      if (source[f.name] !== undefined && source[f.name] !== null) picked[f.name] = source[f.name];
    });
    resumedDetails[type] = { ...buildEmptyDetail(type), ...picked };
  });

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
      if (typeof rawPrescription === "string") {
        prescriptionRows = rawPrescription.split(",").map((medStr, idx) => {
          const trimmed = medStr.trim();
          const match = trimmed.match(/^(.*?)(?:\s*\((.*?)\))?$/);
          return {
            id: `obat-plain-${idx}`,
            medicineId: "",
            medicine: match && match[1] ? match[1].trim() : trimmed,
            unit: "Pcs",
            quantity: match && match[2] ? match[2].trim() : "1",
            rule: "Diminum 3x1 sesudah makan"
          };
        });
      }
    }
  }

  return { resumedTypes, resumedDetails, prescriptionRows };
}

export default function MedicalRecordWizard({ recordId: routeRecordId = null }) {
  const router = useRouter();
  const isEditRoute = !!routeRecordId;

  const [user, setUser] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingStep, setIsSavingStep] = useState(false);
  const [isResuming, setIsResuming] = useState(true);
  const [resumedFromDraft, setResumedFromDraft] = useState(false);
  const [loadError, setLoadError] = useState("");

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
  const [selectedPenunjang, setSelectedPenunjang] = useState([]);
  const [detailsByType, setDetailsByType] = useState({});

  const [persistedTypes, setPersistedTypes] = useState([]);

  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [existingAttachmentsInfo, setExistingAttachmentsInfo] = useState([]);

  const [prescriptionItems, setPrescriptionItems] = useState([]);

  const [medicinesCatalog, setMedicinesCatalog] = useState([]);
  const [loadingMedicines, setLoadingMedicines] = useState(true);

  const [recordId, setRecordId] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Toast Notification State
  const [toast, setToast] = useState({ show: false, type: "success", title: "", message: "" });
  const showToast = (message, type = "success", title = "", tipe) =>
    notify(setToast, { type, title, message, tipe });

  const setErrorMessage = (msg) => {
    if (msg) {
      showToast(msg, "error", "Perhatian");
    }
  };

  const setSuccessMessage = (msg) => {
    if (msg) {
      showToast(msg, "success", "Berhasil");
    }
  };

  const [uploadedResult, setUploadedResult] = useState(null);
  const [copiedTx, setCopiedTx] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [doctorsList, setDoctorsList] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [servicePrices, setServicePrices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [doctorSpecialtyFilter, setDoctorSpecialtyFilter] = useState("all");
  const [specialtiesList, setSpecialtiesList] = useState([]);

  const [resumedDoctorInfo, setResumedDoctorInfo] = useState(null);

  const [selectedPenunjangCategories, setSelectedPenunjangCategories] = useState([]);
  const [selectedPenunjangSubItems, setSelectedPenunjangSubItems] = useState([]);

  const recordTypes = useMemo(() => {
    const kategoriFromApi = servicePrices.filter((s) => s.type === "kategori");
    if (kategoriFromApi.length > 0) {
      const mapped = kategoriFromApi.map((item) => {
        const val = (item.code || item.name).toLowerCase().replace(/[^a-z0-9]+/g, "_");
        return {
          value: val,
          label: item.name,
          code: item.code,
          kptl: item.kptl,
        };
      });
      mapped.sort((a, b) => getMedisOrderRank(a.value, a.label) - getMedisOrderRank(b.value, b.label));
      return mapped;
    }
    return DEFAULT_PELAYANAN_MEDIS;
  }, [servicePrices]);

  const penunjangMainCategories = useMemo(() => {
    const mainFromApi = servicePrices.filter((s) => s.type === "penunjang");
    if (mainFromApi.length > 0) {
      return mainFromApi.map((item) => ({
        value: item.category || item.name,
        label: item.name,
        code: item.code,
        kptl: item.kptl,
      }));
    }
    return [
      { value: "Laboratorium", label: "Laboratorium" },
      { value: "Radiologi", label: "Radiologi" },
    ];
  }, [servicePrices]);

  const penunjangSubItems = useMemo(() => {
    return servicePrices.filter((s) => s.type === "sub_penunjang").map((item) => ({
      id: item.code || item.name,
      name: item.name,
      category: item.category || "Penunjang",
      code: item.code,
      kptl: item.kptl,
      satuan: item.satuan,
      price: item.price,
    }));
  }, [servicePrices]);

  const togglePenunjangCategory = (catValue) => {
    setSelectedPenunjangCategories((prev) => {
      if (prev.includes(catValue)) {
        setSelectedPenunjangSubItems((subPrev) =>
          subPrev.filter((id) => {
            const item = penunjangSubItems.find((s) => s.id === id);
            return item ? item.category !== catValue : true;
          })
        );
        return prev.filter((c) => c !== catValue);
      }
      return [...prev, catValue];
    });
  };

  const togglePenunjangSubItem = (itemId) => {
    setSelectedPenunjangSubItems((prev) =>
      prev.includes(itemId) ? prev.filter((i) => i !== itemId) : [...prev, itemId]
    );
  };

  const closeSuccessModal = () => setShowSuccessModal(false);

  const sortedSelectedTypes = useMemo(() => {
    return [...selectedTypes].sort((a, b) => {
      const labelA = recordTypes.find((t) => t.value === a)?.label || a;
      const labelB = recordTypes.find((t) => t.value === b)?.label || b;
      return getMedisOrderRank(a, labelA) - getMedisOrderRank(b, labelB);
    });
  }, [selectedTypes, recordTypes]);

  const steps = useMemo(
    () => [STEP_JENIS, STEP_KUNJUNGAN, ...sortedSelectedTypes.map(detailStepKey), STEP_LAMPIRAN],
    [sortedSelectedTypes]
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
    try {
      const activeList = getSpecialties().filter((s) => s.status === "active");
      setSpecialtiesList(activeList);
    } catch (err) {
      console.error("Gagal memuat spesialisasi", err);
    }
  }, []);

  useEffect(() => {
    const fetchServicePricesData = async () => {
      setLoadingServices(true);
      try {
        const res = await getServicePrices();
        if (res?.success && Array.isArray(res.data)) {
          setServicePrices(res.data.filter((s) => s.status === "active"));
        } else if (Array.isArray(res)) {
          setServicePrices(res.filter((s) => s.status === "active"));
        }
      } catch (err) {
        console.error("Gagal memuat daftar jenis layanan dari finance", err);
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServicePricesData();
  }, []);

  const typeOfTreatmentOptions = useMemo(() => {
    if (servicePrices.length > 0) {
      const options = servicePrices.map((sp) => ({
        value: sp.name,
        label: sp.code ? `${sp.name} (${sp.code})` : sp.name,
      }));
      if (typeOfTreatment && !options.some((o) => o.value === typeOfTreatment)) {
        options.unshift({ value: typeOfTreatment, label: typeOfTreatment });
      }
      return options;
    }
    return TYPE_OF_TREATMENT_OPTIONS;
  }, [servicePrices, typeOfTreatment]);

  useEffect(() => {
    const fetchApprovedPatients = async () => {
      setLoadingPatients(true);
      try {
        const result = await apiGet("/api/hospital/access-requests");
        const allPatients = Array.isArray(result?.data) ? result.data : [];

        setApprovedPatients(
          allPatients.map((item) => ({
            patientId: item.patient_id,
            patientName: item.Patient?.name || item.patient?.name || "Pasien Terdaftar",
            nik: item.Patient?.profil?.nik || item.patient?.profil?.nik || "-",
            requestId: item.id,
          }))
        );
      } catch (err) {
        console.error("Gagal memuat pasien", err);
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

  function applyLoadedRecord(record, selectedTypesHint) {
    setRecordId(record.id);
    setPatientId(record.patient_id || "");
    setTitle(record.title || "");
    setVisitDate(record.visit_date || todayStr);
    setTypeOfTreatment(record.type_of_treatment || "");
    setDoctorId(record.doctor?.id ? String(record.doctor.id) : "");
    setResumedDoctorInfo(record.doctor || null);
    setSummary(record.summary || "");
    setExistingAttachmentsInfo(record.attachments || []);

    const { resumedTypes, resumedDetails, prescriptionRows } = buildStateFromRecord(record, selectedTypesHint);

    if (prescriptionRows.length > 0) setPrescriptionItems(prescriptionRows);

    setSelectedTypes(resumedTypes);
    setDetailsByType(resumedDetails);
    setPersistedTypes(resumedTypes); // BUG FIX #2: apapun yang sudah termuat dari backend dianggap "persisted"

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

  useEffect(() => {
    if (!isEditRoute && recordId) {
      saveWizardDraftMeta(recordId, selectedTypes);
    }
  }, [recordId, selectedTypes, isEditRoute]);

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

  const handleTypeOfTreatmentChange = (val) => {
    setTypeOfTreatment(val);
    if (val && doctorId) {
      const selectedDoc = doctorsList.find((d) => String(d.id) === String(doctorId)) || resumedDoctorInfo;
      if (selectedDoc && !isDoctorMatchingTreatment(selectedDoc, val)) {
        setDoctorId("");
      }
    }
  };

  const handleDoctorSpecialtyFilterChange = (val) => {
    setDoctorSpecialtyFilter(val);
    if (val && val !== "all" && doctorId) {
      const selectedDoc = doctorsList.find((d) => String(d.id) === String(doctorId)) || resumedDoctorInfo;
      if (selectedDoc && !isDoctorMatchingSpecialty(selectedDoc, val)) {
        setDoctorId("");
      }
    }
  };

  const filteredDoctorsList = useMemo(() => {
    let list = doctorsList;

    if (doctorSpecialtyFilter && doctorSpecialtyFilter !== "all") {
      const specFiltered = list.filter((d) => isDoctorMatchingSpecialty(d, doctorSpecialtyFilter));
      if (specFiltered.length > 0) return specFiltered;
    } else if (typeOfTreatment) {
      const treatmentFiltered = list.filter((d) => isDoctorMatchingTreatment(d, typeOfTreatment));
      if (treatmentFiltered.length > 0) return treatmentFiltered;
    }

    return doctorsList;
  }, [doctorsList, doctorSpecialtyFilter, typeOfTreatment]);

  const doctorsForSelection = useMemo(() => {
    const alreadyInFiltered = filteredDoctorsList.some((d) => String(d.id) === String(doctorId));
    if (doctorId && !alreadyInFiltered) {
      const fullMatch = doctorsList.find((d) => String(d.id) === String(doctorId));
      if (fullMatch) {
        return [fullMatch, ...filteredDoctorsList];
      }
      if (resumedDoctorInfo && String(resumedDoctorInfo.id) === String(doctorId)) {
        return [resumedDoctorInfo, ...filteredDoctorsList];
      }
    }
    return filteredDoctorsList;
  }, [filteredDoctorsList, doctorsList, doctorId, resumedDoctorInfo]);

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
        label: d.name,
      })),
    [doctorsForSelection]
  );

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

  const addPrescriptionRow = () => {
    setPrescriptionItems((prev) => [...prev, buildEmptyPrescriptionRow()]);
  };

  const updatePrescriptionRow = (id, field, value) => {
    setPrescriptionItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const removePrescriptionRow = (id) => {
    setPrescriptionItems((prev) => prev.filter((item) => item.id !== id));
  };

  const getRemainingStockForRow = (rowId, medicineId) => {
    const med = medicinesCatalog.find((m) => m.id === medicineId);
    if (!med) return 0;
    const usedByOtherRows = prescriptionItems
      .filter((i) => i.id !== rowId && i.medicineId === medicineId)
      .reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
    return Math.max(0, med.stock - usedByOtherRows);
  };

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

  const getMedicineOptionsForRow = (rowId) =>
    medicinesCatalog.map((med) => {
      const remaining = getRemainingStockForRow(rowId, med.id);
      return {
        value: med.id,
        disabled: remaining <= 0,
        label: remaining <= 0 ? `${med.name} (Stok Habis)` : med.name,
      };
    });

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

  const buildAllDetailsPayload = () => {
    const payload = {};
    selectedTypes.forEach((type) => {
      const source = detailsByType[type] || {};
      const fields = {};
      getDetailFieldsConfig(type).forEach((f) => {
        if (source[f.name] !== undefined && source[f.name] !== null && source[f.name] !== "") {
          fields[f.name] = source[f.name];
        }
      });
      if (Object.keys(fields).length > 0) payload[type] = fields;
    });

    const prescriptionDetail = buildPrescriptionDetailPayload();
    if (prescriptionDetail) Object.assign(payload, prescriptionDetail);

    return payload;
  };

  // BUG FIX #2: jenis yang dulu ada di persistedTypes (sudah tersimpan di backend)
  // tapi sekarang sudah tidak ada lagi di selectedTypes (di-uncheck user) --
  // inilah yang harus dikirim ke backend supaya baris detailnya benar-benar dihapus.
  const getRemovedTypes = () => persistedTypes.filter((t) => !selectedTypes.includes(t));

  const resetWizard = () => {
    setPatientId("");
    setTitle("");
    setVisitDate(todayStr);
    setTypeOfTreatment("");
    setDoctorId("");
    setResumedDoctorInfo(null);
    setSummary("");
    setSelectedTypes([]);
    setDetailsByType({});
    setPersistedTypes([]); // BUG FIX #2
    setAttachmentFiles([]);
    setExistingAttachmentsInfo([]);
    setPrescriptionItems([]);
    setRecordId(null);
    setCurrentStepIndex(0);
    setResumedFromDraft(false);
    clearWizardDraftMeta();
  };

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
      return newId; // PERBAIKAN: kembalikan id supaya bisa dipakai langsung tanpa menunggu re-render
    } else {
      const result = await updateMedicalRecordDraft(recordId, fd);
      if (!result?.success) throw new Error(result?.message || "Gagal memperbarui informasi kunjungan.");
      return recordId; // PERBAIKAN
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

  // PERBAIKAN: helper validasi step Kunjungan dipisah supaya dipakai bersama oleh
  // validateAndPersistStep (tombol "Lanjutkan") dan canSaveDraft (tombol "Simpan Draft").
  const isKunjunganValid = () => !!(patientId && title.trim() && visitDate && typeOfTreatment);

  // PERBAIKAN: menentukan apakah tombol "Simpan Draft" boleh diklik di step SEKARANG,
  // berdasarkan field wajib pada step tersebut sudah terisi atau belum.
  const canSaveDraft = useMemo(() => {
    if (isSavingStep || isUploading) return false;

    if (currentStep === STEP_JENIS) {
      // Belum ada info kunjungan sama sekali di step ini, belum ada yang bisa disimpan.
      return false;
    }

    if (currentStep === STEP_KUNJUNGAN) {
      return isKunjunganValid();
    }

    if (currentStep.startsWith("detail_")) {
      const type = currentStep.replace("detail_", "");
      const fields = detailsByType[type] || {};
      const hasContent = Object.values(fields).some((v) => v && String(v).trim() !== "");
      return !!recordId && hasContent;
    }

    if (currentStep === STEP_LAMPIRAN) {
      // Obat & lampiran memang opsional, boleh disimpan draft kapan saja selama record sudah ada.
      return !!recordId;
    }

    return false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, isSavingStep, isUploading, patientId, title, visitDate, typeOfTreatment, recordId, detailsByType]);

  // PERBAIKAN: pesan tooltip saat tombol "Simpan Draft" disabled
  const saveDraftHint = useMemo(() => {
    if (currentStep === STEP_JENIS) {
      return "Pilih jenis rekam medis lalu lengkapi step 'Informasi Kunjungan' dulu.";
    }
    if (currentStep === STEP_KUNJUNGAN && !isKunjunganValid()) {
      return "Lengkapi Pasien, Judul, Tanggal Kunjungan, dan Jenis Layanan terlebih dahulu.";
    }
    if (currentStep.startsWith("detail_")) {
      const type = currentStep.replace("detail_", "");
      const typeLabel = recordTypes.find((t) => t.value === type)?.label || type;
      return `Isi minimal 1 data untuk ${typeLabel} terlebih dahulu.`;
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, patientId, title, visitDate, typeOfTreatment, recordTypes]);

  async function validateAndPersistStep(stepKey) {
    if (stepKey === STEP_JENIS) {
      if (selectedTypes.length === 0) {
        setErrorMessage("Pilih minimal 1 jenis rekam medis / pelayanan medis yang ingin diunggah.");
        return false;
      }
      return true;
    }

    if (stepKey === STEP_KUNJUNGAN) {
      if (!patientId) {
        setErrorMessage("Pilih pasien terlebih dahulu.");
        return false;
      }
      if (!title.trim()) {
        setErrorMessage("Judul rekam medis wajib diisi.");
        return false;
      }
      if (!visitDate) {
        setErrorMessage("Tanggal kunjungan wajib diisi.");
        return false;
      }
      if (!isEditRoute && visitDate < todayStr) {
        setErrorMessage("Tanggal kunjungan tidak boleh sebelum hari ini.");
        return false;
      }
      if (!typeOfTreatment) {
        setErrorMessage("Jenis layanan wajib dipilih.");
        return false;
      }

      try {
        await persistHeaderStep();
        return true;
      } catch (err) {
        console.error(err);
        setErrorMessage(err.message || "Gagal menyimpan informasi kunjungan.");
        return false;
      }
    }

    if (stepKey.startsWith("detail_")) {
      const type = stepKey.replace("detail_", "");
      const fields = detailsByType[type] || {};
      const hasContent = Object.values(fields).some((v) => v && String(v).trim() !== "");
      if (!hasContent) {
        const typeLabel = recordTypes.find((t) => t.value === type)?.label || type;
        setErrorMessage(`Lengkapi minimal 1 data untuk rekam medis ${typeLabel}.`);
        return false;
      }
      try {
        await persistDetailStep(type);
        // BUG FIX #2: begitu 1 jenis berhasil disimpan ke backend, tandai sebagai persisted
        // supaya kalau nanti di-uncheck, kita tahu itu harus masuk daftar removeTypes.
        setPersistedTypes((prev) => (prev.includes(type) ? prev : [...prev, type]));
        return true;
      } catch (err) {
        console.error(err);
        setErrorMessage(err.message || `Gagal menyimpan data ${type}.`);
        return false;
      }
    }

    return true;
  }

  const handleNext = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setIsSavingStep(true);
    try {
      const ok = await validateAndPersistStep(currentStep);
      if (ok) setCurrentStepIndex((i) => i + 1);
    } finally {
      setIsSavingStep(false);
    }
  };

  const handlePrev = () => {
    setErrorMessage("");
    setCurrentStepIndex((i) => Math.max(0, i - 1));
  };

  const goToStep = async (targetIndex) => {
    if (targetIndex === currentStepIndex || isSavingStep || isUploading) return;
    setErrorMessage("");
    setSuccessMessage("");

    if (targetIndex < currentStepIndex) {
      setCurrentStepIndex(targetIndex);
      return;
    }

    setIsSavingStep(true);
    try {
      for (let i = currentStepIndex; i < targetIndex; i++) {
        const ok = await validateAndPersistStep(steps[i]);
        if (!ok) {
          setCurrentStepIndex(i);
          return;
        }
      }
      setCurrentStepIndex(targetIndex);
    } finally {
      setIsSavingStep(false);
    }
  };

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

      const detailsPayload = buildAllDetailsPayload();
      if (Object.keys(detailsPayload).length > 0) fd.append("details", JSON.stringify(detailsPayload));

      // BUG FIX #2: kirim jenis yang di-uncheck supaya backend menghapus baris detailnya
      const removedTypes = getRemovedTypes();
      if (removedTypes.length > 0) fd.append("removeTypes", JSON.stringify(removedTypes));

      attachmentFiles.forEach((file) => fd.append("attachments", file));

      const result = await updateMedicalRecordDraft(recordId, fd);
      if (result?.success) {
        setPersistedTypes(selectedTypes); // BUG FIX #2: sinkronkan setelah berhasil
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

  const handleSaveDraftAndExit = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (hasPrescriptionStockErrors()) {
      setErrorMessage("Ada obat yang jumlahnya melebihi stok tersedia. Perbaiki dahulu sebelum menyimpan draft.");
      return;
    }

    setIsSavingStep(true);
    try {
      // PERBAIKAN: kalau record belum ada, atau kita sedang di step Kunjungan (jaga-jaga ada
      // perubahan header yang belum ke-persist), simpan header dulu dan pakai id hasilnya
      // langsung -- tidak menunggu re-render supaya recordId tidak stale saat langsung dipakai
      // di bawah untuk updateMedicalRecordDraft.
      let activeRecordId = recordId;
      if (!recordId || currentStep === STEP_KUNJUNGAN) {
        if (!isKunjunganValid()) {
          setErrorMessage("Lengkapi Pasien, Judul, Tanggal Kunjungan, dan Jenis Perawatan terlebih dahulu.");
          return;
        }
        activeRecordId = await persistHeaderStep();
      }

      const fd = new FormData();
      let hasChanges = false;

      if (attachmentFiles.length > 0) {
        attachmentFiles.forEach((file) => fd.append("attachments", file));
        hasChanges = true;
      }

      const detailsPayload = buildAllDetailsPayload();
      if (Object.keys(detailsPayload).length > 0) {
        fd.append("details", JSON.stringify(detailsPayload));
        hasChanges = true;
      }

      // BUG FIX #2
      const removedTypes = getRemovedTypes();
      if (removedTypes.length > 0) {
        fd.append("removeTypes", JSON.stringify(removedTypes));
        hasChanges = true;
      }

      if (hasChanges) {
        const result = await updateMedicalRecordDraft(activeRecordId, fd); // PERBAIKAN: pakai activeRecordId, bukan recordId dari closure lama
        if (!result?.success) throw new Error(result?.message || "Gagal menyimpan lampiran/obat.");
        setPersistedTypes(selectedTypes); // BUG FIX #2: sinkronkan setelah berhasil
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
    : 'Satu rekam medis mewakili satu kunjungan pasien. Isi bertahap per langkah -- progres otomatis tersimpan sebagai draft setiap kali Anda menekan "Lanjut", atau klik langsung step yang dituju di atas.';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16 md:pb-0">
      <Navbar user={user} roleLabel="Fasilitas Kesehatan" onLogout={() => router.push("/auth/login")} />
      <div className="flex flex-1">
        <Sidebar role="faskes" />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-teal-800 font-bold">Dashboard Faskes</p>
              <h1 className="text-3xl font-extrabold text-slate-900 mt-3">{pageTitle}</h1>
              <p className="max-w-2xl text-sm text-slate-500 mt-2">{pageSubtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/dashboard/faskes/medical-records")}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-700 to-cyan-800 px-4 py-3 text-sm font-bold text-white shadow-md hover:from-teal-800 hover:to-cyan-900 transition"
            >
              <ArrowUpRight className="h-4 w-4" /> Semua Rekam Medis
            </button>
          </div>

          <MedicalRecordMain
            isResuming={isResuming}
            isEditRoute={isEditRoute}
            loadError={loadError}
            onBackToList={() => router.push("/dashboard/faskes/medical-records")}
            resumedFromDraft={resumedFromDraft}
            onResetWizard={resetWizard}
            isFinalRecord={isFinalRecord}
            steps={steps}
            currentStepIndex={currentStepIndex}
            onGoToStep={goToStep}
            isSavingStep={isSavingStep}
            isUploading={isUploading}
            currentStep={currentStep}
            stepJenis={STEP_JENIS}
            stepKunjungan={STEP_KUNJUNGAN}
            stepLampiran={STEP_LAMPIRAN}
            recordTypes={recordTypes}
            penunjangMainCategories={penunjangMainCategories}
            selectedPenunjangCategories={selectedPenunjangCategories}
            onTogglePenunjangCategory={togglePenunjangCategory}
            penunjangSubItems={penunjangSubItems}
            selectedPenunjangSubItems={selectedPenunjangSubItems}
            onTogglePenunjangSubItem={togglePenunjangSubItem}
            selectedTypes={selectedTypes}
            onToggleRecordType={toggleRecordType}
            patientId={patientId}
            onPatientChange={setPatientId}
            patientOptions={patientOptions}
            loadingPatients={loadingPatients}
            recordId={recordId}
            approvedPatients={approvedPatients}
            title={title}
            onTitleChange={setTitle}
            visitDate={visitDate}
            onVisitDateChange={setVisitDate}
            todayStr={todayStr}
            typeOfTreatment={typeOfTreatment}
            onTypeOfTreatmentChange={handleTypeOfTreatmentChange}
            typeOfTreatmentOptions={typeOfTreatmentOptions}
            doctorSpecialtyFilter={doctorSpecialtyFilter}
            onDoctorSpecialtyFilterChange={handleDoctorSpecialtyFilterChange}
            specialtiesList={specialtiesList}
            doctorId={doctorId}
            onDoctorChange={setDoctorId}
            doctorOptions={doctorOptions}
            loadingDoctors={loadingDoctors}
            selectedDoctorInfo={selectedDoctorInfo}
            doctorsForSelection={doctorsForSelection}
            summary={summary}
            onSummaryChange={setSummary}
            getDetailFieldsConfig={getDetailFieldsConfig}
            detailsByType={detailsByType}
            buildEmptyDetail={buildEmptyDetail}
            onUpdateDetailField={updateDetailField}
            prescriptionItems={prescriptionItems}
            getRowStockError={getRowStockError}
            getRemainingStockForRow={getRemainingStockForRow}
            onRemovePrescriptionRow={removePrescriptionRow}
            loadingMedicines={loadingMedicines}
            medicinesCatalog={medicinesCatalog}
            getMedicineOptionsForRow={getMedicineOptionsForRow}
            onSelectMedicineForRow={selectMedicineForRow}
            onQuantityChange={handleQuantityChange}
            onUpdatePrescriptionRow={updatePrescriptionRow}
            dosageRulePresets={DOSAGE_RULE_PRESETS}
            onAddPrescriptionRow={addPrescriptionRow}
            maxAttachments={MAX_ATTACHMENTS}
            onHandleFilesSelected={handleFilesSelected}
            existingAttachmentsInfo={existingAttachmentsInfo}
            attachmentFiles={attachmentFiles}
            onRemoveAttachment={removeAttachment}
            updateActionsProps={{
              isFirstStep,
              isSavingStep,
              isUploading,
              isLastContentStep,
              recordId,
              isFinalRecord,
              canSaveDraft,
              saveDraftHint,
              onPrev: handlePrev,
              onNext: handleNext,
              onSaveDraft: handleSaveDraftAndExit,
              onFinalSubmit: handleFinalSubmit,
            }}
          />
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
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-6 py-8 text-white text-center relative overflow-hidden">
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
                    <Hash className="h-3.5 w-3.5 text-teal-700" />
                    {uploadedResult.title || "Rekam Medis"}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full border border-teal-200">
                    {uploadedResult.recordType}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-3 gap-2">
                  <span className="font-mono text-xs font-bold text-teal-900 break-all select-all">
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
                      className="px-3 py-1.5 rounded-lg bg-teal-50 text-teal-800 hover:bg-teal-100 font-bold text-xs transition cursor-pointer shrink-0 border border-teal-200"
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
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-700 to-cyan-800 hover:from-teal-800 hover:to-cyan-900 px-5 py-3 text-xs font-bold text-white shadow-md transition cursor-pointer"
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

      {/* Floating Toast Notification */}
      <Toast toast={toast} onClose={() => setToast({ ...toast, show: false })} />
    </div>
  );
}
