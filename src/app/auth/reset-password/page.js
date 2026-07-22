"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Lock, Loader, CheckCircle2, AlertCircle, ArrowRight, Eye, EyeOff } from "lucide-react";
import { apiPost } from "@/lib/api";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");
  const uid = searchParams.get("uid") || searchParams.get("userId");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token || !uid) {
      setError("Parameter reset password (token atau userId) tidak ditemukan di URL.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password baru tidak cocok.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password baru harus minimal 8 karakter dan mengandung kombinasi huruf serta angka.");
      return;
    }

    setLoading(true);

    try {
      const result = await apiPost("/api/auth/reset-password", {
        userId: Number(uid),
        token,
        newPassword,
      });

      if (result.success) {
        setSuccess(result.message || "Password berhasil direset! Silakan login dengan password baru Anda.");
        setTimeout(() => {
          router.push("/auth/login");
        }, 2500);
      }
    } catch (err) {
      setError(err.message || "Gagal mengaktifkan password baru. Token mungkin kedaluwarsa.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-8 shadow-xl space-y-6">
        
        {/* Header Logo */}
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#7F1D1D] p-2 text-white shadow-xs">
              <Image src="/images/logo.png" alt="Satu Data logo" width={28} height={28} className="h-full w-full object-contain" />
            </span>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-wider">Satu Data</h3>
              <p className="text-[10px] text-slate-500">Security Center</p>
            </div>
          </Link>
        </div>

        <div className="space-y-1 border-b border-slate-100 pb-4">
          <h1 className="text-xl font-extrabold text-slate-900">Buat Password Baru</h1>
          <p className="text-xs text-slate-500">
            Silakan masukkan password baru yang kuat untuk akun Anda.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-800 font-semibold">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password Baru *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 karakter (huruf & angka)"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-[#7F1D1D] focus:ring-2 focus:ring-[#7F1D1D]/20 outline-none transition text-xs"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none transition cursor-pointer"
                aria-label={showNewPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Konfirmasi Password Baru *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ketik ulang password baru"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-[#7F1D1D] focus:ring-2 focus:ring-[#7F1D1D]/20 outline-none transition text-xs"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none transition cursor-pointer"
                aria-label={showConfirmPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#7F1D1D] hover:bg-[#A61B2D] text-white font-extrabold py-3 rounded-xl transition cursor-pointer disabled:opacity-50 text-xs shadow-xs"
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Menyimpan Password Baru...
              </>
            ) : (
              <>
                <span>Simpan Password Baru</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader className="h-8 w-8 animate-spin text-[#7F1D1D]" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
