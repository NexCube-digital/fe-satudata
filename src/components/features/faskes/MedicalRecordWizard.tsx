'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import MedicalRecordMain from '@/components/features/faskes/medical-records/MedicalRecordMain';
import { apiGet } from '@/lib/api-client';
import {
  ArrowUpRight,
  CheckCircle,
  Hash,
  FileText,
  X,
} from 'lucide-react';
import {
  createMedicalRecordDraft,
  updateMedicalRecordDraft,
  getMedicalRecordById,
} from '@/services/faskes-service';
import { getServicePrices } from '@/services/finance-service';
import { getSpecialties } from '@/services/doctor-service';
import Toast from '@/components/ui/Toast';
import notify from '@/lib/notify';

const DEFAULT_PELAYANAN_MEDIS = [
  { value: 'igd', label: 'Instalasi Gawat Darurat' },
  { value: 'rawat_jalan', label: 'Instalasi Rawat Jalan' },
  { value: 'rawat_inap', label: 'Instalasi Rawat Inap' },
  { value: 'bedah_sentral', label: 'Instalasi Bedah Sentral' },
  { value: 'rehab_medik', label: 'Pelayanan Rehabilitas Medik' },
  { value: 'one_day_care', label: 'One Day Care' },
  { value: 'rujukan_medis', label: 'Surat Rujukan Medis' },
  { value: 'death_certificate', label: 'Surat Keterangan Kematian' },
];

function getMedisOrderRank(val: string, label = '') {
  const normVal = (val || '').toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const normLbl = (label || '').toLowerCase();

  if (normVal.includes('igd') || normLbl.includes('gawat darurat')) return 1;
  if (normVal.includes('rawat_jalan') || normLbl.includes('rawat jalan')) return 2;
  if (normVal.includes('rawat_inap') || normLbl.includes('rawat inap')) return 3;
  if (normVal.includes('bedah') || normLbl.includes('bedah')) return 4;
  if (normVal.includes('rehab') || normLbl.includes('rehabilitas')) return 5;
  if (normVal.includes('one_day_care') || normLbl.includes('one day care') || normVal.includes('odc')) return 6;
  if (normVal.includes('rujuk') || normLbl.includes('rujuk')) return 7;
  if (normVal.includes('death') || normVal.includes('kematian') || normVal.includes('meninggal') || normLbl.includes('kematian')) return 8;
  return 99;
}

const TYPE_OF_TREATMENT_OPTIONS = [
  { value: 'rawat_jalan', label: 'Rawat Jalan' },
  { value: 'rawat_inap', label: 'Rawat Inap' },
  { value: 'igd', label: 'IGD' },
  { value: 'one_day_care', label: 'One Day Care' },
];

const DOSAGE_RULE_PRESETS = [
  '1x1 sebelum makan',
  '1x1 sesudah makan',
  '1x1 malam hari sebelum tidur',
  '2x1 sebelum makan',
  '2x1 sesudah makan',
  '2x1 pagi dan malam',
  '3x1 sebelum makan',
  '3x1 sesudah makan',
  '3x1 saat makan',
  '4x1 sesudah makan',
  'Setiap 8 jam',
  'Setiap 12 jam',
  'Bila perlu (prn)',
  'Dioleskan pada area yang sakit',
  'Sesuai anjuran dokter',
];

function getDetailFieldsConfig(type: string) {
  const normType = String(type || '').toLowerCase().trim();

  if (
    normType === 'igd' ||
    normType === 'gawat_darurat' ||
    normType.includes('igd') ||
    normType.includes('gawat darurat')
  ) {
    return [
      { name: 'igd_triase_data', label: 'FORM GAWAT DARURAT MEDIS (TRIAGE STATUS & PEMERIKSAAN JASMANI)', section: 'S', inputType: 'igd_triase_form' },
      { name: 'ugd_discharge_status', label: 'Ringkasan Kondisi Sebelum Meninggalkan UGD', section: 'P', inputType: 'ugd_discharge_summary' },
    ];
  }

  if (
    normType === 'rawat_inap' ||
    normType.includes('rawat_inap') ||
    normType.includes('rawat inap') ||
    normType.includes('ranap') ||
    normType.includes('ri-')
  ) {
    return [
      { name: 'complaint', label: 'Hasil Anamnesis: Keluhan Utama Masuk Rawat Inap', section: 'S', inputType: 'textarea', placeholder: 'Keluhan utama saat pasien masuk ruang perawatan...' },
      { name: 'anamnesis', label: 'Hasil Anamnesis: Riwayat Penyakit Lengkap', section: 'S', inputType: 'textarea', placeholder: 'Riwayat penyakit sekarang, riwayat operasi, penyakit dahulu, alergi obat...' },
      { name: 'vital_signs', label: 'Hasil Pemeriksaan Tanda-Tanda Vital Harian', section: 'O', inputType: 'vital_signs' },
      { name: 'physical_exam', label: 'Hasil Pemeriksaan Fisik & Kamar Rawat Inap', section: 'O', inputType: 'textarea', placeholder: 'Hasil pemeriksaan fisik & kamar rawat inap...' },
      { name: 'clinical_observation', label: 'Catatan Observasi Klinis & Hasil Pengobatan', section: 'O', inputType: 'textarea', placeholder: 'Catatan perkembangan pasien terpadu (CPPT), evaluasi harian, respon pengobatan...' },
      { name: 'icd10_primary', label: 'Diagnosis Utama (ICD-10)', section: 'A', inputType: 'icd10_autocomplete' },
      { name: 'icd10_secondary', label: 'Diagnosis Sekunder (ICD-10)', section: 'A', inputType: 'icd10_multiselect' },
      { name: 'diagnosis', label: 'Diagnosis Dokter (Utama & Sekunder)', section: 'A', inputType: 'textarea', placeholder: 'Diagnosis utama & diagnosis penyerta...' },
      { name: 'action', label: 'Pengobatan atau Tindakan Medis Rawat Inap', section: 'P', inputType: 'textarea', placeholder: 'Rencana penatalaksanaan, pemasangan infus, terapi harian, tindakan medis...' },
      { name: 'informed_consent', label: 'Persetujuan Tindakan Medis (Informed Consent)', section: 'P', inputType: 'text', placeholder: 'Persetujuan tindakan medis / surat izin rawat inap...' },
      { name: 'discharge_summary', label: 'Ringkasan Pulang (Discharge Summary)', section: 'P', inputType: 'textarea', placeholder: 'Ringkasan kondisi saat pulang, instruksi obat pulang & jadwal kontrol...' },
      { name: 'other_services', label: 'Pelayanan Lain yang Diberikan', section: 'P', inputType: 'textarea', placeholder: 'Asuhan gizi, fisioterapi rawat inap, konsul spesialis...' },
    ];
  }

  if (
    normType === 'rawat_jalan' ||
    normType.includes('rawat_jalan') ||
    normType.includes('rawat jalan') ||
    normType.includes('rajal') ||
    normType.includes('rj-')
  ) {
    return [
      { name: 'rajal_form_data', label: 'FORMULIR REKAM MEDIS RAWAT JALAN (RM RJ 01)', section: 'S', inputType: 'rajal_form' },
    ];
  }

  if (
    normType === 'lab' ||
    normType.includes('laboratorium') ||
    normType.includes('lab')
  ) {
    return [
      { name: 'examination_type', label: 'Jenis Pemeriksaan Laboratorium', section: 'O', inputType: 'textarea' },
      { name: 'checkup_result', label: 'Hasil Pemeriksaan Laboratorium', section: 'O', inputType: 'textarea' },
      { name: 'reference_values', label: 'Nilai Referensi', section: 'O', inputType: 'textarea' },
      { name: 'conclusion', label: 'Kesimpulan & Evaluasi Dokter', section: 'A', inputType: 'textarea' },
    ];
  }

  if (
    normType === 'radiologi' ||
    normType.includes('radiologi')
  ) {
    return [
      { name: 'examination_type', label: 'Jenis Pemeriksaan Radiologi', section: 'O', inputType: 'textarea' },
      { name: 'checkup_result', label: 'Temuan Radiologi', section: 'O', inputType: 'textarea' },
      { name: 'conclusion', label: 'Kesimpulan / Impresi Dokter Radiologi', section: 'A', inputType: 'textarea' },
    ];
  }

  if (
    normType === 'rujukan_medis' ||
    normType.includes('rujukan') ||
    normType.includes('rujuk') ||
    normType.includes('referral')
  ) {
    return [
      { name: 'referral_type', label: 'Jenis Rujukan Medis', section: 'P', inputType: 'text' },
      { name: 'referral_urgency', label: 'Sifat / Urgensi Rujukan', section: 'P', inputType: 'text' },
      { name: 'target_faskes_name', label: 'Faskes Tujuan', section: 'P', inputType: 'text' },
      { name: 'target_specialty', label: 'Poli/Spesialis Tujuan', section: 'P', inputType: 'text' },
      { name: 'referral_reasons', label: 'Alasan Rujukan', section: 'P', inputType: 'text' },
      { name: 'referral_clinical_summary', label: 'Resume Klinis Rujukan', section: 'S', inputType: 'textarea' },
      { name: 'attached_files', label: 'Berkas Lampiran Rujukan', section: 'P', inputType: 'text' },
      { name: 'transportation', label: 'Sarana Transportasi', section: 'P', inputType: 'text' },
    ];
  }

  if (
    normType === 'death_certificate' ||
    normType.includes('death') ||
    normType.includes('kematian') ||
    normType.includes('meninggal') ||
    normType.includes('mati')
  ) {
    return [
      { name: 'death_datetime', label: 'Waktu Kematian', section: 'P', inputType: 'text' },
      { name: 'declaring_doctor', label: 'Dokter Yang Menyatakan', section: 'P', inputType: 'text' },
      { name: 'death_location', label: 'Lokasi Kematian', section: 'P', inputType: 'text' },
      { name: 'underlying_cause', label: 'Penyebab Utama Kematian', section: 'A', inputType: 'textarea' },
      { name: 'autopsy_done', label: 'Autopsi / Pemeriksaan Luar', section: 'P', inputType: 'text' },
    ];
  }

  return [
    { name: 'complaint', label: 'Keluhan Utama', section: 'S', inputType: 'textarea', placeholder: 'Keluhan utama yang dirasakan pasien saat ini...' },
    { name: 'anamnesis', label: 'Anamnesis / Riwayat Penyakit', section: 'S', inputType: 'textarea', placeholder: 'Riwayat penyakit sekarang, dahulu, keluarga, alergi...' },
    { name: 'vital_signs', label: 'Tanda-Tanda Vital', section: 'O', inputType: 'vital_signs' },
    { name: 'physical_exam', label: 'Pemeriksaan Fisik & Penunjang', section: 'O', inputType: 'textarea', placeholder: 'Hasil pemeriksaan fisik & penunjang medis...' },
    { name: 'icd10_primary', label: 'Diagnosis Utama (ICD-10)', section: 'A', inputType: 'icd10_autocomplete' },
    { name: 'icd10_secondary', label: 'Diagnosis Sekunder (ICD-10)', section: 'A', inputType: 'icd10_multiselect' },
    { name: 'diagnosis', label: 'Diagnosis Dokter', section: 'A', inputType: 'textarea', placeholder: 'Diagnosis kerja dan/atau diagnosis banding...' },
    { name: 'action', label: 'Pengobatan / Tindakan Medis', section: 'P', inputType: 'textarea', placeholder: 'Rencana penatalaksanaan, pengobatan, terapi...' },
    { name: 'other_services', label: 'Pelayanan Lain yang Diberikan', section: 'P', inputType: 'textarea', placeholder: 'Pelayanan lain yang diberikan kepada pasien...' },
    { name: 'note_doctor', label: 'Catatan & Edukasi Dokter', section: 'P', inputType: 'textarea', placeholder: 'Instruksi follow-up, edukasi pasien, rencana kontrol...' },
  ];
}

function isDoctorMatchingSpecialty(doctor: any, selectedSpec: string) {
  if (!selectedSpec || selectedSpec === 'all') return true;

  const docSpec = (doctor?.specialist || '').toLowerCase().trim();
  const targetSpec = (selectedSpec || '').toLowerCase().trim();

  if (!docSpec) return false;
  if (docSpec === targetSpec) return true;

  const extractKeyTerm = (str: string) => {
    if (str.includes('paru') || str.includes('pulmonologi')) return 'paru';
    if (str.includes('jantung') || str.includes('kardiologi') || str.includes('kardiovaskuler')) return 'jantung';
    if (str.includes('penyakit dalam') || str.includes('sp.pd') || str.includes('internis')) return 'dalam';
    if (str.includes('bedah') || str.includes('sp.b')) return 'bedah';
    if (str.includes('anak') || str.includes('sp.a') || str.includes('pediatri')) return 'anak';
    if (str.includes('obstetri') || str.includes('ginekologi') || str.includes('obgyn')) return 'obgyn';
    if (str.includes('saraf') || str.includes('neurologi')) return 'saraf';
    if (str.includes('anestesi')) return 'anestesi';
    if (str.includes('umum')) return 'umum';
    return str;
  };

  const docKey = extractKeyTerm(docSpec);
  const targetKey = extractKeyTerm(targetSpec);

  return docKey === targetKey || docSpec.includes(targetSpec) || targetSpec.includes(docSpec);
}

function buildEmptyDetail(type: string) {
  const empty: Record<string, string> = {};
  getDetailFieldsConfig(type).forEach((f) => {
    empty[f.name] = '';
  });
  return empty;
}

function isDoctorMatchingTreatment(doctor: any, treatmentType: string) {
  if (!treatmentType) return true;

  const spec = (doctor?.specialist || '').toLowerCase();
  const name = (doctor?.name || '').toLowerCase();

  switch (treatmentType) {
    case 'rawat_inap': {
      const keywords = [
        'penyakit dalam', 'sp.pd', 'internis',
        'paru', 'pulmonologi', 'sp.p',
        'jantung', 'kardiologi', 'kardiovaskuler', 'sp.jp',
        'bedah', 'sp.b', 'sp.btkv', 'sp.bs', 'sp.ot', 'sp.ba', 'sp.u', 'sp.bp',
        'obstetri', 'ginekologi', 'obgyn', 'obsgyn', 'sp.og',
        'saraf', 'neurologi', 'sp.n', 'sp.s',
        'anak', 'pediatri', 'sp.a',
        'anestesi', 'sp.an',
        'umum'
      ];
      return keywords.some((kw) => spec.includes(kw) || name.includes(kw));
    }
    case 'rawat_jalan': {
      return true;
    }
    case 'igd': {
      const keywords = [
        'umum', 'kepala klinik',
        'bedah', 'sp.b', 'sp.btkv', 'sp.bs', 'sp.ot', 'sp.ba', 'sp.u', 'sp.bp',
        'anestesi', 'sp.an',
        'penyakit dalam', 'sp.pd', 'internis',
        'jantung', 'kardiologi', 'kardiovaskuler', 'sp.jp',
        'paru', 'pulmonologi', 'sp.p',
        'anak', 'pediatri', 'sp.a',
        'obstetri', 'ginekologi', 'obgyn', 'sp.og',
        'saraf', 'neurologi', 'sp.n', 'sp.s',
        'gawat', 'darurat', 'igd'
      ];
      return keywords.some((kw) => spec.includes(kw) || name.includes(kw));
    }
    case 'one_day_care': {
      const keywords = [
        'bedah', 'sp.b', 'sp.btkv', 'sp.bs', 'sp.ot', 'sp.ba', 'sp.u', 'sp.bp',
        'rehabilitasi', 'kfr', 'sp.kfr',
        'obstetri', 'ginekologi', 'obgyn', 'sp.og',
        'penyakit dalam', 'sp.pd', 'internis',
        'mata', 'sp.m',
        'tht', 'sp.tht',
        'gigi', 'mulut',
        'umum'
      ];
      return keywords.some((kw) => spec.includes(kw) || name.includes(kw));
    }
    default:
      return true;
  }
}

const MAX_ATTACHMENTS = 5;
const STEP_JENIS = 'jenis';
const STEP_KUNJUNGAN = 'kunjungan';
const STEP_LAMPIRAN = 'lampiran';
const detailStepKey = (type: string) => `detail_${type}`;
const WIZARD_DRAFT_STORAGE_KEY = 'faskes_medrec_wizard_draft_v1';

function saveWizardDraftMeta(recordId: any, selectedTypes: string[]) {
  try {
    localStorage.setItem(WIZARD_DRAFT_STORAGE_KEY, JSON.stringify({ recordId, selectedTypes }));
  } catch (err) {}
}

function loadWizardDraftMeta() {
  try {
    const raw = localStorage.getItem(WIZARD_DRAFT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

function clearWizardDraftMeta() {
  try {
    localStorage.removeItem(WIZARD_DRAFT_STORAGE_KEY);
  } catch (err) {}
}

function normalizeMedicine(raw: any) {
  const id = raw.id ?? raw.medicine_id ?? raw._id ?? raw.uuid;
  const name = raw.name || raw.nama || raw.medicine_name || raw.nama_obat || 'Tanpa Nama';
  const stockRaw = raw.stock ?? raw.stok ?? raw.quantity ?? raw.qty ?? raw.jumlah ?? 0;
  const unit = raw.unit || raw.satuan || raw.uom || raw.unit_type || 'unit';
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
    medicineId: '',
    medicine: '',
    unit: '',
    quantity: '',
    rule: '',
  };
}

function buildStateFromRecord(record: any, selectedTypesHint?: string[]) {
  const resumedTypes =
    Array.isArray(selectedTypesHint) && selectedTypesHint.length > 0
      ? selectedTypesHint
      : Object.keys(record.detail || {});

  const resumedDetails: Record<string, any> = {};
  resumedTypes.forEach((type) => {
    const source = record.detail?.[type] || {};
    const picked: Record<string, any> = {};
    getDetailFieldsConfig(type).forEach((f) => {
      if (source[f.name] !== undefined && source[f.name] !== null) picked[f.name] = source[f.name];
    });
    resumedDetails[type] = { ...buildEmptyDetail(type), ...picked };
  });

  let prescriptionRows: any[] = [];
  const rawPrescription = record.detail?.resep?.list_of_medicines;
  if (rawPrescription) {
    try {
      const parsed = JSON.parse(rawPrescription);
      if (Array.isArray(parsed)) {
        prescriptionRows = parsed.map((item: any) => ({
          id: `obat-resume-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          medicineId: item.medicine_id ? String(item.medicine_id) : '',
          medicine: item.medicine || '',
          unit: item.unit || '',
          quantity: (item.quantity || '').toString().split(' ')[0] || '',
          rule: item.rule || '',
        }));
      }
    } catch (err) {
      if (typeof rawPrescription === 'string') {
        prescriptionRows = rawPrescription.split(',').map((medStr, idx) => {
          const trimmed = medStr.trim();
          const match = trimmed.match(/^(.*?)(?:\s*\((.*?)\))?$/);
          return {
            id: `obat-plain-${idx}`,
            medicineId: '',
            medicine: match && match[1] ? match[1].trim() : trimmed,
            unit: 'Pcs',
            quantity: match && match[2] ? match[2].trim() : '1',
            rule: 'Diminum 3x1 sesudah makan',
          };
        });
      }
    }
  }

  return { resumedTypes, resumedDetails, prescriptionRows };
}

export interface MedicalRecordWizardProps {
  recordId?: any;
}

export const MedicalRecordWizard: React.FC<MedicalRecordWizardProps> = ({ recordId: routeRecordId = null }) => {
  const router = useRouter();
  const isEditRoute = !!routeRecordId;

  const [user, setUser] = useState<any>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSavingStep, setIsSavingStep] = useState<boolean>(false);
  const [isResuming, setIsResuming] = useState<boolean>(true);
  const [resumedFromDraft, setResumedFromDraft] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string>('');

  const [isFinalRecord, setIsFinalRecord] = useState<boolean>(false);

  const [patientId, setPatientId] = useState<string>('');
  const [approvedPatients, setApprovedPatients] = useState<any[]>([]);
  const [loadingPatients, setLoadingPatients] = useState<boolean>(true);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const nowTimeStr = useMemo(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }, []);

  const generateVisitId = () => {
    const d = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `VISIT-${d}-${rand}`;
  };

  const [visitId, setVisitId] = useState<string>(generateVisitId);
  const [primaryEntryPoint, setPrimaryEntryPoint] = useState<string>('');
  const [igdDischargeDecision, setIgdDischargeDecision] = useState<string>('pulang');
  const [rujukanData, setRujukanData] = useState<any>({ targetFacility: '', reason: '', condition: '', transport: 'Ambulans' });
  const [deathData, setDeathData] = useState<any>({ deathTime: '', deathCause: '', certifierDoctor: '' });
  const [cpptNotes, setCpptNotes] = useState<string>('');

  const [title, setTitle] = useState<string>('');
  const [visitDate, setVisitDate] = useState<string>(todayStr);
  const [visitTime, setVisitTime] = useState<string>(nowTimeStr);
  const [paymentType, setPaymentType] = useState<string>('');
  const [escortName, setEscortName] = useState<string>('');
  const [escortRelation, setEscortRelation] = useState<string>('');
  const [escortPhone, setEscortPhone] = useState<string>('');

  const [typeOfTreatment, setTypeOfTreatment] = useState<string>('');
  const [doctorId, setDoctorId] = useState<string>('');
  const [summary, setSummary] = useState<string>('');

  const [nakesName, setNakesName] = useState<string>('');
  const [doctorSignature, setDoctorSignature] = useState<string>('');
  const [icd9Procedures, setIcd9Procedures] = useState<any[]>([]);
  const [nursingCareNotes, setNursingCareNotes] = useState<string>('');
  const [penunjangResultText, setPenunjangResultText] = useState<string>('');

  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedPenunjang, setSelectedPenunjang] = useState<any[]>([]);
  const [detailsByType, setDetailsByType] = useState<Record<string, any>>({});

  const handlePrimaryEntryPointChange = (entryPoint: string) => {
    setPrimaryEntryPoint(entryPoint);
    setSelectedTypes([entryPoint]);
    setDetailsByType((prev) => ({
      ...prev,
      [entryPoint]: prev[entryPoint] || buildEmptyDetail(entryPoint),
    }));
  };

  const [persistedTypes, setPersistedTypes] = useState<string[]>([]);

  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [existingAttachmentsInfo, setExistingAttachmentsInfo] = useState<any[]>([]);

  const [prescriptionItems, setPrescriptionItems] = useState<any[]>([]);

  const [medicinesCatalog, setMedicinesCatalog] = useState<any[]>([]);
  const [loadingMedicines, setLoadingMedicines] = useState<boolean>(true);

  const [recordId, setRecordId] = useState<any>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const [toast, setToast] = useState<{ show: boolean; type: string; title: string; message: string }>({
    show: false,
    type: 'success',
    title: '',
    message: '',
  });

  const showToast = (message: string, type = 'success', title = '', tipe?: string) =>
    notify(setToast, { type, title, message, tipe });

  const setErrorMessage = (msg: string) => {
    if (msg) showToast(msg, 'error', 'Perhatian');
  };

  const setSuccessMessage = (msg: string) => {
    if (msg) showToast(msg, 'success', 'Berhasil');
  };

  const [uploadedResult, setUploadedResult] = useState<any>(null);
  const [copiedTx, setCopiedTx] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState<boolean>(true);
  const [servicePrices, setServicePrices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState<boolean>(true);
  const [doctorSpecialtyFilter, setDoctorSpecialtyFilter] = useState<string>('all');
  const [specialtiesList, setSpecialtiesList] = useState<any[]>([]);

  const [resumedDoctorInfo, setResumedDoctorInfo] = useState<any>(null);
  const [selectedPenunjangCategories, setSelectedPenunjangCategories] = useState<string[]>([]);
  const [selectedPenunjangSubItems, setSelectedPenunjangSubItems] = useState<string[]>([]);

  const recordTypes = useMemo(() => {
    const kategoriFromApi = servicePrices.filter((s) => s.type === 'kategori');
    if (kategoriFromApi.length > 0) {
      const mapped = kategoriFromApi.map((item) => {
        const val = (item.code || item.name).toLowerCase().replace(/[^a-z0-9]+/g, '_');
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
    const mainFromApi = servicePrices.filter((s) => s.type === 'penunjang');
    if (mainFromApi.length > 0) {
      return mainFromApi.map((item) => ({
        value: item.category || item.name,
        label: item.name,
        code: item.code,
        kptl: item.kptl,
      }));
    }
    return [
      { value: 'Laboratorium', label: 'Laboratorium' },
      { value: 'Radiologi', label: 'Radiologi' },
    ];
  }, [servicePrices]);

  const penunjangSubItems = useMemo(() => {
    return servicePrices
      .filter((s) => s.type === 'sub_penunjang' || s.type === 'penunjang')
      .map((item) => ({
        id: item.code || item.name,
        name: item.name,
        category: item.category || (item.name?.toLowerCase().includes('rad') ? 'Radiologi' : 'Laboratorium'),
        code: item.code,
        kptl: item.kptl,
        satuan: item.satuan,
        price: item.price,
      }));
  }, [servicePrices]);

  const roomOptions = useMemo(() => {
    return servicePrices
      .filter((s) => s.type === 'ruangan')
      .map((item) => ({
        value: item.name,
        label: `${item.name} (${item.code || 'AKM'}) - Rp ${Number(item.price || 0).toLocaleString('id-ID')}/${item.satuan || 'Hari'}`,
        price: item.price,
        code: item.code,
      }));
  }, [servicePrices]);

  const layananAdminOptions = useMemo(() => {
    const rawServices = servicePrices.filter((s) => s.type === 'layanan');

    const selectedTypesInfo = selectedTypes.map((tVal) => {
      const rec = recordTypes.find((r) => r.value === tVal);
      return {
        value: tVal,
        label: (rec?.label || tVal).toLowerCase(),
      };
    });

    const filtered = rawServices.filter((item) => {
      if (selectedTypes.length === 0) return true;

      const nameLower = (item.name || '').toLowerCase();
      const catLower = (item.category || '').toLowerCase();
      const kptlLower = (item.kptl || '').toLowerCase();

      const matchesAnySelected = selectedTypesInfo.some(({ value, label }) => {
        if (value === 'igd' || label.includes('gawat darurat')) {
          if (nameLower.includes('gawat') || nameLower.includes('igd') || catLower.includes('gawat') || kptlLower.includes('igd')) return true;
        }
        if (value === 'rawat_jalan' || label.includes('rawat jalan')) {
          if (nameLower.includes('rawat jalan') || catLower.includes('rawat jalan') || kptlLower.includes('rj')) return true;
        }
        if (value === 'rawat_inap' || label.includes('rawat inap')) {
          if (nameLower.includes('rawat inap') || nameLower.includes('(ranap)') || catLower.includes('rawat inap') || kptlLower.includes('ri')) return true;
        }
        if (value === 'bedah_sentral' || label.includes('bedah')) {
          if (nameLower.includes('bedah') || catLower.includes('bedah') || kptlLower.includes('bdh')) return true;
        }
        if (value === 'one_day_care' || label.includes('one day care') || value === 'odc') {
          if (nameLower.includes('one day care') || nameLower.includes('odc') || kptlLower.includes('odc')) return true;
        }
        return false;
      });

      const isGenericAdmin =
        !nameLower.includes('pendaftaran') &&
        !nameLower.includes('gawat') &&
        !nameLower.includes('rawat jalan') &&
        !nameLower.includes('(ranap)') &&
        !nameLower.includes('rawat inap');

      return matchesAnySelected || isGenericAdmin;
    });

    return filtered.map((item) => ({
      value: item.name,
      label: `${item.name} (${item.code || 'ADM'}) - Rp ${Number(item.price || 0).toLocaleString('id-ID')}`,
      price: item.price,
      code: item.code,
    }));
  }, [servicePrices, selectedTypes, recordTypes]);

  const subLayananItems = useMemo(() => {
    return servicePrices
      .filter((s) => s.type === 'sub_layanan')
      .map((item) => ({
        id: item.code || item.name,
        name: item.name,
        category: item.category || 'General',
        price: item.price,
        code: item.code,
      }));
  }, [servicePrices]);

  const togglePenunjangCategory = (catValue: string) => {
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

  const togglePenunjangSubItem = (itemId: string) => {
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
    () => [STEP_KUNJUNGAN, ...sortedSelectedTypes.map(detailStepKey), STEP_LAMPIRAN],
    [sortedSelectedTypes]
  );
  const currentStep = steps[currentStepIndex] || STEP_KUNJUNGAN;

  useEffect(() => {
    setCurrentStepIndex((idx) => Math.min(idx, steps.length - 1));
  }, [steps.length]);

  useEffect(() => {
    const rawUser = localStorage.getItem('user');
    if (rawUser) {
      try {
        setUser(JSON.parse(rawUser));
      } catch (err) {}
    }
  }, []);

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const res: any = await getSpecialties();
        const rawList = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        const activeList = rawList.filter((s: any) => s.status === 'active');
        setSpecialtiesList(activeList);
      } catch (err) {}
    };
    fetchSpecialties();
  }, []);

  useEffect(() => {
    const fetchServicePricesData = async () => {
      setLoadingServices(true);
      try {
        const res = await getServicePrices();
        if (res?.success && Array.isArray(res.data)) {
          setServicePrices(res.data.filter((s: any) => s.status === 'active'));
        } else if (Array.isArray(res)) {
          setServicePrices(res.filter((s: any) => s.status === 'active'));
        }
      } catch (err) {
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
        const result = await apiGet('/api/hospital/access-requests');
        const allPatients = Array.isArray(result?.data) ? result.data : [];

        setApprovedPatients(
          allPatients.map((item: any) => {
            const pUser = item.Patient || item.patient || item.User || item.user || {};
            const prof = pUser.profil || pUser.patient_profil || pUser.PatientProfile || item.PatientProfile || item.patient_profile || {};

            const dob = prof.date_of_birth || prof.birth_date || prof.tanggal_lahir || pUser.date_of_birth || pUser.birth_date || '';
            let computedAge = prof.age || prof.umur || '-';
            if (dob && computedAge === '-') {
              const bDate = new Date(dob);
              if (!isNaN(bDate.getTime())) {
                const diffMs = Date.now() - bDate.getTime();
                const ageDate = new Date(diffMs);
                computedAge = `${Math.abs(ageDate.getUTCFullYear() - 1970)} TH`;
              }
            }

            return {
              patientId: item.patient_id || item.patientId || item.id,
              name: pUser.name || prof.name || 'Pasien Terdaftar',
              patientName: pUser.name || prof.name || 'Pasien Terdaftar',
              nik: prof.nik || pUser.nik || '-',
              mr_number: prof.no_rm || prof.mr_number || pUser.no_rm || `RM-${String(item.patient_id || item.id || 1).padStart(6, '0')}`,
              sex: prof.sex || prof.jenis_kelamin || prof.gender || pUser.sex || '-',
              gender: prof.sex || prof.jenis_kelamin || prof.gender || pUser.sex || '-',
              date_of_birth: dob,
              birth_date: dob,
              place_of_birth: prof.place_of_birth || prof.tempat_lahir || '',
              age: computedAge,
              address: prof.address || prof.alamat || pUser.address || '-',
              phone: prof.phone || pUser.phone || '',
              blood_type: prof.blood_type || prof.golongan_darah || '',
              emergencyName: prof.emergency_contact_name || prof.emergencyName || pUser.emergency_contact_name || '',
              emergencyPhone: prof.emergency_contact_phone || prof.emergencyPhone || pUser.emergency_contact_phone || '',
              emergencyRelation: prof.emergency_relation || prof.relationship || '',
              requestId: item.id,
            };
          })
        );
      } catch (err) {
      } finally {
        setLoadingPatients(false);
      }
    };

    fetchApprovedPatients();
  }, []);

  useEffect(() => {
    if (!patientId || approvedPatients.length === 0) return;

    const matched = approvedPatients.find((p) => String(p.patientId) === String(patientId));
    if (matched) {
      const eName = matched.emergencyName || '';
      const ePhone = matched.emergencyPhone || matched.phone || '';
      let eRel = matched.emergencyRelation || '';

      if (!eRel && eName) {
        const lowerName = eName.toLowerCase();
        if (lowerName.includes('suami') || lowerName.includes('istri')) eRel = 'Suami / Istri';
        else if (lowerName.includes('ayah') || lowerName.includes('bapak') || lowerName.includes('ibu') || lowerName.includes('mama') || lowerName.includes('orang tua')) eRel = 'Orang Tua';
        else if (lowerName.includes('anak')) eRel = 'Anak';
        else if (lowerName.includes('saudara') || lowerName.includes('kakak') || lowerName.includes('adik') || lowerName.includes('kerabat')) eRel = 'Saudara / Kerabat';
        else if (lowerName.includes('teman') || lowerName.includes('tetangga')) eRel = 'Teman / Tetangga';
        else eRel = 'Saudara / Kerabat';
      }

      setEscortName(eName);
      setEscortPhone(ePhone);
      setEscortRelation(eRel || (eName ? 'Saudara / Kerabat' : ''));
    }
  }, [patientId, approvedPatients]);

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoadingDoctors(true);
      try {
        const result = await apiGet('/api/doctor');
        const docs = Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result?.data?.items)
          ? result.data.items
          : [];
        setDoctorsList(docs);
      } catch (err) {
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
        const result = await apiGet('/api/hospital/pharmacy/medicines');
        const meds = Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result?.data?.items)
          ? result.data.items
          : [];
        setMedicinesCatalog(meds.map(normalizeMedicine).filter((m: any) => m.id));
      } catch (err) {
      } finally {
        setLoadingMedicines(false);
      }
    };

    fetchMedicines();
  }, []);

  function applyLoadedRecord(record: any, selectedTypesHint?: string[]) {
    setRecordId(record.id);
    setPatientId(record.patient_id || '');
    setTitle(record.title || '');
    setVisitDate(record.visit_date || todayStr);
    setTypeOfTreatment(record.type_of_treatment || '');
    setDoctorId(record.doctor?.id ? String(record.doctor.id) : '');
    setResumedDoctorInfo(record.doctor || null);
    setSummary(record.summary || '');
    setExistingAttachmentsInfo(record.attachments || []);

    if (record.detail?.kunjungan_info) {
      const ki = record.detail.kunjungan_info;
      if (ki.visit_id) setVisitId(ki.visit_id);
      if (ki.primary_entry_point) setPrimaryEntryPoint(ki.primary_entry_point);
      if (ki.visit_time) setVisitTime(ki.visit_time);
      if (ki.payment_type) setPaymentType(ki.payment_type);
      if (ki.escort_name) setEscortName(ki.escort_name);
      if (ki.escort_relation) setEscortRelation(ki.escort_relation);
      if (ki.escort_phone) setEscortPhone(ki.escort_phone);
    }
    if (record.detail?.igd_discharge_decision) {
      const dd = record.detail.igd_discharge_decision;
      if (dd.decision) setIgdDischargeDecision(dd.decision);
      if (dd.rujukan) setRujukanData(dd.rujukan);
      if (dd.death) setDeathData(dd.death);
    }
    if (record.detail?.cppt_notes) {
      setCpptNotes(record.detail.cppt_notes);
    }
    if (record.detail?.pengesahan) {
      const p = record.detail.pengesahan;
      if (p.nakes_name) setNakesName(p.nakes_name);
      if (p.doctor_signature) setDoctorSignature(p.doctor_signature);
    }
    if (record.detail?.tindakan_icd9) {
      const t = record.detail.tindakan_icd9;
      if (Array.isArray(t.procedures)) setIcd9Procedures(t.procedures);
      if (t.nursing_care) setNursingCareNotes(t.nursing_care);
    }
    if (record.detail?.penunjang_result?.text_result) {
      setPenunjangResultText(record.detail.penunjang_result.text_result);
    }

    const { resumedTypes, resumedDetails, prescriptionRows } = buildStateFromRecord(record, selectedTypesHint);

    if (prescriptionRows.length > 0) setPrescriptionItems(prescriptionRows);

    setSelectedTypes(resumedTypes);
    setDetailsByType(resumedDetails);
    setPersistedTypes(resumedTypes);

    const firstIncompleteType = resumedTypes.find((type) => {
      const fields = resumedDetails[type] || {};
      return !Object.values(fields).some((v) => v && String(v).trim() !== '');
    });
    const resumeStepKey = firstIncompleteType ? detailStepKey(firstIncompleteType) : STEP_LAMPIRAN;
    const stepsAfterResume = [STEP_KUNJUNGAN, ...resumedTypes.map(detailStepKey), STEP_LAMPIRAN];
    const resumeIndex = stepsAfterResume.indexOf(resumeStepKey);
    setCurrentStepIndex(resumeIndex >= 0 ? resumeIndex : 0);

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
            setLoadError('Rekam medis tidak ditemukan atau Anda tidak memiliki akses ke data ini.');
            return;
          }

          setIsFinalRecord(record.status === 'final');
          applyLoadedRecord(record);
          setResumedFromDraft(true);
        } catch (err: any) {
          setLoadError(err.message || 'Gagal memuat data rekam medis.');
        } fontally: {
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

        if (!result?.success || !record || record.status !== 'draft') {
          clearWizardDraftMeta();
          setIsResuming(false);
          return;
        }

        applyLoadedRecord(record, meta.selectedTypes);
        setResumedFromDraft(true);
      } catch (err) {
        clearWizardDraftMeta();
      } finally {
        setIsResuming(false);
      }
    })();
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
  }, [medicinesCatalog]);

  const handleTypeOfTreatmentChange = (val: string) => {
    setTypeOfTreatment(val);
    if (val && doctorId) {
      const selectedDoc = doctorsList.find((d) => String(d.id) === String(doctorId)) || resumedDoctorInfo;
      if (selectedDoc && !isDoctorMatchingTreatment(selectedDoc, val)) {
        setDoctorId('');
      }
    }
  };

  const handleDoctorSpecialtyFilterChange = (val: string) => {
    setDoctorSpecialtyFilter(val);
    if (val && val !== 'all' && doctorId) {
      const selectedDoc = doctorsList.find((d) => String(d.id) === String(doctorId)) || resumedDoctorInfo;
      if (selectedDoc && !isDoctorMatchingSpecialty(selectedDoc, val)) {
        setDoctorId('');
      }
    }
  };

  const filteredDoctorsList = useMemo(() => {
    let list = doctorsList;

    if (doctorSpecialtyFilter && doctorSpecialtyFilter !== 'all') {
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

  const toggleRecordType = (type: string) => {
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

  const updateDetailField = (type: string, fieldName: string, value: any) => {
    setDetailsByType((prev) => ({
      ...prev,
      [type]: { ...prev[type], [fieldName]: value },
    }));
  };

  const handleFilesSelected = (fileList: FileList | null) => {
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

  const removeAttachment = (index: number) => {
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const addPrescriptionRow = () => {
    setPrescriptionItems((prev) => [...prev, buildEmptyPrescriptionRow()]);
  };

  const updatePrescriptionRow = (id: string, field: string, value: any) => {
    setPrescriptionItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const removePrescriptionRow = (id: string) => {
    setPrescriptionItems((prev) => prev.filter((item) => item.id !== id));
  };

  const getRemainingStockForRow = (rowId: string, medicineId: string) => {
    const med = medicinesCatalog.find((m) => m.id === medicineId);
    if (!med) return 0;
    const usedByOtherRows = prescriptionItems
      .filter((i) => i.id !== rowId && i.medicineId === medicineId)
      .reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
    return Math.max(0, med.stock - usedByOtherRows);
  };

  const selectMedicineForRow = (rowId: string, medicineId: string) => {
    setPrescriptionItems((prev) => {
      const med = medicinesCatalog.find((m) => m.id === medicineId);
      return prev.map((item) => {
        if (item.id !== rowId) return item;
        if (!med) {
          return { ...item, medicineId: '', medicine: '', unit: '', quantity: '' };
        }
        const otherRowsUsed = prev
          .filter((i) => i.id !== rowId && i.medicineId === med.id)
          .reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
        const remaining = Math.max(0, med.stock - otherRowsUsed);
        const currentQty = Number(item.quantity) || 0;
        const cappedQty = currentQty > remaining ? (remaining > 0 ? String(remaining) : '') : item.quantity;
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

  const handleQuantityChange = (rowId: string, medicineId: string, rawValue: string) => {
    if (rawValue === '') {
      updatePrescriptionRow(rowId, 'quantity', '');
      return;
    }
    let num = parseInt(rawValue, 10);
    if (Number.isNaN(num) || num < 0) num = 0;
    if (medicineId) {
      const remaining = getRemainingStockForRow(rowId, medicineId);
      if (num > remaining) num = remaining;
    }
    updatePrescriptionRow(rowId, 'quantity', String(num));
  };

  const getRowStockError = (item: any) => {
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
    const payload: Record<string, any> = {};
    selectedTypes.forEach((type) => {
      const source = detailsByType[type] || {};
      const fields: Record<string, any> = {};
      getDetailFieldsConfig(type).forEach((f) => {
        if (source[f.name] !== undefined && source[f.name] !== null && source[f.name] !== '') {
          fields[f.name] = source[f.name];
        }
      });
      if (Object.keys(fields).length > 0) payload[type] = fields;
    });

    const prescriptionDetail = buildPrescriptionDetailPayload();
    if (prescriptionDetail) Object.assign(payload, prescriptionDetail);

    payload.kunjungan_info = {
      visit_id: visitId,
      primary_entry_point: primaryEntryPoint,
      visit_time: visitTime,
      payment_type: paymentType,
      escort_name: escortName,
      escort_relation: escortRelation,
      escort_phone: escortPhone,
    };

    payload.igd_discharge_decision = {
      decision: igdDischargeDecision,
      rujukan: rujukanData,
      death: deathData,
    };

    payload.cppt_notes = cpptNotes;

    payload.pengesahan = {
      nakes_name: nakesName,
      doctor_signature: doctorSignature,
    };

    payload.tindakan_icd9 = {
      procedures: icd9Procedures,
      nursing_care: nursingCareNotes,
    };

    if (penunjangResultText) {
      payload.penunjang_result = {
        text_result: penunjangResultText,
      };
    }

    return payload;
  };

  const getRemovedTypes = () => persistedTypes.filter((t) => !selectedTypes.includes(t));

  const resetWizard = () => {
    setVisitId(generateVisitId());
    setPrimaryEntryPoint('');
    setSelectedTypes([]);
    setIgdDischargeDecision('pulang');
    setRujukanData({ targetFacility: '', reason: '', condition: '', transport: 'Ambulans' });
    setDeathData({ deathTime: '', deathCause: '', certifierDoctor: '' });
    setCpptNotes('');
    setPatientId('');
    setTitle('');
    setVisitDate(todayStr);
    setVisitTime(nowTimeStr);
    setPaymentType('');
    setEscortName('');
    setEscortRelation('');
    setEscortPhone('');
    setTypeOfTreatment('');
    setDoctorId('');
    setResumedDoctorInfo(null);
    setSummary('');
    setNakesName('');
    setDoctorSignature('');
    setIcd9Procedures([]);
    setNursingCareNotes('');
    setPenunjangResultText('');
    setDetailsByType({});
    setPersistedTypes([]);
    setAttachmentFiles([]);
    setExistingAttachmentsInfo([]);
    setPrescriptionItems([]);
    setRecordId(null);
    setCurrentStepIndex(0);
    setResumedFromDraft(false);
    clearWizardDraftMeta();
  };

  const effectiveTypeOfTreatment = useMemo(() => {
    if (typeOfTreatment && typeOfTreatment.trim() !== '') return typeOfTreatment;
    if (selectedTypes.length > 0) {
      const firstType = selectedTypes[0];
      const rec = recordTypes.find((r) => r.value === firstType);
      return rec?.label || firstType;
    }
    return 'Rawat Jalan';
  }, [typeOfTreatment, selectedTypes, recordTypes]);

  async function persistHeaderStep() {
    const fd = new FormData();
    fd.append('patientId', patientId);
    fd.append('title', title);
    fd.append('visitDate', visitDate);
    fd.append('typeOfTreatment', effectiveTypeOfTreatment);
    if (doctorId) fd.append('doctorId', doctorId);
    if (summary) fd.append('summary', summary);

    if (!recordId) {
      fd.append('status', 'draft');
      fd.append('details', JSON.stringify({}));
      const result = await createMedicalRecordDraft(fd);
      if (!result?.success) throw new Error(result?.message || 'Gagal menyimpan informasi kunjungan.');
      const newId = result.data?.id;
      setRecordId(newId);
      if (!isEditRoute) saveWizardDraftMeta(newId, selectedTypes);
      return newId;
    } else {
      const result = await updateMedicalRecordDraft(recordId, fd);
      if (!result?.success) throw new Error(result?.message || 'Gagal memperbarui informasi kunjungan.');
      return recordId;
    }
  }

  async function persistDetailStep(type: string) {
    const source = detailsByType[type] || {};
    const payload: Record<string, any> = {};
    getDetailFieldsConfig(type).forEach((f) => {
      if (source[f.name] !== undefined && source[f.name] !== null) payload[f.name] = source[f.name];
    });
    const fd = new FormData();
    fd.append('details', JSON.stringify({ [type]: payload }));
    const result = await updateMedicalRecordDraft(recordId, fd);
    if (!result?.success) throw new Error(result?.message || `Gagal menyimpan data ${type}.`);
  }

  const isKunjunganValid = () => !!(patientId && title.trim() && visitDate && primaryEntryPoint && paymentType);

  const canSaveDraft = useMemo(() => {
    if (isSavingStep || isUploading) return false;

    if (currentStep === STEP_KUNJUNGAN || currentStep === STEP_JENIS) {
      return primaryEntryPoint && paymentType && isKunjunganValid();
    }

    if (currentStep.startsWith('detail_')) {
      const type = currentStep.replace('detail_', '');
      const fields = detailsByType[type] || {};
      const hasContent = Object.values(fields).some((v) => v && String(v).trim() !== '');
      return !!recordId && hasContent;
    }

    if (currentStep === STEP_LAMPIRAN) {
      return !!recordId;
    }

    return false;
  }, [currentStep, isSavingStep, isUploading, selectedTypes.length, patientId, title, visitDate, recordId, detailsByType, primaryEntryPoint, paymentType]);

  const saveDraftHint = useMemo(() => {
    if (currentStep === STEP_KUNJUNGAN || currentStep === STEP_JENIS) {
      if (!primaryEntryPoint) {
        return 'Pilih Unit Entri Utama (IGD / Rawat Jalan / Direct Rawat Inap) terlebih dahulu.';
      }
      if (!paymentType) {
        return 'Pilih Jenis Pembayaran terlebih dahulu.';
      }
      if (!isKunjunganValid()) {
        return 'Lengkapi Pasien, Judul, dan Tanggal Kunjungan terlebih dahulu.';
      }
    }
    if (currentStep.startsWith('detail_')) {
      const type = currentStep.replace('detail_', '');
      const typeLabel = recordTypes.find((t) => t.value === type)?.label || type;
      return `Isi minimal 1 data untuk ${typeLabel} terlebih dahulu.`;
    }
    return undefined;
  }, [currentStep, selectedTypes.length, primaryEntryPoint, paymentType, patientId, title, visitDate, recordTypes]);

  async function validateAndPersistStep(stepKey: string) {
    if (stepKey === STEP_KUNJUNGAN || stepKey === STEP_JENIS) {
      if (!primaryEntryPoint) {
        setErrorMessage('Pilih Unit Entri Utama (IGD / Rawat Jalan / Direct Rawat Inap) terlebih dahulu.');
        return false;
      }
      if (!paymentType) {
        setErrorMessage('Pilih Jenis Pembayaran terlebih dahulu.');
        return false;
      }
      if (!patientId) {
        setErrorMessage('Pilih pasien terlebih dahulu.');
        return false;
      }
      if (!title.trim()) {
        setErrorMessage('Judul rekam medis wajib diisi.');
        return false;
      }
      if (!visitDate) {
        setErrorMessage('Tanggal kunjungan wajib diisi.');
        return false;
      }
      if (!isEditRoute && visitDate < todayStr) {
        setErrorMessage('Tanggal kunjungan tidak boleh sebelum hari ini.');
        return false;
      }

      try {
        await persistHeaderStep();
        return true;
      } catch (err: any) {
        setErrorMessage(err.message || 'Gagal menyimpan informasi kunjungan.');
        return false;
      }
    }

    if (stepKey.startsWith('detail_')) {
      const type = stepKey.replace('detail_', '');
      const fields = detailsByType[type] || {};
      const hasContent = Object.values(fields).some((v) => v && String(v).trim() !== '');
      if (!hasContent) {
        const typeLabel = recordTypes.find((t) => t.value === type)?.label || type;
        setErrorMessage(`Lengkapi minimal 1 data untuk rekam medis ${typeLabel}.`);
        return false;
      }
      try {
        await persistDetailStep(type);
        setPersistedTypes((prev) => (prev.includes(type) ? prev : [...prev, type]));
        return true;
      } catch (err: any) {
        setErrorMessage(err.message || `Gagal menyimpan data ${type}.`);
        return false;
      }
    }

    return true;
  }

  const handleNext = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsSavingStep(true);
    try {
      const ok = await validateAndPersistStep(currentStep);
      if (ok) setCurrentStepIndex((i) => i + 1);
    } finally {
      setIsSavingStep(false);
    }
  };

  const handlePrev = () => {
    setErrorMessage('');
    setCurrentStepIndex((i) => Math.max(0, i - 1));
  };

  const goToStep = async (targetIndex: number) => {
    if (targetIndex === currentStepIndex || isSavingStep || isUploading) return;
    setErrorMessage('');
    setSuccessMessage('');

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
    setErrorMessage('');

    if (hasPrescriptionStockErrors()) {
      setErrorMessage('Ada obat yang jumlahnya melebihi stok tersedia. Perbaiki dahulu sebelum finalisasi.');
      return;
    }

    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append('status', 'final');

      const detailsPayload = buildAllDetailsPayload();
      if (Object.keys(detailsPayload).length > 0) fd.append('details', JSON.stringify(detailsPayload));

      const removedTypes = getRemovedTypes();
      if (removedTypes.length > 0) fd.append('removeTypes', JSON.stringify(removedTypes));

      attachmentFiles.forEach((file) => fd.append('attachments', file));

      const result = await updateMedicalRecordDraft(recordId, fd);
      if (result?.success) {
        setPersistedTypes(selectedTypes);
        setUploadedResult({
          recordType: result.data?.record_type,
          title: result.data?.title,
          status: result.data?.status,
          txHash: result.data?.tx_hash || '',
        });
        setShowSuccessModal(true);
        if (!isEditRoute) resetWizard();
      } else {
        setErrorMessage(result?.message || 'Gagal memfinalisasi rekam medis.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Koneksi ke backend bermasalah.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveDraftAndExit = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (hasPrescriptionStockErrors()) {
      setErrorMessage('Ada obat yang jumlahnya melebihi stok tersedia. Perbaiki dahulu sebelum menyimpan draft.');
      return;
    }

    setIsSavingStep(true);
    try {
      let activeRecordId = recordId;
      if (!recordId || currentStep === STEP_KUNJUNGAN) {
        if (!isKunjunganValid()) {
          setErrorMessage('Lengkapi Pasien, Judul, Tanggal Kunjungan, dan Jenis Perawatan terlebih dahulu.');
          return;
        }
        activeRecordId = await persistHeaderStep();
      }

      const fd = new FormData();
      let hasChanges = false;

      if (attachmentFiles.length > 0) {
        attachmentFiles.forEach((file) => fd.append('attachments', file));
        hasChanges = true;
      }

      const detailsPayload = buildAllDetailsPayload();
      if (Object.keys(detailsPayload).length > 0) {
        fd.append('details', JSON.stringify(detailsPayload));
        hasChanges = true;
      }

      const removedTypes = getRemovedTypes();
      if (removedTypes.length > 0) {
        fd.append('removeTypes', JSON.stringify(removedTypes));
        hasChanges = true;
      }

      if (hasChanges) {
        const result = await updateMedicalRecordDraft(activeRecordId, fd);
        if (!result?.success) throw new Error(result?.message || 'Gagal menyimpan lampiran/obat.');
        setPersistedTypes(selectedTypes);
      }

      setSuccessMessage('Draft tersimpan. Anda bisa melanjutkan pengisian kapan saja dari halaman ini.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan draft.');
    } finally {
      setIsSavingStep(false);
    }
  };

  const isLastContentStep = currentStep === STEP_LAMPIRAN;
  const isFirstStep = currentStepIndex === 0;

  const pageTitle = isEditRoute ? 'Lengkapi / Edit Rekam Medis' : 'Upload Rekam Medis Baru';
  const pageSubtitle = isEditRoute
    ? 'Data yang sudah tersimpan sebelumnya sudah terisi otomatis -- tinggal lengkapi kekurangannya atau perbaiki isinya, lalu simpan lagi sebagai draft atau finalisasi.'
    : 'Satu rekam medis mewakili satu kunjungan pasien. Isi bertahap per langkah -- progres otomatis tersimpan sebagai draft setiap kali Anda menekan "Lanjut", atau klik langsung step yang dituju di atas.';

  const nextStepKey = steps[currentStepIndex + 1] || '';
  const isNextStepRanap = nextStepKey.includes('inap') || nextStepKey.includes('ranap');
  const nextButtonLabel = isNextStepRanap ? 'Lanjutkan mengisi form Ranap' : 'Lanjutkan';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-teal-800 font-bold">Dashboard Faskes</p>
              <h1 className="text-3xl font-extrabold text-slate-900 mt-3">{pageTitle}</h1>
              <p className="max-w-2xl text-sm text-slate-500 mt-2">{pageSubtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/dashboard/faskes/medical-records')}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-700 to-cyan-800 px-4 py-3 text-sm font-bold text-white shadow-md hover:from-teal-800 hover:to-cyan-900 transition cursor-pointer"
            >
              <ArrowUpRight className="h-4 w-4" /> Semua Rekam Medis
            </button>
          </div>

          <MedicalRecordMain
            isResuming={isResuming}
            isEditRoute={isEditRoute}
            loadError={loadError}
            onBackToList={() => router.push('/dashboard/faskes/medical-records')}
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
            roomOptions={roomOptions}
            layananAdminOptions={layananAdminOptions}
            subLayananItems={subLayananItems}
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
            visitId={visitId}
            onVisitIdChange={setVisitId}
            primaryEntryPoint={primaryEntryPoint}
            onPrimaryEntryPointChange={handlePrimaryEntryPointChange}
            igdDischargeDecision={igdDischargeDecision}
            onIgdDischargeDecisionChange={setIgdDischargeDecision}
            rujukanData={rujukanData}
            onRujukanDataChange={setRujukanData}
            deathData={deathData}
            onDeathDataChange={setDeathData}
            cpptNotes={cpptNotes}
            onCpptNotesChange={setCpptNotes}
            onPatientCreated={(newP) => {
              setApprovedPatients((prev) => [newP, ...prev]);
              setPatientId(newP.patientId || newP.id || `PAT-${Date.now()}`);
            }}
            visitDate={visitDate}
            onVisitDateChange={setVisitDate}
            visitTime={visitTime}
            onVisitTimeChange={setVisitTime}
            paymentType={paymentType}
            onPaymentTypeChange={setPaymentType}
            escortName={escortName}
            onEscortNameChange={setEscortName}
            escortRelation={escortRelation}
            onEscortRelationChange={setEscortRelation}
            escortPhone={escortPhone}
            onEscortPhoneChange={setEscortPhone}
            nakesName={nakesName}
            onNakesNameChange={setNakesName}
            doctorSignature={doctorSignature}
            onDoctorSignatureChange={setDoctorSignature}
            icd9Procedures={icd9Procedures}
            onIcd9ProceduresChange={setIcd9Procedures}
            nursingCareNotes={nursingCareNotes}
            onNursingCareNotesChange={setNursingCareNotes}
            penunjangResultText={penunjangResultText}
            onPenunjangResultTextChange={setPenunjangResultText}
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
              nextButtonLabel,
              onPrev: handlePrev,
              onNext: handleNext,
              onSaveDraft: handleSaveDraftAndExit,
              onFinalSubmit: handleFinalSubmit,
            }}
          />

      {showSuccessModal && uploadedResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
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
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xs shadow-lg ring-4 ring-white/30">
                <CheckCircle className="h-9 w-9 text-white" />
              </div>
              <h3 className="text-xl font-extrabold tracking-tight">
                {isEditRoute ? 'Perubahan Berhasil Disimpan!' : 'Rekam Medis Berhasil Diunggah!'}
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
                    {uploadedResult.title || 'Rekam Medis'}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full border border-teal-200">
                    {uploadedResult.recordType}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-3 gap-2">
                  <span className="font-mono text-xs font-bold text-teal-900 break-all select-all">
                    {uploadedResult.txHash || 'Belum di-anchor (draft)'}
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
                      {copiedTx ? 'Tersalin!' : 'Salin Hash'}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/faskes/medical-records')}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-700 to-cyan-800 hover:from-teal-800 hover:to-cyan-900 px-5 py-3 text-xs font-bold text-white shadow-md transition cursor-pointer"
                >
                  <FileText className="h-4 w-4" />
                  Lihat Semua Rekam Medis
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (isEditRoute) {
                      router.push('/dashboard/faskes/medical-records');
                      return;
                    }
                    closeSuccessModal();
                    setUploadedResult(null);
                  }}
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-100 hover:bg-slate-200 px-5 py-3 text-xs font-bold text-slate-700 transition cursor-pointer"
                >
                  {isEditRoute ? 'Kembali ke Daftar' : 'Unggah Lagi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} onClose={() => setToast({ ...toast, show: false })} />
    </div>
  );
};

export default MedicalRecordWizard;
