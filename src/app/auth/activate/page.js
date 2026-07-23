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

  // Set password states
  const [needsPassword, setNeedsPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState("");

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
        if (result.success && result.data) {
          setStatus("success");
          setMessage(result.message || "Akun berhasil diaktivasi!");
          
          // Save session tokens for auto-login
          if (result.data.accessToken) {
            localStorage.setItem("accessToken", result.data.accessToken);
            localStorage.setItem("refreshToken", result.data.refreshToken);
            localStorage.setItem("user", JSON.stringify(result.data.user));
            window.dispatchEvent(new Event("userUpdated"));
          }
          
          setUser(result.data.user || result.data);
          
          if (result.data.needsPassword) {
            setNeedsPassword(true);
          }
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

  const handleSetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPassMsg("Konfirmasi kata sandi tidak cocok");
      return;
    }
    if (password.length < 8) {
      setPassMsg("Kata sandi minimal 8 karakter");
      return;
    }

    setPassLoading(true);
    setPassMsg("");

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/auth/set-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword: password, confirmPassword })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setPassMsg("Kata sandi berhasil disimpan! Mengalihkan...");
        setTimeout(() => {
          router.push("/dashboard/pasien");
        }, 1500);
      } else {
        setPassMsg(result.message || "Gagal mengatur kata sandi");
      }
    } catch (err) {
      console.error(err);
      setPassMsg("Terjadi kesalahan sistem saat menyimpan password");
    } finally {
      setPassLoading(false);
    }
  };

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

            {needsPassword ? (
              <form onSubmit={handleSetPassword} className="space-y-4 text-left">
                <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 text-[11px] text-rose-800 leading-normal font-medium">
                  Akun Anda belum memiliki kata sandi (dibuat oleh Faskes). Silakan atur kata sandi baru untuk mengamankan akun Anda.
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Kata Sandi Baru</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 8 karakter"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-[#7F1D1D] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Konfirmasi Kata Sandi</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi baru"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-[#7F1D1D] outline-none"
                  />
                </div>
                {passMsg && (
                  <p className={`text-[10px] font-bold ${passMsg.includes("berhasil") ? "text-emerald-700" : "text-rose-700"}`}>{passMsg}</p>
                )}
                <button
                  type="submit"
                  disabled={passLoading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#7F1D1D] hover:bg-[#A61B2D] px-6 py-3 text-xs font-extrabold text-white shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  {passLoading ? "Menyimpan..." : "Simpan & Lanjut ke Dasbor"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <Link
                href="/auth/login"
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#7F1D1D] hover:bg-[#A61B2D] px-6 py-3 text-xs font-extrabold text-white shadow-md transition"
              >
                Masuk Sekarang
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
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
