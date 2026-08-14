'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Lock, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { resetPassword } from '@/services/auth-service';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword({ token, newPassword });
      if (res.success) {
        setSuccess('Kata sandi berhasil diperbarui! Silakan masuk kembali.');
      } else {
        setError(res.message || 'Gagal mereset kata sandi.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-slate-900">Setel Ulang Kata Sandi</h2>
        <p className="text-xs text-slate-500 mt-1">Masukkan kata sandi baru untuk akun Anda</p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {success ? (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 text-center space-y-3">
          <p className="font-bold">{success}</p>
          <Link href="/login" className="inline-block px-4 py-2 bg-emerald-700 text-white rounded-lg font-bold">
            Ke Halaman Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Kata Sandi Baru</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Konfirmasi Kata Sandi Baru</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-teal-800 hover:bg-teal-900 text-white font-bold py-2.5 rounded-lg transition disabled:opacity-50 text-sm shadow-xs"
          >
            {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            <span>Simpan Kata Sandi Baru</span>
          </button>
        </form>
      )}
    </div>
  );
}
