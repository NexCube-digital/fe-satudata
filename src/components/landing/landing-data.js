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
    accent: "from-rose-500 via-pink-500 to-amber-400",
    checklist: [
      "Kelola izin akses per rumah sakit secara granular",
      "Pantau riwayat akses rekam medis secara real-time",
      "Cabut izin dengan revoke instan dari dashboard",
    ],
  },
  hospital: {
    label: "Portal RS / Faskes",
    accent: "from-sky-500 via-cyan-500 to-emerald-400",
    checklist: [
      "Ajukan permintaan akses data pasien dengan NIK",
      "Pantau status persetujuan pasien secara langsung",
      "Kelola billing dan simulasi transaksi layanan",
    ],
  },
};

export const faqQuestions = [
  {
    question: "Apakah data rekam medis saya disimpan secara langsung di dalam blockchain?",
    answer: "Tidak. Blockchain (Hardhat/Solidity) hanya menyimpan metadata akses (Access Control List) dan log audit trail. Rekam medis asli yang terenkripsi AES-256 disimpan secara off-chain di database MySQL aman (Express.js/XAMPP) untuk menghemat biaya gas dan menjamin kerahasiaan sesuai standar privasi medis global."
  },
  {
    question: "Bagaimana mekanisme gas fee bekerja? Apakah pasien harus membayar setiap kali memberikan izin?",
    answer: "Tidak. Platform kami menerapkan pola Meta-Transactions (EIP-2771 / Gasless Transactions). Pasien hanya perlu menandatangani pesan (cryptographic signature) secara gratis di MetaMask. Biaya gas fee (gas-sharing) akan ditanggung sepenuhnya oleh Rumah Sakit atau Faskes yang mengajukan permohonan akses data."
  },
  {
    question: "Seberapa aman database MySQL lokal (XAMPP) dalam arsitektur hybrid ini?",
    answer: "Sangat aman. Database MySQL bertindak sebagai cold storage untuk berkas terenkripsi. Tanpa kunci privat pasien dan otorisasi dari smart contract blockchain, data di MySQL hanyalah sandi acak (ciphertext) AES-256 yang tidak dapat dibaca oleh administrator database sekalipun."
  },
  {
    question: "Apa yang terjadi jika saya secara tidak sengaja memberikan hak akses ke faskes yang salah?",
    answer: "Anda dapat menggunakan fitur Revoke Instan kapan saja. Dengan memanggil fungsi revokeAccess(), MetaMask Anda akan mengirimkan transaksi untuk membatalkan hak akses faskes tersebut seketika. Sistem off-chain akan menolak pengiriman kunci dekripsi ke faskes tersebut mulai detik itu juga."
  }
];