"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mail, ArrowLeft, Loader, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { apiPost } from "@/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showUnregisteredModal, setShowUnregisteredModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const result = await apiPost("/api/auth/forgot-password", { email });
      if (result.success) {
        setMessage(result.message || "Tautan reset password telah dikirim ke email Anda.");
      } else if (result.message && result.message.toLowerCase().includes("tidak terdaftar")) {
        setShowUnregisteredModal(true);
        setTimeout(() => {
          router.push("/auth/register");
        }, 4000);
      } else {
        setError(result.message || "Gagal memproses permintaan reset password.");
      }
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes("tidak terdaftar")) {
        setShowUnregisteredModal(true);
        setTimeout(() => {
          router.push("/auth/register");
        }, 4000);
      } else {
        setError(err.message || "Gagal memproses permintaan reset password.");
      }
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
              <p className="text-[10px] text-slate-500">Healthcare Sovereign</p>
            </div>
          </Link>
          <Link href="/auth/login" className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800">
            <ArrowLeft className="h-3.5 w-3.5" /> Login
          </Link>
        </div>

        <div className="space-y-1 border-b border-slate-100 pb-4">
          <h1 className="text-xl font-extrabold text-slate-900">Lupa Password?</h1>
          <p className="text-xs text-slate-500">
            Masukkan alamat email yang terdaftar pada akun SatuData Anda. Kami akan mengirimkan tautan reset password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="flex items-start gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-800 font-medium leading-relaxed">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Terdaftar</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase().trim())}
                placeholder="nama@domain.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:border-[#7F1D1D] focus:ring-2 focus:ring-[#7F1D1D]/20 outline-none transition text-xs"
                required
                disabled={loading}
              />
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
                Mengirim Link Reset...
              </>
            ) : (
              "Kirim Tautan Reset Password"
            )}
          </button>
        </form>
      </div>

      {/* Unregistered Account Modal */}
      {showUnregisteredModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-6 text-center animate-in zoom-in-95 duration-200">
            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
            
            {/* Warning Circle */}
            <div className="relative mx-auto h-16 w-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-100 animate-bounce">
              <AlertCircle className="h-8 w-8 text-rose-500" />
            </div>

            <h3 className="text-lg font-extrabold text-slate-900 mb-2">Akun Belum Terdaftar</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium mb-6">
              Email <strong className="text-slate-800 break-all">{email}</strong> belum terdaftar di sistem SatuData. <br />
              Anda akan dialihkan ke halaman pendaftaran dalam beberapa detik...
            </p>

            {/* Action button redirecting immediately */}
            <button
              type="button"
              onClick={() => {
                setShowUnregisteredModal(false);
                router.push("/auth/register");
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#7F1D1D] hover:bg-[#A61B2D] text-white font-extrabold py-3.5 rounded-2xl transition cursor-pointer shadow-md hover:shadow-lg text-xs"
            >
              <span>Daftar Sekarang</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
