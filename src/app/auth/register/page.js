"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Mail, 
  Lock, 
  User, 
  Building2, 
  AlertCircle, 
  Loader, 
  ArrowRight, 
  CheckCircle2, 
  Home,
  Eye,
  EyeOff,
  Zap,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Check,
  Sparkles
} from "lucide-react";
import { apiPost } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Choose Role, 2: Form Input
  const [role, setRole] = useState("pasien");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isContractAccepted, setIsContractAccepted] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [hasReadContract, setHasReadContract] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Essential Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nik, setNik] = useState("");

  // Faskes specific essential fields
  const [hospitalType, setHospitalType] = useState("umum");
  const [ownership, setOwnership] = useState("swasta");

  // Feedback State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSelectRole = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleNextStep2 = () => {
    setError("");
    if (role === "pasien") {
      if (!nik || nik.length !== 16) {
        setError("NIK harus berupa 16 digit angka.");
        return;
      }
      if (!name.trim()) {
        setError("Nama lengkap pasien harus diisi.");
        return;
      }
      if (!email || !email.includes("@")) {
        setError("Masukkan alamat email yang valid.");
        return;
      }
    } else if (role === "rumah_sakit") {
      if (!name.trim()) {
        setError("Nama fasilitas kesehatan / RS harus diisi.");
        return;
      }
      if (!email || !email.includes("@")) {
        setError("Masukkan alamat email yang valid.");
        return;
      }
    }
    setStep(3);
  };

  const openContractModal = () => {
    setHasReadContract(false);
    setShowContractModal(true);
  };

  const handleScrollContract = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop - clientHeight <= 8) {
      setHasReadContract(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!password || password.length < 8) {
      setError("Password minimal harus 8 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok dengan password.");
      return;
    }

    if (!isContractAccepted) {
      setError("Anda harus menyetujui Kontrak Digital SatuData sebelum mendaftar.");
      return;
    }

    setLoading(true);

    try {
      let payload = {
        role,
        name,
        email,
        password,
      };

      if (role === "pasien") {
        payload.nik = nik || undefined;
      } else if (role === "rumah_sakit") {
        payload.hospital_type = hospitalType;
        payload.ownership = ownership;
      }

      const result = await apiPost("/api/auth/register", payload);

      if (result.success) {
        setShowSuccessModal(true);
      }
    } catch (err) {
      setError(err.message || "Registrasi gagal, periksa kembali kelengkapan data Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen w-full lg:overflow-hidden flex flex-col lg:flex-row bg-slate-50">
      {/* Left Side - Hero Description Panel with Background Image */}
      <div className="hidden lg:flex lg:w-1/2 h-full relative p-12 flex-col justify-between overflow-hidden text-white shrink-0">
        {/* Background Image */}
        <Image
          src="/images/login.jpg"
          alt="Register Background"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover object-center"
        />

        {/* Gradient Maroon Overlay - Thinner Transparency */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#7F1D1D]/60 via-[#A61B2D]/45 to-[#4C0B14]/70" />

        {/* Decorative Light Glows */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-rose-500 blur-3xl" />
          <div className="absolute bottom-0 right-10 w-96 h-96 rounded-full bg-red-600 blur-3xl" />
        </div>

        {/* Top Logo & Brand Header */}
        <div className="relative z-10">
          <Link href="/" className="group flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-md">
              <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                <Image
                  src="/images/logo.png"
                  alt="Satu Data logo"
                  width={40}
                  height={40}
                  className="h-full w-full object-contain"
                />
              </span>
            </span>
            <div>
              <div className="text-xl font-extrabold text-white tracking-wider">Satu Data</div>
              <div className="text-xs text-white/80 font-medium">Healthcare Hub v2026</div>
            </div>
          </Link>
        </div>

        {/* Main Hero Content */}
        <div className="relative z-10 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3.5 py-1 text-xs font-semibold text-rose-200 backdrop-blur-md mb-4">
              <Zap className="h-3.5 w-3.5 text-rose-300" />
              Platform Integritas Rekam Medis Indonesia
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 leading-tight text-white tracking-tight">
              Kedaulatan Rekam Medis Digital
            </h1>
            <p className="text-sm text-white/90 leading-relaxed max-w-md font-medium">
              Bergabunglah dengan ekosistem kesehatan terintegrasi SATUSEHAT & Web3 Sovereign Blockchain. Pasien sebagai pemilik data sah, Faskes sebagai pemproses terverifikasi.
            </p>
          </div>

          <div className="space-y-3.5 pt-2">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white text-xs font-bold shadow-xs">✓</span>
              <div>
                <h4 className="text-xs font-extrabold text-white">100% Hak Akses Pasien</h4>
                <p className="text-[11px] text-white/80">Kontrol penuh izin lewat Smart Contract Hardhat</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white text-xs font-bold shadow-xs">✓</span>
              <div>
                <h4 className="text-xs font-extrabold text-white">Enkripsi Off-Chain AES-256</h4>
                <p className="text-[11px] text-white/80">Standar tinggi privasi & keamanan data medis</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white text-xs font-bold shadow-xs">✓</span>
              <div>
                <h4 className="text-xs font-extrabold text-white">Immutable Audit Trail</h4>
                <p className="text-[11px] text-white/80">Catatan riwayat terenkripsi bagi Faskes & Klinik</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-white/80 font-medium">
          © 2026 SatuData Healthcare Hub. Kemenkes & Web3 Compliant.
        </div>
      </div>

      {/* Right Side - Form Container */}
      <div className="w-full lg:w-1/2 min-h-screen lg:h-full flex flex-col justify-between p-4 sm:p-6 lg:p-10 overflow-y-auto lg:overflow-hidden bg-slate-50">
        <div className="w-full max-w-xl mx-auto flex flex-col flex-1 lg:h-full justify-center space-y-4 py-4 lg:py-0">
          
          {/* Fixed Top Header & Navigation */}
          <div className="shrink-0 flex items-center justify-between">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs font-bold transition shadow-2xs"
            >
              <Home className="h-4 w-4 text-[#7F1D1D]" />
              <span>Beranda</span>
            </Link>
          </div>

          {/* STEP 1: ROLE SELECTION SCREEN */}
          {step === 1 && (
            <div className="flex-1 lg:min-h-0 flex flex-col justify-between bg-white rounded-3xl border border-slate-200/90 shadow-xl p-4 sm:p-8 space-y-4 sm:space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              {/* Background ambient lighting */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* Header Info */}
              <div className="relative z-10 text-center space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200/80 text-[11px] font-extrabold text-[#7F1D1D] shadow-2xs">
                  <Sparkles className="h-3.5 w-3.5 text-rose-600 animate-pulse" /> Langkah 1 dari 2: Pilih Peran Pengguna
                </span>
                <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Selamat Datang di SatuData
                </h2>
                <p className="text-[11px] sm:text-sm text-slate-500 max-w-md mx-auto font-medium leading-relaxed">
                  Pilih kategori pendaftaran akun Anda untuk penyesuaian hak akses & fitur sistem.
                </p>
              </div>

              {/* Selection Cards Grid */}
              <div className="relative z-10 grid gap-3 sm:grid-cols-2 my-auto">
                {/* Option 1: Pasien Baru */}
                <button
                  type="button"
                  onClick={() => handleSelectRole("pasien")}
                  className="group relative flex flex-col justify-between p-4 sm:p-7 rounded-3xl border-2 border-rose-100 hover:border-[#7F1D1D] bg-gradient-to-b from-rose-50/40 via-white to-white hover:from-rose-100/50 hover:to-white text-left transition-all duration-300 hover:shadow-xl cursor-pointer hover:-translate-y-1"
                >
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br from-rose-500 to-[#7F1D1D] text-white flex items-center justify-center shadow-md shadow-rose-900/20 group-hover:scale-110 transition-transform duration-300">
                        <User className="h-5 w-5 sm:h-7 sm:w-7" />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-rose-800 bg-rose-100 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
                        Personal
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base sm:text-xl font-extrabold text-slate-900 mb-1 sm:mb-1.5 group-hover:text-[#7F1D1D] transition-colors">
                        Pasien Baru
                      </h3>
                      <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed font-medium">
                        Dapatkan kontrol penuh, transparansi & kedaulatan atas data rekam medis terenkripsi Anda.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-6 flex items-center justify-between pt-3 sm:pt-4 border-t border-rose-100/80 text-[11px] sm:text-xs font-extrabold text-[#7F1D1D]">
                    <span>Daftar Sebagai Pasien</span>
                    <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-rose-100 group-hover:bg-[#7F1D1D] group-hover:text-white flex items-center justify-center transition-colors">
                      <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </button>

                {/* Option 2: Fasilitas Kesehatan (Faskes / RS) */}
                <button
                  type="button"
                  onClick={() => handleSelectRole("rumah_sakit")}
                  className="group relative flex flex-col justify-between p-4 sm:p-7 rounded-3xl border-2 border-emerald-100 hover:border-emerald-600 bg-gradient-to-b from-emerald-50/40 via-white to-white hover:from-emerald-100/50 hover:to-white text-left transition-all duration-300 hover:shadow-xl cursor-pointer hover:-translate-y-1"
                >
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center shadow-md shadow-emerald-900/20 group-hover:scale-110 transition-transform duration-300">
                        <Building2 className="h-5 w-5 sm:h-7 sm:w-7" />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
                        Instansi / RS
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base sm:text-xl font-extrabold text-slate-900 mb-1 sm:mb-1.5 group-hover:text-emerald-800 transition-colors">
                        Fasilitas Kesehatan
                      </h3>
                      <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed font-medium">
                        Daftarkan Rumah Sakit, Klinik, atau Faskes Anda untuk terintegrasi dengan SATUSEHAT API.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-6 flex items-center justify-between pt-3 sm:pt-4 border-t border-emerald-100/80 text-[11px] sm:text-xs font-extrabold text-emerald-800">
                    <span>Daftar Sebagai Faskes / RS</span>
                    <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-emerald-100 group-hover:bg-emerald-700 group-hover:text-white flex items-center justify-center transition-colors">
                      <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </button>
              </div>

              {/* Footer info */}
              <div className="relative z-10 text-center text-xs text-slate-400 font-medium">
                Pilihan peran dapat diubah sewaktu-waktu sebelum form dikirimkan.
              </div>
            </div>
          )}

          {/* STEP 2 & 3: STREAMLINED FORM INPUT */}
          {(step === 2 || step === 3) && (
            <div className="flex-1 lg:min-h-0 flex flex-col bg-white rounded-3xl border border-slate-200/90 shadow-xl lg:overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              {/* Form Title Header (Fixed) */}
              <div className="shrink-0 p-5 sm:px-7 sm:pt-6 sm:pb-4 border-b border-slate-100 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="inline-flex items-center gap-1 text-xs font-extrabold text-slate-500 hover:text-[#7F1D1D] cursor-pointer transition"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>{step === 2 ? "Ubah Peran Pendaftaran" : "Ubah Informasi Utama"}</span>
                  </button>

                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 uppercase border border-slate-200">
                    Langkah {step} dari 3
                  </span>
                </div>

                <h2 className="text-xl font-extrabold text-slate-900">
                  {step === 2 
                    ? (role === "pasien" ? "Formulir Pendaftaran Pasien" : "Formulir Registrasi Faskes / RS")
                    : (role === "pasien" ? "Buat Kata Sandi Pasien" : "Buat Kata Sandi Faskes")}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  {step === 2 
                    ? (role === "pasien" 
                      ? "Isi data utama Anda di bawah ini. Data pendukung lainnya dapat dilengkapi nanti di Pengaturan." 
                      : "Isi data utama instansi Anda di bawah ini. Informasi pendukung dapat diperbarui nanti.")
                    : "Tentukan kata sandi yang kuat untuk mengamankan akses akun SatuData Anda."}
                </p>
              </div>

              {/* Inner Scrollable Form Body */}
              <form onSubmit={handleSubmit} className="flex-1 lg:overflow-y-auto p-5 sm:px-7 space-y-4 lg:min-h-0">
                {error && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-700 font-semibold animate-in fade-in duration-150">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-800 font-bold animate-in fade-in duration-150">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                    <span>{success}</span>
                  </div>
                )}

                {/* PASIEN STREAMLINED FORM FIELDS (STEP 2) */}
                {role === "pasien" && step === 2 && (
                  <div className="space-y-4">
                    {/* 1. NIK Pasien */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        1. NIK Pasien (16 Digit) *
                      </label>
                      <input
                        type="text"
                        value={nik}
                        onChange={(e) => setNik(e.target.value.replace(/\D/g, ""))}
                        placeholder="Masukkan 16 digit NIK Anda"
                        maxLength={16}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#7F1D1D] focus:ring-2 focus:ring-[#7F1D1D]/20 outline-none transition text-xs font-mono font-medium"
                        required
                      />
                    </div>

                    {/* 2. Nama Lengkap Pasien */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        2. Nama Lengkap Pasien *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z\s.,']/g, ""))}
                          placeholder="Masukkan nama lengkap Anda"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#7F1D1D] focus:ring-2 focus:ring-[#7F1D1D]/20 outline-none transition text-xs font-medium"
                          required
                        />
                      </div>
                    </div>

                    {/* 3. Email Aktif */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        3. Email Aktif *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value.toLowerCase().trim())}
                          autoCapitalize="none"
                          autoCorrect="off"
                          spellCheck="false"
                          placeholder="Masukkan alamat email aktif Anda"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#7F1D1D] focus:ring-2 focus:ring-[#7F1D1D]/20 outline-none transition text-xs font-medium lowercase"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* RUMAH SAKIT STREAMLINED FORM FIELDS (STEP 2) */}
                {role === "rumah_sakit" && step === 2 && (
                  <div className="space-y-4">
                    {/* 1. Nama Fasilitas Kesehatan */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        1. Nama Fasilitas Kesehatan / RS *
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z0-9\s.,'()\-]/g, ""))}
                          placeholder="Masukkan nama fasilitas kesehatan / RS Anda"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#7F1D1D] focus:ring-2 focus:ring-[#7F1D1D]/20 outline-none transition text-xs font-medium"
                          required
                        />
                      </div>
                    </div>

                    {/* 2. Tipe Fasilitas Kesehatan */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        2. Tipe Fasilitas Kesehatan *
                      </label>
                      <select
                        value={hospitalType}
                        onChange={(e) => setHospitalType(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#7F1D1D] focus:ring-2 focus:ring-[#7F1D1D]/20 outline-none transition text-xs font-medium cursor-pointer"
                      >
                        <option value="umum">Rumah Sakit Umum</option>
                        <option value="khusus">Rumah Sakit Khusus</option>
                        <option value="klinik">Klinik Utama / Pratama</option>
                      </select>
                    </div>

                    {/* 3. Email Aktif */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        3. Email Aktif *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value.toLowerCase().trim())}
                          autoCapitalize="none"
                          autoCorrect="off"
                          spellCheck="false"
                          placeholder="Masukkan alamat email aktif instansi Anda"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#7F1D1D] focus:ring-2 focus:ring-[#7F1D1D]/20 outline-none transition text-xs font-medium lowercase"
                          required
                        />
                      </div>
                    </div>

                    {/* 4. Kepemilikan */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        4. Kepemilikan Faskes *
                      </label>
                      <select
                        value={ownership}
                        onChange={(e) => setOwnership(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#7F1D1D] focus:ring-2 focus:ring-[#7F1D1D]/20 outline-none transition text-xs font-medium cursor-pointer"
                      >
                        <option value="swasta">Swasta</option>
                        <option value="pemerintah">Pemerintah</option>
                        <option value="bumn">BUMN</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* PASSWORD & CONFIRM PASSWORD (STEP 3) */}
                {step === 3 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    {/* Password */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Kata Sandi Akun *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Masukkan kata sandi (minimal 8 karakter)"
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-[#7F1D1D] focus:ring-2 focus:ring-[#7F1D1D]/20 outline-none transition text-xs font-medium"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none transition cursor-pointer"
                          aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Konfirmasi Kata Sandi *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Ulangi kata sandi Anda"
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-[#7F1D1D] focus:ring-2 focus:ring-[#7F1D1D]/20 outline-none transition text-xs font-medium"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none transition cursor-pointer"
                          aria-label={showConfirmPassword ? "Sembunyikan password" : "Tampilkan password"}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Digital Contract Checkbox */}
                    <div className="flex items-start gap-2.5 pt-2">
                      <input
                        type="checkbox"
                        id="contract-checkbox"
                        checked={isContractAccepted}
                        onChange={(e) => {
                          if (!isContractAccepted) {
                            openContractModal();
                          } else {
                            setIsContractAccepted(false);
                          }
                        }}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#7F1D1D] focus:ring-[#7F1D1D]/20 cursor-pointer"
                      />
                      <label htmlFor="contract-checkbox" className="text-xs text-slate-600 font-medium leading-relaxed select-none">
                        Saya menyetujui ketentuan{" "}
                        <button
                          type="button"
                          onClick={openContractModal}
                          className="text-[#7F1D1D] hover:underline font-bold focus:outline-none cursor-pointer"
                        >
                          Kontrak Digital SatuData
                        </button>{" "}
                        mengenai privasi rekam medis & keamanan data blockchain. *
                      </label>
                    </div>
                  </div>
                )}

                {/* Optional Info Banner */}
                {step === 2 && (
                  <div className="rounded-2xl bg-amber-50/80 border border-amber-200/80 p-3.5 text-xs text-amber-800 flex items-start gap-2.5 mt-4">
                    <Sparkles className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                    <p className="leading-relaxed text-[11px] font-semibold">
                      <strong>Catatan:</strong> Data pendukung lainnya (seperti Tempat/Tanggal Lahir, Alamat, No. Telepon, Lisensi Medis, Website, dll) bersifat <em>opsional</em> dan dapat Anda lengkapi kapan saja pada fitur <strong>Setting Akun</strong> setelah masuk.
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2">
                  {step === 2 ? (
                    <button
                      type="button"
                      onClick={handleNextStep2}
                      className="w-full flex items-center justify-center gap-2 bg-[#7F1D1D] hover:bg-[#A61B2D] text-white font-extrabold py-3.5 rounded-2xl transition cursor-pointer shadow-md hover:shadow-lg"
                    >
                      <span>Lanjut</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading || !isContractAccepted}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#7F1D1D] to-[#A61B2D] hover:from-[#A61B2D] hover:to-[#7F1D1D] text-white font-extrabold py-3.5 rounded-2xl transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                    >
                      {loading ? (
                        <>
                          <Loader className="h-4 w-4 animate-spin" />
                          Sedang Mendaftarkan Akun...
                        </>
                      ) : (
                        <>
                          <span>Daftar Akun</span>
                          <Check className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>

              {/* Form Footer */}
              <div className="shrink-0 p-3 sm:px-7 border-t border-slate-100 bg-slate-50/60 text-center text-xs text-slate-500 font-medium">
                Sudah memiliki akun terdaftar?{" "}
                <Link href="/auth/login" className="text-[#7F1D1D] hover:underline font-bold">
                  Masuk di sini
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Kontrak Digital Modal */}
      {showContractModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            {/* Modal Ambient Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
            
            {/* Header */}
            <div className="relative z-10 shrink-0 p-6 border-b border-slate-100 flex items-center gap-3 bg-white">
              <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-[#7F1D1D] flex items-center justify-center shadow-xs">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 leading-none">Kontrak Digital & Syarat Ketentuan</h3>
                <p className="text-xs text-slate-400 mt-1.5 font-medium">SatuData Healthcare Sovereign Hub v2026</p>
              </div>
            </div>

            {/* Scrollable Content */}
            <div 
              onScroll={handleScrollContract}
              className="relative z-10 flex-1 overflow-y-auto p-6 space-y-4 text-xs text-slate-600 leading-relaxed font-medium"
            >
              <p>
                Selamat datang di platform <strong>SatuData Healthcare Hub</strong>. Sebelum menyelesaikan proses registrasi, Anda wajib membaca, memahami, dan menyetujui poin-poin hukum dan ketentuan teknologi di bawah ini:
              </p>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-3">
                <h4 className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px]">1. Kedaulatan Data Pasien (Sovereignty)</h4>
                <p>
                  Seluruh data medis terenkripsi Anda di SatuData dikendalikan sepenuhnya oleh Anda sebagai pemilik data (untuk Pasien) atau diproses secara legal oleh Faskes terverifikasi (untuk Faskes). Sistem ini menggunakan mekanisme Web3 Smart Contract (Hardhat) di mana izin akses data (consent) hanya dapat diberikan, diubah, atau dicabut langsung oleh Pasien.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-3">
                <h4 className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px]">2. Enkripsi Off-Chain AES-256</h4>
                <p>
                  Untuk menjamin privasi maksimal, data rekam medis berukuran besar disimpan di tempat penyimpanan terenkripsi yang aman (off-chain) dengan algoritma enkripsi militer AES-256. Hanya hash data dan riwayat audit trails transaksi yang dipublikasikan ke jaringan blockchain.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-3">
                <h4 className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px]">3. Integrasi SATUSEHAT & Kemenkes RI</h4>
                <p>
                  SatuData mematuhi regulasi Kementerian Kesehatan Republik Indonesia dan standar interoperabilitas SATUSEHAT. Faskes wajib menjamin kebenaran dan validitas data rekam medis elektronik yang diunggah ke jaringan.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-3">
                <h4 className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px]">4. Pertanggungjawaban Akun</h4>
                <p>
                  Pengguna bertanggung jawab penuh atas kerahasiaan kata sandi dan private key (jika ada) yang diasosiasikan dengan akun terdaftar. Sistem SatuData tidak memiliki akses untuk memulihkan kata sandi yang hilang tanpa metode otentikasi email resmi yang valid.
                </p>
              </div>

              <p className="text-[10px] text-slate-400 italic">
                Dengan mengklik tombol "Setujui & Setuju Ketentuan" di bawah, Anda menyatakan tunduk secara hukum terhadap kontrak digital ini dan mengizinkan pemrosesan data rekam medis Anda sesuai kebijakan privasi SatuData.
              </p>
            </div>

            {/* Footer Actions */}
            <div className="relative z-10 shrink-0 p-5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsContractAccepted(false);
                    setShowContractModal(false);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs transition cursor-pointer"
                >
                  Batal
                </button>
                {!hasReadContract && (
                  <span className="text-[10px] text-amber-600 font-semibold animate-pulse hidden sm:inline">
                    * Gulir ke bawah untuk menyetujui
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsContractAccepted(true);
                  setShowContractModal(false);
                }}
                disabled={!hasReadContract}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7F1D1D] to-[#A61B2D] hover:from-[#A61B2D] hover:to-[#7F1D1D] text-white font-extrabold text-xs transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center gap-1.5"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Setujui & Setuju Ketentuan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-6 text-center animate-in zoom-in-95 duration-200">
            {/* Modal Ambient Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            
            {/* Animated Check/Mail Icon */}
            <div className="relative mx-auto h-16 w-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 shadow-sm border border-emerald-100 animate-bounce">
              <Mail className="h-8 w-8" />
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow-xs">✓</span>
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 mb-2">Registrasi Berhasil!</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium mb-4">
              Akun Anda telah berhasil dibuat. Kami telah mengirimkan tautan aktivasi akun ke email: <br />
              <strong className="text-slate-800 text-[13px] break-all">{email}</strong>
            </p>

            {/* Spam Folder Alert */}
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-left text-xs text-amber-800 space-y-1.5 mb-6">
              <div className="flex items-center gap-1.5 font-extrabold text-[11px] uppercase tracking-wider text-amber-900">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-700" />
                <span>Penting: Periksa Folder Spam</span>
              </div>
              <p className="leading-relaxed font-semibold">
                Jika email tidak ditemukan di Kotak Masuk utama Anda dalam 1-2 menit, harap periksa folder <strong>Spam</strong> atau <strong>Junk</strong>. Pastikan Anda membuka email tersebut dan menekan tombol <strong>"Aktifkan Akun"</strong> sebelum masuk.
              </p>
            </div>

            {/* Action button redirecting immediately */}
            <button
              type="button"
              onClick={() => {
                setShowSuccessModal(false);
                router.push("/auth/login");
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#7F1D1D] hover:bg-[#A61B2D] text-white font-extrabold py-3.5 rounded-2xl transition cursor-pointer shadow-md hover:shadow-lg"
            >
              <span>Lanjut ke Halaman Login</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
