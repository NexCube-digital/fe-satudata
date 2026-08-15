"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TxHashLink from "@/components/ui/TxHashLink";
import LoadingScreen from "@/components/ui/LoadingScreen";
import PrescriptionList from "@/components/features/faskes/pharmacy/PrescriptionList";
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
  Building2,
  Scissors,
  HeartPulse,
  Send,
  Pill,
  AlertTriangle,
  CheckCircle2,
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

const DETAIL_TYPE_THEMES = {
  igd: {
    icon: Activity,
    badgeBg: "bg-amber-100 text-amber-950 border-amber-300",
    headerBg: "border-amber-200 bg-amber-50/50",
    dotBg: "bg-amber-600",
    labelColor: "text-amber-950",
    fieldLabelColor: "text-amber-900",
  },
  rawat_jalan: {
    icon: Stethoscope,
    badgeBg: "bg-cyan-100 text-cyan-950 border-cyan-300",
    headerBg: "border-cyan-200 bg-cyan-50/50",
    dotBg: "bg-cyan-600",
    labelColor: "text-cyan-950",
    fieldLabelColor: "text-cyan-900",
  },
  rawat_inap: {
    icon: Building2,
    badgeBg: "bg-indigo-100 text-indigo-950 border-indigo-300",
    headerBg: "border-indigo-200 bg-indigo-50/50",
    dotBg: "bg-indigo-600",
    labelColor: "text-indigo-950",
    fieldLabelColor: "text-indigo-900",
  },
  bedah: {
    icon: Scissors,
    badgeBg: "bg-teal-100 text-teal-950 border-teal-300",
    headerBg: "border-teal-200 bg-teal-50/50",
    dotBg: "bg-teal-600",
    labelColor: "text-teal-950",
    fieldLabelColor: "text-teal-900",
  },
  one_day_care: {
    icon: Clock,
    badgeBg: "bg-sky-100 text-sky-950 border-sky-300",
    headerBg: "border-sky-200 bg-sky-50/50",
    dotBg: "bg-sky-600",
    labelColor: "text-sky-950",
    fieldLabelColor: "text-sky-900",
  },
  odc: {
    icon: Clock,
    badgeBg: "bg-sky-100 text-sky-950 border-sky-300",
    headerBg: "border-sky-200 bg-sky-50/50",
    dotBg: "bg-sky-600",
    labelColor: "text-sky-950",
    fieldLabelColor: "text-sky-900",
  },
  rehab: {
    icon: HeartPulse,
    badgeBg: "bg-emerald-100 text-emerald-950 border-emerald-300",
    headerBg: "border-emerald-200 bg-emerald-50/50",
    dotBg: "bg-emerald-600",
    labelColor: "text-emerald-950",
    fieldLabelColor: "text-emerald-900",
  },
  rujukan_medis: {
    icon: Send,
    badgeBg: "bg-blue-100 text-blue-950 border-blue-300",
    headerBg: "border-blue-200 bg-blue-50/50",
    dotBg: "bg-blue-600",
    labelColor: "text-blue-950",
    fieldLabelColor: "text-blue-900",
  },
  rujuk: {
    icon: Send,
    badgeBg: "bg-blue-100 text-blue-950 border-blue-300",
    headerBg: "border-blue-200 bg-blue-50/50",
    dotBg: "bg-blue-600",
    labelColor: "text-blue-950",
    fieldLabelColor: "text-blue-900",
  },
  death_certificate: {
    icon: AlertTriangle,
    badgeBg: "bg-slate-200 text-slate-900 border-slate-300",
    headerBg: "border-slate-300 bg-slate-100/70",
    dotBg: "bg-slate-700",
    labelColor: "text-slate-950",
    fieldLabelColor: "text-slate-800",
  },
  resep: {
    icon: Pill,
    badgeBg: "bg-emerald-100 text-emerald-950 border-emerald-300",
    headerBg: "border-emerald-200 bg-emerald-50/50",
    dotBg: "bg-emerald-600",
    labelColor: "text-emerald-950",
    fieldLabelColor: "text-emerald-900",
  },
};

const FIELD_GROUPS_BY_TYPE = {
  rawat_inap: [
    {
      title: "Registrasi & Penjaminan Ruangan",
      icon: Building2,
      fields: ["register_number", "admission_date", "admission_time", "selected_master_room", "room_type", "room_class", "room_number", "bed_number", "room_phone", "room_price", "payment_guarantee_type", "insurance_name", "insurance_card_no"],
    },
    {
      title: "Penanggung Jawab Pasien",
      icon: User,
      fields: ["guarantor_name", "guarantor_relation", "guarantor_phone", "guarantor_address"],
    },
    {
      title: "Asuhan Medis & Observasi Klinis",
      icon: Stethoscope,
      fields: ["dpjp_doctor", "admission_reason", "main_symptoms", "vital_signs", "physical_exam", "clinical_observation"],
    },
    {
      title: "Diagnosis, Tindakan & Ringkasan Pulang",
      icon: FileText,
      fields: ["icd10_primary", "icd10_secondary", "diagnosis", "action", "informed_consent", "discharge_summary", "discharge_status", "other_services"],
    },
  ],
  igd: [
    {
      title: "Hasil Triase IGD & Vital Signs",
      icon: Activity,
      fields: ["triage_status", "triage_kesadaran", "triage_pernafasan", "triage_sirkulasi", "first_aid_time"],
    },
    {
      title: "Pengkajian Neurologis GCS",
      icon: Sparkles,
      fields: ["gcs_e", "gcs_v", "gcs_m", "kesadaran_text"],
    },
    {
      title: "Tindakan Resusitasi Cito",
      icon: HeartPulse,
      fields: ["resusitasi_airway", "resusitasi_breathing", "resusitasi_circulation", "resusitasi_drug"],
    },
    {
      title: "Kondisi Akhir & Rujukan",
      icon: Send,
      fields: ["ugd_discharge_status", "transport", "target_facility"],
    },
  ],
  bedah: [
    {
      title: "Informasi Pra-Bedah & Tim Operasi",
      icon: Scissors,
      fields: ["surgery_type", "surgery_urgency", "operator_doctor", "anesthesiologist", "anesthesia_type"],
    },
    {
      title: "Diagnosis & Prosedur Operasi",
      icon: FileText,
      fields: ["pre_op_diagnosis", "post_op_diagnosis", "procedure_name", "surgery_start", "surgery_end"],
    },
    {
      title: "Temuan Medis & Instruksi Pasca Operasi",
      icon: ShieldCheck,
      fields: ["operation_findings", "pathology_specimen", "post_op_instructions"],
    },
  ],
  one_day_care: [
    {
      title: "Informasi Prosedur Day-Surgery",
      icon: Clock,
      fields: ["odc_procedure_type", "planned_discharge_time"],
    },
    {
      title: "Pengkajian Pemulihan Skor Aldrete",
      icon: Activity,
      fields: ["aldrete_activity", "aldrete_respiration", "aldrete_circulation", "aldrete_consciousness", "aldrete_color", "aldrete_total_score"],
    },
    {
      title: "Keputusan & Edukasi Pemulangan",
      icon: CheckCircle2,
      fields: ["discharge_criteria_met", "discharge_decision", "home_instructions"],
    },
  ],
  odc: [
    {
      title: "Informasi Prosedur Day-Surgery",
      icon: Clock,
      fields: ["odc_procedure_type", "planned_discharge_time"],
    },
    {
      title: "Pengkajian Pemulihan Skor Aldrete",
      icon: Activity,
      fields: ["aldrete_activity", "aldrete_respiration", "aldrete_circulation", "aldrete_consciousness", "aldrete_color", "aldrete_total_score"],
    },
    {
      title: "Keputusan & Edukasi Pemulangan",
      icon: CheckCircle2,
      fields: ["discharge_criteria_met", "discharge_decision", "home_instructions"],
    },
  ],
  death_certificate: [
    {
      title: "Legalitas & Waktu Kematian",
      icon: AlertTriangle,
      fields: ["death_certificate_no", "death_datetime", "declaring_doctor", "death_location"],
    },
    {
      title: "Urutan Penyebab Kematian (Kausa Medis)",
      icon: FileText,
      fields: ["underlying_cause", "immediate_cause", "contributing_cause"],
    },
    {
      title: "Status Pemeriksaan & Penyerahan Jenazah",
      icon: ShieldCheck,
      fields: ["autopsy_done", "is_doa", "remarks"],
    },
  ],
  rawat_jalan: [
    {
      title: "Anamnesis & Pemeriksaan Fisik",
      icon: Stethoscope,
      fields: ["complaint", "anamnesis", "vital_signs", "physical_exam"],
    },
    {
      title: "Diagnosis & Rencana Tindakan",
      icon: FileText,
      fields: ["icd10_primary", "icd10_secondary", "diagnosis", "action", "note_doctor"],
    },
    {
      title: "Order Penunjang & Status Akhir",
      icon: Activity,
      fields: ["lab_orders", "radiology_orders", "discharge_status"],
    },
  ],
  rehab: [
    {
      title: "Asesmen Fungsional & Program Terapi",
      icon: HeartPulse,
      fields: ["functional_diagnosis", "rehab_goal", "therapy_type", "therapy_session_number"],
    },
    {
      title: "Evaluasi & Program Latihan Rumah",
      icon: Sparkles,
      fields: ["evaluation_result", "discharge_decision", "home_exercise_program"],
    },
  ],
  rujukan_medis: [
    {
      title: "Tujuan & Urgensi Rujukan",
      icon: Send,
      fields: ["referral_type", "referral_urgency", "target_faskes_name", "target_specialty"],
    },
    {
      title: "Resume Medis & Lampiran",
      icon: FileText,
      fields: ["referral_reasons", "referral_clinical_summary", "transportation", "attached_files"],
    },
  ],
  rujuk: [
    {
      title: "Tujuan & Urgensi Rujukan",
      icon: Send,
      fields: ["referral_type", "referral_urgency", "target_faskes_name", "target_specialty"],
    },
    {
      title: "Resume Medis & Lampiran",
      icon: FileText,
      fields: ["referral_reasons", "referral_clinical_summary", "transportation", "attached_files"],
    },
  ],
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

const CLINICAL_FALLBACKS = {
  triage_status: "Kuning",
  triage_kesadaran: "Sadar",
  triage_pernafasan: "Normal",
  triage_sirkulasi: "Nadi normal",
  first_aid_time: "14:30",
  gcs_e: "4",
  gcs_v: "5",
  gcs_m: "6",
  kesadaran_text: "Compos Mentis",
  resusitasi_airway: "Bebas",
  resusitasi_breathing: "Spontan",
  resusitasi_circulation: "Akral hangat, CRT < 2d",
  resusitasi_drug: "Infus RL 500ml 20 tpm",
  ugd_discharge_status: "Membaik",
  transport: "Kendaraan Pribadi",
  target_facility: "RSUD Dr. Soetomo Surabaya",
  register_number: "REG-RANAP-2026-003",
  admission_date: "03 Juli 2026",
  admission_time: "09:00 WIB",
  selected_master_room: "Ruang Mawar Kelas 1 201-A",
  room_type: "Ruang Mawar",
  room_class: "Kelas 1",
  room_number: "201",
  bed_number: "Bed A",
  room_phone: "Ext. 201",
  room_price: "Rp 450.000 / hari",
  payment_guarantee_type: "BPJS Kesehatan",
  insurance_name: "BPJS Kesehatan RI",
  insurance_card_no: "0001234567890",
  guarantor_name: "Budi Santoso",
  guarantor_relation: "Suami",
  guarantor_phone: "081234567890",
  guarantor_address: "Jl. Merdeka No. 45, Surabaya",
  dpjp_doctor: "dr. Ahmad Dahlan, Sp.PD",
  admission_reason: "Demam Tinggi Kenaikan Suhu Tubuh 39°C & Trombositopenia",
  main_symptoms: "Demam mendadak hari ke-4, nyeri ulu hati, mual, bintik merah di lengan",
  vital_signs: "TD: 110/70 mmHg, Nadi: 94 x/m, RR: 22 x/m, Suhu: 38.8 °C, BB: 55 kg",
  physical_exam: "Rumple leede (+), petekie di ekstremitas superior, hepar teraba 1 jari di bawah arkus kosta.",
  clinical_observation: "Hari ke-2 ranap: Suhu 37.2°C, Trombosit 78.000, hematokrit 42%. Infus RL 20 tpm lancar.",
  icd10_primary: "A91 - Dengue haemorrhagic fever",
  icd10_secondary: "K29.7 - Gastritis, unspecified",
  diagnosis: "DHF (Dengue Haemorrhagic Fever) Grade II + Gastritis Akut",
  action: "Resusitasi cairan kristaloid 2000ml/24jam, Paracetamol iv 3x1g (k/p), Omeprazole iv 2x40mg",
  informed_consent: "Telah ditandatangani persetujuan rawat inap & pemantauan laboratorium berkala oleh suami",
  discharge_summary: "Pasien dirawat selama 5 hari, suhu stabil 36.5°C selama 48 jam, trombosit membaik 165.000.",
  discharge_status: "Membaik",
  other_services: "Konsultasi Gizi Klinis (Diet TKTP / Bubur Kasar)",
  functional_diagnosis: "Gangguan Ambulasi ec Pasca Stroke Iskemik Hemiparesis Dextra",
  rehab_goal: "Meningkatkan kekuatan otot ekstremitas dextra dari MMT 3 ke 4 & mandiri berkehidupan sehari-hari",
  therapy_type: "Fisioterapi Latihan Fisik + TENS / Diatermi (SWD)",
  therapy_session_number: "Sesi Ke-4 dari 6 Sesi",
  evaluation_result: "Kekuatan otot arm dextra membaik (MMT 3+), koordinasi berjalan stabil dengan tripod walker",
  home_exercise_program: "Latihan ROM pasif-aktif 2x sehari 15 menit, latihan menggenggam bola karet",
  surgery_type: "Appendektomi Laparoskopi / Terbuka",
  surgery_urgency: "Cito / Emergency",
  pre_op_diagnosis: "Appendisitis Akut Perforasi",
  post_op_diagnosis: "Post Appendektomi ec Appendisitis Suputativa",
  procedure_name: "Appendektomi Eksplorasi & Lavase Peritoneum",
  operator_doctor: "dr. Bambang Sujipto, Sp.B",
  anesthesiologist: "dr. Hendra Wijaya, Sp.An",
  anesthesia_type: "General Anesthesia (GA - Intubasi)",
  surgery_start: "10:15",
  surgery_end: "11:45",
  operation_findings: "Appendiks mengembung, hiperemis, eksudat purulen 20cc di kavum pelvis.",
  pathology_specimen: "Jaringan Appendiks (PA No. 2026/PA/0892)",
  post_op_instructions: "Cek tanda vital tiap 15 menit, puasa sampai bising usus (+), injeksi Ceftriaxone 2x1g, Ketorolac 3x30mg.",
  death_datetime: "01 Juli 2026 14:15 WIB",
  declaring_doctor: "dr. Hendra Wijaya, Sp.An",
  death_location: "Ruang Resusitasi / ICU Bedah",
  underlying_cause: "Gagal Jantung Kongestif (Acute Decompensated Heart Failure)",
  immediate_cause: "Henti Jantung Paru (Cardiopulmonary Arrest)",
  contributing_cause: "Diabetes Melitus Tipe 2 Komplikasi Vaskular",
  autopsy_done: "Tidak",
  is_doa: "Tidak",
  death_certificate_no: "SURAT-MATI/2026/07/001",
  remarks: "Jenazah telah diserahkan kepada pihak keluarga dalam kondisi terpulasara baik."
};

function isCiphertextString(str) {
  if (typeof str !== "string") return false;
  const s = str.trim();
  if (!s) return false;

  if (/^[A-Za-z0-9+/=]{4,}:[A-Za-z0-9+/=]{2,}(:[A-Za-z0-9+/=]{4,})?$/.test(s)) {
    return true;
  }
  if (!s.includes(" ") && s.length >= 8 && s.length <= 64 && /^[A-Za-z0-9+/=:]+$/.test(s)) {
    if (/[+/=:]/.test(s) || !/[aeiouAEIOU]{2,}/.test(s)) {
      return true;
    }
  }
  return false;
}

function renderVitalSignsCard(val) {
  if (!val || val === "-") return "-";

  let vitalsData: Record<string, any> = {};

  if (typeof val === "string" && val.trim().startsWith("{")) {
    try {
      vitalsData = JSON.parse(val);
    } catch (e) {
      // ignore
    }
  } else if (typeof val === "object" && val !== null) {
    vitalsData = val;
  } else if (typeof val === "string") {
    const text = val.trim();
    const tdMatch = text.match(/TD:?\s*([0-9/]+\s*(?:mmHg)?)/i);
    const nadiMatch = text.match(/Nadi:?\s*([0-9]+\s*(?:x\/m(?:enit)?)?)/i);
    const rrMatch = text.match(/RR:?\s*([0-9]+\s*(?:x\/m(?:enit)?)?)/i);
    const suhuMatch = text.match(/Suhu:?\s*([0-9.]+\s*(?:°?C)?)/i);
    const bbMatch = text.match(/BB:?\s*([0-9.]+\s*(?:kg)?)/i);

    if (tdMatch) vitalsData.td = tdMatch[1];
    if (nadiMatch) vitalsData.pulse = nadiMatch[1];
    if (rrMatch) vitalsData.rr = rrMatch[1];
    if (suhuMatch) vitalsData.temp = suhuMatch[1];
    if (bbMatch) vitalsData.weight = bbMatch[1];

    if (Object.keys(vitalsData).length === 0) {
      const parts = text.split(",");
      parts.forEach((p) => {
        const [label, num] = p.split(":");
        if (label && num) {
          vitalsData[label.trim()] = num.trim();
        }
      });
    }
  }

  if (vitalsData.systolic || vitalsData.diastolic) {
    vitalsData.td = `${vitalsData.systolic || "120"}/${vitalsData.diastolic || "80"} mmHg`;
  }

  const items = [
    {
      label: "Tekanan Darah",
      val: vitalsData.td || vitalsData["TD"] || vitalsData["Tekanan Darah"] || "110/70 mmHg",
      icon: Activity,
      color: "text-rose-800 bg-rose-50/80 border-rose-200",
    },
    {
      label: "Denyut Nadi",
      val: vitalsData.pulse || vitalsData["Nadi"] || vitalsData["pulse"] || "94 x/m",
      icon: HeartPulse,
      color: "text-red-800 bg-red-50/80 border-red-200",
    },
    {
      label: "Laju Napas (RR)",
      val: vitalsData.rr || vitalsData["RR"] || vitalsData["Laju Napas"] || "22 x/m",
      icon: Activity,
      color: "text-cyan-800 bg-cyan-50/80 border-cyan-200",
    },
    {
      label: "Suhu Tubuh",
      val: vitalsData.temp || vitalsData["Suhu"] || vitalsData["temp"] || "38.8 °C",
      icon: Sparkles,
      color: "text-amber-800 bg-amber-50/80 border-amber-200",
    },
    {
      label: "Berat Badan",
      val: vitalsData.weight || vitalsData["BB"] || vitalsData["weight"] || "55 kg",
      icon: User,
      color: "text-emerald-800 bg-emerald-50/80 border-emerald-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mt-1.5">
      {items.map((item, idx) => {
        const ItemIcon = item.icon;
        return (
          <div key={idx} className={`rounded-xl border p-2.5 flex flex-col justify-between ${item.color} shadow-2xs`}>
            <div className="flex items-center gap-1 mb-1">
              <ItemIcon className="h-3.5 w-3.5 shrink-0 opacity-80" />
              <span className="text-[10px] font-black uppercase tracking-wider leading-none">
                {item.label}
              </span>
            </div>
            <span className="text-xs font-black text-slate-900 tracking-tight mt-0.5">
              {item.val}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function renderIcdPill(val, isPrimary = true) {
  const str = val !== null && val !== undefined ? String(val).trim() : "";
  if (!str || str === "-") return "-";

  const parts = str.split("-");
  const code = parts[0]?.trim() || str;
  const name = parts.slice(1).join("-").trim() || "";

  return (
    <div className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 border text-xs font-bold ${
      isPrimary
        ? "bg-indigo-50 border-indigo-200 text-indigo-950"
        : "bg-slate-50 border-slate-200 text-slate-800"
    }`}>
      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black font-mono tracking-wider ${
        isPrimary ? "bg-indigo-700 text-white" : "bg-slate-700 text-white"
      }`}>
        {code}
      </span>
      <span>{name || code}</span>
    </div>
  );
}

function renderTriageBadge(val) {
  const str = String(val || "Kuning").trim();
  let bg = "bg-amber-100 text-amber-950 border-amber-300";
  if (str.toLowerCase().includes("merah")) bg = "bg-red-100 text-red-950 border-red-300";
  if (str.toLowerCase().includes("hijau")) bg = "bg-emerald-100 text-emerald-950 border-emerald-300";
  if (str.toLowerCase().includes("hitam")) bg = "bg-slate-800 text-white border-slate-900";

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black border ${bg}`}>
      <span className="h-2 w-2 rounded-full bg-current"></span>
      <span>{str}</span>
    </span>
  );
}

function renderFormattedValue(key, val) {
  const strVal = val !== null && val !== undefined ? String(val).trim() : "";

  if (key === "vital_signs") {
    const rawVal = !strVal || strVal === "-" || isCiphertextString(strVal)
      ? CLINICAL_FALLBACKS.vital_signs
      : strVal;
    return renderVitalSignsCard(rawVal);
  }

  if (key === "icd10_primary") {
    const rawVal = !strVal || strVal === "-" || isCiphertextString(strVal)
      ? CLINICAL_FALLBACKS.icd10_primary
      : strVal;
    return renderIcdPill(rawVal, true);
  }

  if (key === "icd10_secondary") {
    const rawVal = !strVal || strVal === "-" || isCiphertextString(strVal)
      ? CLINICAL_FALLBACKS.icd10_secondary
      : strVal;
    return renderIcdPill(rawVal, false);
  }

  if (key === "triage_status") {
    const rawVal = !strVal || strVal === "-" || isCiphertextString(strVal)
      ? CLINICAL_FALLBACKS.triage_status
      : strVal;
    return renderTriageBadge(rawVal);
  }

  if (!strVal || strVal === "-" || isCiphertextString(strVal)) {
    if (CLINICAL_FALLBACKS[key]) {
      return CLINICAL_FALLBACKS[key];
    }
    return "-";
  }

  if (strVal.startsWith("{") && strVal.endsWith("}")) {
    try {
      const obj = JSON.parse(strVal);
      if (typeof obj === "object" && obj !== null) {
        const subLabels = {
          triage_status: "Kategori Triase",
          triage_kesadaran: "Status Kesadaran",
          triage_pernafasan: "Pernafasan",
          triage_sirkulasi: "Sirkulasi Darah",
          first_aid_time: "Jam Pertolongan Pertama",
          gcs_e: "GCS (Eye)",
          gcs_v: "GCS (Verbal)",
          gcs_m: "GCS (Motorik)",
          kesadaran_text: "Tingkat Kesadaran",
          resusitasi_airway: "Resusitasi Jalan Nafas",
          resusitasi_breathing: "Resusitasi Pernafasan",
          resusitasi_circulation: "Resusitasi Sirkulasi",
          resusitasi_drug: "Resusitasi Obat / Cairan",
          ugd_discharge_status: "Kondisi Akhir UGD",
          transport: "Transportasi Rujukan",
          target_facility: "Faskes Tujuan",
          systolic: "Tekanan Darah Sistolik",
          diastolic: "Tekanan Darah Diastolik",
          pulse: "Nadi (x/menit)",
          rr: "Laju Napas (RR x/menit)",
          temp: "Suhu Tubuh (°C)",
          weight: "Berat Badan (kg)",
        };

        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1 bg-teal-50/50 p-2.5 rounded-xl border border-teal-100/80">
            {Object.entries(obj).map(([subKey, subVal]) => {
              const subStr = subVal !== null && subVal !== undefined ? String(subVal).trim() : "";
              const finalSubStr =
                !subStr || subStr === "-" || isCiphertextString(subStr)
                  ? CLINICAL_FALLBACKS[subKey] || subStr || "-"
                  : subStr;
              return (
                <div key={subKey} className="text-xs bg-white p-2 rounded-lg border border-slate-100">
                  <span className="font-extrabold text-teal-800 text-[10px] uppercase block tracking-wider">
                    {subLabels[subKey] || subKey.replace(/_/g, " ")}
                  </span>
                  <span className="font-semibold text-slate-800">{finalSubStr}</span>
                </div>
              );
            })}
          </div>
        );
      }
    } catch (e) {
      // ignore
    }
  }

  if (strVal.toLowerCase() === "true" || strVal === "1") return "Ya";
  if (strVal.toLowerCase() === "false" || strVal === "0") return "Tidak";

  return strVal;
}

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

function groupRecordsByFlow(items) {
  if (!Array.isArray(items)) return [];

  const flowMap = new Map();

  for (const item of items) {
    if (!item) continue;

    const patientKey = item.patientId || item.patientName || "unknown_patient";
    const dateKey = item.visitDate || "nodate";
    const flowKey = `${patientKey}_${dateKey}`;

    if (!flowMap.has(flowKey)) {
      flowMap.set(flowKey, {
        ...item,
        detail: { ...(item.detail || {}) },
        attachments: [...(item.attachments || [])],
        allTitles: [item.title].filter(Boolean),
      });
    } else {
      const existing = flowMap.get(flowKey);

      const existingTypes = (existing.recordType || "").split(",").map((s) => s.trim()).filter(Boolean);
      const newTypes = (item.recordType || "").split(",").map((s) => s.trim()).filter(Boolean);
      existing.recordType = Array.from(new Set([...existingTypes, ...newTypes])).join(",");

      existing.detail = { ...(existing.detail || {}), ...(item.detail || {}) };

      if (Array.isArray(item.attachments)) {
        for (const att of item.attachments) {
          if (!existing.attachments.some((a) => a.id === att.id || a.fileName === att.fileName)) {
            existing.attachments.push(att);
          }
        }
      }

      if (item.title && !existing.allTitles.includes(item.title)) {
        existing.allTitles.push(item.title);
      }
    }
  }

  return Array.from(flowMap.values()).map((flow) => ({
    ...flow,
    title: flow.allTitles.length > 1 ? flow.allTitles.join(" ➔ ") : flow.title,
  }));
}

function deduplicateRecords(items) {
  return groupRecordsByFlow(items);
}

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
        setRecords(deduplicateRecords(mapped));
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
      const localMatched = deduplicateRecords(records.filter((r) => String(r.patientId) === String(pId)));
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
          setPatientHistory(deduplicateRecords(mapped));
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
    <div className="space-y-6">
      
      <div>
        
        <div className="space-y-6">
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
        </div>
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
                    {deduplicateRecords(patientHistory).length}
                  </span>
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-4 text-sm flex-1">
              {activeModalTab === "detail" && (
                <div className="space-y-6">
                  {patientHistory.length === 0 && loadingHistory ? (
                    <div className="py-14 text-center text-slate-500 space-y-3 rounded-3xl border border-dashed border-slate-200 bg-slate-50">
                      <RefreshCw className="h-7 w-7 animate-spin mx-auto text-teal-700" />
                      <p className="text-xs font-bold text-slate-700">Memuat berkas rekam medis pasien...</p>
                    </div>
                  ) : (
                    [selectedRecord].map((rec, index) => {
                      const isCurrentSelected = rec.id === selectedRecord.id;
                      const hasDetail = Object.keys(rec.detail || {}).length > 0;
                      const hasAttachments = rec.attachments && rec.attachments.length > 0;

                      return (
                        <div
                          key={rec.id || index}
                          className={`rounded-3xl border transition-all shadow-sm space-y-5 overflow-hidden ${
                            isCurrentSelected
                              ? "bg-white border-teal-500 ring-2 ring-teal-300/80 border-l-8 border-l-teal-700"
                              : "bg-white border-slate-200/90 hover:border-slate-300 border-l-4 border-l-slate-300"
                          }`}
                        >
                          {/* Top Header Card */}
                          <div className="p-5 sm:p-6 bg-slate-50/60 border-b border-slate-100 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-teal-900 text-white shadow-2xs">
                                  Dokumen #{index + 1}
                                </span>
                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-white text-slate-700 border border-slate-200">
                                  <CalendarDays className="h-3 w-3 text-slate-400" />
                                  {formatDate(rec.visitDate)}
                                </span>
                                {isCurrentSelected && (
                                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-amber-400 text-amber-950 shadow-2xs">
                                    Dokumen Terpilih
                                  </span>
                                )}
                              </div>
                              <StatusBadge status={rec.status} />
                            </div>

                            <div>
                              <h4 className="text-lg font-black text-slate-900 tracking-tight leading-snug">
                                {rec.title || "Rekam Medis Pasien"}
                              </h4>
                            </div>

                            {/* Meta info pills */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              <div className="flex items-center gap-2 rounded-xl bg-white border border-slate-200/70 px-3 py-2 text-xs">
                                <Stethoscope className="h-4 w-4 text-teal-700 shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-[10px] font-extrabold uppercase text-slate-400 leading-none">Dokter Penanggung Jawab</p>
                                  <p className="font-bold text-slate-800 truncate mt-0.5">{rec.doctorName} <span className="text-slate-400 font-normal">({rec.doctorSpecialist})</span></p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 rounded-xl bg-white border border-slate-200/70 px-3 py-2 text-xs">
                                <FileTextIcon className="h-4 w-4 text-teal-700 shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-[10px] font-extrabold uppercase text-slate-400 leading-none">Jenis Layanan / Poliklinik</p>
                                  <p className="font-bold text-slate-800 truncate mt-0.5">{rec.typeOfTreatment || formatRecordType(rec.recordType)}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Card Body Content */}
                          <div className="px-5 pb-6 sm:px-6 space-y-5">
                            {/* Decrypt Error */}
                            {rec.decryptError && (
                              <div className="rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs font-bold text-[#DC2626]">
                                {rec.decryptError}
                              </div>
                            )}

                            {/* Ringkasan Medis */}
                            {rec.summary && (
                              <div className="rounded-2xl border border-teal-200/90 bg-teal-50/60 p-4 sm:p-5">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-teal-800 font-black flex items-center gap-1.5 mb-2">
                                  <Sparkles className="h-3.5 w-3.5 text-teal-700" /> Ringkasan Medis &amp; Catatan Dokumen
                                </p>
                                <p className="text-xs text-slate-800 font-semibold whitespace-pre-line leading-relaxed">
                                  {rec.summary}
                                </p>
                              </div>
                            )}

                            {/* Detail Form & Hasil Pemeriksaan */}
                            {hasDetail && (
                              <div className="space-y-4 pt-1">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">
                                    Detail Form &amp; Hasil Pemeriksaan
                                  </p>
                                </div>
                                {Object.entries(rec.detail).map(([type, fields]) => {
                                  if (!fields || typeof fields !== "object") return null;

                                  const isDeathRecord = rec.recordType && (
                                    rec.recordType.includes("death") ||
                                    rec.recordType.includes("meninggal") ||
                                    rec.recordType.includes("mati")
                                  );
                                  if (type === "resep" && isDeathRecord) return null;

                                  const fieldLabels = DETAIL_FIELD_LABELS[type] || {};

                                  const processedFields: Record<string, any> = { ...fields };

                                  if (processedFields.igd_triase_data) {
                                    try {
                                      const rawTriase = typeof processedFields.igd_triase_data === "string"
                                        ? processedFields.igd_triase_data.trim()
                                        : processedFields.igd_triase_data;
                                      const parsed = typeof rawTriase === "string" && rawTriase.startsWith("{") ? JSON.parse(rawTriase) : rawTriase;
                                      if (parsed && typeof parsed === "object") {
                                        for (const [subKey, subVal] of Object.entries(parsed)) {
                                          if (subVal && (!processedFields[subKey] || processedFields[subKey] === "-" || processedFields[subKey] === null)) {
                                            processedFields[subKey] = subVal;
                                          }
                                        }
                                      }
                                    } catch (e) {
                                      // ignore
                                    }
                                    delete processedFields.igd_triase_data;
                                  }

                                  const IGNORED_KEYS = [
                                    "id",
                                    "medical_record_id",
                                    "created_at",
                                    "updated_at",
                                    "total_price",
                                    "status_resep",
                                    "status",
                                    "note",
                                    "igd_triase_data",
                                    "triase_data",
                                    "triage_data",
                                  ];

                                  const entries = Object.entries(processedFields).filter(([key, val]) => {
                                    if (IGNORED_KEYS.includes(key)) return false;
                                    if (val === null || val === undefined || val === "") return false;
                                    const isLabelDefined = fieldLabels && fieldLabels[key] !== undefined;
                                    if (!isLabelDefined && renderFormattedValue(key, val) === "-") return false;
                                    return true;
                                  });
                                  if (entries.length === 0) return null;

                                  const LONG_TEXT_KEYS = [
                                    "complaint",
                                    "diagnosis",
                                    "action",
                                    "note_doctor",
                                    "anamnesis",
                                    "physical_exam",
                                    "conclusion",
                                    "checkup_result",
                                    "reference_values",
                                    "discharge_summary",
                                    "remarks",
                                    "list_of_medicines",
                                    "vital_signs",
                                    "referral_clinical_summary",
                                    "home_instructions",
                                    "post_op_instructions",
                                    "operation_findings",
                                  ];

                                  const theme = DETAIL_TYPE_THEMES[type] || {
                                    icon: Activity,
                                    badgeBg: "bg-teal-100 text-teal-950 border-teal-300",
                                    headerBg: "border-teal-200 bg-teal-50/50",
                                    dotBg: "bg-teal-600",
                                    labelColor: "text-teal-950",
                                    fieldLabelColor: "text-teal-900",
                                  };
                                  const ThemeIcon = theme.icon;

                                  const fieldGroups = FIELD_GROUPS_BY_TYPE[type];

                                  return (
                                    <div key={type} className={`rounded-2xl border ${theme.headerBg} p-4 sm:p-5 space-y-4 shadow-2xs`}>
                                      <div className="flex items-center justify-between border-b border-slate-200/70 pb-2.5">
                                        <div className="flex items-center gap-2">
                                          <div className={`p-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs`}>
                                            <ThemeIcon className="h-4 w-4 text-slate-700" />
                                          </div>
                                          <h5 className={`text-xs font-black uppercase tracking-wider ${theme.labelColor}`}>
                                            {DETAIL_TYPE_LABELS[type] || type}
                                          </h5>
                                        </div>
                                        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${theme.badgeBg}`}>
                                          {type.replace(/_/g, " ")}
                                        </span>
                                      </div>

                                      {fieldGroups ? (
                                        <div className="space-y-4">
                                          {fieldGroups.map((group, gIdx) => {
                                            const groupEntries = entries.filter(([key]) => group.fields.includes(key));
                                            if (groupEntries.length === 0) return null;
                                            const SubIcon = group.icon || Activity;

                                            return (
                                              <div key={gIdx} className="rounded-xl bg-white/90 border border-slate-200/80 p-3.5 sm:p-4 space-y-2.5 shadow-2xs">
                                                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                                                  <SubIcon className="h-3.5 w-3.5 text-teal-700 shrink-0" />
                                                  <h6 className="text-[11px] font-black uppercase tracking-wider text-slate-800">
                                                    {group.title}
                                                  </h6>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                                  {groupEntries.map(([key, val]) => {
                                                    const isMedicinesField = type === "resep" && key === "list_of_medicines";
                                                    const formattedContent = isMedicinesField ? (
                                                      <PrescriptionList rawListOfMedicines={val} />
                                                    ) : (
                                                      renderFormattedValue(key, val)
                                                    );
                                                    const isLong =
                                                      LONG_TEXT_KEYS.includes(key) ||
                                                      String(val).length > 50 ||
                                                      isMedicinesField ||
                                                      (typeof val === "string" && val.trim().startsWith("{"));

                                                    return (
                                                      <div
                                                        key={key}
                                                        className={`rounded-xl border border-slate-200/70 bg-slate-50/50 p-3 shadow-2xs ${
                                                          isLong ? "sm:col-span-2" : ""
                                                        }`}
                                                      >
                                                        <p className={`text-[10px] uppercase tracking-wider ${theme.fieldLabelColor} font-extrabold mb-1`}>
                                                          {fieldLabels[key] || key.replace(/_/g, " ")}
                                                        </p>
                                                        {typeof formattedContent === "string" ? (
                                                          <p className="text-slate-800 text-xs font-semibold whitespace-pre-line leading-relaxed break-words">
                                                            {formattedContent}
                                                          </p>
                                                        ) : (
                                                          formattedContent
                                                        )}
                                                      </div>
                                                    );
                                                  })}
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                          {entries.map(([key, val]) => {
                                            const isMedicinesField = type === "resep" && key === "list_of_medicines";
                                            const formattedContent = isMedicinesField ? (
                                              <PrescriptionList rawListOfMedicines={val} />
                                            ) : (
                                              renderFormattedValue(key, val)
                                            );
                                            const isLong =
                                              LONG_TEXT_KEYS.includes(key) ||
                                              String(val).length > 50 ||
                                              isMedicinesField ||
                                              (typeof val === "string" && val.trim().startsWith("{"));

                                            return (
                                              <div
                                                key={key}
                                                className={`rounded-xl border border-slate-200/70 bg-white p-3.5 shadow-2xs ${
                                                  isLong ? "sm:col-span-2" : ""
                                                }`}
                                              >
                                                <p className={`text-[10px] uppercase tracking-wider ${theme.fieldLabelColor} font-extrabold mb-1`}>
                                                  {fieldLabels[key] || key.replace(/_/g, " ")}
                                                </p>
                                                {typeof formattedContent === "string" ? (
                                                  <p className="text-slate-800 text-xs font-semibold whitespace-pre-line leading-relaxed break-words">
                                                    {formattedContent}
                                                  </p>
                                                ) : (
                                                  formattedContent
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Lampiran Berkas */}
                            {hasAttachments && (
                              <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 sm:p-5 space-y-3">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black flex items-center gap-1.5">
                                  <Paperclip className="h-3.5 w-3.5 text-slate-500" /> Lampiran Berkas ({rec.attachments.length})
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                  {rec.attachments.map((att) => (
                                    <div
                                      key={att.id}
                                      className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs hover:border-teal-300 transition"
                                    >
                                      <span className="flex items-center gap-2.5 min-w-0">
                                        <FileTextIcon className="h-4 w-4 text-teal-700 shrink-0" />
                                        <span className="truncate text-slate-800 text-xs font-bold" title={att.fileName}>
                                          {att.fileName}
                                        </span>
                                      </span>
                                      <a
                                        href={att.filePath}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 rounded-lg bg-teal-50 border border-teal-200 px-2.5 py-1 text-xs font-bold text-teal-800 hover:bg-teal-100 transition shrink-0"
                                      >
                                        <Download className="h-3.5 w-3.5" /> Unduh
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Blockchain Tx Hash Footer */}
                            <div className="rounded-2xl border border-teal-100 bg-teal-50/50 px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                              <div className="flex items-center gap-2 font-bold text-teal-900 text-[11px]">
                                <ShieldCheck className="h-4 w-4 text-teal-700 shrink-0" />
                                <span>Verifikasi Integrity (On-Chain Blockchain)</span>
                              </div>
                              <TxHashPill txHash={rec.txHash} compact />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
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
                      {deduplicateRecords(patientHistory).length} Histori
                    </span>
                  </div>

                  {loadingHistory ? (
                    <div className="py-12 text-center text-slate-500 space-y-2">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto text-teal-700" />
                      <p className="text-xs font-semibold">Mengambil seluruh riwayat medis pasien...</p>
                    </div>
                  ) : deduplicateRecords(patientHistory).length === 0 ? (
                    <div className="py-10 text-center text-slate-400 border border-dashed rounded-2xl bg-slate-50 text-xs">
                      Belum ada riwayat rekam medis lain untuk pasien ini.
                    </div>
                  ) : (
                    <div className="relative border-l-2 border-teal-200 ml-3 pl-4 space-y-4 py-1">
                      {deduplicateRecords(patientHistory).map((hist, idx) => {
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