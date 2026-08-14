'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { requestPasswordReset } from '@/services/auth-service';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await requestPasswordReset(email);
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
      <Link href="/login" className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-teal-800 transition">
        <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Login
      </Link>

      <div className="text-center mb-4">
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
              placeholder="contoh@email.com"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
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
