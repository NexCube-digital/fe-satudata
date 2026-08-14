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
    title: "Persetujuan Pasien",
    text: "Notifikasi masuk ke dashboard pasien. Setujui atau tolak izin akses dalam satu sentuhan.",
  },
  {
    step: "04",
    title: "Smart Contract Log",
    text: "Audit trail transaksi terekam permanen secara transparan di jaringan Sepolia Testnet.",
  },
];
