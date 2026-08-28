"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { KeyRound, Loader, CheckCircle2, AlertCircle, ArrowRight, Eye, EyeOff } from "lucide-react";
import { apiPost } from "@/lib/api";

function ResetPinContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handlePinChange = (setter) => (event) => {
    setter(event.target.value.replace(/\D/g, "").slice(0, 6));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Token reset PIN tidak ditemukan di URL.");
      return;
    }

    if (!/^\d{6}$/.test(newPin)) {
      setError("PIN baru harus terdiri dari 6 digit angka.");
      return;
    }

    if (newPin !== confirmPin) {
      setError("Konfirmasi PIN baru tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      const result = await apiPost("/api/auth/reset-pin", {
        token,
        newPin,
        confirmPin,
      });

      if (result.success) {
        setSuccess(result.message || "PIN berhasil direset. Silakan login dengan PIN baru.");
        setTimeout(() => router.push("/auth/login"), 2500);
      }
    } catch (err) {
      setError(err.message || "Gagal mereset PIN. Tautan mungkin sudah kedaluwarsa.");
    } finally {
      setLoading(false);
    }
  };

  const pinInput = (value, setter, visible, setVisible, label, placeholder) => (
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-1">{label}</label>
      <div className="relative">
        <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <input
          type={visible ? "text" : "password"}
          inputMode="numeric"
          value={value}
          onChange={setter}
          maxLength={6}
          placeholder={placeholder}
          className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition text-xs tracking-[0.3em]"
          required
          disabled={loading}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none transition cursor-pointer"
          aria-label={visible ? `Sembunyikan ${label.toLowerCase()}` : `Tampilkan ${label.toLowerCase()}`}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <p className="mt-1 text-[10px] text-slate-500">{value.length}/6 digit</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary p-2 text-white shadow-xs">
              <Image src="/images/logo.png" alt="Satu Data logo" width={28} height={28} className="h-full w-full object-contain" />
            </span>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-wider">Satu Data</h3>
              <p className="text-[10px] text-slate-500">Security Center</p>
            </div>
          </Link>
          <Link href="/auth/login" className="text-xs font-bold text-slate-500 hover:text-slate-800">Login</Link>
        </div>

        <div className="space-y-1 border-b border-slate-100 pb-4">
          <h1 className="text-xl font-extrabold text-slate-900">Buat PIN Baru</h1>
          <p className="text-xs text-slate-500">Masukkan PIN baru enam digit untuk akun pasien Anda.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-800 font-semibold">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          {pinInput(newPin, handlePinChange(setNewPin), showNewPin, setShowNewPin, "PIN Baru *", "••••••")}
          {pinInput(confirmPin, handlePinChange(setConfirmPin), showConfirmPin, setShowConfirmPin, "Konfirmasi PIN Baru *", "Ketik ulang PIN baru")}

          <button
            type="submit"
            disabled={loading || newPin.length !== 6 || confirmPin.length !== 6}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-extrabold py-3 rounded-xl transition cursor-pointer disabled:opacity-50 text-xs shadow-xs"
          >
            {loading ? <><Loader className="h-4 w-4 animate-spin" /> Menyimpan PIN Baru...</> : <><span>Simpan PIN Baru</span><ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPinPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader className="h-8 w-8 animate-spin text-primary" /></div>}>
      <ResetPinContent />
    </Suspense>
  );
}