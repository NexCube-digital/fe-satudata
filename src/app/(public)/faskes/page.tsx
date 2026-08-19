'use client';

import React, { useState, useEffect } from 'react';
import LandingNavbar from '@/components/layout/LandingNavbar';
import LandingFooter from '@/components/layout/LandingFooter';
import { apiGet } from '@/lib/api-client';

export default function FaskesDirectoryPage() {
  const [faskesList, setFaskesList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadFaskes() {
      try {
        const res = await apiGet('/api/hospital/public');
        if (res.success && Array.isArray(res.data)) {
          setFaskesList(res.data);
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    }
    loadFaskes();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <LandingNavbar />
      <main className="flex-1 max-w-6xl mx-auto px-6 pt-28 sm:pt-32 pb-12 w-full">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Direktori Fasilitas Kesehatan</h1>
        <p className="text-sm text-slate-500 mb-8">Daftar Rumah Sakit, Klinik, dan Faskes yang terhubung dalam jaringan SatuData.</p>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400">Memuat direktori faskes...</div>
        ) : faskesList.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400">
            Belum ada Faskes terdaftar di sistem.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {faskesList.map((faskes, idx) => (
              <div key={faskes.id || idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="font-bold text-base text-slate-900 mb-1">{faskes.nama || faskes.name}</h3>
                <p className="text-xs text-teal-700 font-semibold mb-2">{faskes.kategori || 'Rumah Sakit'}</p>
                <p className="text-xs text-slate-500">{faskes.alamat || 'Alamat tidak tersedia'}</p>
              </div>
            ))}
          </div>
        )}
      </main>
      <LandingFooter />
    </div>
  );
}
