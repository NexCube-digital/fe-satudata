import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-xl text-center">
        <h1 className="text-4xl font-extrabold text-teal-800 mb-2">404</h1>
        <h2 className="text-lg font-bold text-slate-800 mb-2">Halaman Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500 mb-6">Halaman yang Anda cari tidak tersedia atau telah dipindahkan.</p>
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-semibold text-sm transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
