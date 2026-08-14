'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Script from 'next/script';
import { User, Lock, LogIn, AlertCircle, Loader, ArrowRight, ArrowLeft, Home, Mail, CheckCircle, Eye, EyeOff, Building2 } from 'lucide-react';
import { apiPost, setTokens, setUser } from '@/lib/api-client';
import Toast from '@/components/ui/Toast';
import { ENV } from '@/constants/env';

declare global {
  interface Window {
    google?: any;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'pasien' | 'rumah_sakit'>('pasien');
  const [loginStep, setLoginStep] = useState<'select' | 'form'>('select');
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isInactive, setIsInactive] = useState<boolean>(false);
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [resendMsg, setResendMsg] = useState<string>('');

  const [toast, setToast] = useState<{ show: boolean; type: 'success' | 'error' | 'info'; title: string; message: string }>({
    show: false,
    type: 'info',
    title: '',
    message: '',
  });

  const showToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setToast({ show: true, type, title, message });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  const handleGoogleLoginSuccess = async (response: any) => {
    setError('');
    setLoading(true);
    try {
      const result = await apiPost('/api/auth/google', { idToken: response.credential, role });

      if (result.success && result.data) {
        setTokens(result.data.accessToken, result.data.refreshToken);
        setUser(result.data.user);
        showToast('success', 'Login Berhasil', 'Selamat datang di SatuData!');

        const userRole = result.data.user.role;
        setTimeout(() => {
          if (userRole === 'admin') {
            router.push('/dashboard/admin');
          } else if (userRole === 'rumah_sakit' || userRole === 'dokter' || userRole === 'faskes' || userRole === 'staf_rs' || userRole === 'staff') {
            router.push('/dashboard/faskes');
          } else {
            router.push('/dashboard/pasien');
          }
        }, 500);
      }
    } catch (err: any) {
      let msg = err.message || 'Gagal masuk menggunakan Google';
      showToast('error', 'Login Google Gagal', msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleScriptLoad = () => {
    if (typeof window !== 'undefined' && window.google) {
      const clientId = ENV.GOOGLE_CLIENT_ID || '501418475114-g7b5cauv82eh8v1jhakvqggu3et9okrh.apps.googleusercontent.com';
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleLoginSuccess,
      });

      const container = document.getElementById('google-signin-btn-form');
      if (container) {
        window.google.accounts.id.renderButton(container, {
          theme: 'outline',
          size: 'large',
          width: '320',
          text: 'signin_with',
        });
      }
    }
  };

  useEffect(() => {
    if (loginStep === 'form') {
      const timer = setTimeout(() => {
        handleScriptLoad();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loginStep, role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResendMsg('');
    setIsInactive(false);
    setLoading(true);

    try {
      const result = await apiPost('/api/auth/login', { identifier, password });

      if (result.success && result.data) {
        setTokens(result.data.accessToken, result.data.refreshToken);
        setUser(result.data.user);
        showToast('success', 'Login Berhasil', 'Selamat datang kembali di SatuData!');

        const userRole = result.data.user.role;
        setTimeout(() => {
          if (userRole === 'admin') {
            router.push('/dashboard/admin');
          } else if (userRole === 'rumah_sakit' || userRole === 'dokter' || userRole === 'faskes' || userRole === 'staf_rs' || userRole === 'staff') {
            router.push('/dashboard/faskes');
          } else {
            router.push('/dashboard/pasien');
          }
        }, 500);
      }
    } catch (err: any) {
      let msg = err.message || 'Login gagal, silakan periksa kredensial Anda.';
      showToast('error', 'Login Gagal', msg);
      setError(msg);
      if (err.status === 403 || msg.toLowerCase().includes('aktif')) {
        setIsInactive(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendActivation = async () => {
    if (!identifier) {
      const msg = 'Masukkan alamat email Anda terlebih dahulu.';
      setError(msg);
      showToast('error', 'Perhatian', msg);
      return;
    }
    setResendLoading(true);
    setResendMsg('');
    try {
      const result = await apiPost('/api/auth/resend-activation', { email: identifier });
      const msg = result.message || 'Email aktivasi berhasil dikirim ulang.';
      setResendMsg(msg);
      showToast('success', 'Aktivasi Terkirim', msg);
    } catch (err: any) {
      const msg = err.message || 'Gagal mengirim ulang email aktivasi.';
      showToast('error', 'Gagal Kirim Email', msg);
      setError(msg);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-end">
        <Link href="/" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-teal-800 shadow-xs hover:bg-slate-50 transition">
          <Home className="h-4 w-4" />
        </Link>
      </div>

      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-slate-900">
          {loginStep === 'select' ? 'Pilih Metode Masuk' : `Masuk sebagai ${role === 'pasien' ? 'Pasien' : 'Fasilitas Kesehatan'}`}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {loginStep === 'select' ? 'Tentukan peran Anda untuk mengakses sistem SatuData' : 'Silakan isi kredensial akun Anda'}
        </p>
      </div>

      {loginStep === 'select' ? (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {
              setRole('pasien');
              setLoginStep('form');
              setError('');
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 hover:border-teal-600 hover:bg-teal-50/50 bg-white text-left transition duration-200 group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-teal-800 group-hover:bg-teal-800 group-hover:text-white transition-all">
                <User className="h-5 w-5" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Pasien Terdaftar</h4>
                <p className="text-[10px] text-slate-500">Akses EHR & kontrol izin medis</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-teal-800 transition-all" />
          </button>

          <button
            type="button"
            onClick={() => {
              setRole('rumah_sakit');
              setLoginStep('form');
              setError('');
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 hover:border-teal-600 hover:bg-teal-50/50 bg-white text-left transition duration-200 group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-teal-800 group-hover:bg-teal-800 group-hover:text-white transition-all">
                <Building2 className="h-5 w-5" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Fasilitas Kesehatan / RS</h4>
                <p className="text-[10px] text-slate-500">Kelola data medis & blockchain log</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-teal-800 transition-all" />
          </button>

          <div className="pt-3 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-600">
              Belum punya akun?{' '}
              <Link href="/register" className="text-teal-800 font-semibold hover:underline">
                Daftar di sini
              </Link>
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <button
            type="button"
            onClick={() => {
              setLoginStep('select');
              setError('');
            }}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-teal-800 transition cursor-pointer mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke pilihan metode</span>
          </button>

          {error && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
              {isInactive && (
                <div className="pt-1 border-t border-rose-200/60 flex items-center justify-between text-[10px]">
                  <span>Belum aktivasi via email?</span>
                  <button
                    type="button"
                    onClick={handleResendActivation}
                    disabled={resendLoading}
                    className="font-bold underline cursor-pointer"
                  >
                    {resendLoading ? <Loader className="h-3 w-3 animate-spin" /> : <Mail className="h-3 w-3 inline mr-1" />}
                    Kirim Ulang Email
                  </button>
                </div>
              )}
            </div>
          )}

          {resendMsg && (
            <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800 font-semibold">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{resendMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {role === 'pasien' ? 'Email Pasien / NIK *' : 'Email Fasilitas Kesehatan *'}
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={role === 'pasien' ? 'contoh: pasien@email.com' : 'contoh: admin@rumahsakit.com'}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              required
              disabled={loading}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              <Link href="/forgot-password" className="text-[11px] text-teal-800 font-medium hover:underline">
                Lupa password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 pr-10"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-teal-800 hover:bg-teal-900 text-white font-bold py-2.5 rounded-lg transition disabled:opacity-50 text-sm shadow-xs"
          >
            {loading ? <Loader className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            <span>Masuk Sekarang</span>
          </button>

          <div className="w-full flex flex-col items-center justify-center pt-2">
            <div id="google-signin-btn-form" className="w-full flex justify-center" style={{ minHeight: '44px' }} />
          </div>
        </form>
      )}

      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={handleScriptLoad} />
      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}
