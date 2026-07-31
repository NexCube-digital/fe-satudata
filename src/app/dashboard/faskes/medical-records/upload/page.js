"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { apiGet } from "@/lib/api";
import { Plus, RefreshCw, ArrowUpRight, CheckCircle, Hash, FileText, Check, X } from "lucide-react";
import { uploadMedicalRecord } from "@/services/hospitalService";

const RECORD_TYPES = [
  { value: "umum", label: "Umum" },
  { value: "lab", label: "Laboratorium" },
  { value: "radiologi", label: "Radiologi" },
  { value: "resep", label: "Resep" }
];

const SPECIALIST_KEYWORDS_BY_TYPE = {
  umum: ["umum"],
  lab: ["patologi klinik", "laboratorium"],
  radiologi: ["radiologi"],
  resep: null,
};

// Dokter wajib diisi hanya untuk type tertentu.
// false = boleh dikosongkan (ditandai "opsional" di UI)
const DOCTOR_REQUIRED_BY_TYPE = {
  umum: true,
  lab: false,
  radiologi: true,
  resep: false,
};

// ==== Sinkronisasi field yang sama antar jenis rekam medis ====
const SYNCED_GROUPS = {
  title: {
    appliesTo: () => true,
    getValue: (entry) => entry.title,
    setValue: (entry, _type, value) => ({ ...entry, title: value }),
  },
  visitDate: {
    appliesTo: () => true,
    getValue: (entry) => entry.visitDate,
    setValue: (entry, _type, value) => ({ ...entry, visitDate: value }),
  },
  summary: {
    appliesTo: () => true,
    getValue: (entry) => entry.summary,
    setValue: (entry, _type, value) => ({ ...entry, summary: value }),
  },
  doctorId: {
    appliesTo: () => true,
    getValue: (entry) => entry.doctorId,
    setValue: (entry, _type, value) => ({ ...entry, doctorId: value }),
  },
  doctorNote: {
    // Catatan Dokter cuma ada di form Umum (field `note_doctor`) & Resep (field `note`)
    appliesTo: (type) => type === "umum" || type === "resep",
    getValue: (entry, type) => (type === "resep" ? entry.detail?.note : entry.detail?.note_doctor),
    setValue: (entry, type, value) =>
      type === "resep"
        ? { ...entry, detail: { ...entry.detail, note: value } }
        : { ...entry, detail: { ...entry.detail, note_doctor: value } },
  },
};

function getDetailFieldsConfig(type) {
  switch (type) {
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
    default:
      return [
        { name: "complaint", label: "Keluhan Pasien" },
        { name: "diagnosis", label: "Diagnosa" },
        { name: "action", label: "Tindakan" },
        { name: "note_doctor", label: "Catatan Dokter" }
      ];
  }
}

function buildEmptyDetail(type) {
  if (type === "resep") {
    // untuk resep, field bebas cuma "note" (sesuai kolom model),
    // daftar obat disimpan terpisah di `medicines` (array baris)
    return { note: "" };
  }
  const fields = getDetailFieldsConfig(type);
  const empty = {};
  fields.forEach((f) => { empty[f.name] = ""; });
  return empty;
}

let medicineRowSeq = 0;
function buildEmptyMedicineRow() {
  medicineRowSeq += 1;
  return { rowId: `med-${medicineRowSeq}`, name: "", dose: "", qty: "", usage: "" };
}

function buildEmptyRecordEntry(type, todayStr) {
  const base = {
    title: "",
    visitDate: todayStr,
    doctorId: "",
    summary: "",
    detail: buildEmptyDetail(type),
  };
  if (type === "resep") {
    base.medicines = [buildEmptyMedicineRow()];
  }
  return base;
}

export default function FaskesMedicalRecordUploadPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [approvedPatients, setApprovedPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);

  const [selectedTypes, setSelectedTypes] = useState([]);
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [recordsData, setRecordsData] = useState({});

  // State sinkronisasi field yang sama antar jenis rekam medis.
  // Bentuk: { [groupKey]: { source: type|null, dirty: { [type]: true } } }
  const [syncMeta, setSyncMeta] = useState({});

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadedResults, setUploadedResults] = useState([]);
  const [copiedTx, setCopiedTx] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [doctorsList, setDoctorsList] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

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
        // Asumsi: /api/doctor sudah mengembalikan dokter yang terhubung
        // (DoctorHospital status "Aktif") dengan RS yang sedang login.
        // Kalau ternyata endpoint ini mengembalikan SEMUA dokter lintas RS,
        // perlu filter tambahan berdasarkan hospital_id di sini.
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

  const getDoctorsForType = (type) => {
    const keywords = SPECIALIST_KEYWORDS_BY_TYPE[type];
    if (!keywords) return doctorsList;
    const filtered = doctorsList.filter((doc) => {
      const spec = (doc.specialist || "").toLowerCase();
      return keywords.some((k) => spec.includes(k));
    });
    return filtered.length > 0 ? filtered : doctorsList;
  };

  const toggleRecordType = (type) => {
    setSelectedTypes((prev) => {
      if (prev.includes(type)) {
        setRecordsData((prevData) => {
          const next = { ...prevData };
          delete next[type];
          return next;
        });
        return prev.filter((t) => t !== type);
      }

      setRecordsData((prevData) => {
        let newEntry = buildEmptyRecordEntry(type, todayStr);

        // Kalau ada field yang sedang tersinkronisasi (sudah punya nilai
        // "sumber") dan type baru ini belum pernah divergen untuk field
        // tsb, langsung isi otomatis dari nilai sumber saat ini.
        Object.entries(SYNCED_GROUPS).forEach(([groupKey, groupDef]) => {
          if (!groupDef.appliesTo(type)) return;
          const meta = syncMeta[groupKey];
          if (!meta || !meta.source || meta.dirty?.[type]) return;

          const sourceEntry = prevData[meta.source];
          if (!sourceEntry || !groupDef.appliesTo(meta.source)) return;

          const sourceValue = groupDef.getValue(sourceEntry, meta.source);
          if (sourceValue) {
            newEntry = groupDef.setValue(newEntry, type, sourceValue);
          }
        });

        return { ...prevData, [type]: newEntry };
      });
      return [...prev, type];
    });
  };

  const updateRecordDetailField = (type, fieldName, value) => {
    setRecordsData((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        detail: { ...prev[type].detail, [fieldName]: value },
      },
    }));
  };

  // Handler generik untuk field yang sama di beberapa jenis rekam medis
  // (Judul, Tanggal Kunjungan, Ringkasan Medis, Dokter Penanggung Jawab,
  // Catatan Dokter). Semua field ini pakai handler ini, bukan lagi
  // updateRecordField langsung.
  const updateSyncedField = (group, type, value) => {
    const groupDef = SYNCED_GROUPS[group];
    const meta = syncMeta[group] || { source: null, dirty: {} };
    const alreadyDirty = !!meta.dirty[type];

    // "Divergen": field ini diedit langsung padahal sumber sinkronisasi
    // saat ini adalah type lain -> putuskan link untuk type ini saja,
    // type sumber tidak boleh ikut berubah lagi gara-gara edit ini.
    const isDiverging = !alreadyDirty && meta.source && meta.source !== type;
    const shouldBroadcast = !alreadyDirty && !isDiverging;

    setRecordsData((prev) => {
      if (!prev[type]) return prev;
      const next = { ...prev, [type]: groupDef.setValue(prev[type], type, value) };

      if (shouldBroadcast) {
        selectedTypes.forEach((siblingType) => {
          if (siblingType === type) return;
          if (!groupDef.appliesTo(siblingType)) return;
          if (meta.dirty[siblingType]) return; // sudah divergen, jangan ditimpa
          if (!next[siblingType]) return;
          next[siblingType] = groupDef.setValue(next[siblingType], siblingType, value);
        });
      }

      return next;
    });

    if (isDiverging) {
      setSyncMeta((prev) => ({
        ...prev,
        [group]: { ...meta, dirty: { ...meta.dirty, [type]: true } },
      }));
    } else if (!alreadyDirty) {
      setSyncMeta((prev) => ({
        ...prev,
        [group]: { ...meta, source: type },
      }));
    }
  };

  const addMedicineRow = (type) => {
    setRecordsData((prev) => ({
      ...prev,
      [type]: { ...prev[type], medicines: [...(prev[type].medicines || []), buildEmptyMedicineRow()] },
    }));
  };

  const removeMedicineRow = (type, rowId) => {
    setRecordsData((prev) => ({
      ...prev,
      [type]: { ...prev[type], medicines: prev[type].medicines.filter((m) => m.rowId !== rowId) },
    }));
  };

  const updateMedicineRow = (type, rowId, field, value) => {
    setRecordsData((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        medicines: prev[type].medicines.map((m) => (m.rowId === rowId ? { ...m, [field]: value } : m)),
      },
    }));
  };

  const resetForm = () => {
    setPatientId("");
    setSelectedTypes([]);
    setRecordsData({});
    setSyncMeta({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!patientId) {
      setErrorMessage("Pilih pasien terlebih dahulu.");
      return;
    }

    if (selectedTypes.length === 0) {
      setErrorMessage("Pilih minimal 1 jenis rekam medis yang ingin diunggah.");
      return;
    }

    for (const type of selectedTypes) {
      const entry = recordsData[type];
      const typeLabel = RECORD_TYPES.find((t) => t.value === type)?.label || type;

      if (!entry?.title || !entry?.visitDate) {
        setErrorMessage(`Lengkapi judul dan tanggal kunjungan untuk rekam medis ${typeLabel}.`);
        return;
      }

      if (DOCTOR_REQUIRED_BY_TYPE[type] && !entry?.doctorId) {
        setErrorMessage(`Lengkapi dokter penanggung jawab untuk rekam medis ${typeLabel}.`);
        return;
      }

      if (entry.visitDate < todayStr) {
        setErrorMessage(`Tanggal kunjungan untuk rekam medis ${typeLabel} tidak boleh sebelum hari ini.`);
        return;
      }

      if (type === "resep") {
        const filledMedicines = (entry.medicines || []).filter((m) => m.name.trim() !== "");
        if (filledMedicines.length === 0) {
          setErrorMessage("Lengkapi minimal 1 obat pada daftar obat resep.");
          return;
        }
      }
    }

    setIsUploading(true);

    const records = selectedTypes.map((type) => {
      const entry = recordsData[type];

      let detailPayload;
      if (type === "resep") {
        const filledMedicines = (entry.medicines || []).filter((m) => m.name.trim() !== "");
        detailPayload = {
          examination_type: entry.title || "Pemeriksaan Medis",
          list_of_medicines: JSON.stringify(
            filledMedicines.map(({ name, dose, qty, usage }) => ({ name, dose, qty, usage }))
          ),
          note: entry.detail.note,
        };
      } else {
        detailPayload = {
          examination_type: entry.title || "Pemeriksaan Medis",
          ...entry.detail,
        };
      }

      return {
        recordType: type,
        title: entry.title,
        visitDate: entry.visitDate,
        doctorId: entry.doctorId ? Number(entry.doctorId) : undefined,
        summary: entry.summary,
        detail: detailPayload,
      };
    });

    const payload = {
      patientId: Number(patientId),
      records,
    };

    try {
      const result = await uploadMedicalRecord(payload);
      if (result.success) {
        const created = Array.isArray(result.data) ? result.data : result.data ? [result.data] : [];
        setUploadedResults(
          created.map((item) => ({
            recordType: item.record_type,
            title: item.title,
            txHash: item.tx_hash || item.txHash || "",
          }))
        );
        setShowSuccessModal(true);
        resetForm();
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
              <p className="max-w-2xl text-sm text-slate-500 mt-2">Pilih satu atau beberapa jenis rekam medis sekaligus untuk pasien yang sama, lalu unggah dan catat tx hash blockchain.</p>
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

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Jenis Rekam Medis (bisa pilih lebih dari satu)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
              </div>

              {selectedTypes.length === 0 && (
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-500">
                  Pilih minimal 1 jenis rekam medis di atas untuk mulai mengisi form.
                </div>
              )}

              {selectedTypes.map((type) => {
                const entry = recordsData[type] || buildEmptyRecordEntry(type, todayStr);
                const typeLabel = RECORD_TYPES.find((t) => t.value === type)?.label || type;
                const detailFields = getDetailFieldsConfig(type);
                const doctorsForType = getDoctorsForType(type);
                const doctorRequired = DOCTOR_REQUIRED_BY_TYPE[type];

                return (
                  <div key={type} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 space-y-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-rose-800">Rekam Medis: {typeLabel}</span>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Judul Rekam Medis</label>
                        <input
                          value={entry.title}
                          onChange={(e) => updateSyncedField("title", type, e.target.value)}
                          type="text"
                          placeholder="Contoh: Pemeriksaan Gula Darah"
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-rose-700 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Tanggal Kunjungan</label>
                        <input
                          value={entry.visitDate}
                          onChange={(e) => updateSyncedField("visitDate", type, e.target.value)}
                          type="date"
                          min={todayStr}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-rose-700 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">
                        Dokter Penanggung Jawab
                        {!doctorRequired && <span className="text-slate-400 font-medium normal-case ml-1">(opsional)</span>}
                      </label>
                      <select
                        value={entry.doctorId}
                        onChange={(e) => updateSyncedField("doctorId", type, e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-rose-700 focus:outline-none cursor-pointer font-medium"
                        required={doctorRequired}
                      >
                        <option value="">
                          {loadingDoctors
                            ? "Memuat daftar dokter..."
                            : doctorRequired
                            ? `-- Pilih Dokter untuk ${typeLabel} --`
                            : "-- Tidak ditentukan (opsional) --"}
                        </option>
                        {doctorsForType.map((doc) => (
                          <option key={doc.id} value={doc.id}>
                            {doc.name} - {doc.specialist || "Dokter Umum"}
                          </option>
                        ))}
                      </select>
                      {!loadingDoctors && doctorsForType.length === 0 && (
                        <p className="mt-2 text-xs text-amber-700 font-medium">Belum ada dokter yang terhubung ke Faskes Anda. Silakan daftarkan dokter terlebih dahulu.</p>
                      )}
                      {!doctorRequired && (
                        <p className="mt-2 text-xs text-slate-400">Boleh dikosongkan jika belum ada dokter spesialis terkait yang menangani.</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Ringkasan Medis</label>
                      <textarea
                        value={entry.summary}
                        onChange={(e) => updateSyncedField("summary", type, e.target.value)}
                        rows={3}
                        placeholder="Ringkasan singkat kondisi pasien"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-rose-700 focus:outline-none"
                      />
                    </div>

                    {type === "resep" ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Daftar Obat</label>
                          <div className="space-y-3">
                            <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1.5fr_auto] gap-2 px-1">
                              {["Nama Obat", "Dosis", "Jumlah", "Aturan Pakai", ""].map((h) => (
                                <span key={h} className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{h}</span>
                              ))}
                            </div>

                            {entry.medicines.map((row) => (
                              <div key={row.rowId} className="grid gap-2 md:grid-cols-[2fr_1fr_1fr_1.5fr_auto]">
                                <input
                                  value={row.name}
                                  onChange={(e) => updateMedicineRow(type, row.rowId, "name", e.target.value)}
                                  placeholder="Nama Obat"
                                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-rose-700 focus:outline-none"
                                />
                                <input
                                  value={row.dose}
                                  onChange={(e) => updateMedicineRow(type, row.rowId, "dose", e.target.value)}
                                  placeholder="Dosis"
                                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-rose-700 focus:outline-none"
                                />
                                <input
                                  value={row.qty}
                                  onChange={(e) => updateMedicineRow(type, row.rowId, "qty", e.target.value)}
                                  placeholder="Jumlah"
                                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-rose-700 focus:outline-none"
                                />
                                <input
                                  value={row.usage}
                                  onChange={(e) => updateMedicineRow(type, row.rowId, "usage", e.target.value)}
                                  placeholder="Aturan Pakai"
                                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-rose-700 focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeMedicineRow(type, row.rowId)}
                                  disabled={entry.medicines.length === 1}
                                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-400 hover:text-rose-700 hover:border-rose-300 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center justify-center"
                                  title="Hapus obat ini"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => addMedicineRow(type)}
                            className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-dashed border-rose-300 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" /> Tambah Obat
                          </button>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Catatan Dokter</label>
                          <textarea
                            value={entry.detail.note || ""}
                            onChange={(e) => updateSyncedField("doctorNote", type, e.target.value)}
                            rows={3}
                            placeholder="Catatan Dokter"
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-rose-700 focus:outline-none"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-6">
                        {detailFields.map((field) => (
                          <div key={field.name}>
                            <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">{field.label}</label>
                            <textarea
                              value={entry.detail[field.name] || ""}
                              onChange={(e) => {
                                // "Catatan Dokter" (note_doctor) ikut aturan sinkronisasi
                                // dengan Catatan Dokter di form Resep. Field detail lain
                                // (keluhan, diagnosa, dll) tetap khusus per-type.
                                if (field.name === "note_doctor") {
                                  updateSyncedField("doctorNote", type, e.target.value);
                                } else {
                                  updateRecordDetailField(type, field.name, e.target.value);
                                }
                              }}
                              rows={3}
                              placeholder={field.label}
                              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-rose-700 focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

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

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-6 py-8 text-white text-center relative overflow-hidden">
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-xl" />
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-lg ring-4 ring-white/30">
                <CheckCircle className="h-9 w-9 text-white" />
              </div>
              <h3 className="text-xl font-extrabold tracking-tight">
                {uploadedResults.length > 1 ? `${uploadedResults.length} Rekam Medis Berhasil Diunggah!` : "Rekam Medis Berhasil Diunggah!"}
              </h3>
              <p className="text-xs text-emerald-100 mt-1 font-medium max-w-sm mx-auto">
                Data rekam medis terenkripsi AES-256 dan bukti transaksi terjangkar secara resmi ke Smart Contract Blockchain.
              </p>
            </div>

            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
              {uploadedResults.map((item, idx) => {
                const typeLabel = RECORD_TYPES.find((t) => t.value === item.recordType)?.label || item.recordType;
                return (
                  <div key={`${item.recordType}-${idx}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Hash className="h-3.5 w-3.5 text-rose-600" />
                        {typeLabel} — Tx Hash
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full border border-rose-200">
                        Smart Contract
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-3 gap-2">
                      <span className="font-mono text-xs font-bold text-rose-900 break-all select-all">
                        {item.txHash || "0x0000000000000000000000000000000000000000"}
                      </span>
                      {item.txHash && (
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(item.txHash);
                            setCopiedTx(item.txHash);
                            setTimeout(() => setCopiedTx(""), 2000);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-800 hover:bg-rose-100 font-bold text-xs transition cursor-pointer shrink-0 border border-rose-200"
                        >
                          {copiedTx === item.txHash ? "Tersalin!" : "Salin Hash"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

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
                    setShowSuccessModal(false);
                    setUploadedResults([]);
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