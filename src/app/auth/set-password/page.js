"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, Key, Loader } from "lucide-react";
import { apiPost, getAccessToken, getUser, setUser } from "@/lib/api";

export default function SetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (!getAccessToken() || !getUser()) {
      router.replace("/auth/login");
      return;
    }
    setPageLoading(false);
  }, [router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage({ type: "", text: "" });

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Konfirmasi password tidak cocok." });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: "error", text: "Password minimal 8 karakter." });
      return;
    }

    setLoading(true);
    try {
      const result = await apiPost("/api/auth/set-password", {
        newPassword,
        confirmPassword,
      });

      const user = getUser();
      if (user) {
        setUser({ ...user, hasPassword: true, passwordConfigured: true });
        localStorage.setItem(`passwordConfigured:${user.id}`, "true");
      }
      window.dispatchEvent(new Event("userUpdated"));
      setMessage({ type: "success", text: result.message || "Password berhasil dibuat." });
      setTimeout(() => router.push("/settings"), 900);
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Gagal membuat password." });
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader className="h-8 w-8 animate-spin text-teal-800" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/settings" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-teal-800">
            <ArrowLeft className="h-4 w-4" /> Kembali ke Pengaturan
          </Link>
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-teal-700 to-cyan-800 p-2">
            <Image src="/images/logo.png" alt="Satu Data logo" width={28} height={28} className="h-full w-full object-contain" />
          </span>
        </div>

        <div className="space-y-1 border-b border-slate-100 pb-4">
          <h1 className="text-xl font-extrabold text-slate-900">Buat Password</h1>
          <p className="text-xs text-slate-500">Akun Google Anda belum memiliki password. Buat password untuk login alternatif dan keamanan akun.</p>
        </div>

        {message.text && (
          <div className={`flex items-center gap-2 rounded-xl p-3 text-xs font-medium ${message.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
            {message.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordField
            label="Password Baru"
            value={newPassword}
            onChange={setNewPassword}
            visible={showNewPassword}
            onToggle={() => setShowNewPassword(!showNewPassword)}
            placeholder="Minimal 8 karakter"
            disabled={loading}
          />
          <PasswordField
            label="Konfirmasi Password Baru"
            value={confirmPassword}
            onChange={setConfirmPassword}
            visible={showConfirmPassword}
            onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
            placeholder="Ulangi password baru"
            disabled={loading}
          />
          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-700 to-cyan-800 hover:from-teal-800 hover:to-cyan-900 text-white font-extrabold py-3 text-xs shadow-md transition disabled:opacity-50">
            {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
            {loading ? "Menyimpan..." : "Simpan Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

function PasswordField({ label, value, onChange, visible, onToggle, placeholder, disabled }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-1">{label}</label>
      <div className="relative">
        <Key className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 outline-none transition text-xs"
          required
          disabled={disabled}
        />
        <button type="button" onClick={onToggle} disabled={disabled} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer disabled:opacity-50" aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}>
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
