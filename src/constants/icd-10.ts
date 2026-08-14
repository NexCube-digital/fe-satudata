export interface ICD10Item {
  code: string;
  name: string;
  category: string;
}

export const ICD10_DATABASE: ICD10Item[] = [
  { code: "A09", name: "Diare dan Gastroenteritis Oleh Penyebab Infeksi Toksik", category: "Penyakit Infeksi" },
  { code: "A01.0", name: "Tifoid / Demam Tifoid (Typhoid Fever)", category: "Penyakit Infeksi" },
  { code: "A91", name: "Demam Berdarah Dengue (Dengue Hemorrhagic Fever - DHF)", category: "Penyakit Infeksi" },
  { code: "A90", name: "Demam Dengue (Dengue Fever - DF)", category: "Penyakit Infeksi" },
  { code: "B34.9", name: "Infeksi Virus Tanpa Spesifikasi (Viral Infection NOS)", category: "Penyakit Infeksi" },
  { code: "U07.1", name: "COVID-19, Virus Teridentifikasi", category: "Penyakit Infeksi" },
  
  { code: "E11.9", name: "Diabetes Melitus Tipe 2 Tanpa Komplikasi", category: "Endokrin & Metabolik" },
  { code: "E11.65", name: "Diabetes Melitus Tipe 2 dengan Hiperglikemia", category: "Endokrin & Metabolik" },
  { code: "E10.9", name: "Diabetes Melitus Tipe 1 Tanpa Komplikasi", category: "Endokrin & Metabolik" },
  { code: "E78.5", name: "Hiperlipidemia Tanpa Spesifikasi", category: "Endokrin & Metabolik" },
  { code: "E05.9", name: "Tirotoksikosis / Hipertiroidisme", category: "Endokrin & Metabolik" },

  { code: "I10", name: "Hipertensi Esensial (Primer)", category: "Kardiovaskular" },
  { code: "I11.9", name: "Penyakit Jantung Hipertensi Tanpa Gagal Jantung", category: "Kardiovaskular" },
  { code: "I20.9", name: "Angina Pektoris Unspecified", category: "Kardiovaskular" },
  { code: "I21.9", name: "Infar Miokard Akut (Acute Myocardial Infarction - AMI)", category: "Kardiovaskular" },
  { code: "I50.9", name: "Gagal Jantung Tanpa Spesifikasi (Heart Failure)", category: "Kardiovaskular" },
  { code: "I64", name: "Stroke, Tidak Diberitahukan Sebagai Perdarahan Atau Infark", category: "Kardiovaskular" },

  { code: "J00", name: "Nasofaringitis Akut (Flu Biasa / Common Cold)", category: "Respirasi" },
  { code: "J02.9", name: "Faringitis Akut Tanpa Spesifikasi", category: "Respirasi" },
  { code: "J03.9", name: "Tonsilitis Akut Tanpa Spesifikasi", category: "Respirasi" },
  { code: "J06.9", name: "Infeksi Saluran Napas Atas Akut (ISPA)", category: "Respirasi" },
  { code: "J18.9", name: "Pneumonia Tanpa Spesifikasi", category: "Respirasi" },
  { code: "J20.9", name: "Bronkitis Akut Tanpa Spesifikasi", category: "Respirasi" },
  { code: "J45.909", name: "Asma Bronkial Unspecified", category: "Respirasi" },

  { code: "K21.9", name: "Gastro-Esophageal Reflux Disease (GERD)", category: "Pencernaan" },
  { code: "K29.7", name: "Gastritis Tanpa Spesifikasi", category: "Pencernaan" },
  { code: "K30", name: "Dispepsia (Dispepsia)", category: "Pencernaan" },
  { code: "K35.8", name: "Apendisitis Akut Lain Dan Tanpa Spesifikasi", category: "Pencernaan" },

  { code: "M54.5", name: "Nyeri Punggung Bawah (Low Back Pain - LBP)", category: "Muskuloskeletal" },
  { code: "M79.1", name: "Mialgia (Nyeri Otot)", category: "Muskuloskeletal" },
  { code: "M10.9", name: "Gout Tanpa Spesifikasi (Asam Urat)", category: "Muskuloskeletal" },

  { code: "R50.9", name: "Demam Tanpa Spesifikasi", category: "Gejala Umum" },
  { code: "R51", name: "Sakit Kepala (Headache)", category: "Gejala Umum" },
  { code: "R42", name: "Dizziness and Giddiness (Pusing / Vertigo)", category: "Gejala Umum" },
  { code: "R05", name: "Batuk (Cough)", category: "Gejala Umum" },
  { code: "R11", name: "Mual dan Muntah (Nausea and Vomiting)", category: "Gejala Umum" }
];
