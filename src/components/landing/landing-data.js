export const heroMetrics = [
  { value: "100% Aman", label: "Terenskripsi & Audit Trail Blockchain" },
  { value: "Sub-Detik", label: "Waktu Akses & Verifikasi Izin" },
  { value: "Satu Identitas", label: "Koneksi NIK & Wallet Address" },
];

export const capabilities = [
  {
    icon: "shield",
    title: "Granular Patient Consent",
    text: "Pasien memegang kendali penuh atas siapa yang boleh melihat rekam medis mereka. Berikan atau cabut izin akses dalam satu ketukan secara real-time.",
  },
  {
    icon: "workflow",
    title: "Satu Rekam Medis (EHR)",
    text: "Satukan riwayat diagnosis, hasil laboratorium, resep obat, dan kunjungan antar-rumah sakit dalam satu linimasa terpadu tanpa fragmentasi data.",
  },
  {
    icon: "audit",
    title: "Kepatuhan & Keamanan Hukum",
    text: "Semua riwayat pengajuan, persetujuan, dan pengunggahan dokumen kesehatan dicatat permanen dalam ledger blockchain untuk audit hukum yang sah.",
  },
];

export const workflowSteps = [
  {
    step: "01",
    title: "Pasien Menghubungkan NIK & Dompet",
    text: "Pasien mengautentikasi identitas resmi mereka menggunakan platform SatuData terdesentralisasi.",
  },
  {
    step: "02",
    title: "Rumah Sakit Meminta Akses Medis",
    text: "Saat pasien berobat, dokter/petugas medis mengajukan permintaan akses rekam medis melalui sistem HIS terintegrasi.",
  },
  {
    step: "03",
    title: "Verifikasi Consent Instan",
    text: "Pasien mendapatkan notifikasi pop-up dan menandatangani izin akses secara instan melalui panel dasbor mereka.",
  },
  {
    step: "04",
    title: "Pertukaran Data Aman & Audit Trail",
    text: "Sistem membuka dekripsi data EHR pasien untuk dokter, lalu mencatat tanda waktu transaksi ke dalam log blockchain.",
  },
];

export const audienceData = {
  patient: {
    label: "Portal Pasien Digital",
    title: "Akses riwayat medis dan kelola izin dokter Anda kapan saja, di mana saja.",
    description:
      "Panel yang didesain intuitif untuk pasien. Tinjau riwayat penyakit, unduh hasil laboratorium, serta berikan persetujuan akses darurat secara real-time.",
    accent: "from-rose-500 via-red-500 to-rose-700",
    stats: [
      { value: "Aktif", label: "Status Consent Anda" },
      { value: "03 Faskes", label: "Tautan Faskes Aktif" },
      { value: "100%", label: "Kontrol Kepemilikan" },
    ],
    cards: [
      {
        title: "Riwayat Kesehatan Kronologis",
        text: "Semua riwayat alergi, diagnosis dokter, dan resep dirangkum dalam bentuk linimasa interaktif yang mudah dibaca.",
      },
      {
        title: "Manajemen Izin (Consent)",
        text: "Lihat daftar rumah sakit atau dokter yang sedang memiliki hak akses aktif, dan cabut izin mereka secara instan jika sudah selesai.",
      },
      {
        title: "Notifikasi Akses Instan",
        text: "Dapatkan pemberitahuan langsung ke perangkat Anda setiap kali ada faskes yang mencoba mengajukan permintaan baca rekam medis.",
      },
    ],
    checklist: [
      "Kontrol consent satu ketukan",
      "Linimasa rekam medis kronologis terpadu",
      "Unduh dokumen medis terenkripsi PDF",
    ],
  },
  hospital: {
    label: "Portal Manajemen Rumah Sakit",
    title: "Integrasi HIS modern dengan penagihan layanan (POS) dan request rekam medis.",
    description:
      "Memudahkan administrasi rumah sakit dan klinisi untuk mengajukan permohonan rekam medis pasien eksternal secara legal serta mencatat billing kasir secara langsung.",
    accent: "from-red-600 via-rose-600 to-red-800",
    stats: [
      { value: "Sub-Detik", label: "Kecepatan Tarik Data" },
      { value: "99.99%", label: "Ketersediaan Server API" },
      { value: "Terintegrasi", label: "Sesuai Standar SATUSEHAT" },
    ],
    cards: [
      {
        title: "Request Rekam Medis Eksternal",
        text: "Ajukan permohonan akses data pasien secara formal dengan tujuan medis yang terklasifikasi demi perlindungan data pribadi.",
      },
      {
        title: "Kasir Medis & POS Kas",
        text: "Kelola pendaftaran kunjungan pasien, tagihan obat, dan tindakan operasional harian dalam satu alur kerja front desk.",
      },
      {
        title: "Log Audit Kepatuhan",
        text: "Setiap data medis yang diunduh atau diubah secara otomatis tercatat dengan tanda tangan digital dokter penanggung jawab.",
      },
    ],
    checklist: [
      "Sistem Kasir (Point of Sale) Terpadu",
      "Form Pengajuan Izin Akses Rekam Medis",
      "Integrasi API SATUSEHAT & HL7 FHIR",
    ],
  },
};