'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, UserPlus, AlertCircle, Loader, Home, Eye, EyeOff } from 'lucide-react';
import { registerUser } from '@/services/auth-service';
import { Role } from '@/types/auth';
import { sanitizeInput, isValidEmail, isValidNik } from '@/lib/security';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>('pasien');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [nik, setNik] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Sanitization & format validation
    const cleanName = sanitizeInput(name);
    const cleanEmail = sanitizeInput(email);
    const cleanNik = sanitizeInput(nik);

    if (!cleanName || cleanName.length < 2) {
      setError('Silakan masukkan nama lengkap yang valid.');
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setError('Format alamat email tidak valid.');
      return;
    }

    if (role === 'pasien' && cleanNik && !isValidNik(cleanNik)) {
      setError('NIK pasien harus berupa 16 digit angka yang valid.');
      return;
    }

    if (!password || password.length < 8) {
      setError('Password minimal harus 8 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok dengan password.');
      return;
    }

    setLoading(true);

    try {
      const res = await registerUser({ name: cleanName, email: cleanEmail, password, role, nik: cleanNik });
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
    <div className="w-full h-full flex flex-col justify-between">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Link href="/" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-teal-800 shadow-xs hover:bg-slate-50 transition">
            <Home className="h-4 w-4" />
          </Link>
        </div>

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
              onClick={() => {
                setRole('pasien');
                setName('');
                setNik('');
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg border ${
                role === 'pasien' ? 'bg-teal-800 text-white border-teal-800' : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              Pasien
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('faskes');
                setName('');
                setNik('');
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg border ${
                role === 'faskes' ? 'bg-teal-800 text-white border-teal-800' : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              Fasilitas Kesehatan
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {role === 'pasien' ? 'Nama Lengkap Pasien *' : 'Nama Fasilitas Kesehatan / RS *'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                const val = e.target.value;
                if (role === 'pasien') {
                  // Pasien: Allow only letters, spaces, dots, commas, apostrophes/quotes, and hyphens (NO NUMBERS & NO SYMBOLS)
                  setName(val.replace(/[^a-zA-Z\s.,'`-]/g, ''));
                } else {
                  // Faskes: Allow letters, numbers, spaces, dots, commas, hyphens, and slashes
                  setName(val.replace(/[^a-zA-Z0-9\s.,'/\-]/g, ''));
                }
              }}
              placeholder={role === 'pasien' ? 'Masukkan nama lengkap' : 'Masukkan nama fasilitas kesehatan'}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              maxLength={100}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.replace(/\s+/g, '').toLowerCase())}
              placeholder="Masukkan alamat email"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              maxLength={100}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {role === 'pasien' ? 'NIK 16 Digit *' : 'Kode Izin Operasional Faskes *'}
            </label>
            <input
              type="text"
              value={nik}
              onChange={(e) => {
                const val = e.target.value;
                if (role === 'pasien') {
                  // Pasien: Only allow digits for NIK
                  setNik(val.replace(/\D/g, ''));
                } else {
                  // Faskes: Uppercase alphanumeric, hyphens, slashes
                  setNik(val.replace(/[^a-zA-Z0-9\-/]/g, '').toUpperCase());
                }
              }}
              placeholder={role === 'pasien' ? 'Masukkan 16 digit NIK' : 'Masukkan kode izin faskes'}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-mono"
              maxLength={role === 'pasien' ? 16 : 30}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 pr-10"
                maxLength={128}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Konfirmasi Password *</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password Anda"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 pr-10"
                maxLength={128}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-teal-800 hover:bg-teal-900 text-white font-bold py-2.5 rounded-lg transition disabled:opacity-50 text-sm shadow-xs mt-2"
          >
            {loading ? <Loader className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            <span>Daftar Sekarang</span>
          </button>

        </form>
      )}
      </div>

      {/* Fixed Bottom Footer Link */}
      <div className="pt-6 border-t border-slate-100 text-center text-xs text-slate-600 font-medium mt-auto">
        Sudah memiliki akun?{' '}
        <Link href="/login" className="text-teal-800 font-bold hover:underline">
          Masuk di sini
        </Link>
      </div>
    </div>
  );
}
