export interface ICD10Item {
  code: string;
  name: string;
  category: string;
}

export interface ICD9Item {
  code: string;
  name: string;
  category: string;
}

export const ICD10_DATABASE: ICD10Item[] = [
  { code: 'A09', name: 'Diare dan Gastroenteritis Oleh Penyebab Infeksi Toksik', category: 'Penyakit Infeksi' },
  { code: 'A01.0', name: 'Tifoid / Demam Tifoid (Typhoid Fever)', category: 'Penyakit Infeksi' },
  { code: 'A91', name: 'Demam Berdarah Dengue (Dengue Hemorrhagic Fever - DHF)', category: 'Penyakit Infeksi' },
  { code: 'A90', name: 'Demam Dengue (Dengue Fever - DF)', category: 'Penyakit Infeksi' },
  { code: 'B34.9', name: 'Infeksi Virus Tanpa Spesifikasi (Viral Infection NOS)', category: 'Penyakit Infeksi' },
  { code: 'U07.1', name: 'COVID-19, Virus Teridentifikasi', category: 'Penyakit Infeksi' },
  
  { code: 'E11.9', name: 'Diabetes Melitus Tipe 2 Tanpa Komplikasi', category: 'Endokrin & Metabolik' },
  { code: 'E11.65', name: 'Diabetes Melitus Tipe 2 dengan Hiperglikemia', category: 'Endokrin & Metabolik' },
  { code: 'E10.9', name: 'Diabetes Melitus Tipe 1 Tanpa Komplikasi', category: 'Endokrin & Metabolik' },
  { code: 'E78.5', name: 'Hiperlipidemia Tanpa Spesifikasi', category: 'Endokrin & Metabolik' },
  { code: 'E05.9', name: 'Tirotoksikosis / Hipertiroidisme', category: 'Endokrin & Metabolik' },

  { code: 'I10', name: 'Hipertensi Esensial (Primer)', category: 'Kardiovaskular' },
  { code: 'I11.9', name: 'Penyakit Jantung Hipertensi Tanpa Gagal Jantung', category: 'Kardiovaskular' },
  { code: 'I20.9', name: 'Angina Pektoris Unspecified', category: 'Kardiovaskular' },
  { code: 'I21.9', name: 'Infar Miokard Akut (Acute Myocardial Infarction - AMI)', category: 'Kardiovaskular' },
  { code: 'I50.9', name: 'Gagal Jantung Tanpa Spesifikasi (Heart Failure)', category: 'Kardiovaskular' },
  { code: 'I64', name: 'Stroke, Tidak Diberitahukan Sebagai Perdarahan Atau Infark', category: 'Kardiovaskular' },

  { code: 'J00', name: 'Nasofaringitis Akut (Flu Biasa / Common Cold)', category: 'Respirasi' },
  { code: 'J02.9', name: 'Faringitis Akut Tanpa Spesifikasi', category: 'Respirasi' },
  { code: 'J03.9', name: 'Tonsilitis Akut Tanpa Spesifikasi', category: 'Respirasi' },
  { code: 'J06.9', name: 'Infeksi Saluran Napas Atas Akut (ISPA)', category: 'Respirasi' },
  { code: 'J18.9', name: 'Pneumonia Tanpa Spesifikasi', category: 'Respirasi' },
  { code: 'J20.9', name: 'Bronkitis Akut Tanpa Spesifikasi', category: 'Respirasi' },
  { code: 'J45.909', name: 'Asma Bronkial Unspecified', category: 'Respirasi' },

  { code: 'K29.7', name: 'Gastritis Tanpa Spesifikasi', category: 'Pencernaan' },
  { code: 'K30', name: 'Dispepsia / Nyeri Ulu Hati', category: 'Pencernaan' },
  { code: 'K21.9', name: 'Gastro-Esophageal Reflux Disease (GERD)', category: 'Pencernaan' },
  { code: 'K35.80', name: 'Apendisitis Akut Unspecified', category: 'Pencernaan' },
  { code: 'K80.20', name: 'Kolelitiasis / Batu Empedu Tanpa Kolesistitis', category: 'Pencernaan' },

  { code: 'M54.5', name: 'Nyeri Punggung Bawah (Low Back Pain - LBP)', category: 'Muskuloskeletal' },
  { code: 'M79.1', name: 'Mialgia (Nyeri Otot)', category: 'Muskuloskeletal' },
  { code: 'M10.9', name: 'Gout / Asam Urat Unspecified', category: 'Muskuloskeletal' },
  { code: 'M13.9', name: 'Artritis / Nyeri Sendi Unspecified', category: 'Muskuloskeletal' },

  { code: 'N39.0', name: 'Infeksi Saluran Kemih (ISK / UTI)', category: 'Urologi' },
  { code: 'N20.1', name: 'Batu Ureter (Ureterolithiasis)', category: 'Urologi' },

  { code: 'R50.9', name: 'Demam Tanpa Spesifikasi (Fever NOS)', category: 'Gejala Umum' },
  { code: 'R51', name: 'Sakit Kepala (Headache / Cephalgia)', category: 'Gejala Umum' },
  { code: 'R42', name: 'Dizziness / Vertigo Unspecified', category: 'Gejala Umum' },
  { code: 'R10.4', name: 'Nyeri Perut Lain Dan Yang Tidak Diberitahukan (Abdominal Pain)', category: 'Gejala Umum' },
  { code: 'R11.2', name: 'Mual Dan Muntah (Nausea and Vomiting)', category: 'Gejala Umum' },

  { code: 'S06.0X0A', name: 'Gegar Otak Ringan (Concussion / CKR)', category: 'Cedera & Trauma' },
  { code: 'S01.9', name: 'Luka Terbuka Pada Kepala Unspecified (Vulnus Laceratum)', category: 'Cedera & Trauma' },
  { code: 'T14.1', name: 'Luka Lecet / Luka Terbuka Area Tubuh Unspecified (Vulnus Excoriatum)', category: 'Cedera & Trauma' },
  { code: 'S52.50', name: 'Fraktur Tulang Radius Bawah (Fraktur Pergelangan Tangan)', category: 'Cedera & Trauma' },
  { code: 'S82.851A', name: 'Fraktur Pergelangan Kaki / Ankle', category: 'Cedera & Trauma' },
  { code: 'T30.0', name: 'Luka Bakar Unspecified (Burn Injury)', category: 'Cedera & Trauma' },
];

export const ICD9_DATABASE: ICD9Item[] = [
  { code: '89.07', name: 'Konsultasi Dan Pemeriksaan Medis Umum', category: 'Pemeriksaan' },
  { code: '89.52', name: 'Elektrokardiogram (EKG 12 Lead)', category: 'Pemeriksaan' },
  { code: '88.76', name: 'Ultrasonografi Abdomen (USG Abdomen)', category: 'Radiologi' },
  { code: '87.44', name: 'Foto Rontgen Dada / Toraks (Chest X-Ray)', category: 'Radiologi' },
  { code: '87.03', name: 'CT Scan Kepala (Brain CT Scan)', category: 'Radiologi' },

  { code: '38.93', name: 'Pemasangan Kanula Vena Perifer (Infus IV)', category: 'Tindakan Medis' },
  { code: '96.04', name: 'Intubasi Endotrakeal (Endotracheal Intubation)', category: 'Gawat Darurat' },
  { code: '96.71', name: 'Ventilasi Mekanikal Kontinu < 96 Jam', category: 'Gawat Darurat' },
  { code: '99.18', name: 'Injeksi / Infusi Elektrolit & Cairan Resusitasi', category: 'Tindakan Medis' },
  { code: '99.21', name: 'Injeksi Antibiotik IV / IM', category: 'Tindakan Medis' },
  { code: '99.29', name: 'Injeksi Obat Lainnya (Analgesik/Antiemetik)', category: 'Tindakan Medis' },
  { code: '93.94', name: 'Terapi Nebuliser / Inhalasi', category: 'Respirasi' },
  { code: '96.52', name: 'Irigasi & Pembersihan Saluran Napas / Suction', category: 'Respirasi' },

  { code: '86.22', name: 'Debridement Luka / Pembersihan Luka Jahit', category: 'Bedah & Luka' },
  { code: '86.59', name: 'Penjahitan Luka Kulit & Jaringan Subkutan (Hecting)', category: 'Bedah & Luka' },
  { code: '93.57', name: 'Pemasangan Balut Tekan / Rawat Luka', category: 'Bedah & Luka' },
  { code: '93.53', name: 'Pemasangan Gips / Spalk Imobilisasi', category: 'Trauma' },

  { code: '96.6', name: 'Pemasangan NGT (Nasogastric Tube)', category: 'Tindakan Medis' },
  { code: '57.94', name: 'Pemasangan Kateter Urine (Foley Catheter)', category: 'Tindakan Medis' },
  { code: '99.04', name: 'Transfusi Sel Darah Merah (PRC)', category: 'Tindakan Medis' },
  { code: '47.09', name: 'Apendektomi (Operasi Apendiks)', category: 'Bedah Sentral' },
  { code: '74.1', name: 'Sectio Caesarea (Operasi Caesar)', category: 'Bedah Sentral' },
];

export function searchICD10(query?: string): ICD10Item[] {
  if (!query || !query.trim()) return ICD10_DATABASE.slice(0, 15);
  const q = query.trim().toLowerCase();
  return ICD10_DATABASE.filter(
    (item) =>
      item.code.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
  );
}

export function searchICD9(query?: string): ICD9Item[] {
  if (!query || !query.trim()) return ICD9_DATABASE.slice(0, 15);
  const q = query.trim().toLowerCase();
  return ICD9_DATABASE.filter(
    (item) =>
      item.code.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
  );
}

export default ICD10_DATABASE;
