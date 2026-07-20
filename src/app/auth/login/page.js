"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { User, Lock, LogIn, AlertCircle, Loader, ArrowRight, Home } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }),
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login gagal");
      }

      localStorage.setItem("accessToken", result.data.accessToken);
      localStorage.setItem("refreshToken", result.data.refreshToken);
      localStorage.setItem("user", JSON.stringify(result.data.user));

      // Redirect berdasarkan role user
      const userRole = result.data.user.role;
      if (userRole === "admin") {
        router.push("/dashboard/admin");
      } else if (userRole === "rumah_sakit" || userRole === "dokter") {
        router.push("/dashboard/faskes");
      } else {
        // default to pasien dashboard
        router.push("/dashboard/pasien");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
                <div className="flex items-center gap-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{error}</span>
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
                    href="#"
                    className="text-xs text-[#7F1D1D] hover:text-[#A61B2D] font-medium transition"
                  >
                    Lupa password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:border-[#7F1D1D] focus:ring-2 focus:ring-[#7F1D1D]/20 outline-none transition text-sm"
                    required
                    disabled={loading}
                  />
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
