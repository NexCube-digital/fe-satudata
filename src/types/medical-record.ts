export type MedicalRecordType =
  | 'rajal'
  | 'ranap'
  | 'igd'
  | 'bedah'
  | 'odc'
  | 'rehab'
  | 'rujuk'
  | 'death';

export interface Diagnosis {
  code: string;
  name: string;
  description?: string;
  isPrimary?: boolean;
}

export interface Attachment {
  id: string | number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: string;
}

export interface MedicalRecord {
  id: string | number;
  patientId: string | number;
  patientName: string;
  patientNik: string;
  doctorId: string | number;
  doctorName: string;
  faskesId: string | number;
  faskesName: string;
  recordType: MedicalRecordType;
  visitDate: string;
  keluhanUtama: string;
  diagnosa: Diagnosis[];
  tindakan?: string;
  catatanDokter?: string;
  attachments?: Attachment[];
  txHash?: string;
  blockchainVerified?: boolean;
  status: 'draft' | 'submitted' | 'verified';
  createdAt: string;
  updatedAt: string;
}

export interface FormIGDPayload {
  patientId: string | number;
  triageLevel: 'red' | 'yellow' | 'green' | 'black';
  vitalSigns: {
    td: string;
    nadi: string;
    suhu: string;
    respirasi: string;
  };
  keluhanUtama: string;
  tindakanDarurat: string;
}

export interface FormRajalPayload {
  patientId: string | number;
  keluhanUtama: string;
  pemeriksaanFisik: string;
  diagnosaUtama: string;
  resepObat?: string;
}

export interface FormRanapPayload {
  patientId: string | number;
  ruanganId: string | number;
  noBed: string;
  tglMasuk: string;
  tglKeluar?: string;
  diagnosaMasuk: string;
  catatanPerkembangan?: string;
}
