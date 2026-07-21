"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { User, Lock, LogIn, AlertCircle, Loader, ArrowRight, Home, Mail, CheckCircle, Eye, EyeOff } from "lucide-react";
import { apiPost, setTokens, setUser } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
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
    <div className="min-h-screen flex overflow-hidden">
      {/* Left Side - Description Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-[#7F1D1D] via-[#A61B2D] to-[#4C0B14] p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 right-10 w-96 h-96 rounded-full bg-white blur-3xl" />
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
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
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
                  Email atau NIK Anda
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="contoh@email.com atau NIK 16 digit"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:border-[#7F1D1D] focus:ring-2 focus:ring-[#7F1D1D]/20 outline-none transition text-sm"
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
    </div>
  );
}
