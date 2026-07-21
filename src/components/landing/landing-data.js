export const heroMetrics = [
  { value: "100% Aman", label: "Terdekripsi & Audit Trail Blockchain" },
  { value: "Sub-Detik", label: "Waktu Akses & Verifikasi Izin" },
  { value: "Satu Identitas", label: "Koneksi NIK & Wallet Address" },
];

export const capabilities = [
  {
    icon: "kontrol",
    title: "Kontrol Penuh (Sovereign Consent)",
    text: "Pasien memegang kendali mutlak atas siapa yang berhak melihat rekam medis mereka. Berikan izin akses secara granular secara real-time.",
  },
  {
    icon: "enkripsi",
    title: "Enkripsi Off-chain AES-256",
    text: "Rekam medis asli dienkripsi kuat secara off-chain di database MySQL. Hanya pihak terotorisasi yang dapat membaca datanya.",
  },
  {
    icon: "gas",
    title: "Sharing Gas Fee",
    text: "Biaya gas transaksi blockchain disubsidi penuh oleh Rumah Sakit via Meta-Transaction. Pasien melakukan approval 100% gratis.",
  },
  {
    icon: "revoke",
    title: "Mekanisme Revoke Instan",
    text: "Cabut izin akses dokter seketika dari dashboard Anda. Sekali dicabut, data otomatis kembali terkunci dan terenkripsi.",
  },
];

export const workflowSteps = [
  {
    step: "01",
    title: "Registrasi Pasien",
    text: "Hubungkan identitas NIK resmi Anda dan tautkan dengan MetaMask Wallet secara aman.",
  },
  {
    step: "02",
    title: "Request Akses Medis",
    text: "Dokter atau Faskes mengajukan permintaan izin rekam medis digital melalui sistem HIS terintegrasi.",
  },
  {
    step: "03",
    title: "Approve Transaksi",
    text: "Pasien menerima notifikasi real-time di dompet MetaMask dan menandatangani izin akses secara digital.",
  },
  {
    step: "04",
    title: "Dekripsi Data Medis",
    text: "Sistem membaca persetujuan blockchain dan mendekripsi data rekam medis terstruktur untuk dokter.",
  },
];

export const audienceData = {
  patient: {
    label: "Portal Pasien",
    accent: "from-[#7F1D1D] via-[#A61B2D] to-[#4C0B14]",
    checklist: [
      "Kelola izin akses per rumah sakit secara granular",
      "Pantau riwayat akses rekam medis secara real-time",
      "Cabut izin dengan revoke instan dari dashboard",
    ],
  },
  hospital: {
    label: "Portal RS / Faskes",
    accent: "from-[#7F1D1D] via-[#A61B2D] to-[#6D0D24]",
    checklist: [
      "Ajukan permintaan akses data pasien dengan NIK",
      "Pantau status persetujuan pasien secara langsung",
      "Kelola billing dan simulasi transaksi layanan",
    ],
  },
};

export const faqQuestions = [
  {
    id: 1,
    category: "web3",
    categoryLabel: "Web3 & Blockchain",
    question: "Apakah data rekam medis saya disimpan secara langsung di dalam blockchain?",
    answer: "Tidak. Blockchain (Hardhat/Solidity) hanya menyimpan metadata akses (Access Control List) dan log audit trail. Rekam medis asli yang terenkripsi AES-256 disimpan secara off-chain di database MySQL aman (Express.js/XAMPP) untuk menghemat biaya gas dan menjamin kerahasiaan sesuai standar privasi medis global."
  },
  {
    id: 2,
    category: "web3",
    categoryLabel: "Web3 & Blockchain",
    question: "Bagaimana mekanisme gas fee bekerja? Apakah pasien harus membayar setiap kali memberikan izin?",
    answer: "Tidak. Platform kami menerapkan pola Meta-Transactions (EIP-2771 / Gasless Transactions). Pasien hanya perlu menandatangani pesan (cryptographic signature) secara gratis di MetaMask. Biaya gas fee (gas-sharing) akan ditanggung sepenuhnya oleh Rumah Sakit atau Faskes yang mengajukan permohonan akses data."
  },
  {
    id: 3,
    category: "privasi",
    categoryLabel: "Keamanan & Privasi",
    question: "Seberapa aman penyimpanan terenkripsi AES-256 di database MySQL?",
    answer: "Sangat aman. Database MySQL bertindak sebagai cold storage untuk berkas terenkripsi. Tanpa kunci privat pasien dan otorisasi dari smart contract blockchain, data di MySQL hanyalah sandi acak (ciphertext) AES-256 yang tidak dapat dibaca oleh administrator database sekalipun."
  },
  {
    id: 4,
    category: "pasien",
    categoryLabel: "Panduan Pasien",
    question: "Apa yang terjadi jika saya secara tidak sengaja memberikan hak akses ke faskes yang salah?",
    answer: "Anda dapat menggunakan fitur Revoke Instan kapan saja dari Portal Pasien. Dengan memanggil fungsi revokeAccess(), transaksi akan dikirim untuk membatalkan hak akses faskes tersebut seketika. Sistem off-chain akan menolak pengiriman kunci dekripsi ke faskes tersebut mulai detik itu juga."
  },
  {
    id: 5,
    category: "pasien",
    categoryLabel: "Panduan Pasien",
    question: "Bagaimana cara menghubungkan dompet MetaMask dengan NIK terdaftar saya?",
    answer: "Anda cukup melakukan login ke Portal Pasien, buka menu Pengaturan Akun & Dompet, lalu klik tombol 'Tautkan MetaMask Wallet'. Sistem akan meminta tanda tangan digital (personal_sign) untuk memverifikasi kepemilikan dompet tanpa memotong saldo ETH Anda."
  },
  {
    id: 6,
    category: "faskes",
    categoryLabel: "Integrasi Faskes & API",
    question: "Bagaimana fasilitas kesehatan (Rumah Sakit/Klinik) mengintegrasikan sistem HIS lokal dengan SatuData?",
    answer: "Faskes dapat mendaftarkan akun di Portal Faskes, mendapatkan lisensi verifikasi admin, dan menggunakan REST API SATUSEHAT v2.5 / Web3 SDK terintegrasi kami. Faskes dapat mengajukan request izin baca rekam medis menggunakan NIK pasien secara otomatis."
  },
  {
    id: 7,
    category: "privasi",
    categoryLabel: "Keamanan & Privasi",
    question: "Apakah platform SatuData sudah memenuhi Regulasi UU PDP No. 27 Tahun 2022?",
    answer: "Ya, 100% sesuai. Prinsip kedaulatan data (Data Sovereignty) di UU PDP diwujudkan secara utuh: Pasien sebagai Pengendali Data Medis (Data Controller), Faskes sebagai Pemproses Data (Data Processor), dan setiap aktivitas akses tercatat transparan di Immutable Audit Trail Blockchain."
  }
];