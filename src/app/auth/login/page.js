"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { User, Lock, LogIn, AlertCircle, Loader, ArrowRight, Home, Mail, CheckCircle, Eye, EyeOff, Building2 } from "lucide-react";
import { apiPost, setTokens, setUser } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState("pasien"); // "pasien", "rumah_sakit"
  const [identifier, setIdentifier] = useState("");
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isInactive, setIsInactive] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResendMsg("");
    setIsInactive(false);
    setLoading(true);

    try {
      const result = await apiPost("/api/auth/login", { identifier, password });

      if (result.success && result.data) {
        setTokens(result.data.accessToken, result.data.refreshToken);
        setUser(result.data.user);

        // Redirect berdasarkan role user
        const userRole = result.data.user.role;
        if (userRole === "admin") {
          router.push("/dashboard/admin");
        } else if (userRole === "rumah_sakit" || userRole === "dokter" || userRole === "faskes") {
          router.push("/dashboard/faskes");
        } else {
          router.push("/dashboard/pasien");
        }
      }
    } catch (err) {
      const msg = err.message || "Login gagal, silakan periksa kredensial Anda.";
      setError(msg);
      if (err.status === 403 || msg.toLowerCase().includes("aktif")) {
        setIsInactive(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendActivation = async () => {
    if (!identifier) {
      setError("Masukkan alamat email Anda terlebih dahulu.");
      return;
    }
    setResendLoading(true);
    setResendMsg("");
    try {
      const result = await apiPost("/api/auth/resend-activation", { email: identifier });
      setResendMsg(result.message || "Email aktivasi berhasil dikirim ulang.");
    } catch (err) {
      setError(err.message || "Gagal mengirim ulang email aktivasi.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen w-full lg:overflow-hidden flex flex-col lg:flex-row bg-slate-50">
      {/* Left Side - Description Panel with Background Image & Maroon Highlight */}
      <div className="hidden lg:flex lg:w-1/2 h-full relative p-12 flex-col justify-between overflow-hidden text-white shrink-0">
        {/* Background Image */}
        <Image
          src="/images/login.jpg"
          alt="Login Background"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover object-center"
        />

        {/* Gradient Maroon Overlay & Highlight - Thinner Transparency */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#7F1D1D]/60 via-[#A61B2D]/45 to-[#4C0B14]/70" />

        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-rose-500 blur-3xl" />
          <div className="absolute bottom-0 right-10 w-96 h-96 rounded-full bg-red-600 blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <Link href="/" className="group flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white">
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
                <div className="text-lg font-bold text-white tracking-wider">Satu Data</div>
                <div className="text-xs text-white/80">Healthcare Hub</div>
              </div>
            </Link>

          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Selamat Datang Kembali
            </h1>
            <p className="text-lg text-white/90">
              Gerakan kesehatan digital yang sedang bertumbuh melayani transparansi data medis Anda
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-white/20 backdrop-blur-md">
                  <span className="text-white text-lg">✓</span>
                </div>
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Autentikasi Aman</h3>
                <p className="text-white/80 text-sm">Enkripsi end-to-end untuk semua data akun Anda</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-white/20 backdrop-blur-md">
                  <span className="text-white text-lg">✓</span>
                </div>
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Proses Cepat</h3>
                <p className="text-white/80 text-sm">Login instan, akses rekam medis dalam 3 detik</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-white/20 backdrop-blur-md">
                  <span className="text-white text-lg">✓</span>
                </div>
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Kontrol Penuh</h3>
                <p className="text-white/80 text-sm">Anda menentukan siapa yang bisa akses data Anda</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-white/80 text-sm">
          © 2026 SatuData. Semua hak dilindungi.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 min-h-screen lg:h-full flex flex-col justify-center p-4 sm:p-6 lg:p-12 overflow-y-auto lg:overflow-hidden bg-slate-50 lg:bg-white">
        <div className="w-full max-w-md mx-auto my-auto space-y-4 py-4 lg:py-0">
          <div className="mb-4 flex justify-end">
            <Link href="/" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-[#7F1D1D] shadow-sm transition hover:bg-slate-50">
              <Home className="h-5 w-5" />
            </Link>
          </div>

          <div className="bg-[#7F1D1D] rounded-t-3xl px-8 py-8 text-white">
            <h2 className="text-2xl font-bold">Masuk ke Akun Anda</h2>
            <p className="text-rose-100 mt-2 text-sm">Silakan masuk untuk mengakses dashboard</p>
          </div>

          <div className="bg-slate-50 rounded-b-3xl px-8 py-8 border border-t-0 border-slate-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selector Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl mb-6">
                <button
                  type="button"
                  onClick={() => setRole("pasien")}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    role === "pasien"
                      ? "bg-[#7F1D1D] text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span>Pasien</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("rumah_sakit")}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    role === "rumah_sakit"
                      ? "bg-[#7F1D1D] text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  <span>Faskes / RS</span>
                </button>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700 space-y-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                  {isInactive && (
                    <div className="pt-2 border-t border-red-200/60 flex items-center justify-between text-xs">
                      <span>Akun belum diaktivasi via email?</span>
                      <button
                        type="button"
                        onClick={handleResendActivation}
                        disabled={resendLoading}
                        className="inline-flex items-center gap-1 font-bold text-rose-900 underline hover:text-red-950 cursor-pointer disabled:opacity-50"
                      >
                        {resendLoading ? <Loader className="h-3 w-3 animate-spin" /> : <Mail className="h-3 w-3" />}
                        Kirim Ulang Email Aktivasi
                      </button>
                    </div>
                  )}
                </div>
              )}

              {resendMsg && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700 font-semibold">
                  <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{resendMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {role === "pasien" ? "Email Pasien / NIK *" : "Email Fasilitas Kesehatan (Faskes) *"}
                </label>
                <div className="relative">
                  {role === "pasien" ? (
                    <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  ) : (
                    <Building2 className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  )}
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => {
                      const val = e.target.value.toLowerCase().replace(/[^a-z0-9@._\-+]/g, "");
                      setIdentifier(val);
                    }}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    placeholder={role === "pasien" ? "contoh: pasien@email.com atau NIK 16 digit" : "contoh: admin@rumahsakit.com"}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:border-[#7F1D1D] focus:ring-2 focus:ring-[#7F1D1D]/20 outline-none transition text-sm lowercase"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Password
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-[#7F1D1D] hover:text-[#A61B2D] font-medium transition"
                  >
                    Lupa password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 rounded-lg border border-slate-300 focus:border-[#7F1D1D] focus:ring-2 focus:ring-[#7F1D1D]/20 outline-none transition text-sm"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none transition cursor-pointer"
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#7F1D1D] hover:bg-[#A61B2D] text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Sedang memproses...
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    Masuk Sekarang
                  </>
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-50 text-slate-500">atau</span>
                </div>
              </div>

              {/* Google Login Button */}
              <button
                type="button"
                onClick={() => setShowGoogleModal(true)}
                className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 px-4 rounded-xl border border-slate-200 shadow-sm transition hover:shadow cursor-pointer text-xs"
              >
                {/* SVG Google Logo */}
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <g transform="matrix(1, 0, 0, 1, 0, 0)">
                    <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.58h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.4C21.68,11.83 21.56,11.43 21.35,11.1z" fill="#4285F4" />
                    <path d="M12,20.8c2.43,0 4.47,-0.8 5.96,-2.2l-3.3,-2.58c-0.92,0.62 -2.1,0.98 -3.37,0.98 -2.43,0 -4.5,-1.64 -5.24,-3.84H2.61v2.66C4.1,18.78 7.82,20.8 12,20.8z" fill="#34A853" />
                    <path d="M6.76,13.16c-0.18,-0.56 -0.29,-1.16 -0.29,-1.77c0,-0.61 0.1,-1.21 0.29,-1.77V6.96H2.61C1.96,8.26 1.6,9.73 1.6,11.27c0,1.54 0.36,3.01 1.01,4.31L6.76,13.16z" fill="#FBBC05" />
                    <path d="M12,5.22c1.32,0 2.5,0.45 3.44,1.35l2.58,-2.58C16.46,2.54 14.43,1.64 12,1.64c-4.18,0 -7.9,2.02 -9.39,4.98l4.15,3.22C7.5,7.03 9.57,5.22 12,5.22z" fill="#EA4335" />
                  </g>
                </svg>
                <span>Masuk dengan Google</span>
              </button>

              <p className="text-center text-sm text-slate-600">
                Belum punya akun?{" "}
                <Link href="/auth/register" className="text-[#7F1D1D] hover:text-[#A61B2D] font-semibold transition">
                  Daftar di sini
                  <ArrowRight className="inline-block ml-1 h-3 w-3" />
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Google Login Placeholder Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-6 text-center animate-in zoom-in-95 duration-200">
            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            
            {/* Google Icon Circle */}
            <div className="relative mx-auto h-16 w-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-4 shadow-sm border border-amber-100 animate-pulse">
              <svg className="h-8 w-8 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.58h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.4C21.68,11.83 21.56,11.43 21.35,11.1z" fill="#4285F4" />
                <path d="M12,20.8c2.43,0 4.47,-0.8 5.96,-2.2l-3.3,-2.58c-0.92,0.62 -2.1,0.98 -3.37,0.98 -2.43,0 -4.5,-1.64 -5.24,-3.84H2.61v2.66C4.1,18.78 7.82,20.8 12,20.8z" fill="#34A853" />
                <path d="M6.76,13.16c-0.18,-0.56 -0.29,-1.16 -0.29,-1.77c0,-0.61 0.1,-1.21 0.29,-1.77V6.96H2.61C1.96,8.26 1.6,9.73 1.6,11.27c0,1.54 0.36,3.01 1.01,4.31L6.76,13.16z" fill="#FBBC05" />
                <path d="M12,5.22c1.32,0 2.5,0.45 3.44,1.35l2.58,-2.58C16.46,2.54 14.43,1.64 12,1.64c-4.18,0 -7.9,2.02 -9.39,4.98l4.15,3.22C7.5,7.03 9.57,5.22 12,5.22z" fill="#EA4335" />
              </svg>
            </div>

            <h3 className="text-lg font-extrabold text-slate-900 mb-2">Google Login Belum Tersedia</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium mb-6">
              Fitur masuk menggunakan akun Google sedang dalam tahap pengembangan dan akan segera dirilis pada versi berikutnya. Silakan masuk menggunakan Email/NIK dan Password Anda untuk saat ini.
            </p>

            {/* Action button */}
            <button
              type="button"
              onClick={() => setShowGoogleModal(false)}
              className="w-full bg-[#7F1D1D] hover:bg-[#A61B2D] text-white font-extrabold py-3 rounded-2xl transition cursor-pointer shadow-md hover:shadow-lg text-xs"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
