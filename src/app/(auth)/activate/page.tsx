'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { activateAccount } from '@/services/auth-service';

export default function ActivatePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [loading, setLoading] = useState<boolean>(true);
  const [status, setStatus] = useState<'success' | 'error'>('success');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    async function runActivation() {
      if (!token) {
        setStatus('error');
        setMessage('Token aktivasi tidak ditemukan.');
        setLoading(false);
        return;
      }

      try {
        const res = await activateAccount(token);
        if (res.success) {
          setStatus('success');
          setMessage(res.message || 'Akun Anda berhasil diaktivasi!');
        } else {
          setStatus('error');
          setMessage(res.message || 'Gagal mengaktivasi akun.');
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'Token aktivasi tidak valid atau telah kadaluarsa.');
      } finally {
        setLoading(false);
      }
    }

    runActivation();
  }, [token]);

  return (
    <div className="w-full text-center space-y-4 py-4">
      {loading ? (
        <div className="space-y-3">
          <Loader className="h-8 w-8 animate-spin text-teal-700 mx-auto" />
          <p className="text-xs text-slate-600 font-semibold">Memproses Aktivasi Akun...</p>
        </div>
      ) : status === 'success' ? (
        <div className="space-y-4">
          <CheckCircle className="h-12 w-12 text-emerald-600 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Aktivasi Berhasil!</h2>
          <p className="text-xs text-slate-500">{message}</p>
          <Link href="/login" className="inline-block px-5 py-2.5 bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs">
            Masuk ke Aplikasi
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <AlertCircle className="h-12 w-12 text-rose-600 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Aktivasi Gagal</h2>
          <p className="text-xs text-slate-500">{message}</p>
          <Link href="/login" className="inline-block px-5 py-2.5 bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs">
            Kembali ke Login
          </Link>
        </div>
      )}
    </div>
  );
}
