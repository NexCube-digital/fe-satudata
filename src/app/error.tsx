'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled App Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-xl text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Terjadi Kesalahan Sistem</h2>
        <p className="text-xs text-slate-500 mb-6">{error?.message || 'Gagal memuat komponen aplikasi.'}</p>
        <Button onClick={reset} variant="primary">
          Coba Lagi
        </Button>
      </div>
    </div>
  );
}
