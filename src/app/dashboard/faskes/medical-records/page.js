"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import TxHashLink from "@/components/ui/TxHashLink";
import LoadingScreen from "@/components/ui/LoadingScreen";
import PrescriptionList from "@/components/features/faskes/PrescriptionList";
import {
  FileText,
  Plus,
  Search,
  RefreshCw,
  X,
  Hash,
  User,
  Stethoscope,
  CalendarDays,
  FileText as FileTextIcon,
  Paperclip,
  Download,
  Pencil,
  Inbox,
  ChevronRight,
  DollarSign,
  History,
  Clock,
  Activity,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { getHospitalMedicalRecords, getPatientMedicalRecords } from "@/services/hospitalService";

const formatRupiah = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
};

// Label tampilan untuk tiap jenis detail rekam medis
const DETAIL_TYPE_LABELS = {
  umum: "Pemeriksaan Umum",
  lab: "Laboratorium",
  radiologi: "Radiologi",
  resep: "Resep Obat",
  igd: "Gawat Darurat (IGD & Triase)",
  rawat_jalan: "Rawat Jalan / Poliklinik",
  rawat_inap: "Rawat Inap (RM RI 01)",
  bedah: "Laporan Operasi Bedah & Anestesi",
  one_day_care: "One Day Care (ODC)",
  odc: "One Day Care (ODC)",
  rehab: "Rehabilitasi Medis & Fisioterapi",
  rujukan_medis: "Surat Rujukan Medis",
  rujuk: "Surat Rujukan Medis",
  death_certificate: "Surat Keterangan Kematian",
  meninggal: "Surat Keterangan Kematian",
};

// Label field per jenis detail, biar ga nampilin key mentah
const DETAIL_FIELD_LABELS = {
  umum: {
    complaint: "Keluhan Utama",
    diagnosis: "Diagnosis Dokter",
    action: "Tindakan Medis",
    note_doctor: "Catatan Dokter",
    anamnesis: "Anamnesis",
    physical_exam: "Pemeriksaan Fisik",
    vital_signs: "Tanda Vital",
  },
  lab: {
    examination_type: "Jenis Pemeriksaan",
    checkup_result: "Hasil Pemeriksaan",
    reference_values: "Nilai Rujukan",
    conclusion: "Kesimpulan",
  },
  radiologi: {
    examination_type: "Jenis Pemeriksaan",
    checkup_result: "Hasil Temuan Radiologi",
    conclusion: "Kesimpulan Radiologi",
  },
  resep: {
    list_of_medicines: "Daftar Obat",
    note: "Instruksi Pemakaian",
  },
  igd: {
    triage_status: "Kategori Triase",
    triage_kesadaran: "Status Kesadaran",
    triage_pernafasan: "Pernafasan",
    triage_sirkulasi: "Sirkulasi Darah",
    first_aid_time: "Jam Pertolongan Pertama",
    gcs_e: "GCS (E)",
    gcs_v: "GCS (V)",
    gcs_m: "GCS (M)",
    kesadaran_text: "Tingkat Kesadaran",
    resusitasi_airway: "Resusitasi Jalan Nafas",
    resusitasi_breathing: "Resusitasi Pernafasan",
    resusitasi_circulation: "Resusitasi Sirkulasi",
    resusitasi_drug: "Resusitasi Obat / Cairan",
    ugd_discharge_status: "Kondisi Akhir UGD",
    transport: "Transportasi Rujukan",
    target_facility: "Faskes Tujuan",
  },
  rawat_jalan: {
    complaint: "Keluhan Utama",
    anamnesis: "Anamnesis",
    vital_signs: "Tanda-Tanda Vital",
    physical_exam: "Pemeriksaan Fisik",
    icd10_primary: "Diagnosis Utama (ICD-10)",
    icd10_secondary: "Diagnosis Sekunder (ICD-10)",
    diagnosis: "Diagnosis Dokter",
    action: "Tindakan / Pengobatan",
    note_doctor: "Catatan Dokter",
    discharge_status: "Kondisi Akhir Pasien",
    lab_orders: "Permintaan Laboratorium",
    radiology_orders: "Permintaan Radiologi",
  },
  rawat_inap: {
    register_number: "No. Register",
    admission_date: "Tanggal Masuk Rawat Inap",
    admission_time: "Jam Masuk Rawat Inap",
    selected_master_room: "Pilihan Kamar",
    room_type: "Nama Ruangan",
    room_class: "Kelas Perawatan",
    room_number: "Nomor Kamar",
    bed_number: "Nomor Bed",
    room_phone: "Ext. Telepon Ruangan",
    room_price: "Tarif Kamar Per Hari",
    payment_guarantee_type: "Jenis Penjaminan",
    insurance_name: "Nama Asuransi / Penjamin",
    insurance_card_no: "No. Kartu Asuransi",
    guarantor_name: "Nama Penanggung Jawab",
    guarantor_relation: "Hubungan Keluarga",
    guarantor_phone: "Telepon Penanggung Jawab",
    guarantor_address: "Alamat Penanggung Jawab",
    dpjp_doctor: "Dokter DPJP",
    admission_reason: "Alasan Masuk Rawat Inap",
    main_symptoms: "Gejala Utama",
    vital_signs: "Tanda-Tanda Vital",
    physical_exam: "Pemeriksaan Fisik",
    clinical_observation: "Catatan Observasi Klinis",
    icd10_primary: "Diagnosis Utama (ICD-10)",
    icd10_secondary: "Diagnosis Sekunder (ICD-10)",
    diagnosis: "Diagnosis Dokter",
    action: "Tindakan Medis",
    informed_consent: "Persetujuan Tindakan Medis",
    discharge_summary: "Ringkasan Pulang (Discharge Summary)",
    discharge_status: "Status Pemulangan",
    other_services: "Pelayanan Lain",
  },
  bedah: {
    surgery_type: "Jenis Operasi",
    surgery_urgency: "Urgensi Operasi",
    pre_op_diagnosis: "Diagnosis Pra-Bedah",
    post_op_diagnosis: "Diagnosis Pasca Bedah",
    procedure_name: "Tindakan / Prosedur Bedah",
    operator_doctor: "Dokter Operator Bedah",
    anesthesiologist: "Dokter Anestesi",
    anesthesia_type: "Jenis Anestesi",
    surgery_start: "Jam Mulai Operasi",
    surgery_end: "Jam Selesai Operasi",
    operation_findings: "Temuan Operasi",
    pathology_specimen: "Spesimen Patologi (PA)",
    post_op_instructions: "Instruksi Pasca Operasi",
  },
  one_day_care: {
    odc_procedure_type: "Prosedur Day-Surgery",
    planned_discharge_time: "Rencana Jam Pulang",
    aldrete_activity: "Skor Aldrete: Aktivitas",
    aldrete_respiration: "Skor Aldrete: Respirasi",
    aldrete_circulation: "Skor Aldrete: Sirkulasi",
    aldrete_consciousness: "Skor Aldrete: Kesadaran",
    aldrete_color: "Skor Aldrete: Warna Kulit",
    aldrete_total_score: "Total Skor Aldrete",
    discharge_criteria_met: "Kriteria Pulang Terpenuhi",
    discharge_decision: "Keputusan Pemulangan",
    home_instructions: "Instruksi Perawatan Di Rumah",
  },
  rehab: {
    functional_diagnosis: "Diagnosis Fungsional",
    rehab_goal: "Tujuan Rehabilitasi Medis",
    therapy_type: "Jenis Terapi",
    therapy_session_number: "Sesi Terapi",
    evaluation_result: "Hasil Evaluasi Terapi",
    discharge_decision: "Keputusan Terapi",
    home_exercise_program: "Program Latihan Di Rumah",
  },
  rujukan_medis: {
    referral_type: "Jenis Rujukan Medis",
    referral_urgency: "Sifat / Urgensi Rujukan",
    target_faskes_name: "Faskes Tujuan Rujukan",
    target_specialty: "Poli / Spesialis Tujuan",
    referral_reasons: "Alasan Rujukan",
    referral_clinical_summary: "Resume Klinis Rujukan",
    transportation: "Sarana Transportasi",
    attached_files: "Berkas Lampiran Rujukan",
  },
  death_certificate: {
    death_datetime: "Waktu Kematian (Pronounced Dead)",
    declaring_doctor: "Dokter Yang Menyatakan",
    death_location: "Lokasi Kematian",
    underlying_cause: "Penyebab Utama (Kausa a)",
    immediate_cause: "Penyebab Langsung (Kausa b)",
    contributing_cause: "Kondisi Kontribusi (Kausa c)",
    autopsy_done: "Autopsi / Pemeriksaan Luar",
    is_doa: "Death on Arrival (DOA)",
    death_certificate_no: "No. Surat Kematian",
    remarks: "Catatan Tambahan",
  },
};

function formatRecordType(recordType) {
  if (!recordType) return "-";
  return recordType
    .split(",")
    .map((t) => DETAIL_TYPE_LABELS[t.trim()] || t.trim().toUpperCase())
    .join(", ");
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }) {
  const isDraft = status === "draft";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ${
        isDraft
          ? "bg-amber-50 text-amber-700 border border-amber-200"
          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
      }`}
    >
      {status || "FINAL"}
    </span>
  );
}

function shortenHash(hash, head = 14, tail = 8) {
  if (!hash || hash.length <= head + tail + 3) return hash;
  return `${hash.slice(0, head)}...${hash.slice(-tail)}`;
}

function TxHashPill({ txHash, compact = false, truncate = true }) {
  if (!txHash) {
    return <span className="text-xs text-slate-400 font-medium italic">Off-Chain</span>;
  }
  return (
    <TxHashLink
      txHash={txHash}
      className={`font-mono font-bold text-teal-900 bg-teal-50 border border-teal-200 shadow-sm rounded-xl inline-flex items-center gap-1 max-w-full ${
        compact ? "text-[10px] px-2.5 py-1" : "text-xs px-3 py-1.5"
      } ${truncate ? "whitespace-nowrap" : "whitespace-normal break-all"}`}
      title={txHash}
    >
      <span className="tracking-[0.03em] leading-tight">
        {truncate ? shortenHash(txHash, 14, 8) : txHash}
      </span>
    </TxHashLink>
  );
}

export default function FaskesMedicalRecordsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState("detail");
  const [patientHistory, setPatientHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [recordStages, setRecordStages] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem("activePatientStage");
    if (saved) {
      const stageVal = parseInt(saved, 10);
      setRecordStages((prev) => ({ 1: stageVal, ...prev }));
    }
  }, []);

  useEffect(() => {
    if (selectedRecord) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedRecord]);

  const handleStageChange = (recordId, newStage) => {
    setRecordStages((prev) => ({ ...prev, [recordId]: newStage }));
    localStorage.setItem("activePatientStage", newStage.toString());
    window.dispatchEvent(new Event("storage"));
  };

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
      if (result?.success && Array.isArray(result.data)) {
        const mapped = result.data.map((item) => ({
          id: item.id,
          patientId: item.patient?.id ?? item.user_id ?? null,
          patientName: item.patient?.name || "Pasien Tidak Diketahui",
          recordType: item.record_type,
          typeOfTreatment: item.type_of_treatment,
          title: item.title,
          visitDate: item.visit_date,
          status: item.status,
          doctorName: item.doctor?.name || "-",
          doctorSpecialist: item.doctor?.specialist || "-",
          summary: item.summary || null,
          detail: item.detail || {},
          biaya: item.biaya || null,
          totalPrice: Number(item.biaya?.total_keseluruhan ?? item.total_price ?? item.total_amount ?? 0),
          attachments: item.attachments || [],
          dataHash: item.data_hash,
          txHash: item.tx_hash || null,
          decryptError: item.decryptError || null,
        }));
        setRecords(mapped);
        setPagination(result.pagination || null);
      } else {
        setRecords([]);
      }
    } catch (err) {
      console.error("Error fetching medical records", err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRecords();
    setRefreshing(false);
  };

  const keyword = searchTerm.trim().toLowerCase();
  const filteredRecords = keyword
    ? records.filter((rec) =>
        [rec.patientName, rec.title, rec.recordType, rec.doctorName, rec.txHash]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(keyword)
      )
    : records;

  const draftCount = records.filter((r) => r.status === "draft").length;
  const onChainCount = records.filter((r) => r.txHash).length;
  const offChainCount = records.length - onChainCount;

  const openRecordDetail = async (record, defaultTab = "detail") => {
    setSelectedRecord(record);
    setActiveModalTab(defaultTab);
    const pId = record.patientId;
    if (pId) {
      const localMatched = records.filter((r) => String(r.patientId) === String(pId));
      setPatientHistory(localMatched.length > 0 ? localMatched : [record]);
      setLoadingHistory(true);
      try {
        const res = await getPatientMedicalRecords(pId);
        if (res?.success && Array.isArray(res.data)) {
          const mapped = res.data.map((item) => ({
            id: item.id,
            patientId: item.patient?.id ?? item.user_id ?? null,
            patientName: item.patient?.name || record.patientName || "Pasien Tidak Diketahui",
            recordType: item.record_type,
            typeOfTreatment: item.type_of_treatment,
            title: item.title,
            visitDate: item.visit_date,
            status: item.status,
            doctorName: item.doctor?.name || "-",
            doctorSpecialist: item.doctor?.specialist || "-",
            summary: item.summary || null,
            detail: item.detail || {},
            biaya: item.biaya || null,
            totalPrice: Number(item.biaya?.total_keseluruhan ?? item.total_price ?? item.total_amount ?? 0),
            attachments: item.attachments || [],
            dataHash: item.data_hash,
            txHash: item.tx_hash || null,
            decryptError: item.decryptError || null,
          }));
          setPatientHistory(mapped);
        }
      } catch (err) {
        console.error("Error fetching patient history", err);
      } finally {
        setLoadingHistory(false);
      }
    } else {
      setPatientHistory([record]);
    }
  };

  const closeRecordDetail = () => {
    setSelectedRecord(null);
    setPatientHistory([]);
  };
  const goToEditDraft = (recordId) => router.push(`/dashboard/faskes/medical-records/${recordId}/edit`);

  const handleDownloadPdf = (record) => {
    setSelectedRecord(record);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleRowActivate = (record) => {
    if (record.status === "draft") {
      goToEditDraft(record.id);
      return;
    }
    openRecordDetail(record, "detail");
  };

  if (loading) {
    return <LoadingScreen message="Memuat Berkas Rekam Medis Faskes..." fullScreen={false} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16 md:pb-0">
      <Navbar user={user} roleLabel="Fasilitas Kesehatan" onLogout={() => router.push("/auth/login")} />
      <div className="flex flex-1">
        <Sidebar role="faskes" />
        <main className="flex-1 min-w-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6 sm:mb-8">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.3em] text-teal-800 font-bold">Dashboard Faskes</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">Direktori Rekam Medis</h1>
              <p className="max-w-2xl text-sm text-slate-500 mt-1.5">
                Daftar seluruh rekam medis yang telah diunggah dan terenkripsi.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 shrink-0 ${refreshing ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard/faskes/medical-records/upload")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-700 to-cyan-800 px-4 py-3 text-sm font-bold text-white shadow-md hover:from-teal-800 hover:to-cyan-900 transition cursor-pointer"
              >
                <Plus className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Upload Rekam Medis Baru</span>
                <span className="sm:hidden">Upload</span>
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-white border border-slate-200/80 p-4 sm:p-6 shadow-xs">
            <section className="space-y-5">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-bold text-slate-900">Arsip Rekam Medis</h3>
                <span className="text-xs text-slate-500">
                  {filteredRecords.length} data ditemukan
                  {pagination ? ` dari ${pagination.total} total` : ""}
                </span>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="relative flex-1 md:max-w-sm">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari pasien, judul, tx hash..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-9 py-3 text-sm text-slate-800 focus:border-teal-600 focus:outline-none"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      aria-label="Hapus pencarian"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-[#D97706] border border-amber-200 whitespace-nowrap">
                    {draftCount} Draft
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800 border border-teal-200 whitespace-nowrap">
                    {onChainCount} On-chain
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200 whitespace-nowrap">
                    {offChainCount} Off-chain
                  </span>
                </div>
              </div>

              {filteredRecords.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-slate-200 bg-slate-50 py-14 text-center text-slate-500">
                  <Inbox className="h-8 w-8 text-slate-300" />
                  <p className="text-sm font-medium px-4">
                    {keyword ? "Tidak ada rekam medis yang cocok dengan pencarian." : "Belum ada rekam medis."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-y-3 text-left text-sm">
                      <thead>
                        <tr className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          <th className="px-4 py-2 font-semibold whitespace-nowrap">Visit Date</th>
                          <th className="px-4 py-2 font-semibold">Pasien</th>
                          <th className="px-4 py-2 font-semibold">Judul & Tx Hash</th>
                          <th className="px-4 py-2 font-semibold">Layanan</th>
                          <th className="px-4 py-2 font-semibold">Status</th>
                          <th className="px-4 py-2 font-semibold text-right">Tombol Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRecords.map((item) => {
                          const isDraft = item.status === "draft";
                          return (
                            <tr
                              key={item.id}
                              className="group cursor-pointer"
                              onClick={() => handleRowActivate(item)}
                              role="button"
                            >
                              <td className="px-4 py-4 text-slate-700 whitespace-nowrap bg-slate-50 group-hover:bg-slate-100 transition rounded-l-2xl border-y border-l border-slate-200/80">
                                {formatDate(item.visitDate)}
                              </td>
                              <td className="px-4 py-4 font-bold text-slate-900 bg-slate-50 group-hover:bg-slate-100 transition border-y border-slate-200/80 max-w-[150px] truncate">
                                {item.patientName}
                              </td>
                              <td className="px-4 py-4 bg-slate-50 group-hover:bg-slate-100 transition border-y border-slate-200/80">
                                <div className="flex flex-col gap-1.5 min-w-0">
                                  <span className="font-bold text-slate-900 truncate max-w-[280px]" title={item.title}>
                                    {item.title || "-"}
                                  </span>
                                  <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                                    <TxHashPill txHash={item.txHash} compact />
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-slate-700 bg-slate-50 group-hover:bg-slate-100 transition border-y border-slate-200/80 whitespace-nowrap">
                                {item.typeOfTreatment || formatRecordType(item.recordType)}
                              </td>
                              <td className="px-4 py-4 bg-slate-50 group-hover:bg-slate-100 transition border-y border-slate-200/80">
                                <StatusBadge status={item.status} />
                              </td>
                              <td className="px-4 py-4 text-right bg-slate-50 group-hover:bg-slate-100 transition rounded-r-2xl border-y border-r border-slate-200/80">
                                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    type="button"
                                    onClick={() => openRecordDetail(item, "history")}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 px-3 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap"
                                    title="Lihat Riwayat Rekam Medis Pasien Ini"
                                  >
                                    <History className="h-3.5 w-3.5" /> Riwayat Pasien
                                  </button>
                                  {isDraft ? (
                                    <button
                                      type="button"
                                      onClick={() => goToEditDraft(item.id)}
                                      className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700 transition cursor-pointer whitespace-nowrap shadow-2xs"
                                    >
                                      <Pencil className="h-3.5 w-3.5" /> Edit
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleDownloadPdf(item)}
                                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-700 to-cyan-800 hover:from-teal-800 hover:to-cyan-900 text-white px-3 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap shadow-2xs"
                                    >
                                      <Download className="h-3.5 w-3.5" /> PDF
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="lg:hidden space-y-3">
                    {filteredRecords.map((item) => {
                      const isDraft = item.status === "draft";
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleRowActivate(item)}
                          className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 space-y-3 active:bg-slate-100 transition cursor-pointer"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate">{item.patientName}</p>
                              <p className="text-xs font-semibold text-slate-700 mt-0.5">{item.title || "-"}</p>
                            </div>
                            <StatusBadge status={item.status} />
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                            <span className="inline-flex items-center gap-1">
                              <CalendarDays className="h-3.5 w-3.5 text-slate-400" /> {formatDate(item.visitDate)}
                            </span>
                            <span className="font-medium text-slate-500">{item.typeOfTreatment || formatRecordType(item.recordType)}</span>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60" onClick={(e) => e.stopPropagation()}>
                            <TxHashPill txHash={item.txHash} compact />
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openRecordDetail(item, "history")}
                                className="inline-flex items-center gap-1 rounded-lg border border-teal-200 bg-teal-50 text-teal-800 px-2.5 py-1 text-xs font-bold hover:bg-teal-100"
                              >
                                <History className="h-3 w-3" /> Riwayat
                              </button>
                              {isDraft ? (
                                <button
                                  type="button"
                                  onClick={() => goToEditDraft(item.id)}
                                  className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-amber-700"
                                >
                                  <Pencil className="h-3 w-3" /> Edit
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleDownloadPdf(item)}
                                  className="inline-flex items-center gap-1 rounded-lg bg-teal-800 px-2.5 py-1 text-xs font-bold text-white hover:bg-teal-900"
                                >
                                  <Download className="h-3 w-3" /> PDF
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </section>
          </div>
        </main>
      </div>

      {selectedRecord && (
        <div
          className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto"
          onClick={closeRecordDetail}
        >
          <div
            className="w-full max-w-3xl my-6 sm:my-0 max-h-[92vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 bg-gradient-to-r from-teal-900 via-teal-800 to-cyan-950 px-5 sm:px-6 pt-5 pb-3 text-white rounded-t-3xl shadow-sm">
              <button
                type="button"
                onClick={closeRecordDetail}
                className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 transition cursor-pointer"
                aria-label="Tutup detail rekam medis"
                title="Tutup"
              >
                <X className="h-4 w-4" />
              </button>
              <p className="text-[10px] uppercase tracking-[0.3em] text-teal-200 font-bold">Detail Rekam Medis Pasien</p>
              <h3 className="mt-1.5 text-xl sm:text-2xl font-extrabold tracking-tight pr-10 break-words flex items-center gap-2">
                <User className="h-5 w-5 text-teal-300 shrink-0" />
                {selectedRecord.patientName}
              </h3>
              <p className="mt-0.5 text-xs text-teal-100 break-words flex items-center gap-2">
                <span>Judul: {selectedRecord.title}</span>
                <span>&bull;</span>
                <span>Kunjungan: {formatDate(selectedRecord.visitDate)}</span>
              </p>

              <div className="flex items-center gap-2 mt-4 border-b border-teal-700/60 pb-0">
                <button
                  type="button"
                  onClick={() => setActiveModalTab("detail")}
                  className={`pb-2.5 px-3.5 text-xs font-extrabold transition border-b-2 cursor-pointer ${
                    activeModalTab === "detail"
                      ? "border-cyan-300 text-white font-black"
                      : "border-transparent text-teal-200 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <FileTextIcon className="h-3.5 w-3.5" />
                    Detail Rekam Medis Ini
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalTab("history")}
                  className={`pb-2.5 px-3.5 text-xs font-extrabold transition border-b-2 cursor-pointer flex items-center gap-2 ${
                    activeModalTab === "history"
                      ? "border-cyan-300 text-white font-black"
                      : "border-transparent text-teal-200 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <History className="h-3.5 w-3.5" />
                    Riwayat Rekam Medis Pasien
                  </span>
                  <span className="bg-cyan-400 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-black">
                    {patientHistory.length}
                  </span>
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-4 text-sm flex-1">
              {activeModalTab === "detail" && (
                <div className="space-y-4">
                  {selectedRecord.decryptError && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-[#DC2626]">
                      {selectedRecord.decryptError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" /> Pasien
                      </p>
                      <p className="mt-1.5 font-semibold text-slate-900 break-words">{selectedRecord.patientName}</p>
                      <p className="text-xs text-slate-500">ID Pasien: {selectedRecord.patientId ?? "-"}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold flex items-center gap-1.5">
                        <Stethoscope className="h-3.5 w-3.5" /> Dokter
                      </p>
                      <p className="mt-1.5 font-semibold text-slate-900 break-words">{selectedRecord.doctorName}</p>
                      <p className="text-xs text-slate-500">{selectedRecord.doctorSpecialist}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xs:grid-cols-3 sm:grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" /> Visit Date
                      </p>
                      <p className="mt-1.5 font-semibold text-slate-900">{formatDate(selectedRecord.visitDate)}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold flex items-center gap-1.5">
                        <FileTextIcon className="h-3.5 w-3.5" /> Layanan
                      </p>
                      <p className="mt-1.5 font-semibold text-slate-900">{selectedRecord.typeOfTreatment || formatRecordType(selectedRecord.recordType)}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold flex items-center gap-1.5">
                        <Hash className="h-3.5 w-3.5" /> Status
                      </p>
                      <p className="mt-1.5 font-semibold text-slate-900 capitalize">{selectedRecord.status || "-"}</p>
                    </div>
                  </div>

                  {selectedRecord.summary && (
                    <div className="rounded-2xl border border-teal-200/90 bg-teal-50/70 p-4">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-teal-800 font-extrabold flex items-center gap-1.5 mb-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-teal-700" /> Ringkasan Medis
                      </p>
                      <p className="text-xs text-slate-800 font-medium whitespace-pre-line leading-relaxed">
                        {selectedRecord.summary}
                      </p>
                    </div>
                  )}

                  {Object.keys(selectedRecord.detail || {}).length > 0 && (
                    <div className="space-y-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">Detail Form &amp; Hasil Pemeriksaan</p>
                      {Object.entries(selectedRecord.detail).map(([type, fields]) => {
                        if (!fields) return null;
                        const fieldLabels = DETAIL_FIELD_LABELS[type] || {};
                        const entries = Object.entries(fields).filter(
                          ([key, val]) =>
                            !["id", "medical_record_id", "created_at", "updated_at", "total_price", "status_resep", "status", "note"].includes(key) && val
                        );
                        if (entries.length === 0) return null;
                        return (
                          <div key={type} className="rounded-2xl border border-teal-100 bg-teal-50/50 p-4 shadow-2xs">
                            <p className="text-xs font-bold text-teal-900 uppercase tracking-wide border-b border-teal-200/60 pb-1.5 mb-2.5">
                              {DETAIL_TYPE_LABELS[type] || type}
                            </p>
                            <div className="space-y-3">
                              {entries.map(([key, val]) => {
                                const isMedicinesField = type === "resep" && key === "list_of_medicines";
                                return (
                                  <div key={key}>
                                    <p className="text-[10px] uppercase tracking-wide text-slate-500 font-bold mb-1">
                                      {fieldLabels[key] || key}
                                    </p>
                                    {isMedicinesField ? (
                                      <PrescriptionList rawListOfMedicines={val} />
                                    ) : (
                                      <p className="text-slate-800 text-xs font-medium whitespace-pre-line break-words">{String(val)}</p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {selectedRecord.attachments.length > 0 && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold flex items-center gap-1.5">
                        <Paperclip className="h-3.5 w-3.5" /> Lampiran Berkas ({selectedRecord.attachments.length})
                      </p>
                      <ul className="mt-2.5 space-y-2">
                        {selectedRecord.attachments.map((att) => (
                          <li
                            key={att.id}
                            className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2"
                          >
                            <span className="flex items-center gap-2 min-w-0">
                              <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                              <span className="truncate text-slate-700 text-xs font-semibold" title={att.fileName}>
                                {att.fileName}
                              </span>
                            </span>
                            <a
                              href={att.filePath}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-bold text-teal-800 hover:text-teal-900 shrink-0"
                            >
                              <Download className="h-3.5 w-3.5" /> Unduh
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold flex items-center gap-1.5">
                      <Hash className="h-3.5 w-3.5" /> Blockchain Tx Hash
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <TxHashPill txHash={selectedRecord.txHash} />
                    </div>
                  </div>
                </div>
              )}

              {activeModalTab === "history" && (
                <div className="space-y-4">
                  <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold text-teal-950">
                    <div className="flex items-center gap-2">
                      <History className="h-4 w-4 text-teal-700 shrink-0" />
                      <span>Seluruh Histori Rekam Medis: <strong className="text-teal-900">{selectedRecord.patientName}</strong></span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-800 text-white text-[10px]">
                      {patientHistory.length} Histori
                    </span>
                  </div>

                  {loadingHistory ? (
                    <div className="py-12 text-center text-slate-500 space-y-2">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto text-teal-700" />
                      <p className="text-xs font-semibold">Mengambil seluruh riwayat medis pasien...</p>
                    </div>
                  ) : patientHistory.length === 0 ? (
                    <div className="py-10 text-center text-slate-400 border border-dashed rounded-2xl bg-slate-50 text-xs">
                      Belum ada riwayat rekam medis lain untuk pasien ini.
                    </div>
                  ) : (
                    <div className="relative border-l-2 border-teal-200 ml-3 pl-4 space-y-4 py-1">
                      {patientHistory.map((hist, idx) => {
                        const isCurrentActive = hist.id === selectedRecord.id;
                        return (
                          <div
                            key={hist.id || idx}
                            className={`relative rounded-2xl border p-4 transition cursor-pointer ${
                              isCurrentActive
                                ? "bg-teal-50/90 border-teal-500 ring-2 ring-teal-200 shadow-sm"
                                : "bg-white border-slate-200 hover:border-teal-300 hover:bg-slate-50"
                            }`}
                            onClick={() => setSelectedRecord(hist)}
                          >
                            <div className={`absolute -left-[23px] top-5 h-3.5 w-3.5 rounded-full border-2 border-white ${
                              isCurrentActive ? "bg-teal-700 ring-2 ring-teal-300" : "bg-teal-400"
                            }`} />

                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-teal-900 text-white">
                                    {formatDate(hist.visitDate)}
                                  </span>
                                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                                    {hist.typeOfTreatment || formatRecordType(hist.recordType)}
                                  </span>
                                  {isCurrentActive && (
                                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-400 text-amber-950">
                                      Sedang Dibuka
                                    </span>
                                  )}
                                </div>
                                <h4 className="font-extrabold text-slate-900 text-sm mt-1">
                                  {hist.title || "Rekam Medis Pasien"}
                                </h4>
                                <p className="text-xs text-slate-500 font-medium">
                                  Dokter: <span className="text-slate-800 font-semibold">{hist.doctorName}</span> ({hist.doctorSpecialist})
                                </p>
                              </div>
                              <StatusBadge status={hist.status} />
                            </div>

                            {hist.summary && (
                              <p className="mt-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 italic font-medium line-clamp-2">
                                &ldquo;{hist.summary}&rdquo;
                              </p>
                            )}

                            <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                              <TxHashPill txHash={hist.txHash} compact />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedRecord(hist);
                                  setActiveModalTab("detail");
                                }}
                                className="inline-flex items-center gap-1 font-bold text-teal-800 hover:text-teal-950 text-xs"
                              >
                                Lihat Detail Form &rarr;
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-200 mt-4">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-700 to-cyan-800 hover:from-teal-800 hover:to-cyan-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                >
                  <Download className="h-4 w-4" /> Download PDF
                </button>
                <button
                  type="button"
                  onClick={closeRecordDetail}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 hover:bg-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition cursor-pointer"
                >
                  <X className="h-4 w-4" /> Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}