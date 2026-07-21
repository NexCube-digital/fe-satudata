"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, XCircle, Loader, ArrowRight, ShieldCheck, Mail } from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";

function ActivateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("loading"); // "loading", "success", "error"
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [resendEmail, setResendEmail] = useState("");
  const [resendMsg, setResendMsg] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setStatus("error");
      setMessage("Token aktivasi tidak ditemukan atau tidak valid.");
      return;
    }

    async function handleActivate() {
      try {
        const result = await apiGet(`/api/auth/activate?token=${encodeURIComponent(token)}`);
        if (result.success) {
          setStatus("success");
          setMessage(result.message || "Akun berhasil diaktivasi!");
          setUser(result.data);
        } else {
          setStatus("error");
          setMessage(result.message || "Gagal mengaktivasi akun.");
        }
      } catch (err) {
        setStatus("error");
        setMessage(err.message || "Token aktivasi kedaluwarsa atau tidak valid.");
      } finally {
        setLoading(false);
      }
    }

    handleActivate();
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail) return;
    setResendLoading(true);
    setResendMsg("");

    try {
      const result = await apiPost("/api/auth/resend-activation", { email: resendEmail });
      setResendMsg(result.message || "Email aktivasi berhasil dikirim ulang.");
    } catch (err) {
      setResendMsg(`Error: ${err.message}`);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-8 shadow-xl text-center space-y-6">
        
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-3.5 mx-auto">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#7F1D1D] p-2 text-white shadow-xs">
            <Image src="/images/logo.png" alt="Satu Data logo" width={32} height={32} className="h-full w-full object-contain" />
          </span>
          <div className="text-left">
            <h3 className="text-base font-extrabold text-slate-900 tracking-wider">Satu Data</h3>
            <p className="text-[10px] text-slate-500">Healthcare Sovereign Hub</p>
          </div>
        </Link>

        {loading && (
          <div className="py-8 space-y-3">
            <Loader className="h-10 w-10 animate-spin text-[#7F1D1D] mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">Memverifikasi Token Aktivasi...</h4>
            <p className="text-xs text-slate-500">Mohon tunggu sebentar, sistem sedang mengaktifkan akun Anda.</p>
          </div>
        )}

        {!loading && status === "success" && (
          <div className="space-y-4 py-4">
            <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-slate-900">Aktivasi Berhasil!</h3>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">{message}</p>
            </div>

            {user && (
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 text-left text-xs space-y-1">
                <p className="font-bold text-slate-800">{user.name}</p>
                <p className="text-slate-500 font-mono">{user.email}</p>
                <p className="text-[10px] text-emerald-700 font-bold uppercase pt-1">Status: Aktif ✓</p>
              </div>
            )}

            <Link
              href="/auth/login"
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#7F1D1D] hover:bg-[#A61B2D] px-6 py-3 text-xs font-extrabold text-white shadow-md transition"
            >
              Masuk Sekarang
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {!loading && status === "error" && (
          <div className="space-y-4 py-4">
            <div className="h-16 w-16 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
              <XCircle className="h-10 w-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-slate-900">Aktivasi Gagal</h3>
              <p className="text-xs text-rose-600 font-medium max-w-xs mx-auto">{message}</p>
            </div>

            {/* Form Resend Email */}
            <form onSubmit={handleResend} className="rounded-2xl bg-slate-50 p-4 border border-slate-200 text-left space-y-2.5">
              <label className="block text-[11px] font-bold text-slate-700">Kirim Ulang Link Aktivasi</label>
              <input
                type="email"
                placeholder="Masukkan email terdaftar Anda"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                className="w-full rounded-xl bg-white border border-slate-300 px-3 py-2 text-xs focus:border-[#7F1D1D] outline-none"
                required
              />
              <button
                type="submit"
                disabled={resendLoading}
                className="w-full rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2 transition disabled:opacity-50"
              >
                {resendLoading ? "Mengirim..." : "Kirim Email Aktivasi Baru"}
              </button>
              {resendMsg && (
                <p className="text-[10px] font-semibold text-emerald-700 pt-1">{resendMsg}</p>
              )}
            </form>

            <Link
              href="/auth/login"
              className="inline-block text-xs font-bold text-[#7F1D1D] hover:underline"
            >
              Kembali ke Halaman Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ActivatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader className="h-8 w-8 animate-spin text-[#7F1D1D]" />
      </div>
    }>
      <ActivateContent />
    </Suspense>
  );
}
