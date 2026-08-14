'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, UserPlus, AlertCircle, Loader } from 'lucide-react';
import { registerUser } from '@/services/auth-service';
import { Role } from '@/types/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>('pasien');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [nik, setNik] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await registerUser({ name, email, password, role, nik });
      if (res.success) {
        setSuccess('Pendaftaran berhasil! Silakan periksa email Anda untuk verifikasi aktivasi akun.');
      } else {
        setError(res.message || 'Gagal mendaftar.');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal melakukan pendaftaran.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-slate-900">Pendaftaran Akun Baru</h2>
        <p className="text-xs text-slate-500 mt-1">Buat akun untuk mengakses layanan SatuData</p>
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
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => setRole('pasien')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg border ${
                role === 'pasien' ? 'bg-teal-800 text-white border-teal-800' : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              Pasien
            </button>
            <button
              type="button"
              onClick={() => setRole('faskes')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg border ${
                role === 'faskes' ? 'bg-teal-800 text-white border-teal-800' : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              Fasilitas Kesehatan
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap / Nama Faskes</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{role === 'pasien' ? 'NIK 16 Digit' : 'Kode / Izin Faskes'}</label>
            <input
              type="text"
              value={nik}
              onChange={(e) => setNik(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-teal-800 hover:bg-teal-900 text-white font-bold py-2.5 rounded-lg transition disabled:opacity-50 text-sm shadow-xs mt-2"
          >
            {loading ? <Loader className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            <span>Daftar Sekarang</span>
          </button>

          <p className="text-center text-xs text-slate-600 pt-2">
            Sudah memiliki akun?{' '}
            <Link href="/login" className="text-teal-800 font-semibold hover:underline">
              Masuk di sini
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
