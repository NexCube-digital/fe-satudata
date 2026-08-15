'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader, CheckCircle, AlertCircle, Home } from 'lucide-react';
import { requestPasswordReset } from '@/services/auth-service';
import { sanitizeInput, isValidEmail } from '@/lib/security';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const cleanEmail = sanitizeInput(email);
    if (!isValidEmail(cleanEmail)) {
      setError('Silakan masukkan alamat email yang valid.');
      return;
    }

    setLoading(true);

    try {
      const res = await requestPasswordReset(cleanEmail);
      if (res.success) {
        setMessage('Instruksi reset password telah dikirim ke email Anda.');
      } else {
        setError(res.message || 'Gagal mengirim permintaan reset password.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/login" className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-teal-800 transition">
          <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Login
        </Link>
        <Link
          href="/"
          title="Kembali ke Beranda"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 hover:bg-teal-50 hover:border-teal-300 text-teal-800 transition shrink-0 cursor-pointer shadow-2xs"
        >
          <Home className="h-4 w-4" />
        </Link>
      </div>

      <div className="hidden lg:block mb-4">
        <h2 className="text-xl font-bold text-slate-900">Lupa Kata Sandi</h2>
        <p className="text-xs text-slate-500 mt-1">Masukkan email terdaftar Anda untuk mereset kata sandi</p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {message ? (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 text-center flex items-center gap-2">
          <CheckCircle className="h-5 w-5 shrink-0" /> {message}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Terdaftar</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan alamat email"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              maxLength={100}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-teal-800 hover:bg-teal-900 text-white font-bold py-2.5 rounded-lg transition disabled:opacity-50 text-sm shadow-xs"
          >
            {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            <span>Kirim Link Reset Password</span>
          </button>
        </form>
      )}
    </div>
  );
}
